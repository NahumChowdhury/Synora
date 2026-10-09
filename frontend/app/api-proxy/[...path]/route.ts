import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HOP_BY_HOP = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
  "content-length",
]);

function backendBaseUrl(): string {
  const value = process.env.BACKEND_URL?.trim();
  if (!value) throw new Error("BACKEND_URL is not configured on the frontend server");
  return value.replace(/\/$/, "");
}

function internalProxyKey(): string {
  const value = process.env.INTERNAL_PROXY_KEY?.trim();
  if (!value || value.length < 32) throw new Error("INTERNAL_PROXY_KEY must be configured with at least 32 characters");
  return value;
}

function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip") || "unknown";
}

async function proxy(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  try {
    const { path } = await context.params;
    const sourceUrl = new URL(request.url);
    const targetUrl = `${backendBaseUrl()}/${path.map(encodeURIComponent).join("/")}${sourceUrl.search}`;

    const headers = new Headers();
    const contentType = request.headers.get("content-type");
    const authorization = request.headers.get("authorization");
    const cookie = request.headers.get("cookie");
    if (contentType) headers.set("content-type", contentType);
    if (authorization) headers.set("authorization", authorization);
    if (cookie) headers.set("cookie", cookie);

    // Preserve the browser origin for backend CSRF/origin validation while authenticating
    // this hop as Synora's trusted same-origin frontend proxy.
    headers.set("origin", request.headers.get("origin") || sourceUrl.origin);
    headers.set("x-synora-proxy-key", internalProxyKey());
    headers.set("x-synora-client-ip", clientIp(request));

    const method = request.method.toUpperCase();
    const body = method === "GET" || method === "HEAD" ? undefined : await request.arrayBuffer();
    const upstream = await fetch(targetUrl, {
      method,
      headers,
      body,
      redirect: "manual",
      cache: "no-store",
    });

    const responseHeaders = new Headers();
    upstream.headers.forEach((value, key) => {
      if (!HOP_BY_HOP.has(key.toLowerCase()) && key.toLowerCase() !== "set-cookie") {
        responseHeaders.set(key, value);
      }
    });
    const setCookie = upstream.headers.get("set-cookie");
    if (setCookie) responseHeaders.set("set-cookie", setCookie);

    return new NextResponse(await upstream.arrayBuffer(), {
      status: upstream.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("Synora API proxy error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ message: "Synora API is temporarily unavailable" }, { status: 502 });
  }
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
export const OPTIONS = proxy;

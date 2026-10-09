const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();

if (process.env.NODE_ENV === "production" && !configuredApiUrl) {
  throw new Error("NEXT_PUBLIC_API_URL must be configured for a production build");
}

const API_BASE_URL = (configuredApiUrl || "http://localhost:5000").replace(/\/$/, "");

export function apiUrl(path: string): string {
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const response = await fetch(apiUrl(path), {
    ...init,
    credentials: "include",
    headers: {
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...(init.headers || {}),
    },
  });

  if (
    response.status === 401 &&
    typeof window !== "undefined" &&
    !window.location.pathname.startsWith("/login") &&
    !path.includes("/api/auth/google")
  ) {
    window.location.assign("/login?reason=session-expired");
  }

  return response;
}

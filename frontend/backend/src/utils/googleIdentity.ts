import crypto from "crypto";

const GOOGLE_JWKS_URL = "https://www.googleapis.com/oauth2/v3/certs";
const VALID_ISSUERS = new Set(["https://accounts.google.com", "accounts.google.com"]);

type GoogleIdPayload = {
  iss?: string;
  aud?: string | string[];
  sub?: string;
  email?: string;
  email_verified?: boolean | string;
  hd?: string;
  name?: string;
  exp?: number;
  iat?: number;
};

type GoogleJwk = JsonWebKey & { kid?: string; alg?: string; use?: string };

let cachedKeys: GoogleJwk[] = [];
let cacheExpiresAt = 0;

function decodeBase64Url(value: string): Buffer {
  return Buffer.from(value.replace(/-/g, "+").replace(/_/g, "/"), "base64");
}

function parseMaxAge(cacheControl: string | null): number {
  const match = cacheControl?.match(/max-age=(\d+)/i);
  return match ? Number(match[1]) * 1000 : 60 * 60 * 1000;
}

async function getGoogleKeys(): Promise<GoogleJwk[]> {
  if (cachedKeys.length > 0 && Date.now() < cacheExpiresAt) return cachedKeys;

  const response = await fetch(GOOGLE_JWKS_URL, { signal: AbortSignal.timeout(5000) });
  if (!response.ok) throw new Error("Unable to retrieve Google signing keys");
  const data = (await response.json()) as { keys?: GoogleJwk[] };
  if (!Array.isArray(data.keys) || data.keys.length === 0) throw new Error("Google signing keys unavailable");

  cachedKeys = data.keys;
  cacheExpiresAt = Date.now() + parseMaxAge(response.headers.get("cache-control"));
  return cachedKeys;
}

export async function verifyGoogleIdToken(idToken: string, expectedAudience: string): Promise<Required<Pick<GoogleIdPayload, "sub" | "email">> & GoogleIdPayload> {
  const parts = idToken.split(".");
  if (parts.length !== 3) throw new Error("Malformed Google ID token");

  const header = JSON.parse(decodeBase64Url(parts[0]).toString("utf8")) as { alg?: string; kid?: string };
  if (header.alg !== "RS256" || !header.kid) throw new Error("Unsupported Google token signature");

  const keys = await getGoogleKeys();
  const jwk = keys.find((key) => key.kid === header.kid);
  if (!jwk) {
    cachedKeys = [];
    cacheExpiresAt = 0;
    const refreshed = await getGoogleKeys();
    const retry = refreshed.find((key) => key.kid === header.kid);
    if (!retry) throw new Error("Google signing key not found");
    return verifyWithKey(idToken, retry, expectedAudience);
  }

  return verifyWithKey(idToken, jwk, expectedAudience);
}

function verifyWithKey(idToken: string, jwk: GoogleJwk, expectedAudience: string) {
  const parts = idToken.split(".");
  const signingInput = `${parts[0]}.${parts[1]}`;
  const signature = decodeBase64Url(parts[2]);
  const publicKey = crypto.createPublicKey({ key: jwk, format: "jwk" });
  const valid = crypto.verify("RSA-SHA256", Buffer.from(signingInput), publicKey, signature);
  if (!valid) throw new Error("Invalid Google token signature");

  const payload = JSON.parse(decodeBase64Url(parts[1]).toString("utf8")) as GoogleIdPayload;
  const nowSeconds = Math.floor(Date.now() / 1000);
  const audienceOk = Array.isArray(payload.aud) ? payload.aud.includes(expectedAudience) : payload.aud === expectedAudience;
  const emailVerified = payload.email_verified === true || payload.email_verified === "true";

  if (!payload.iss || !VALID_ISSUERS.has(payload.iss)) throw new Error("Invalid Google token issuer");
  if (!audienceOk) throw new Error("Invalid Google token audience");
  if (!payload.exp || payload.exp <= nowSeconds) throw new Error("Expired Google token");
  if (payload.iat && payload.iat > nowSeconds + 300) throw new Error("Invalid Google token issue time");
  if (!payload.sub || !payload.email || !emailVerified) throw new Error("Google identity is not verified");

  return payload as Required<Pick<GoogleIdPayload, "sub" | "email">> & GoogleIdPayload;
}

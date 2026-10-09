function requireProductionEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (process.env.NODE_ENV === "production" && !value) {
    throw new Error(`${name} is required in production`);
  }
  return value || "";
}

export const config = {
  port: Number(process.env.PORT || 5000),
  frontendOrigins: (process.env.FRONTEND_URL || "http://localhost:3000")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean),
  jwtSecret: process.env.JWT_SECRET || "",
  googleClientId: process.env.GOOGLE_CLIENT_ID || "",
  internalProxyKey: process.env.INTERNAL_PROXY_KEY || "",
  nodeEnv: process.env.NODE_ENV || "development",
};

export function validateEnvironment() {
  if (!Number.isInteger(config.port) || config.port <= 0) {
    throw new Error("PORT must be a valid positive integer");
  }

  if (process.env.NODE_ENV === "production") {
    const jwt = requireProductionEnv("JWT_SECRET");
    requireProductionEnv("DATABASE_URL");
    requireProductionEnv("GOOGLE_CLIENT_ID");
    requireProductionEnv("FRONTEND_URL");
    const proxyKey = requireProductionEnv("INTERNAL_PROXY_KEY");
    if (jwt.length < 32) throw new Error("JWT_SECRET must be at least 32 characters");
    if (proxyKey.length < 32) throw new Error("INTERNAL_PROXY_KEY must be at least 32 characters");
    if (config.frontendOrigins.some((origin) => origin.includes("localhost"))) {
      throw new Error("FRONTEND_URL must not contain localhost in production");
    }
  }
}

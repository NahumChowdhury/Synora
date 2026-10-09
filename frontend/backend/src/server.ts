import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import profileRoutes from "./routes/profileRoutes";
import taskRoutes from "./routes/taskRoutes";
import chatRoutes from "./routes/chatRoutes";
import adminRoutes from "./routes/adminRoutes";
import { apiLimiter } from "./middleware/rateLimits";
import { config, validateEnvironment } from "./config";

validateEnvironment();
const app = express();

if (config.nodeEnv === "production") app.set("trust proxy", 1);
app.disable("x-powered-by");

app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  next();
});

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || config.frontendOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Origin not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json({ limit: "100kb" }));
app.use((req, res, next) => {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();
  const origin = req.headers.origin;
  const hasBearer = req.headers.authorization?.startsWith("Bearer ");
  if (origin && config.frontendOrigins.includes(origin)) return next();
  if (!origin && (hasBearer || config.nodeEnv !== "production")) return next();
  return res.status(403).json({ message: "Request origin could not be verified" });
});
app.use("/api", apiLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/admin", adminRoutes);

app.get("/health", (_req, res) => res.status(200).json({ status: "ok" }));
app.get("/", (_req, res) => res.status(200).json({ service: "Synora Backend API", status: "ok" }));
app.use((_req, res) => res.status(404).json({ message: "Route not found" }));
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const message = err instanceof Error ? err.message : "Unexpected server error";
  if (message === "Origin not allowed by CORS") return res.status(403).json({ message: "Origin not allowed" });
  console.error("Unhandled server error:", message);
  return res.status(500).json({ message: "Server error" });
});

app.listen(config.port, () => console.log(`Synora Server running on port ${config.port}`));

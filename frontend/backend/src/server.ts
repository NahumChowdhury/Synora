import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import profileRoutes from "./routes/profileRoutes";
import taskRoutes from "./routes/taskRoutes";
import teamRoutes from "./routes/teamRoutes";
import chatRoutes from "./routes/chatRoutes";
import adminRoutes from "./routes/adminRoutes";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/team", teamRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.send("Synora Backend API is running");
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Synora Server running on port ${PORT}`);
});
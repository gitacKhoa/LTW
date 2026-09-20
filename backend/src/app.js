const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const authRoutes = require("./routes/auth.routes");
const studentRoutes = require("./routes/student.routes");
const subjectRoutes = require("./routes/subject.routes");
const gradeRoutes = require("./routes/grade.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const notificationRoutes = require("./routes/notification.routes");
const sequelize = require("./config/sequelize");

const app = express();

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Quá nhiều request, vui lòng thử lại sau." },
    skip: (req) => {
      const path = (req.originalUrl || req.path || "").toLowerCase();
      return path.startsWith("/api/auth/login") || path.startsWith("/api/auth/register");
    },
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/grades", gradeRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/notifications", notificationRoutes);

app.get("/", (req, res) => {
  res.json({ message: "EduResult API is running" });
});

const startServer = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    console.log("Database connected and synchronized");
  } catch (error) {
    console.error("Database connection failed:", error.message);
  }
};

startServer();

module.exports = app;
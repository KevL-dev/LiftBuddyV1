const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/auth");
const exercisesRoutes = require("./routes/exercises");
const workoutsRoutes = require("./routes/workouts");
const plansRoutes = require("./routes/plans");
const sessionsRoutes = require("./routes/sessions");

const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
  }),
);

// Security headers
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  next();
});

// Block access to sensitive paths served by static middleware
app.use((req, res, next) => {
  const p = req.path.toLowerCase();
  if (
    p.startsWith("/.git") ||
    p.endsWith(".db") ||
    p.startsWith("/backend/session") ||
    p.startsWith("/backend/node_modules")
  ) {
    return res.status(403).end();
  }
  next();
});

app.use(express.json({ limit: "1mb" }));

app.use("/api/auth", authRoutes);
app.use("/api/exercises", exercisesRoutes);
app.use("/api/workouts", workoutsRoutes);
app.use("/api/plans", plansRoutes);
app.use("/api/sessions", sessionsRoutes);

app.use(express.static(path.join(__dirname, "..")));
app.get("/", (_req, res) => {
  res.redirect("/frontend/index.html");
});

// Global error handler — no stack traces in responses
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server läuft auf Port ${PORT}`));

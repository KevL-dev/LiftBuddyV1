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
    origin: [
      "http://127.0.0.1:5500",
      "http://localhost:5500",
      "http://localhost:3000",
    ],
    credentials: true,
  }),
);

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/exercises", exercisesRoutes);
app.use("/api/workouts", workoutsRoutes);
app.use("/api/plans", plansRoutes);
app.use("/api/sessions", sessionsRoutes);

app.use(express.static(path.join(__dirname, "..")));
app.get("/", (_req, res) => {
  res.redirect("/frontend/index.html");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server läuft auf Port ${PORT}`));

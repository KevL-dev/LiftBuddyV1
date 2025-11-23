const express = require("express");
const session = require("express-session");
const cors = require("cors");
const authRoutes = require("./routes/auth");

const app = express();

// Middleware -------------------------
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5500",
    credentials: true,
  })
);

app.use(
  session({
    secret: "supersecretkey",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  })
);

app.get("/", (req, res) => {
  res.send("Backend läuft!");
});


// Routes -----------------------------
app.use("/api/auth", authRoutes);

// Start Server -----------------------
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});



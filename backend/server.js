const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth");

const app = express();

app.use(
  cors({
    origin: "http://127.0.0.1:5500",
    credentials: true,
  })
);

app.use(express.json());

app.use("/api/auth", authRoutes);

app.listen(3000, () => console.log("Server läuft auf Port 3000"));

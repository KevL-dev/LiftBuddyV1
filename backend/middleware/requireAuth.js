const db = require("../database");

module.exports = function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const parts = authHeader.split(" ");
  const token = parts.length === 2 ? parts[1] : null;

  if (!token) return res.status(401).json({ error: "Missing token" });

  db.get(
    `SELECT id, username, email, active FROM users WHERE authToken = ?`,
    [token],
    (err, user) => {
      if (err) return res.status(500).json({ error: "Database error" });
      if (!user) return res.status(401).json({ error: "Invalid token" });
      if (user.active === 0)
        return res.status(403).json({ error: "Account is deactivated" });

      req.user = user;
      next();
    },
  );
};

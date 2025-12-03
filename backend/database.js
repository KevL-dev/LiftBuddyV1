const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./liftbuddy.db");

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT,
      email TEXT UNIQUE,
      passwordHash TEXT,
      created TEXT
    )
  `);

  db.get(`PRAGMA table_info(users);`, (err, row) => {
    db.all(`PRAGMA table_info(users);`, (err, columns) => {
      const hasToken = columns.some((col) => col.name === "authToken");

      if (!hasToken) {
        console.log("Adding authToken column to users table...");
        db.run(`ALTER TABLE users ADD COLUMN authToken TEXT;`);
      } else {
        console.log("authToken column already exists.");
      }
    });
  });
});

module.exports = db;

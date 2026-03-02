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

  db.run(`
    CREATE TABLE IF NOT EXISTS exercises (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      muscle_group TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS workouts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      created TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS workout_exercises (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      workout_id INTEGER NOT NULL,
      exercise_id INTEGER NOT NULL,
      sets INTEGER,
      reps INTEGER,
      weight REAL,
      FOREIGN KEY (workout_id) REFERENCES workouts(id),
      FOREIGN KEY (exercise_id) REFERENCES exercises(id)
    )
  `);

  db.serialize(() => {
    db.run(`
    CREATE TABLE IF NOT EXISTS plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      created TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

    db.run(`
    CREATE TABLE IF NOT EXISTS plan_exercises (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      plan_id INTEGER NOT NULL,
      exercise_id INTEGER NOT NULL,
      target_sets INTEGER,
      target_reps INTEGER,
      FOREIGN KEY (plan_id) REFERENCES plans(id),
      FOREIGN KEY (exercise_id) REFERENCES exercises(id)
    )
  `);

    db.run(`
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      plan_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      started TEXT,
      finished TEXT,
      FOREIGN KEY (plan_id) REFERENCES plans(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

    db.run(`
    CREATE TABLE IF NOT EXISTS session_exercises (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER NOT NULL,
      exercise_id INTEGER NOT NULL,
      sets INTEGER,
      reps INTEGER,
      weight REAL,
      FOREIGN KEY (session_id) REFERENCES sessions(id),
      FOREIGN KEY (exercise_id) REFERENCES exercises(id)
    )
  `);

    db.run(`CREATE INDEX IF NOT EXISTS idx_plans_user ON plans(user_id)`);
    db.run(
      `CREATE INDEX IF NOT EXISTS idx_plan_ex_plan ON plan_exercises(plan_id)`,
    );
    db.run(`CREATE INDEX IF NOT EXISTS idx_sessions_plan ON sessions(plan_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id)`);
    db.run(
      `CREATE INDEX IF NOT EXISTS idx_sess_ex_sess ON session_exercises(session_id)`,
    );
  });

  db.get("SELECT COUNT(*) as c FROM exercises", (err, row) => {
    if (err) {
      console.error("Error counting exercises:", err);
      return;
    }
    if (row && row.c === 0) {
      console.log("Seeding default exercises...");
      const defaults = [
        ["Bench Press", "Chest"],
        ["Incline Dumbbell Press", "Chest"],
        ["Squat", "Legs"],
        ["Deadlift", "Back"],
        ["Pull Up", "Back"],
        ["Barbell Row", "Back"],
        ["Shoulder Press", "Shoulders"],
        ["Biceps Curl", "Arms"],
        ["Triceps Dip", "Arms"],
        ["Leg Press", "Legs"],
      ];
      const stmt = db.prepare(
        "INSERT INTO exercises (name, muscle_group) VALUES (?, ?)",
      );
      defaults.forEach((d) => stmt.run(d[0], d[1]));
      stmt.finalize();
    } else {
      console.log("Exercises already seeded.");
    }
  });

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

db.all(`PRAGMA table_info(users);`, (err, columns) => {
  const hasActive = columns.some((col) => col.name === "active");
  if (!hasActive) {
    console.log("Adding active column to users table...");
    db.run(`ALTER TABLE users ADD COLUMN active INTEGER DEFAULT 1`);
  }

  const hasTokenExpires = columns.some((col) => col.name === "tokenExpires");
  if (!hasTokenExpires) {
    console.log("Adding tokenExpires column to users table...");
    db.run(`ALTER TABLE users ADD COLUMN tokenExpires TEXT`);
  }
});

module.exports = db;

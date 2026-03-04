import sqlite3 from "sqlite3";
const db = new sqlite3.Database("./house_share_app.db");

db.serialize(() => {
  console.log("Setting up SQLite database...");

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      first_name TEXT,
      last_name TEXT,
      username TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS groups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      code TEXT UNIQUE,
      admin_id INTEGER
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS group_members (
      group_id INTEGER,
      user_id INTEGER,
      role TEXT DEFAULT 'member',
      PRIMARY KEY (group_id, user_id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      group_id INTEGER,
      title TEXT NOT NULL,
      description TEXT,
      deadline TEXT,
      recurrence TEXT,
      priority TEXT,
      status TEXT DEFAULT 'pending',
      created_by INTEGER
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS task_assignees (
      task_id INTEGER,
      user_id INTEGER,
      PRIMARY KEY (task_id, user_id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      group_id INTEGER,
      reference TEXT,
      description TEXT,
      amount REAL,
      deadline TEXT,
      recurrence TEXT,
      priority TEXT,
      created_by INTEGER
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS payment_assignees (
      payment_id INTEGER,
      user_id INTEGER,
      PRIMARY KEY (payment_id, user_id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      title TEXT,
      message TEXT,
      time_left TEXT,
      type TEXT,
      item_id INTEGER,
      seen BOOLEAN DEFAULT FALSE,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS points (
      user_id INTEGER PRIMARY KEY,
      points INTEGER DEFAULT 0
    )
  `);

  console.log("SQLite database setup complete.");
});

db.close();

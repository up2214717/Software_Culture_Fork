const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const app = express();
const PORT = 8080;
const projectRoot = path.join(__dirname, "..");
const frontendDir = path.join(projectRoot, "frontend");
const dbPath = path.join(__dirname, "house_share_app.db");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(frontendDir));

const db = new sqlite3.Database(dbPath);

app.get("/", (req, res) => {
  res.sendFile(path.join(frontendDir, "index.html"));
});

db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    code TEXT UNIQUE NOT NULL,
    admin_id INTEGER NOT NULL
  )
`);


db.run(`
  CREATE TABLE IF NOT EXISTS group_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    UNIQUE(group_id, user_id)
  )
`);

app.post("/api/register", (req, res) => {
  const { email, password, firstName, lastName } = req.body;
  db.run(
    "INSERT INTO users (email, password, first_name, last_name) VALUES (?, ?, ?, ?)",
    [email, password, firstName, lastName],
    function (err) {
      if (err) return res.status(400).send("Registration failed.");
      res.send("User registered");
    }
  );
});

app.post("/api/login", (req, res) => {
  const email = req.body.email?.trim();
  const password = req.body.password?.trim();

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and password required" });
  }

  db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, row) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ success: false, message: "Server error" });
    }

    if (!row) {
      console.log("No user found for email:", email);
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    if (row.password !== password) {
      console.log("Password mismatch for user:", email);
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    // Success: return full user object for frontend
    res.json({ success: true, user: row });
  });
});

app.post("/api/create-group", (req, res) => {
  const { name, description, code } = req.body;
  const userId = req.body.userId;

  if (!name || !code || !userId) {
    return res.status(400).send("Missing group name, code, or user ID.");
  }

  // Check if the group code is already taken
  db.get(`SELECT * FROM groups WHERE code = ?`, [code], (err, existingGroup) => {
    if (err) {
      console.error("Error checking group code:", err);
      return res.status(500).send("Server error while checking group code.");
    }

    if (existingGroup) {
      return res.status(400).send("Group code already exists. Please choose another.");
    }

    // Create the new group
    db.run(
      `INSERT INTO groups (name, description, code, admin_id) VALUES (?, ?, ?, ?)`,
      [name, description, code, userId],
      function (err) {
        if (err) {
          console.error("Error creating group:", err);
          return res.status(500).send("Failed to create group.");
        }

        const groupId = this.lastID;

        // Automatically join the user to the new group
        db.run(
          `INSERT INTO user_groups (user_id, group_id) VALUES (?, ?)`,
          [userId, groupId],
          function (err) {
            if (err) {
              console.error("Error joining group after creation:", err);
              return res.status(500).send("Group created but could not join.");
            }

            res.send("Group created successfully!");
          }
        );
      }
    );
  });
});



app.post("/api/join-group", (req, res) => {
  const { code, userId } = req.body;

  if (!userId || !code) {
    return res.status(400).json({ success: false, message: "Missing user ID or group code" });
  }

  db.get("SELECT * FROM groups WHERE code = ?", [code], (err, group) => {
    if (err) {
      console.error("Error checking group:", err);
      return res.status(500).json({ success: false, message: "Database error" });
    }

    if (!group) {
      return res.status(404).json({ success: false, message: "Group does not exist" });
    }

    db.run(
      "INSERT OR IGNORE INTO user_groups (user_id, group_id) VALUES (?, ?)",
      [userId, group.id],
      function (err) {
        if (err) {
          console.error("Error joining group:", err);
          return res.status(500).json({ success: false, message: "Could not join group" });
        }

        res.json({
          success: true,
          name: group.name,
          description: group.description || "",
          groupId: group.id
        });
      }
    );
  });
});



app.get("/api/groups/:userId", (req, res) => {
  const userId = req.params.userId;
  if (!userId) return res.status(400).send("User ID is required");

  db.all(
    `SELECT groups.id, groups.name
     FROM groups
     JOIN group_members ON groups.id = group_members.group_id
     WHERE group_members.user_id = ?`,
    [userId],
    (err, rows) => {
      if (err) return res.status(500).send("Could not load groups");
      res.json(rows);
    }
  );
});

app.get("/api/user-groups", (req, res) => {
  const userId = req.query.userId;
  if (!userId) return res.status(400).send("User ID is required");

  db.all(
    `SELECT g.id, g.name, g.code, g.description
     FROM groups g
     JOIN user_groups ug ON g.id = ug.group_id
     WHERE ug.user_id = ?`,
    [userId],
    (err, rows) => {
      if (err) return res.status(500).send("Could not load groups");
      res.json(rows);
    }
  );
});

// Task Submission
app.post("/api/tasks", (req, res) => {
  const { groupId, title, description, recurrence, priority, deadline, assignedUsers } = req.body;

  if (!groupId || !title || !deadline) return res.status(400).send("Missing required task data.");

  db.run(
    `INSERT INTO tasks (group_id, title, description, recurrence, priority, deadline)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [groupId, title, description, recurrence, priority, deadline],
    function (err) {
      if (err) return res.status(500).send("Failed to insert task.");
      const taskId = this.lastID;

      const stmt = db.prepare("INSERT INTO task_assignees (task_id, user_id) VALUES (?, ?)");
      for (const userId of assignedUsers) {
        stmt.run(taskId, userId);
      }
      stmt.finalize();

      res.send("Task saved.");
    }
  );
});

// Payment Submission
app.post("/api/payments", (req, res) => {
  const { groupId, description, totalCost, assignedUsers } = req.body;

  if (!groupId || !totalCost) return res.status(400).send("Missing payment info.");

  db.run(
    `INSERT INTO payments (group_id, description, total_cost)
     VALUES (?, ?, ?)`,
    [groupId, description, totalCost],
    function (err) {
      if (err) return res.status(500).send("Failed to insert payment.");
      const paymentId = this.lastID;

      const stmt = db.prepare("INSERT INTO payment_assignees (payment_id, user_id) VALUES (?, ?)");
      for (const userId of assignedUsers) {
        stmt.run(paymentId, userId);
      }
      stmt.finalize();

      res.send("Payment saved.");
    }
  );
});

app.get("/api/group-users/:groupId", (req, res) => {
  const { groupId } = req.params;
  db.all(`
    SELECT users.id, users.first_name, users.last_name
    FROM users
    JOIN user_groups ON users.id = user_groups.user_id
    WHERE user_groups.group_id = ?
  `, [groupId], (err, rows) => {
    if (err) return res.status(500).send("Error getting users");
    res.json(rows);
  });
});

app.get("/api/tasks", (req, res) => {
  const { groupId } = req.query;
  db.all("SELECT * FROM tasks WHERE group_id = ?", [groupId], (err, rows) => {
    if (err) return res.status(500).send("Error loading tasks");
    res.json(rows);
  });
});

app.get("/api/payments", (req, res) => {
  const { groupId } = req.query;
  db.all("SELECT * FROM payments WHERE group_id = ?", [groupId], (err, rows) => {
    if (err) return res.status(500).send("Error loading payments");
    res.json(rows);
  });
});


app.listen(PORT, () => {
  console.log("Server running on http://localhost:" + PORT);
});

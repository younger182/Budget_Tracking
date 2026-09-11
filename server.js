const express = require("express");
const path = require("path");
const bcrypt = require("bcrypt");
const session = require("express-session");
const SQLiteStore = require("connect-sqlite3")(session);
const database = require("./database");
const { requireLogin } = require("./auth");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(session({
  store: new SQLiteStore({ db: "sessions.sqlite", dir: path.join(__dirname, "data") }),
  secret: process.env.SESSION_SECRET || "replace-this-local-session-secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
}));
app.use(express.static(path.join(__dirname)));

app.get("/api/health", (request, response) => {
  response.json({ status: "ok" });
});

app.post("/api/auth/login", async (request, response) => {
  const username = typeof request.body.username === "string" ? request.body.username.trim() : "";
  const password = typeof request.body.password === "string" ? request.body.password : "";
  const user = database.prepare("SELECT id, username, password_hash FROM users WHERE username = ?").get(username);

  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    response.status(401).json({ error: "Invalid username or password." });
    return;
  }

  request.session.userId = user.id;
  request.session.username = user.username;
  response.json({ user: { id: user.id, username: user.username } });
});

app.post("/api/auth/logout", (request, response) => {
  request.session.destroy((error) => {
    if (error) {
      response.status(500).json({ error: "Could not log out." });
      return;
    }
    response.clearCookie("connect.sid");
    response.json({ success: true });
  });
});

app.get("/api/auth/me", (request, response) => {
  if (!request.session.userId) {
    response.status(401).json({ error: "Not logged in." });
    return;
  }
  response.json({ user: { id: request.session.userId, username: request.session.username } });
});

app.get("/api/expenses", requireLogin, (request, response) => {
  const expenses = database.prepare(`
    SELECT id, date, place, category, amount, description, created_at
    FROM expenses
    WHERE user_id = ?
    ORDER BY date DESC, id DESC
  `).all(request.session.userId);
  response.json({ expenses });
});

app.post("/api/expenses", requireLogin, (request, response) => {
  const { date, place, category, amount, description = "" } = request.body;
  const numericAmount = Number(amount);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || typeof place !== "string" || !place.trim() || typeof category !== "string" || !category.trim() || !Number.isFinite(numericAmount) || numericAmount <= 0 || typeof description !== "string") {
    response.status(400).json({ error: "Date, place, category, and a positive amount are required." });
    return;
  }

  const result = database.prepare(`
    INSERT INTO expenses (user_id, date, place, category, amount, description)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(request.session.userId, date, place.trim(), category.trim(), numericAmount, description.trim());
  const expense = database.prepare("SELECT id, date, place, category, amount, description, created_at FROM expenses WHERE id = ?").get(result.lastInsertRowid);
  response.status(201).json({ expense });
});

app.delete("/api/expenses/:id", requireLogin, (request, response) => {
  const result = database.prepare("DELETE FROM expenses WHERE id = ? AND user_id = ?").run(request.params.id, request.session.userId);
  if (!result.changes) {
    response.status(404).json({ error: "Expense not found." });
    return;
  }
  response.json({ success: true });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Budget Tracking System running at http://localhost:${PORT}`);
});

const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const Database = require("better-sqlite3");

const dataDirectory = path.join(__dirname, "data");
fs.mkdirSync(dataDirectory, { recursive: true });

const database = new Database(path.join(dataDirectory, "budget.sqlite"));
database.pragma("journal_mode = WAL");
database.pragma("foreign_keys = ON");

database.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    place TEXT NOT NULL,
    category TEXT NOT NULL,
    amount REAL NOT NULL CHECK (amount > 0),
    description TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS expenses_user_date_idx ON expenses (user_id, date);
`);

const defaultUsers = [
  { username: "user1", password: "ChangeMe1!" },
  { username: "user2", password: "ChangeMe2!" },
  { username: "user3", password: "ChangeMe3!" },
  { username: "admin", password: "admin" }
];
const findUser = database.prepare("SELECT id FROM users WHERE username = ?");
const addUser = database.prepare("INSERT INTO users (username, password_hash) VALUES (?, ?)");

for (const user of defaultUsers) {
  if (!findUser.get(user.username)) {
    addUser.run(user.username, bcrypt.hashSync(user.password, 12));
  }
}

module.exports = database;

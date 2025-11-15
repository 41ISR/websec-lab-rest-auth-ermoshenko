const Database = require('better-sqlite3');
const db = new Database('library.db');

// Включаем поддержку внешних ключей
db.pragma('foreign_keys = ON');

db.prepare(`
    CREATE TABLE IF NOT EXISTS user(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL,
        createdAt DATE NOT NULL
    )
    `).run()

db.prepare(`
    CREATE TABLE IF NOT EXISTS book(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        year DATE NOT NULL,
        genre TEXT NOT NULL,
        description TEXT NOT NULL,
        createdBy INTEGER NOT NULL,
        createdAt DATE NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
    `).run()

db.prepare(`
    CREATE TABLE IF NOT EXISTS review(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        bookId INTEGER NOT NULL,
        userId INTEGER NOT NULL,
        rating INTEGER NOT NULL,
        comment TEXT NOT NULL,
        createdAt DATE NOT NULL
        FOREIGN KEY (bookId) REFERENCES book(id),
        FOREIGN KEY (userId) REFERENCES user(id),
    )
    `).run()

module.exports = db
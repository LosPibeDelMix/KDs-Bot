// database.js
const Database = require('better-sqlite3');
const db = new Database('./data/bot.db');

// Crear tablas
db.exec(`
    CREATE TABLE IF NOT EXISTS warns (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        guild_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        moderador TEXT NOT NULL,
        razon TEXT NOT NULL,
        fecha DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS server_configs (
        guild_id TEXT PRIMARY KEY,
        prefix TEXT DEFAULT '!',
        log_channel TEXT,
        welcome_channel TEXT,
        welcome_message TEXT
    );
`);

module.exports = db;
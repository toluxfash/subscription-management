// server/config/database.js
const mysql = require('mysql2/promise');
require('dotenv').config();

let pool;

function getDatabasePool() {
    if (!pool) {
        pool = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });
        console.log('✅ Database pool created');
    }
    return pool;
}

// For one-off connections (used by db/init.js)
async function createDatabaseConnection() {
    return mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });
}

module.exports = { getDatabasePool, createDatabaseConnection };

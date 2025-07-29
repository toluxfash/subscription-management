// server/config/database.js
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

let pool;

async function createDatabaseConnection() {
    if (!pool) {
        pool = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT || 3306,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
            multipleStatements: true // ✅ allow running multiple queries from schema.sql
        });
        console.log('✅ Connected to MySQL database');
    }
    return pool;
}

async function query(sql, params = []) {
    const conn = await createDatabaseConnection();
    const [rows] = await conn.execute(sql, params);
    return rows;
}

module.exports = {
    query,
    createDatabaseConnection
};

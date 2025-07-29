// server/db/init.js
const fs = require('fs');
const path = require('path');
const { createDatabaseConnection } = require('../config/database');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

async function initializeDatabase() {
    const conn = await createDatabaseConnection();
    try {
        console.log('🔄 Connecting to MySQL RDS...');

        const [rows] = await conn.query("SHOW TABLES LIKE 'subscriptions'");
        if (rows.length > 0) {
            console.log('✅ Database already initialized, skipping schema.sql.');
            return;
        }

        console.log('📝 No tables found. Applying schema.sql...');
        const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
        const statements = schema.split(/;\s*$/m).map(s => s.trim()).filter(s => s);

        for (const sql of statements) {
            await conn.query(sql);
        }

        console.log('🎉 Database schema applied successfully!');
    } finally {
        await conn.end();
        console.log('🔒 Database connection closed.');
    }
}

if (require.main === module) {
    initializeDatabase().catch(err => {
        console.error('❌ Database initialization failed:', err);
        process.exit(1);
    });
}

module.exports = initializeDatabase;

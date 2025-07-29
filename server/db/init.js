// server/db/init.js
const fs = require('fs');
const path = require('path');
const { createDatabaseConnection } = require('../config/database');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

async function initializeDatabase() {
    try {
        console.log('🔄 Connecting to MySQL RDS...');
        const conn = await createDatabaseConnection();

        // Check if subscriptions table exists
        const [rows] = await conn.query("SHOW TABLES LIKE 'subscriptions'");
        if (rows.length > 0) {
            console.log('✅ Database already initialized, skipping schema.sql.');
            return;
        }

        console.log('📝 No tables found. Applying schema.sql...');

        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        // Split schema into individual statements
        const statements = schema
            .split(/;\s*$/m)
            .map(s => s.trim())
            .filter(s => s.length);

        for (const sql of statements) {
            try {
                await conn.query(sql);
            } catch (err) {
                console.error("⚠️ Error executing SQL:", sql);
                throw err;
            }
        }

        console.log('🎉 Database schema applied successfully!');
    } catch (error) {
        console.error('❌ Database initialization failed:', error);
        process.exit(1);
    }
}

// Run directly: `node db/init.js`
if (require.main === module) {
    initializeDatabase();
}

module.exports = initializeDatabase;

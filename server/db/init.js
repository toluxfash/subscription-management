// const crypto = require('crypto');
// const config = require('../config');
// const DatabaseMigrations = require('./migrations');

// const dbPath = config.getDatabasePath();

// console.log('🔄 Initializing database...');
// console.log('📂 Database path:', dbPath);

// async function initializeDatabase() {
//     try {
//         // Ensure database directory exists
//         config.ensureDatabaseDir();

//         // Check if database file exists
//         const dbExists = config.databaseExists();
//         if (!dbExists) {
//             console.log('📝 Creating new database file...');
//         } else {
//             console.log('📋 Database file exists, checking for migrations...');
//         }

//         // Run migrations to create/update database schema
//         console.log('🔄 Running database migrations...');
//         const migrations = new DatabaseMigrations(dbPath);
//         await migrations.runMigrations();
//         migrations.close();

//         console.log('✅ Database schema is up to date!');

//         // Generate API key if not provided via environment
//         let apiKey = config.getApiKey();
//         if (!apiKey) {
//             apiKey = crypto.randomBytes(32).toString('hex');
//             console.log('\n🔑 Generated API Key:');
//             console.log('=====================================');
//             console.log(apiKey);
//             console.log('=====================================');
//             console.log('\n⚠️  IMPORTANT: Save this API key securely!');
//             console.log('Add it to your .env file:');
//             console.log(`API_KEY=${apiKey}`);
//             console.log('');
//         } else {
//             console.log('✅ Using API key from environment variables');
//         }

//         console.log('🎉 Database initialization completed successfully!');
//         console.log('\n📊 Database is ready with all required tables and data.');

//     } catch (error) {
//         console.error('❌ Database initialization failed:', error);
//         process.exit(1);
//     }
// }

// // Run initialization if this script is executed directly
// if (require.main === module) {
//     initializeDatabase();
// }

// module.exports = initializeDatabase;



// server/db/init.js
const fs = require('fs');
const path = require('path');
const { createDatabaseConnection } = require('../config/database');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

async function initializeDatabase() {
    try {
        console.log('🔄 Connecting to MySQL RDS...');

        const conn = await createDatabaseConnection();

        // Pick a table that should always exist (update if needed)
        const [rows] = await conn.query("SHOW TABLES LIKE 'subscriptions'");
        if (rows.length > 0) {
            console.log('✅ Database already initialized, skipping schema.sql.');
            return;
        }

        console.log('📝 No tables found. Applying schema.sql...');

        // Read and execute schema.sql
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        await conn.query(schema);

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

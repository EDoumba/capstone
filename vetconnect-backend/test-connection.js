// test-connection.js
require('dotenv').config();
const mysql = require('mysql2/promise');

async function testConnection() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '9173DIMIer@$%!?sql',
      database: process.env.DB_NAME || 'vetconnect',
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306
    });

    console.log('✅ Successfully connected to the database!');
    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();
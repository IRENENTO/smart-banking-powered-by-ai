require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function migrate() {
  const dbName = process.env.TIDB_DB_NAME || process.env.DB_NAME || 'smart_banking_powered_by_ai';

  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10) || 4000,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: dbName,
    ssl: { rejectUnauthorized: false },
    waitForConnections: true,
    connectionLimit: 2,
  });

  try {
    await pool.query('SELECT 1');
    console.log('Connected to DB');

    // Run migration SQL files
    const migrationsDir = path.resolve(__dirname, '..', 'migrations');
    if (fs.existsSync(migrationsDir)) {
      const files = fs.readdirSync(migrationsDir).sort();
      for (const file of files) {
        if (file.endsWith('.sql')) {
          const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
          const statements = sql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--'));

          for (const stmt of statements) {
            try {
              await pool.query(stmt);
            } catch (err) {
              // Table already exists or similar — skip
              if (err.errno !== 1050) {
                console.warn(`  ${file}: ${err.message}`);
              }
            }
          }
          console.log(`  Ran: ${file}`);
        }
      }
    }

    // Ensure default admin exists
    await pool.query(`
      INSERT IGNORE INTO admins (email, password_hash, name, role, status)
      VALUES (
        'smartbankingpoweredbyai@gmail.com',
        '$2a$10$O48qKRkN3cxbsv3MWoISAO8.NRHd1vJGtFIyVCBVZDf8tAddl47k.',
        'Admin User',
        'super_admin',
        'active'
      )
    `);
    console.log('Default admin seed: OK');

    console.log('Migration complete');
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();

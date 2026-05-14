const mysql = require('mysql2/promise');
async function run() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'irene2003',
    database: 'smart_banking_powered_by_ai'
  });
  await conn.execute("ALTER TABLE payments MODIFY COLUMN payment_type ENUM('bill','merchant','subscription','invoice','top_up','other','deposit','withdrawal') NOT NULL");
  console.log('Enum updated');
  conn.end();
}
run().catch(console.error);

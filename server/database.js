import mysql from 'mysql2/promise'; // Import MySQL library

const dbconnect = mysql.createPool({
  host: '103.21.58.5',
  user: 'stepcone2024',
  port: '3306',
  password: 'Curie@1867',
  database: 'stepcone',
  timezone: 'utc',
  dateStrings: true,
  waitForConnections: true,
  connectionLimit: 10000,
  queueLimit: 0,
  connectTimeout: 100000, // 10 seconds
  acquireTimeout: 100000,
});

// Test connection
(async () => {
  try {
    const connection = await dbconnect.getConnection();
    console.log('Successfully connected to the database.');
    connection.release(); // Release connection back to the pool
  } catch (error) {
    console.error('Database connection failed:', error.message);
    console.error('Full error details:', error);
  }
})();

export default dbconnect; // Export the connection pool

import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool.connect((err, client, release) => {
  console.log("Connecting to PostgreSQL");
  if (err) {
    return console.error("Error acquiring client", err.stack);
  }
  client?.query("SELECT NOW()", (err) => {
    release();
    if (err) {
      return console.error("Error executing query", err.stack);
    }
    console.log("Connected to PostgreSQL");
  });
});

export default pool;

import { Pool, PoolConfig } from "pg";

export const dbConfig: PoolConfig = {
  host: "localhost",
  port: 5432,
  user: "postgres",
  password: "postgres", // Replace with your actual password
  database: "distributech", // Replace with your actual database name
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
};

// Create connection pool
const pool = new Pool(dbConfig);

export default pool;

import { Pool, PoolConfig } from "pg";

export const dbConfig: PoolConfig = {
  host: "localhost",
  port: 5432,
  user: "postgres",
  password: "postgres", 
  database: "distributech", 
  max: 20, 
  idleTimeoutMillis: 30000, 
};

const pool = new Pool(dbConfig);

export default pool;

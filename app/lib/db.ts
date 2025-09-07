import mysql, { QueryResult } from "mysql2/promise";

export interface DatabaseConfig {
  host: string;
  user: string;
  password: string;
  database: string;
  port: number;
}

export const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "",
  database: process.env.DB_NAME || "crm_db",
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function executeQuery(query: string, params: any[] = []) {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(query, params);
    if (query.trim().toUpperCase().startsWith("SELECT")) {
      return Array.isArray(rows) ? rows : [];
    }
    return rows;
  } finally {
    connection.release();
  }
}


export async function executeTransaction(queries: { query: string; params: any[] }[]) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const results: QueryResult[] = [];
    for (const { query, params } of queries) {
      const [result] = await connection.execute(query, params);
      results.push(result);
    }

    await connection.commit();
    return results;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

import mysql, { QueryResult } from "mysql2/promise";

export interface DatabaseConfig {
  host: string;
  user: string;
  password: string;
  database: string;
}

export async function createConnection() {
  const config: DatabaseConfig = {
    host: process.env.DB_HOST || "s02bd.syd2.hostingplatform.net.au",
    user: process.env.DB_USER || "bentrod2_crm",
    password: process.env.DB_PASS || "85vNo2k=Qk@Q",
    database: process.env.DB_NAME || "bentrod2_crm",
  };



  try {
    const connection = await mysql.createConnection(config);
    return connection;
  } catch (error) {
    console.error("Database connection failed:", error, config);
    throw new Error("Failed to connect to database");
  }
}

export async function executeQuery(query: string, params: any[] = []) {
  const connection = await createConnection();
  try {
    const [rows] = await connection.execute(query, params);
    // Ensure we always return an array for SELECT queries
    if (query.trim().toUpperCase().startsWith('SELECT')) {
      return Array.isArray(rows) ? rows : [];
    }
    return rows;
  } finally {
    await connection.end();
  }
}

export async function executeTransaction(queries: { query: string; params: any[] }[]) {
  const connection = await createConnection();
  try {
    await connection.beginTransaction();
    
    const results : QueryResult[] = [];
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
    await connection.end();
  }
} 
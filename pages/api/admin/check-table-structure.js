// pages/api/admin/check-table-structure.js
// API endpoint to check if the verified column exists in the models table

import mysql from "mysql2/promise";

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "msgdbusr",
  password: process.env.DB_PASS || "t10f73&La",
  database: process.env.DB_NAME || "msgdb",
  port: process.env.DB_PORT || 3306,
};

export default async function handler(req, res) {
  const { method } = req;

  // Handle OPTIONS
  if (method === "OPTIONS") {
    res.setHeader("Allow", "GET,OPTIONS");
    return res.status(204).end();
  }

  if (method !== "GET") {
    return res.status(405).json({ success: 0, message: "Method not allowed" });
  }

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log("Database connection successful");

    // Check if verified column exists
    const [columns] = await connection.execute(
      "SHOW COLUMNS FROM models LIKE 'verified'"
    );

    // Get table structure
    const [tableStructure] = await connection.execute("DESCRIBE models");

    // Check if table exists
    const [tables] = await connection.execute("SHOW TABLES LIKE 'models'");

    return res.status(200).json({
      success: 1,
      data: {
        tableExists: tables.length > 0,
        verifiedColumnExists: columns.length > 0,
        verifiedColumn: columns[0] || null,
        tableStructure: tableStructure,
        allColumns: tableStructure.map((col) => col.Field),
      },
    });
  } catch (error) {
    console.error("Database error:", error);
    return res.status(500).json({
      success: 0,
      message: "Database error occurred",
      error: error.message,
      details: {
        code: error.code,
        errno: error.errno,
        sqlState: error.sqlState,
        sqlMessage: error.sqlMessage,
      },
    });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// pages/api/admin/add-verified-column.js
// API endpoint to add the verified column to the models table

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
    res.setHeader("Allow", "POST,OPTIONS");
    return res.status(204).end();
  }

  if (method !== "POST") {
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

    if (columns.length > 0) {
      return res.status(200).json({
        success: 1,
        message: "Verified column already exists",
        data: { column: columns[0] },
      });
    }

    // Add verified column
    console.log("Adding verified column to models table");
    await connection.execute(
      "ALTER TABLE models ADD COLUMN verified TINYINT(1) DEFAULT 0 COMMENT 'Whether the therapist is verified (0 = not verified, 1 = verified)'"
    );

    // Add index for better performance
    await connection.execute(
      "CREATE INDEX idx_models_verified ON models(verified)"
    );

    return res.status(200).json({
      success: 1,
      message: "Verified column added successfully",
      data: {
        columnAdded: true,
        indexAdded: true,
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

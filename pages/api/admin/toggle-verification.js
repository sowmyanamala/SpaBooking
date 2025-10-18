// pages/api/admin/toggle-verification.js
// API endpoint for admins to manually toggle therapist verification status

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
  const { method, query, body } = req;

  // Handle OPTIONS
  if (method === "OPTIONS") {
    res.setHeader("Allow", "PUT,OPTIONS");
    return res.status(204).end();
  }

  if (method !== "PUT") {
    return res.status(405).json({ success: 0, message: "Method not allowed" });
  }

  const therapistId = Number(query.id);
  if (!Number.isInteger(therapistId) || therapistId <= 0) {
    return res
      .status(400)
      .json({ success: 0, message: "Invalid therapist ID" });
  }

  const { verified } = body;
  if (typeof verified !== "boolean") {
    return res.status(400).json({
      success: 0,
      message: "Invalid verified status. Must be true or false",
    });
  }

  let connection;
  try {
    console.log("=== TOGGLE VERIFICATION DEBUG ===");
    console.log("Therapist ID:", therapistId);
    console.log("Verified status:", verified);
    console.log("Database config:", {
      host: dbConfig.host,
      user: dbConfig.user,
      database: dbConfig.database,
      port: dbConfig.port,
    });

    connection = await mysql.createConnection(dbConfig);
    console.log("✅ Database connection successful");

    // First, check if the verified column exists
    console.log("Checking if verified column exists...");
    const [columns] = await connection.execute(
      "SHOW COLUMNS FROM models LIKE 'verified'"
    );

    if (columns.length === 0) {
      console.log("❌ Verified column does not exist, adding it...");
      await connection.execute(
        "ALTER TABLE models ADD COLUMN verified TINYINT(1) DEFAULT 0 COMMENT 'Whether the therapist is verified (0 = not verified, 1 = verified)'"
      );
      console.log("✅ Verified column added successfully");
    } else {
      console.log("✅ Verified column exists");
    }

    // Check if therapist exists
    console.log("Checking if therapist exists...");
    const [therapistCheck] = await connection.execute(
      "SELECT id, name FROM models WHERE id = ?",
      [therapistId]
    );

    if (therapistCheck.length === 0) {
      console.log("❌ Therapist not found");
      return res.status(404).json({
        success: 0,
        message: "Therapist not found",
      });
    }

    console.log("✅ Therapist found:", therapistCheck[0]);

    // Update verification status in models table
    console.log(
      `Updating therapist ${therapistId} verification to ${verified}`
    );
    const [result] = await connection.execute(
      "UPDATE models SET verified = ?, updated_at = NOW() WHERE id = ?",
      [verified ? 1 : 0, therapistId]
    );

    console.log("Update result:", result);

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: 0, message: "Therapist not found" });
    }

    console.log("✅ Update successful");
    return res.status(200).json({
      success: 1,
      data: { verified: verified },
      message: `Therapist ${verified ? "verified" : "unverified"} successfully`,
    });
  } catch (error) {
    console.error("❌ Database error:", error);
    return res.status(500).json({
      success: 0,
      message: "Database error occurred",
      error: error.message,
      details: {
        code: error.code,
        errno: error.errno,
        sqlState: error.sqlState,
        sqlMessage: error.sqlMessage,
        stack: error.stack,
      },
    });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

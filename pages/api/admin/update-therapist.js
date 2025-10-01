// pages/api/admin/update-therapist.js
import mysql from "mysql2/promise";
import { dbConfig } from "../../../db-config.js";

export default async function handler(req, res) {
  const { method, query, body } = req;

  // Handle OPTIONS
  if (method === "OPTIONS") {
    res.setHeader("Allow", "PUT,DELETE,OPTIONS");
    return res.status(204).end();
  }

  if (method !== "PUT" && method !== "DELETE") {
    return res.status(405).json({ success: 0, message: "Method not allowed" });
  }

  const id = Number(query.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res
      .status(400)
      .json({ success: 0, message: "Invalid therapist ID" });
  }

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);

    if (method === "PUT") {
      const { status } = body;

      if (!status || !["active", "suspended"].includes(status)) {
        return res.status(400).json({ success: 0, message: "Invalid status" });
      }

      // Map frontend status to database status
      const dbStatus = status === "active" ? "ready" : "pending";

      const [result] = await connection.execute(
        "UPDATE models SET status = ? WHERE id = ?",
        [dbStatus, id]
      );

      if (result.affectedRows === 0) {
        return res
          .status(404)
          .json({ success: 0, message: "Therapist not found" });
      }

      return res.status(200).json({
        success: 1,
        data: {},
        message: `Therapist ${
          status === "suspended" ? "suspended" : "activated"
        } successfully`,
      });
    } else if (method === "DELETE") {
      const [result] = await connection.execute(
        "DELETE FROM models WHERE id = ?",
        [id]
      );

      if (result.affectedRows === 0) {
        return res
          .status(404)
          .json({ success: 0, message: "Therapist not found" });
      }

      return res.status(200).json({
        success: 1,
        data: [],
        message: "Therapist deleted successfully",
      });
    }
  } catch (error) {
    console.error("Database error:", error);
    return res.status(500).json({
      success: 0,
      message: "Database error occurred",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

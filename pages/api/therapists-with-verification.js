// pages/api/therapists-with-verification.js
// API endpoint that fetches therapists and adds verification status

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
  const { method, query } = req;

  // Handle OPTIONS
  if (method === "OPTIONS") {
    res.setHeader("Allow", "GET,OPTIONS");
    return res.status(204).end();
  }

  if (method !== "GET") {
    return res.status(405).json({ success: 0, message: "Method not allowed" });
  }

  try {
    // Build the original API URL with all query parameters
    const originalApiUrl = "https://tsm.spagram.com/api/filter-models.php";
    const params = new URLSearchParams();

    // Add all query parameters from the request
    Object.entries(query).forEach(([key, value]) => {
      if (value) {
        params.append(key, value);
      }
    });

    const fullUrl = params.toString()
      ? `${originalApiUrl}?${params.toString()}`
      : originalApiUrl;

    // Fetch therapists from the original API
    const response = await fetch(fullUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const therapists = await response.json();

    // If the response is not an array, return as is
    if (!Array.isArray(therapists)) {
      return res.status(200).json(therapists);
    }

    // Get verification status from database for all therapists
    const connection = await mysql.createConnection(dbConfig);

    const therapistIds = therapists.map((t) => t.id).filter((id) => id);
    let verificationMap = {};

    if (therapistIds.length > 0) {
      const placeholders = therapistIds.map(() => "?").join(",");
      const [rows] = await connection.execute(
        `SELECT id, verified FROM models WHERE id IN (${placeholders})`,
        therapistIds
      );

      verificationMap = rows.reduce((acc, row) => {
        acc[row.id] = row.verified === 1;
        return acc;
      }, {});
    }

    await connection.end();

    // Add verification status to each therapist
    const therapistsWithVerification = therapists.map((therapist) => ({
      ...therapist,
      verified: verificationMap[therapist.id] || false,
    }));

    return res.status(200).json(therapistsWithVerification);
  } catch (error) {
    console.error("Error in therapists-with-verification API:", error);
    return res.status(500).json({
      success: 0,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

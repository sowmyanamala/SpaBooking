// pages/api/admin/therapists.js
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
  const PHP = "https://tsm.spagram.com/api/models.php";
  const THERAPISTS_PHP = "https://tsm.spagram.com/api/therapists.php";
  const { method, query, body } = req;

  // Handle OPTIONS (keeps tools / preflights happy)
  if (method === "OPTIONS") {
    res.setHeader("Allow", "GET,PUT,DELETE,OPTIONS");
    return res.status(204).end();
  }

  // Small helper: fetch with timeout
  const withTimeout = async (url, options = {}, ms = 10000) => {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), ms);
    try {
      const r = await fetch(url, {
        ...options,
        signal: ctrl.signal,
        cache: "no-store",
      });
      return r;
    } finally {
      clearTimeout(t);
    }
  };

  // Helper function to get verification status from database
  const getVerificationStatus = async (therapistIds) => {
    try {
      const connection = await mysql.createConnection(dbConfig);

      // Check if verified column exists
      const [columns] = await connection.execute(
        "SHOW COLUMNS FROM models LIKE 'verified'"
      );
      if (columns.length === 0) {
        // Add verified column if it doesn't exist
        await connection.execute(
          "ALTER TABLE models ADD COLUMN verified TINYINT(1) DEFAULT 0 COMMENT 'Whether the therapist is verified (0 = not verified, 1 = verified)'"
        );
      }

      // Get verification status for all therapists
      const placeholders = therapistIds.map(() => "?").join(",");
      const [rows] = await connection.execute(
        `SELECT id, verified FROM models WHERE id IN (${placeholders})`,
        therapistIds
      );

      await connection.end();

      // Create a map of id -> verified status
      const verificationMap = {};
      rows.forEach((row) => {
        verificationMap[row.id] = row.verified === 1;
      });

      return verificationMap;
    } catch (error) {
      console.error("Error fetching verification status:", error);
      return {};
    }
  };

  try {
    if (method === "GET") {
      const params = new URLSearchParams({
        page: String(Number(query.page) || 1),
        limit: String(Math.min(Math.max(Number(query.limit) || 25, 1), 100)),
      });

      // Only add search query if it's not empty
      if (query.q && query.q.trim() !== "") {
        params.append("q", query.q);
      }

      // Try therapists.php first, fallback to models.php if it fails
      let url = `${THERAPISTS_PHP}?${params.toString()}`;
      let r = await withTimeout(url);
      let j = await r.json();

      // If therapists.php fails, fallback to models.php
      if (!r.ok || j?.success !== 1) {
        console.log("therapists.php failed, falling back to models.php");
        url = `${PHP}?${params.toString()}`;
        r = await withTimeout(url);
        j = await r.json();

        // Handle models.php response (array format)
        if (r.ok && Array.isArray(j)) {
          // Get verification status from database
          const therapistIds = j.map((t) => t.id);
          const verificationMap = await getVerificationStatus(therapistIds);

          const mappedData = j.map((therapist) => ({
            ...therapist,
            status:
              therapist.status === "ready"
                ? "active"
                : therapist.status === "pending"
                ? "suspended"
                : therapist.status || "active",
            verified: verificationMap[therapist.id] || false,
          }));
          console.log(
            `Showing all ${mappedData.length} therapists from models.php`
          );
          return res.status(200).json({
            success: 1,
            data: mappedData,
            page: Number(query.page) || 1,
            limit: Number(query.limit) || 25,
            total: j.length,
            message: "Therapists loaded successfully",
          });
        }
      }

      // Handle therapists.php response (object format)
      if (r.ok && j?.success === 1) {
        console.log(
          `Showing all ${j.data.length} therapists out of ${j.total} total from therapists.php`
        );

        // Get verification status from database
        const therapistIds = j.data.map((t) => t.id);
        const verificationMap = await getVerificationStatus(therapistIds);

        // Add verification status to therapists.php response
        const therapistsWithVerification = j.data.map((therapist) => ({
          ...therapist,
          verified: verificationMap[therapist.id] || false,
        }));

        return res.status(200).json({
          ...j,
          data: therapistsWithVerification,
        });
      }

      return res.status(r.status).json({
        success: 0,
        data: [],
        message: j?.message || "Failed to load therapists",
      });
    }

    if (method === "PUT" || method === "DELETE") {
      const idNum = Number(query.id);
      if (!Number.isInteger(idNum) || idNum <= 0) {
        return res
          .status(400)
          .json({ success: "0", message: "Missing or invalid id" });
      }

      // Forward the request to the therapists API
      const updateUrl = `${THERAPISTS_PHP}?id=${idNum}`;

      const fetchOpts = {
        method,
        headers: {
          "Content-Type": "application/json",
        },
      };

      if (method === "PUT") {
        fetchOpts.body = JSON.stringify(body);
      }

      try {
        const r = await withTimeout(updateUrl, fetchOpts);
        const j = await r.json();

        if (r.ok && j?.success === 1) {
          return res.status(200).json(j);
        } else {
          return res.status(r.status).json(j);
        }
      } catch (updateError) {
        console.error("Update API error:", updateError);
        return res.status(502).json({
          success: 0,
          data: [],
          message: "Failed to update therapist in database",
        });
      }
    }

    res.setHeader("Allow", "GET,PUT,DELETE,OPTIONS");
    return res.status(405).end("Method Not Allowed");
  } catch (err) {
    const status = err.name === "AbortError" ? 504 : 502;
    return res
      .status(status)
      .json({ success: "0", message: err.message || "Upstream error" });
  }
}

// components/admin/therapists.js
import { useState, useEffect } from "react";
import styles from "./layout.module.css";

const API = "/api/admin/therapists"; // ← therapists proxy with fallback

export default function Therapists() {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const limit = 25;
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await fetch(
        `${API}?page=${page}&limit=${limit}&t=${Date.now()}`,
        {
          cache: "no-store",
        }
      );
      const j = await res.json();
      console.log("Therapists API response:", j);
      const ok =
        res.ok &&
        (j?.success === 1 || j?.success === "1" || j?.success === true);
      if (!ok) throw new Error(j?.message || `HTTP ${res.status}`);
      const data = Array.isArray(j.data) ? j.data : [];
      console.log("Therapists data:", data);
      setRows(data);
    } catch (e) {
      setErr(e.message || "Failed to load therapists");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [page]);

  // Force refresh when component mounts to ensure we get latest data
  useEffect(() => {
    const handleFocus = () => {
      load();
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  const handleSuspend = async (id, currentStatus) => {
    const newStatus =
      (currentStatus || "active") === "active" ? "suspended" : "active";
    try {
      const res = await fetch(`${API}?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const j = await res.json();
      const ok =
        res.ok &&
        (j?.success === 1 || j?.success === "1" || j?.success === true);
      if (ok) {
        setRows((u) =>
          u.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete therapist? This cannot be undone.")) return;
    try {
      const res = await fetch(`${API}?id=${id}`, {
        method: "DELETE",
      });
      const j = await res.json();
      const ok =
        res.ok &&
        (j?.success === 1 || j?.success === "1" || j?.success === true);
      if (ok) {
        setRows((prev) => prev.filter((r) => r.id !== id));
      }
    } catch (e) {
      console.error(`Delete failed: ${e.message}`);
    }
  };

  if (loading) return <p>Loading…</p>;
  if (err) return <p style={{ color: "crimson" }}>Error: {err}</p>;

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h2>Manage Therapists</h2>
        <button
          onClick={load}
          disabled={loading}
          style={{
            padding: "8px 16px",
            backgroundColor: "#0070f3",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Service Area</th>
            <th>Gender</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((t) => (
            <tr key={t.id}>
              <td>{t.id}</td>
              <td>{t.name || "N/A"}</td>
              <td>{t.email || "N/A"}</td>
              <td>{t.phone || "N/A"}</td>
              <td>{t.service_area_primary || t.service_area || "N/A"}</td>
              <td>{t.gender || "N/A"}</td>
              <td>
                <span className={styles.badge}>{t.status || "active"}</span>
              </td>
              <td style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => handleSuspend(t.id, t.status || "active")}
                >
                  {(t.status || "active") === "active" ? "Suspend" : "Activate"}
                </button>
                <button onClick={() => handleDelete(t.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* simple pager */}
      <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
        <button
          disabled={page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          Prev
        </button>
        <span>Page {page}</span>
        <button onClick={() => setPage((p) => p + 1)}>Next</button>
      </div>
    </div>
  );
}

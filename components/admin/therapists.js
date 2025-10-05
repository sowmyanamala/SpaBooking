// components/admin/therapists.js
import { useState, useEffect } from "react";
import styles from "./layout.module.css";
import CheckrVerificationStatus from "../verification/CheckrVerificationStatus";

const API = "/api/admin/therapists"; // ← therapists proxy with fallback

export default function Therapists() {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const limit = 25;
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [selectedTherapist, setSelectedTherapist] = useState(null);
  const [showVerificationStatus, setShowVerificationStatus] = useState(false);

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

  const handleViewVerification = (therapist) => {
    setSelectedTherapist(therapist);
    setShowVerificationStatus(true);
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
            <th>Verification</th>
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
              <td>
                <button
                  onClick={() => handleViewVerification(t)}
                  style={{
                    padding: "4px 8px",
                    fontSize: "12px",
                    backgroundColor: "#3b82f6",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  View Status
                </button>
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

      {/* Verification Status Modal */}
      {showVerificationStatus && selectedTherapist && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
            padding: "20px",
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "8px",
              padding: "20px",
              maxWidth: "800px",
              width: "100%",
              maxHeight: "80vh",
              overflowY: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
                borderBottom: "1px solid #e5e7eb",
                paddingBottom: "16px",
              }}
            >
              <h2>Verification Status - {selectedTherapist.name}</h2>
              <button
                onClick={() => {
                  setShowVerificationStatus(false);
                  setSelectedTherapist(null);
                }}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  color: "#6b7280",
                }}
              >
                ×
              </button>
            </div>
            <CheckrVerificationStatus therapistId={selectedTherapist.id} />
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from "react";
import styles from "./layout.module.css";

const API = "/api/admin/users"; // use the proxy...

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API}?limit=25&page=1`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setUsers(Array.isArray(json.data) ? json.data : []);
    } catch (e) {
      console.error("Error fetching users:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this user?")) return;
    try {
      const res = await fetch(`${API}?id=${id}`, { method: "DELETE" });
      if (res.ok) setUsers((u) => u.filter((row) => row.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const handleSuspend = async (id, currentStatus) => {
    const newStatus = currentStatus === "active" ? "suspended" : "active";
    try {
      const res = await fetch(`${API}?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setUsers((u) =>
          u.map((row) => (row.id === id ? { ...row, status: newStatus } : row))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <p>Loading users...</p>;

  return (
    <div>
      <h2>Manage Users</h2>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>City</th>
            <th>Zip</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.city}</td>
              <td>{user.zip}</td>
              <td>
                <span className={styles.badge}>{user.status || "active"}</span>
              </td>
              <td>
                <button
                  onClick={() =>
                    handleSuspend(user.id, user.status || "active")
                  }
                >
                  {(user.status || "active") === "active"
                    ? "Suspend"
                    : "Reactivate"}
                </button>
                <button onClick={() => handleDelete(user.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

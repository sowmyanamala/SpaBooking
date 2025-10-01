import { useState, useEffect } from "react";
import styles from "./layout.module.css";

const API = "/api/admin/services";

export default function Services({ initialServices }) {
  const [services, setServices] = useState(initialServices || []);
  const [editingService, setEditingService] = useState(null);
  const [newServiceName, setNewServiceName] = useState("");
  const [loading, setLoading] = useState(!initialServices);

  useEffect(() => {
    if (initialServices) {
      setServices(initialServices);
      setLoading(false);
    } else {
      fetchServices();
    }
  }, [initialServices]);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}?limit=100&page=1`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setServices(Array.isArray(json.data) ? json.data : []);
    } catch (e) {
      console.error("Error fetching services:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddService = async () => {
    if (!newServiceName.trim()) return;
    try {
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newServiceName.trim() }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.success) {
        const newService = json.data || {
          id: newServiceName.toLowerCase().replace(/\s+/g, "-"),
          name: newServiceName.trim(),
        };
        setServices([...services, newService]);
        setNewServiceName("");
      }
    } catch (e) {
      console.error("Error adding service:", e);
    }
  };

  const handleEditService = (service) => {
    setEditingService(service);
  };

  const handleSaveEdit = async () => {
    if (!editingService.name.trim()) return;
    try {
      const res = await fetch(`${API}?id=${editingService.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editingService.name.trim() }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.success) {
        setServices(
          services.map((s) => (s.id === editingService.id ? editingService : s))
        );
        setEditingService(null);
      }
    } catch (e) {
      console.error("Error updating service:", e);
    }
  };

  const handleDeleteService = async (id) => {
    if (!confirm("Are you sure you want to delete this service?")) return;
    try {
      const res = await fetch(`${API}?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.success) {
        setServices(services.filter((s) => s.id !== id));
      }
    } catch (e) {
      console.error("Error deleting service:", e);
    }
  };

  if (loading) return <p>Loading services...</p>;

  return (
    <div>
      <h2>Manage Services</h2>
      <div style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="New service name"
          value={newServiceName}
          onChange={(e) => setNewServiceName(e.target.value)}
          style={{ marginRight: "8px", padding: "8px" }}
        />
        <button onClick={handleAddService}>Add Service</button>
      </div>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {services.map((service) => (
              <tr key={service.id}>
                <td>{service.id}</td>
                <td>
                  {editingService && editingService.id === service.id ? (
                    <input
                      type="text"
                      value={editingService.name}
                      onChange={(e) =>
                        setEditingService({
                          ...editingService,
                          name: e.target.value,
                        })
                      }
                    />
                  ) : (
                    service.name
                  )}
                </td>
                <td>
                  {editingService && editingService.id === service.id ? (
                    <>
                      <button onClick={handleSaveEdit}>Save</button>
                      <button onClick={() => setEditingService(null)}>
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleEditService(service)}>
                        Edit
                      </button>
                      <button onClick={() => handleDeleteService(service.id)}>
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {services.length === 0 && (
              <tr>
                <td colSpan="3" style={{ padding: "8px", textAlign: "center" }}>
                  No services available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

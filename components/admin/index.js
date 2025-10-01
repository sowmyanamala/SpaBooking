import AdminLayout from "./layout";
import styles from "./layout.module.css";
import { useState, useEffect } from "react";

export default function AdminHome() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTherapists: 0,
    totalOrders: 0,
    totalRevenue: 0,
    loading: true,
  });

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // Fetch users count
      const usersRes = await fetch("/api/admin/users?limit=1&page=1");
      const usersData = await usersRes.json();

      // Fetch therapists count
      const therapistsRes = await fetch("/api/admin/therapists?limit=1&page=1");
      const therapistsData = await therapistsRes.json();

      // Fetch orders data
      const ordersRes = await fetch(
        "https://tsm.spagram.com/api/getpendingorders.php"
      );
      const ordersData = await ordersRes.json();

      // Calculate total revenue from orders
      const totalRevenue = Array.isArray(ordersData)
        ? ordersData.reduce(
            (sum, order) => sum + (parseFloat(order.amount) || 0),
            0
          )
        : 0;

      setStats({
        totalUsers: usersData.total || 0,
        totalTherapists: therapistsData.total || 0,
        totalOrders: Array.isArray(ordersData) ? ordersData.length : 0,
        totalRevenue: totalRevenue,
        recentOrders: Array.isArray(ordersData) ? ordersData : [],
        loading: false,
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      setStats((prev) => ({ ...prev, loading: false }));
    }
  };

  return (
    <AdminLayout title="Dashboard">
      {/* KPI Cards */}
      <section className={styles.cards}>
        <div className={styles.card}>
          <p className={styles.cardTitle}>Total Users</p>
          <div className={styles.cardValue}>
            {stats.loading ? "..." : stats.totalUsers}
          </div>
        </div>
        <div className={styles.card}>
          <p className={styles.cardTitle}>Total Therapists</p>
          <div className={styles.cardValue}>
            {stats.loading ? "..." : stats.totalTherapists}
          </div>
        </div>
        <div className={styles.card}>
          <p className={styles.cardTitle}>Total Orders</p>
          <div className={styles.cardValue}>
            {stats.loading ? "..." : stats.totalOrders}
          </div>
        </div>
        <div className={styles.card}>
          <p className={styles.cardTitle}>Total Revenue</p>
          <div className={styles.cardValue}>
            {stats.loading ? "..." : `$${stats.totalRevenue}`}
          </div>
        </div>
      </section>

      {/* Charts area (placeholders – swap with Recharts/Chart.js later) */}
      <section className={styles.widgets}>
        <div className={styles.widget} style={{ height: 320 }}>
          <strong>User Statistics</strong>
          <div
            style={{
              height: 260,
              marginTop: 10,
              borderRadius: 12,
              background:
                "linear-gradient(180deg, rgba(255,99,132,.08), rgba(255,99,132,.02))",
              boxShadow: "inset 0 0 0 1px rgba(255,99,132,.15)",
            }}
          />
          <div
            style={{
              display: "flex",
              gap: 24,
              marginTop: 8,
              fontSize: 12,
              color: "#7d7d8c",
            }}
          >
            <span>
              Weekly Users <b style={{ color: "#1e2124" }}>10,840</b>
            </span>
            <span>
              Monthly Users <b style={{ color: "#1e2124" }}>1,020,321</b>
            </span>
            <span>Trend ⤴</span>
          </div>
        </div>
        <div className={styles.widget}>
          <strong>Top 5 Products</strong>
          <div
            style={{
              height: 260,
              marginTop: 10,
              borderRadius: 12,
              background:
                "radial-gradient(circle, rgba(255,99,132,.12), rgba(255,99,132,.03))",
              boxShadow: "inset 0 0 0 1px rgba(255,99,132,.15)",
            }}
          />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 8,
              fontSize: 12,
              color: "#7d7d8c",
              marginTop: 6,
            }}
          >
            <span className={styles.badge}>Paleo Bars</span>
            <span className={styles.badge}>Bow Ties</span>
            <span className={styles.badge}>Pocket Squares</span>
            <span className={styles.badge}>Wood Sunglasses</span>
            <span className={styles.badge}>Leggings</span>
          </div>
        </div>
      </section>

      {/* Recent Orders Table */}
      <section className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Therapist</th>
              <th>Service</th>
              <th>Date</th>
              <th>Status</th>
              <th>Amount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {stats.loading ? (
              <tr>
                <td
                  colSpan="8"
                  style={{ textAlign: "center", padding: "20px" }}
                >
                  Loading recent orders...
                </td>
              </tr>
            ) : stats.recentOrders && stats.recentOrders.length > 0 ? (
              stats.recentOrders.slice(0, 6).map((order) => (
                <tr key={order.id}>
                  <td>#{order.id}</td>
                  <td>{order.customer_name || "N/A"}</td>
                  <td>{order.model_name || "N/A"}</td>
                  <td>{order.service_type || "N/A"}</td>
                  <td>{order.date || "N/A"}</td>
                  <td>
                    <span className={styles.badge}>
                      {order.status || "Pending"}
                    </span>
                  </td>
                  <td>${order.amount || "N/A"}</td>
                  <td>
                    <a href={`/admin/orderSingle?id=${order.id}`} title="View">
                      🔍
                    </a>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="8"
                  style={{ textAlign: "center", padding: "20px" }}
                >
                  No recent orders found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </AdminLayout>
  );
}

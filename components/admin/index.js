import AdminLayout from "./layout";
import styles from "./layout.module.css";
import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

export default function AdminHome() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTherapists: 0,
    totalOrders: 0,
    totalRevenue: 0,
    loading: true,
  });

  const [chartData, setChartData] = useState({
    weeklyUsers: [],
    monthlyRevenue: [],
    summary: {},
  });

  const [topServices, setTopServices] = useState([]);

  useEffect(() => {
    fetchDashboardStats();
    fetchChartData();
    fetchTopServices();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      console.log("Fetching dashboard stats...");

      // Fetch users count
      const usersRes = await fetch("/api/admin/users?limit=1&page=1");
      const usersData = await usersRes.json();
      console.log("Users data:", usersData);

      // Fetch therapists count
      const therapistsRes = await fetch("/api/admin/therapists?limit=1&page=1");
      const therapistsData = await therapistsRes.json();
      console.log("Therapists data:", therapistsData);

      // Fetch orders data
      const ordersRes = await fetch(
        "https://tsm.spagram.com/api/getpendingorders.php"
      );
      const ordersData = await ordersRes.json();
      console.log("Orders data:", ordersData);

      // Calculate total revenue from orders
      const totalRevenue = Array.isArray(ordersData)
        ? ordersData.reduce((sum, order) => {
            const amount = parseFloat(order.amount || order.total || 0);
            return sum + (isNaN(amount) ? 0 : amount);
          }, 0)
        : 0;

      const statsData = {
        totalUsers: usersData.total || usersData.count || 0,
        totalTherapists: therapistsData.total || therapistsData.count || 0,
        totalOrders: Array.isArray(ordersData) ? ordersData.length : 0,
        totalRevenue: Math.round(totalRevenue * 100) / 100, // Round to 2 decimal places
        recentOrders: Array.isArray(ordersData) ? ordersData : [],
        loading: false,
      };

      console.log("Final stats data:", statsData);
      setStats(statsData);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      setStats((prev) => ({ ...prev, loading: false }));
    }
  };

  const fetchChartData = async () => {
    try {
      const response = await fetch(
        "https://tsm.spagram.com/api/getchartdata.php"
      );
      const data = await response.json();
      console.log("Chart data:", data);
      setChartData(data);
    } catch (error) {
      console.error("Error fetching chart data:", error);
      // Fallback to mock data for development
      setChartData({
        weekly_users: [
          { week: "2024-40", count: 5 },
          { week: "2024-41", count: 8 },
          { week: "2024-42", count: 12 },
          { week: "2024-43", count: 15 },
          { week: "2024-44", count: 10 },
          { week: "2024-45", count: 18 },
          { week: "2024-46", count: 22 },
        ],
        monthly_revenue: [
          { month: "2024-07", revenue: 1200 },
          { month: "2024-08", revenue: 1800 },
          { month: "2024-09", revenue: 2200 },
          { month: "2024-10", revenue: 1900 },
          { month: "2024-11", revenue: 2500 },
        ],
        summary: {
          total_weekly_users: 90,
          total_monthly_revenue: 9600,
          avg_daily_orders: 8,
        },
      });
    }
  };

  const fetchTopServices = async () => {
    try {
      const response = await fetch(
        "https://tsm.spagram.com/api/gettopservices.php"
      );
      const data = await response.json();
      console.log("Top services:", data);
      setTopServices(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching top services:", error);
      // Fallback to mock data for development
      setTopServices([
        {
          name: "Swedish Massage",
          order_count: 25,
          total_revenue: 1250,
          avg_price: 50,
        },
        {
          name: "Deep Tissue",
          order_count: 18,
          total_revenue: 1080,
          avg_price: 60,
        },
        {
          name: "Hot Stone",
          order_count: 15,
          total_revenue: 900,
          avg_price: 60,
        },
        {
          name: "Sports Massage",
          order_count: 12,
          total_revenue: 720,
          avg_price: 60,
        },
        {
          name: "Reflexology",
          order_count: 10,
          total_revenue: 500,
          avg_price: 50,
        },
      ]);
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
            {stats.loading ? "..." : `$${stats.totalRevenue.toLocaleString()}`}
          </div>
        </div>
      </section>

      {/* Charts area */}
      <section className={styles.widgets}>
        <div className={styles.widget} style={{ height: 320 }}>
          <strong>User Statistics</strong>
          <div style={{ height: 200, marginTop: 10 }}>
            {chartData.weekly_users && chartData.weekly_users.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData.weekly_users}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="week"
                    tick={{ fontSize: 10 }}
                    stroke="#666"
                    tickFormatter={(value) => `Week ${value.split("-")[1]}`}
                  />
                  <YAxis tick={{ fontSize: 10 }} stroke="#666" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #ddd",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#ff6384"
                    strokeWidth={2}
                    dot={{ fill: "#ff6384", strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div
                style={{
                  height: "100%",
                  borderRadius: 12,
                  background:
                    "linear-gradient(180deg, rgba(255,99,132,.08), rgba(255,99,132,.02))",
                  boxShadow: "inset 0 0 0 1px rgba(255,99,132,.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#999",
                }}
              >
                No user data available
              </div>
            )}
          </div>
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
              Weekly Users{" "}
              <b style={{ color: "#1e2124" }}>
                {chartData.summary?.total_weekly_users || 0}
              </b>
            </span>
            <span>
              Avg Daily Orders{" "}
              <b style={{ color: "#1e2124" }}>
                {chartData.summary?.avg_daily_orders || 0}
              </b>
            </span>
            <span>Trend ⤴</span>
          </div>
        </div>

        <div className={styles.widget}>
          <strong>Top 5 Services</strong>
          <div style={{ height: 200, marginTop: 10 }}>
            {topServices.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topServices}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10 }}
                    stroke="#666"
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis tick={{ fontSize: 10 }} stroke="#666" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #ddd",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                    formatter={(value, name) => [
                      value,
                      name === "order_count" ? "Orders" : "Revenue",
                    ]}
                  />
                  <Bar
                    dataKey="order_count"
                    fill="#ff6384"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div
                style={{
                  height: "100%",
                  borderRadius: 12,
                  background:
                    "radial-gradient(circle, rgba(255,99,132,.12), rgba(255,99,132,.03))",
                  boxShadow: "inset 0 0 0 1px rgba(255,99,132,.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#999",
                }}
              >
                No service data available
              </div>
            )}
          </div>
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
            {topServices.slice(0, 5).map((service, index) => (
              <span
                key={index}
                className={styles.badge}
                title={`${service.order_count} orders`}
              >
                {service.name} ({service.order_count})
              </span>
            ))}
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
              stats.recentOrders.slice(0, 6).map((order) => {
                // Format date properly
                let formattedDate = "N/A";
                const date = order.request_time || order.date;
                if (date) {
                  try {
                    const dateObj = new Date(date);
                    if (!isNaN(dateObj.getTime())) {
                      formattedDate = dateObj.toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      });
                    }
                  } catch (error) {
                    formattedDate = date;
                  }
                }

                return (
                  <tr key={order.id}>
                    <td>#{order.id}</td>
                    <td>{order.customer_name || "Unknown Customer"}</td>
                    <td>{order.model_name || "Unknown Therapist"}</td>
                    <td>
                      {order.call_type ||
                        order.service_type ||
                        "Unknown Service"}
                    </td>
                    <td>{formattedDate}</td>
                    <td>
                      <span className={styles.badge}>
                        {order.status || "Pending"}
                      </span>
                    </td>
                    <td>${order.amount || "0"}</td>
                    <td>
                      <a
                        href={`/admin/orderSingle?id=${order.id}`}
                        title="View"
                      >
                        🔍
                      </a>
                    </td>
                  </tr>
                );
              })
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

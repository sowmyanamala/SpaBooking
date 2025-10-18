import React, { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import Link from "next/link";
import AdminLayout, { siteTitle } from "../../components/admin/layout";
import ordersStyles from "../../styles/admin/orders.module.css";
import withAuth from "../../components/admin/withAuth";
import axios from "axios";
import {
  formatTime12Hour,
  formatDateTimeComponents,
} from "../../utils/timeFormat";

const Orders = () => {
  const [orderData, setOrderData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [noOrder, setNoOrder] = useState(false);

  const fetchOrders = useCallback(async (signal) => {
    setLoading(true);
    setError("");
    setNoOrder(false);

    try {
      const url = `https://tsm.spagram.com/api/getpendingorders.php`; // Omit modelid for admin to get all
      const res = await axios.get(url, { signal });
      const data = Array.isArray(res.data) ? res.data : [];

      setOrderData(data);
      setNoOrder(data.length === 0);
    } catch (err) {
      // Ignore aborts
      if (axios.isCancel?.(err) || err?.name === "CanceledError") return;
      setError(err?.message || "Failed to load orders.");
      setOrderData([]);
      setNoOrder(false);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    const controller = new AbortController();
    fetchOrders(controller.signal);
    return () => controller.abort();
  }, [fetchOrders]);

  return (
    <AdminLayout active="orders">
      <Head>
        <title>Admin Orders | {siteTitle}</title>
      </Head>

      <div className={ordersStyles.ordersContainer}>
        <h2 className={ordersStyles.ordersTitle}>All Orders</h2>

        {loading && <p className={ordersStyles.loading}>Loading orders…</p>}

        {!loading && error && (
          <div className={ordersStyles.error}>
            <p>{error}</p>
            <button
              className="button"
              onClick={() => fetchOrders(new AbortController().signal)}
              type="button"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && noOrder && (
          <p className={ordersStyles.noOrders}>No orders found.</p>
        )}

        {!loading && !error && !noOrder && (
          <div className={ordersStyles.ordersTable}>
            <table>
              <thead className={ordersStyles.thead}>
                <tr>
                  <th className={ordersStyles.th}>ID</th>
                  <th className={ordersStyles.th}>Customer</th>
                  <th className={ordersStyles.th}>Model</th>
                  <th className={ordersStyles.th}>Service</th>
                  <th className={ordersStyles.th}>Date</th>
                  <th className={ordersStyles.th}>Time</th>
                  <th className={ordersStyles.th}>Status</th>
                  <th className={ordersStyles.th}>Amount</th>
                  <th className={ordersStyles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orderData.map((order) => {
                  // Debug log to see what data we're getting
                  console.log("Order data:", order);

                  const id = order?.id ?? order?.Id ?? "";
                  const customer =
                    order?.customer_name ??
                    order?.customer ??
                    "Unknown Customer";
                  const model =
                    order?.model_name ?? order?.model ?? "Unknown Therapist";
                  const service =
                    order?.call_type ??
                    order?.service_type ??
                    "Unknown Service";
                  const date = order?.request_time ?? order?.date ?? "";
                  const time = order?.service_time ?? order?.time ?? "";

                  // Format time to 12-hour format
                  const formattedTime = time ? formatTime12Hour(time) : "N/A";

                  // Format date properly - handle different date formats
                  let formattedDate = "N/A";
                  if (date) {
                    try {
                      // Try to parse the date
                      const dateObj = new Date(date);
                      if (!isNaN(dateObj.getTime())) {
                        formattedDate = dateObj.toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        });
                      }
                    } catch (error) {
                      console.error(
                        "Date parsing error:",
                        error,
                        "for date:",
                        date
                      );
                      formattedDate = date; // Fallback to original date string
                    }
                  }

                  const status =
                    order?.status ?? order?.order_status ?? "Initiated";
                  const amount = order?.amount ?? order?.total ?? "N/A";

                  const statusClass =
                    ordersStyles[
                      `status${
                        status.charAt(0).toUpperCase() + status.slice(1)
                      }`
                    ];

                  return (
                    <tr key={id}>
                      <td className={ordersStyles.td}>{id}</td>
                      <td className={ordersStyles.td}>{customer}</td>
                      <td className={ordersStyles.td}>{model}</td>
                      <td className={ordersStyles.td}>{service}</td>
                      <td className={ordersStyles.td}>{formattedDate}</td>
                      <td className={ordersStyles.td}>{formattedTime}</td>
                      <td className={ordersStyles.td}>
                        <span
                          className={`${ordersStyles.statusBadge} ${statusClass}`}
                        >
                          {status}
                        </span>
                      </td>
                      <td className={ordersStyles.td}>{amount}</td>
                      <td className={ordersStyles.td}>
                        <div className={ordersStyles.actions}>
                          <Link
                            href={`/admin/orderSingle?id=${id}`}
                            className={ordersStyles.viewBtn}
                          >
                            View
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default withAuth(Orders);

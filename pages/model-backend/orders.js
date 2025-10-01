// pages/model-backend/orders.js
import React, { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import Layout, { siteTitle } from "../../components/model/layout";
import styles from "../../styles/orders.module.css";
import withAuth from "../../components/model/withAuth";
import axios from "axios";
import OrderSingle from "./orderSingle.js";

function parseJwt(token) {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

const Orders = () => {
  const [orderData, setOrderData] = useState([]);
  const [modelId, setModelId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [noOrder, setNoOrder] = useState(false);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  const changeOrderStatus = useCallback(() => {
    setRefetchTrigger((t) => t + 1);
  }, []);

  // Read modelId once (prefer explicit modelId, fallback to token decode)
  useEffect(() => {
    if (typeof window === "undefined") return;
    let id = localStorage.getItem("modelId");

    if (!id || id === "undefined") {
      const token = localStorage.getItem("token");

      if (token) {
        // If token is a simple numeric ID, use it directly
        if (/^\d+$/.test(token)) {
          id = token;
          localStorage.setItem("modelId", String(id));
        } else {
          // Otherwise, try to decode as JWT
          try {
            const payload = parseJwt(token);
            id = payload?.id || payload?.userId || payload?.modelId || null;
            if (id) localStorage.setItem("modelId", String(id));
          } catch (error) {
            console.error("Error parsing token:", error);
          }
        }
      }
    }
    console.log("Model ID determined:", id);
    if (id) setModelId(String(id));
  }, []);

  const fetchOrders = useCallback(async (id, signal) => {
    if (!id) {
      return;
    }
    setLoading(true);
    setError("");
    setNoOrder(false);
    try {
      const url = `https://tsm.spagram.com/api/getpendingorders.php?modelid=${encodeURIComponent(
        id
      )}`;
      const { data } = await axios.get(url, { signal });
      const rows = Array.isArray(data) ? data : [];
      setOrderData(rows);
      setNoOrder(rows.length === 0);
    } catch (err) {
      if (axios.isCancel(err) || err?.name === "CanceledError") {
        return;
      }
      console.error("Error fetching orders:", err);
      setError(err?.message || "Failed to load orders.");
      setOrderData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!modelId) return;
    const controller = new AbortController();
    fetchOrders(modelId, controller.signal);
    return () => controller.abort();
  }, [modelId, refetchTrigger, fetchOrders]);

  return (
    <Layout orders>
      <Head>
        <title>{siteTitle}</title>
      </Head>

      <div className={styles.container}>
        <h2 className={styles.title}>Your Service Request</h2>

        {loading && <p className={styles.loading}>Loading pending requests…</p>}

        {!loading && error && (
          <div className={styles.error}>
            <p>{error}</p>
            <button onClick={() => fetchOrders(modelId)} type="button">
              Retry
            </button>
          </div>
        )}

        {!loading && !error && noOrder && (
          <p className={styles.noOrders}>
            You don&apos;t have any pending service request.
          </p>
        )}

        {!loading && !error && !noOrder && (
          <div>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Request Time</th>
                  <th>Customer Name</th>
                  <th>Address</th>
                  <th>Call Type</th>
                  <th>Service Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {orderData.map((order, index) => (
                  <OrderSingle
                    key={order?.id ?? index}
                    order={order}
                    modelId={modelId}
                    changeOrderStatus={changeOrderStatus}
                    styles={styles}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default withAuth(Orders);

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import axios from "axios";
import AdminLayout, { siteTitle } from "../../components/admin/layout";
import ordersStyles from "../../styles/admin/orders.module.css";
import withAuth from "../../components/admin/withAuth";
import { formatTime12Hour, formatDateTime12Hour } from "../../utils/timeFormat";

function OrderSingle() {
  const router = useRouter();
  const { id } = router.query;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [updateErr, setUpdateErr] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("Initiated");

  const fetchOrder = async () => {
    if (!id) return;
    setLoading(true);
    setError("");

    try {
      const url = `https://tsm.spagram.com/api/getorder.php?id=${encodeURIComponent(
        id
      )}`;
      const res = await axios.get(url);
      if (res.data && typeof res.data === "object") {
        setOrder(res.data);
        setSelectedStatus(
          res.data?.status ?? res.data?.order_status ?? "Initiated"
        );
      } else {
        throw new Error("Order not found");
      }
    } catch (err) {
      setError(err?.message || "Failed to load order details.");
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchOrder();
    }
  }, [id]);

  const handleUpdate = async (nextStatus) => {
    if (!order || !id) return;
    setSaving(true);
    setUpdateErr("");

    try {
      const adminToken =
        localStorage.getItem("adminToken") ||
        localStorage.getItem("token") ||
        "";
      const payload = {
        id: order.id ?? order.Id,
        order_status: nextStatus,
        // For admin, no model_id needed; server verifies admin access
      };

      const res = await axios.post(
        "https://tsm.spagram.com/api/update-order.php",
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      if (res.data?.success === "1") {
        setOrder({ ...order, status: nextStatus, order_status: nextStatus });
        setSelectedStatus(nextStatus);
      } else {
        throw new Error(res.data?.message || "Update failed");
      }
    } catch (e) {
      setUpdateErr(e?.message || "Could not update order");
    } finally {
      setSaving(false);
    }
  };

  // Tolerant field mapping
  if (loading) {
    return (
      <AdminLayout active="orders">
        <Head>
          <title>Loading Order | {siteTitle}</title>
        </Head>
        <div className={ordersStyles.ordersContainer}>
          <p className={ordersStyles.loading}>Loading order details…</p>
        </div>
      </AdminLayout>
    );
  }

  if (error || !order) {
    return (
      <AdminLayout active="orders">
        <Head>
          <title>Order Not Found | {siteTitle}</title>
        </Head>
        <div className={ordersStyles.ordersContainer}>
          <div className={ordersStyles.error}>
            <p>{error || "Order not found."}</p>
            <Link href="/admin/orders">
              <a className={ordersStyles.backBtn}>Back to Orders</a>
            </Link>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const requestTime = order?.request_time ?? order?.date_of_creation ?? "";
  const address = order?.address ?? order?.service_address ?? "";
  const callType = order?.call_type ?? order?.service_type ?? "";
  const serviceTime = order?.service_time ?? "";
  const status = order?.status ?? order?.order_status ?? "Initiated";
  const amount = order?.amount ?? order?.total ?? "N/A";
  const customerName = order?.customer_name ?? order?.customer ?? "N/A";
  const customerEmail = order?.customer_email ?? "N/A";
  const customerPhone = order?.customer_phone ?? "N/A";
  const modelName = order?.model_name ?? order?.model ?? "N/A";
  const date = order?.date ?? requestTime;
  const paymentStatus = order?.payment_status ?? "Pending";

  const isInitiated = status === "Initiated";

  return (
    <AdminLayout active="orders">
      <Head>
        <title>
          Order {id} | {siteTitle}
        </title>
      </Head>
      <div className={ordersStyles.ordersContainer}>
        <div
          className={ordersStyles.actionsButtons}
          style={{
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h2 className={ordersStyles.ordersTitle}>Order Details #{id}</h2>
          <Link href="/admin/orders">
            <a className={ordersStyles.backBtn}>Back to Orders</a>
          </Link>
        </div>

        <div className={ordersStyles.detailsContainer}>
          {/* Order Information Section */}
          <div className={ordersStyles.section}>
            <h3 className={ordersStyles.sectionTitle}>Order Information</h3>
            <div className={ordersStyles.infoGrid}>
              <div className={ordersStyles.infoItem}>
                <span className={ordersStyles.infoLabel}>Order ID:</span>
                <span className={ordersStyles.infoValue}>{id}</span>
              </div>
              <div className={ordersStyles.infoItem}>
                <span className={ordersStyles.infoLabel}>Status:</span>
                <span className={ordersStyles.infoValue}>
                  <span
                    className={`${ordersStyles.statusBadge} ${
                      ordersStyles[
                        `status${
                          status.charAt(0).toUpperCase() + status.slice(1)
                        }`
                      ]
                    }`}
                  >
                    {status}
                  </span>
                </span>
              </div>
              <div className={ordersStyles.infoItem}>
                <span className={ordersStyles.infoLabel}>Request Date:</span>
                <span className={ordersStyles.infoValue}>
                  {formatDateTime12Hour(requestTime)}
                </span>
              </div>
              <div className={ordersStyles.infoItem}>
                <span className={ordersStyles.infoLabel}>Service Date:</span>
                <span className={ordersStyles.infoValue}>{date}</span>
              </div>
              <div className={ordersStyles.infoItem}>
                <span className={ordersStyles.infoLabel}>Service Time:</span>
                <span className={ordersStyles.infoValue}>
                  {formatTime12Hour(serviceTime)}
                </span>
              </div>
            </div>
          </div>

          {/* Customer Details Section */}
          <div className={ordersStyles.section}>
            <h3 className={ordersStyles.sectionTitle}>Customer Details</h3>
            <div className={ordersStyles.infoGrid}>
              <div className={ordersStyles.infoItem}>
                <span className={ordersStyles.infoLabel}>Name:</span>
                <span className={ordersStyles.infoValue}>{customerName}</span>
              </div>
              <div className={ordersStyles.infoItem}>
                <span className={ordersStyles.infoLabel}>Email:</span>
                <span className={ordersStyles.infoValue}>{customerEmail}</span>
              </div>
              <div className={ordersStyles.infoItem}>
                <span className={ordersStyles.infoLabel}>Phone:</span>
                <span className={ordersStyles.infoValue}>{customerPhone}</span>
              </div>
            </div>
          </div>

          {/* Model/Therapist Section */}
          <div className={ordersStyles.section}>
            <h3 className={ordersStyles.sectionTitle}>Model/Therapist</h3>
            <div className={ordersStyles.infoGrid}>
              <div className={ordersStyles.infoItem}>
                <span className={ordersStyles.infoLabel}>Name:</span>
                <span className={ordersStyles.infoValue}>{modelName}</span>
              </div>
            </div>
          </div>

          {/* Service Details Section */}
          <div className={ordersStyles.section}>
            <h3 className={ordersStyles.sectionTitle}>Service Details</h3>
            <div className={ordersStyles.infoGrid}>
              <div className={ordersStyles.infoItem}>
                <span className={ordersStyles.infoLabel}>Service Type:</span>
                <span className={ordersStyles.infoValue}>{callType}</span>
              </div>
              <div className={ordersStyles.infoItem}>
                <span className={ordersStyles.infoLabel}>Address:</span>
                <span className={ordersStyles.infoValue}>{address}</span>
              </div>
            </div>
          </div>

          {/* Payment Section */}
          <div className={ordersStyles.section}>
            <h3 className={ordersStyles.sectionTitle}>Payment</h3>
            <div className={ordersStyles.infoGrid}>
              <div className={ordersStyles.infoItem}>
                <span className={ordersStyles.infoLabel}>Amount:</span>
                <span className={ordersStyles.infoValue}>${amount}</span>
              </div>
              <div className={ordersStyles.infoItem}>
                <span className={ordersStyles.infoLabel}>Payment Status:</span>
                <span className={ordersStyles.infoValue}>{paymentStatus}</span>
              </div>
            </div>
          </div>

          {/* Actions Section */}
          <div className={ordersStyles.section}>
            <h3 className={ordersStyles.sectionTitle}>Actions</h3>
            <div className={ordersStyles.statusCell}>
              <strong>Update Status</strong>
              {isInitiated ? (
                <div className={ordersStyles.actionsButtons}>
                  <button
                    className={ordersStyles.approveBtn}
                    onClick={() => handleUpdate("Approved")}
                    disabled={saving}
                  >
                    {saving ? "Saving…" : "Approve"}
                  </button>
                  <button
                    className={ordersStyles.denyBtn}
                    onClick={() => handleUpdate("Denied")}
                    disabled={saving}
                  >
                    {saving ? "Saving…" : "Deny"}
                  </button>
                </div>
              ) : (
                <div className={ordersStyles.actionsButtons}>
                  <select
                    className={ordersStyles.statusSelect}
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    disabled={saving}
                  >
                    <option value="Initiated">Initiated</option>
                    <option value="Approved">Approved</option>
                    <option value="Denied">Denied</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                  <button
                    className={ordersStyles.updateBtn}
                    onClick={() => handleUpdate(selectedStatus)}
                    disabled={saving}
                  >
                    {saving ? "Updating…" : "Update Status"}
                  </button>
                </div>
              )}
              {updateErr && (
                <div className={ordersStyles.errorMini}>{updateErr}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default withAuth(OrderSingle);

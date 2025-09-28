// updated: pages/model-backend/orderSingle.js
import { useState } from "react";
import axios from "axios";
import styles from "../../styles/model.module.css";

export default function OrderSingle({ order, changeOrderStatus }) {
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const handleUpdate = async (next) => {
    setSaving(true);
    setErr("");

    try {
      const modelId = Number(localStorage.getItem("token")) || 0; // therapist id
      const payload = {
        id: order?.id ?? order?.Id,
        order_status: next, // "Approved" or "Denied"
        model_id: modelId, // server can verify their ownership
      };

      const res = await axios.post(
        "https://tsm.spagram.com/api/update-order.php",
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      if (res.data?.success === "1") {
        // Tell the parent to refetch (the Orders component watches status change)
        changeOrderStatus(next);
      } else {
        throw new Error(res.data?.message || "Update failed");
      }
    } catch (e) {
      setErr(e?.message || "Could not update order");
    } finally {
      setSaving(false);
    }
  };

  // tolerant field mapping.....
  const requestTime = order?.request_time ?? order?.date_of_creation ?? "";
  const address = order?.address ?? order?.service_address ?? "";
  const callType = order?.call_type ?? order?.service_type ?? "";
  const serviceTime = order?.service_time ?? "";
  const status = order?.status ?? order?.order_status ?? "Initiated";
  const isInitiated = status === "Initiated";

  return (
    <tr>
      <td>{requestTime}</td>
      <td>{address}</td>
      <td>{callType}</td>
      <td>{serviceTime}</td>
      <td>
        <div className={styles.statusCell}>
          <strong>{status}</strong>

          {isInitiated && (
            <div className={styles.actions}>
              <button
                className={styles.approveBtn}
                onClick={() => handleUpdate("Approved")}
                disabled={saving}>
                {saving ? "Saving…" : "Approve"}
              </button>
              <button
                className={styles.denyBtn}
                onClick={() => handleUpdate("Denied")}
                disabled={saving}>
                {saving ? "Saving…" : "Deny"}
              </button>
            </div>
          )}

          {err && <div className={styles.errorMini}>{err}</div>}
        </div>
      </td>
    </tr>
  );
}

// updated: pages/model-backend/orderSingle.js
import { useState, useEffect } from "react";
import axios from "axios";

export default function OrderSingle({
  order,
  modelId,
  changeOrderStatus,
  styles,
}) {
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [customerName, setCustomerName] = useState("Loading...");

  const handleUpdate = async (next) => {
    setSaving(true);
    setErr("");

    try {
      if (!modelId) {
        throw new Error("Could not determine model ID");
      }

      const payload = {
        id: order?.id ?? order?.Id,
        order_status: next, // "Approved" or "Denied"
        model_id: Number(modelId), // server can verify their ownership
      };

      const res = await axios.post(
        "https://tsm.spagram.com/api/update-order.php",
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      if (res.data?.success === "1") {
        // Tell the parent to refetch
        changeOrderStatus();
      } else {
        throw new Error(res.data?.message || "Update failed");
      }
    } catch (e) {
      setErr(e?.message || "Could not update order");
    } finally {
      setSaving(false);
    }
  };

  // Fetch customer name when component mounts
  useEffect(() => {
    const fetchCustomerName = async () => {
      console.log("Full order object:", JSON.stringify(order, null, 2));
      // Check multiple possible field names
      const customerId =
        order?.customer_id ||
        order?.customerId ||
        order?.customerid ||
        order?.customer;
      console.log("Customer ID from order:", customerId);
      console.log("order.customer_id:", order?.customer_id);
      console.log("order.customerId:", order?.customerId);
      console.log("order.customerid:", order?.customerid);

      if (!customerId) {
        console.log("No customer_id found in any variation, setting N/A");
        setCustomerName("N/A");
        return;
      }

      try {
        const url = `https://tsm.spagram.com/api/single-customer.php?id=${customerId}`;
        console.log("Fetching customer from:", url);
        const response = await axios.get(url);
        console.log("Customer API response:", response.data);

        if (response.data?.name) {
          setCustomerName(response.data.name);
        } else {
          setCustomerName("Unknown");
        }
      } catch (error) {
        console.error("Error fetching customer name:", error);
        setCustomerName("N/A");
      }
    };

    fetchCustomerName();
  }, [order?.customer_id]);

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
      <td>{customerName}</td>
      <td>{address}</td>
      <td>{callType}</td>
      <td>{serviceTime}</td>
      <td>
        <div className={styles ? styles.statusCell : ""}>
          <strong>{status}</strong>

          {isInitiated && (
            <div>
              <input
                type="button"
                value="Approve"
                onClick={() => handleUpdate("Approved")}
                disabled={saving}
                style={{ marginRight: "5px" }}
              />
              <input
                type="button"
                value="Deny"
                onClick={() => handleUpdate("Denied")}
                disabled={saving}
              />
            </div>
          )}

          {err && <div className={styles ? styles.errorMini : ""}>{err}</div>}
        </div>
      </td>
    </tr>
  );
}

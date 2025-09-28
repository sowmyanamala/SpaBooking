// pages/therapistDetails/book.js
import { useRouter } from "next/router";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import styles from "../styles/ConfirmAndPay.module.css"; // make sure this path is correct

export default function ConfirmAndPayPage() {
  const router = useRouter();
  const { name, image, date, time, callType, price } = router.query;

  const paypalOptions = {
    "client-id": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
    currency: "USD",
    intent: "capture",
  };

  const createOrder = (data, actions) => {
    if (!price || isNaN(parseFloat(price))) {
      console.error("Invalid price:", price);
      alert("Invalid price. Please go back and select a valid service.");
      throw new Error("Invalid price");
    }
    const formattedPrice = parseFloat(price).toFixed(2);
    return actions.order
      .create({
        purchase_units: [
          {
            amount: {
              value: formattedPrice,
              currency_code: "USD",
            },
          },
        ],
      })
      .catch((error) => {
        console.error("Error creating PayPal order:", error);
        throw error;
      });
  };

  const onApprove = (data, actions) => {
    return actions.order
      .capture()
      .then((details) => {
        alert(
          "Payment successful! Transaction completed by " +
            details.payer.name.given_name
        );
        // For demo, redirect to a success page or back to home
        router.push("/");
      })
      .catch((error) => {
        console.error("Error capturing PayPal order:", error);
        alert("Payment failed. Please try again.");
      });
  };

  return (
    <PayPalScriptProvider options={paypalOptions}>
      <div className={styles.confirmPage}>
        <div className={styles.paymentSection}>
          <h2>Confirm and pay</h2>

          <div className={styles.cardForm}>
            <h4>1. Choose when to pay</h4>
            <div className={styles.cardBox}>Pay ${price} now</div>

            <h4>2. Pay with PayPal</h4>
            <PayPalButtons
              createOrder={createOrder}
              onApprove={onApprove}
              style={{ layout: "vertical" }}
            />
          </div>
        </div>

        <div className={styles.summarySection}>
          <img
            src={decodeURIComponent(image || "/images/default.jpg")}
            alt={name}
            className={styles.profilePic}
          />

          <p>
            <strong>Model:</strong> {name}
          </p>
          <p>
            <strong>Date:</strong> {date}
          </p>
          <p>
            <strong>Time:</strong> {time}
          </p>
          <p>
            <strong>Call Type:</strong> {callType}
          </p>
          <p className={styles.totalAmount}>Total: ${price}</p>
        </div>
      </div>
    </PayPalScriptProvider>
  );
}

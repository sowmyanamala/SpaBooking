// pages/model-backend/verification.js
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "../../components/model/layout";
import CheckrVerificationFlow from "../../components/verification/CheckrVerificationFlow";
import CheckrVerificationStatus from "../../components/verification/CheckrVerificationStatus";
import withAuth from "../../components/model/withAuth";
import styles from "../../styles/verification.module.css";

function VerificationPage() {
  const router = useRouter();
  const [showVerificationFlow, setShowVerificationFlow] = useState(false);
  const [modelId, setModelId] = useState(null);
  const [modelInfo, setModelInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get model ID from localStorage
    const storedModelId = localStorage.getItem("modelId");
    const storedModelName = localStorage.getItem("modelName");

    if (storedModelId) {
      setModelId(storedModelId);
      setModelInfo({ id: storedModelId, name: storedModelName });
      setLoading(false);
    } else {
      // Redirect to login if no model ID found
      router.push("/model-registration");
    }
  }, [router]);

  const handleVerificationSuccess = (data) => {
    setShowVerificationFlow(false);
    // Optionally show success message or redirect
    console.log("Verification initiated successfully:", data);
  };

  const handleVerificationError = (error) => {
    console.error("Verification error:", error);
    // Error is handled within the VerificationFlow component
  };

  if (loading) {
    return (
      <Layout>
        <div className={styles.loading}>Loading...</div>
      </Layout>
    );
  }

  if (!modelId) {
    return (
      <Layout>
        <div className={styles.error}>
          Unable to load model information. Please log in again.
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={styles.pageContainer}>
        <div className={styles.header}>
          <h1>Background Check Verification</h1>
          <p>
            Complete your background check verification to start accepting
            bookings.
          </p>
        </div>

        <div className={styles.content}>
          {/* Current Verification Status */}
          <CheckrVerificationStatus therapistId={modelId} />

          {/* Action Buttons */}
          <div className={styles.actions}>
            <button
              onClick={() => setShowVerificationFlow(true)}
              className={styles.primaryButton}
            >
              Start New Verification
            </button>

            <button
              onClick={() => router.push("/model-backend/dashboard")}
              className={styles.secondaryButton}
            >
              Back to Dashboard
            </button>
          </div>

          {/* Information Section */}
          <div className={styles.infoSection}>
            <h3>Why is verification required?</h3>
            <ul>
              <li>Ensures safety and trust for our clients</li>
              <li>Complies with local regulations and requirements</li>
              <li>Verifies your identity and professional background</li>
              <li>Protects both you and your clients</li>
            </ul>

            <h3>What information is collected?</h3>
            <ul>
              <li>Personal identification information</li>
              <li>Criminal background check (varies by package)</li>
              <li>Identity verification</li>
              <li>Employment history (if applicable)</li>
            </ul>

            <h3>How long does it take?</h3>
            <p>
              Most background checks are completed within 1-3 business days.
              You'll receive email updates as the process progresses.
            </p>

            <h3>Privacy & Security</h3>
            <p>
              All information is handled securely and in compliance with FCRA
              regulations. We use trusted third-party providers for background
              checks.
            </p>
          </div>
        </div>

        {/* Verification Flow Modal */}
        {showVerificationFlow && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <div className={styles.header}>
                <h1>Background Check Verification</h1>
                <button
                  className={styles.closeButton}
                  onClick={() => setShowVerificationFlow(false)}
                  aria-label="Close modal"
                >
                  ×
                </button>
              </div>
              <CheckrVerificationFlow
                therapist={modelInfo}
                onComplete={() => setShowVerificationFlow(false)}
              />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default withAuth(VerificationPage);

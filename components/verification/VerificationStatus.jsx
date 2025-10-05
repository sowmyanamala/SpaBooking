// components/verification/VerificationStatus.jsx
import { useState, useEffect } from "react";
import styles from "./verification.module.css";
import { buildStatusUrl } from "./api-config";
import { formatDateTime12Hour } from "../../utils/timeFormat";

const VerificationStatus = ({ therapistId }) => {
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadVerificationStatus();
  }, [therapistId]);

  const loadVerificationStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch(buildStatusUrl(therapistId));
      const data = await response.json();

      if (data.success) {
        setVerifications(data.data);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error("Error loading verification status:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status, adjudication) => {
    switch (status) {
      case "pending":
        return "⏳";
      case "in_progress":
        return "🔄";
      case "completed":
        if (adjudication === "clear") return "✅";
        if (adjudication === "consider") return "⚠️";
        if (adjudication === "pre_adverse" || adjudication === "adverse")
          return "❌";
        return "✅";
      case "failed":
        return "❌";
      case "cancelled":
        return "🚫";
      default:
        return "❓";
    }
  };

  const getStatusText = (status, adjudication) => {
    switch (status) {
      case "pending":
        return "Pending";
      case "in_progress":
        return "In Progress";
      case "completed":
        if (adjudication === "clear") return "Verified";
        if (adjudication === "consider") return "Under Review";
        if (adjudication === "pre_adverse") return "Pre-Adverse Action";
        if (adjudication === "adverse") return "Adverse Action";
        return "Completed";
      case "failed":
        return "Failed";
      case "cancelled":
        return "Cancelled";
      default:
        return "Unknown";
    }
  };

  const getStatusColor = (status, adjudication) => {
    switch (status) {
      case "pending":
      case "in_progress":
        return "#f59e0b"; // amber
      case "completed":
        if (adjudication === "clear") return "#10b981"; // green
        if (adjudication === "consider") return "#f59e0b"; // amber
        if (adjudication === "pre_adverse" || adjudication === "adverse")
          return "#ef4444"; // red
        return "#10b981"; // green
      case "failed":
      case "cancelled":
        return "#ef4444"; // red
      default:
        return "#6b7280"; // gray
    }
  };

  const formatDate = (dateString) => {
    return formatDateTime12Hour(dateString);
  };

  if (loading) {
    return (
      <div className={styles.statusContainer}>
        <div className={styles.loading}>Loading verification status...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.statusContainer}>
        <div className={styles.error}>Error: {error}</div>
        <button onClick={loadVerificationStatus} className={styles.retryButton}>
          Retry
        </button>
      </div>
    );
  }

  if (verifications.length === 0) {
    return (
      <div className={styles.statusContainer}>
        <div className={styles.noVerifications}>
          <p>No background check verifications found.</p>
          <p>Contact support to initiate verification.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.statusContainer}>
      <div className={styles.header}>
        <h3>Background Check Status</h3>
        <button
          onClick={loadVerificationStatus}
          className={styles.refreshButton}
        >
          Refresh
        </button>
      </div>

      <div className={styles.verificationsList}>
        {verifications.map((verification) => (
          <div key={verification.id} className={styles.verificationCard}>
            <div className={styles.verificationHeader}>
              <div className={styles.statusInfo}>
                <span className={styles.statusIcon}>
                  {getStatusIcon(
                    verification.status,
                    verification.adjudication
                  )}
                </span>
                <div>
                  <div
                    className={styles.statusText}
                    style={{
                      color: getStatusColor(
                        verification.status,
                        verification.adjudication
                      ),
                    }}
                  >
                    {getStatusText(
                      verification.status,
                      verification.adjudication
                    )}
                  </div>
                  <div className={styles.packageName}>
                    {verification.package_name ||
                      verification.verification_package}
                  </div>
                </div>
              </div>
              <div className={styles.provider}>
                {verification.verification_provider.toUpperCase()}
              </div>
            </div>

            <div className={styles.verificationDetails}>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Initiated:</span>
                <span className={styles.detailValue}>
                  {formatDate(verification.created_at)}
                </span>
              </div>

              {verification.completed_at && (
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Completed:</span>
                  <span className={styles.detailValue}>
                    {formatDate(verification.completed_at)}
                  </span>
                </div>
              )}

              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Amount:</span>
                <span className={styles.detailValue}>
                  ${verification.amount_charged} {verification.currency}
                </span>
              </div>

              {verification.provider_candidate_id && (
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Candidate ID:</span>
                  <span className={styles.detailValue}>
                    {verification.provider_candidate_id}
                  </span>
                </div>
              )}

              {verification.provider_report_id && (
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Report ID:</span>
                  <span className={styles.detailValue}>
                    {verification.provider_report_id}
                  </span>
                </div>
              )}
            </div>

            {verification.adjudication &&
              verification.adjudication !== "clear" && (
                <div className={styles.adjudicationNotice}>
                  <strong>Notice:</strong> This verification requires additional
                  review. Please contact support for more information.
                </div>
              )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default VerificationStatus;

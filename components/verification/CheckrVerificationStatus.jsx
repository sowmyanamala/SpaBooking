import React, { useState, useEffect } from "react";
import styles from "../../styles/verification.module.css";
import { formatDateTime12Hour } from "../../utils/timeFormat";

export default function CheckrVerificationStatus({ therapistId }) {
  const [verification, setVerification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchVerificationStatus();
  }, [therapistId]);

  const fetchVerificationStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://tsm.spagram.com/api/checkr-verification-status.php?therapist_id=${therapistId}`
      );
      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setVerification(data.data);
      }
    } catch (err) {
      setError("Failed to fetch verification status");
    } finally {
      setLoading(false);
    }
  };

  const getStatusDisplay = (status) => {
    const statusMap = {
      pending: { text: "Pending", color: "#f59e0b", icon: "⏳" },
      in_progress: { text: "In Progress", color: "#3b82f6", icon: "🔄" },
      approved: { text: "Approved", color: "#10b981", icon: "✅" },
      needs_review: { text: "Needs Review", color: "#f59e0b", icon: "⚠️" },
      suspended: { text: "Suspended", color: "#ef4444", icon: "❌" },
      cancelled: { text: "Cancelled", color: "#6b7280", icon: "🚫" },
    };

    return (
      statusMap[status] || { text: "Unknown", color: "#6b7280", icon: "❓" }
    );
  };

  const getPackageDisplayName = (packageSlug) => {
    const packageMap = {
      tasker_standard: "Standard Background Check",
      tasker_plus: "Enhanced Background Check",
      tasker_premium: "Premium Background Check",
    };

    return packageMap[packageSlug] || packageSlug;
  };

  if (loading) {
    return (
      <div className={styles.verificationStatus}>
        <div className={styles.loading}>Loading verification status...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.verificationStatus}>
        <div className={styles.error}>Error: {error}</div>
      </div>
    );
  }

  if (!verification) {
    return (
      <div className={styles.verificationStatus}>
        <div className={styles.noVerification}>
          <h3>No Verification Found</h3>
          <p>This therapist has not started the verification process yet.</p>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusDisplay(verification.status);

  return (
    <div className={styles.verificationStatus}>
      <div className={styles.statusHeader}>
        <h3>Background Check Status</h3>
        <div
          className={styles.statusBadge}
          style={{ backgroundColor: statusInfo.color }}
        >
          <span className={styles.statusIcon}>{statusInfo.icon}</span>
          <span className={styles.statusText}>{statusInfo.text}</span>
        </div>
      </div>

      <div className={styles.verificationDetails}>
        <div className={styles.detailRow}>
          <strong>Package:</strong>{" "}
          {getPackageDisplayName(verification.package)}
        </div>

        {verification.candidate_id && (
          <div className={styles.detailRow}>
            <strong>Candidate ID:</strong> {verification.candidate_id}
          </div>
        )}

        {verification.invitation_id && (
          <div className={styles.detailRow}>
            <strong>Invitation ID:</strong> {verification.invitation_id}
          </div>
        )}

        {verification.report_id && (
          <div className={styles.detailRow}>
            <strong>Report ID:</strong> {verification.report_id}
          </div>
        )}

        <div className={styles.detailRow}>
          <strong>Started:</strong>{" "}
          {formatDateTime12Hour(verification.created_at)}
        </div>

        {verification.completed_at && (
          <div className={styles.detailRow}>
            <strong>Completed:</strong>{" "}
            {formatDateTime12Hour(verification.completed_at)}
          </div>
        )}

        <div className={styles.detailRow}>
          <strong>Last Updated:</strong>{" "}
          {formatDateTime12Hour(verification.updated_at)}
        </div>
      </div>

      {verification.status === "approved" && (
        <div className={styles.approvedMessage}>
          <h4>✅ Verification Complete</h4>
          <p>
            This therapist has successfully completed their background check and
            is verified to work on the platform.
          </p>
        </div>
      )}

      {verification.status === "needs_review" && (
        <div className={styles.reviewMessage}>
          <h4>⚠️ Review Required</h4>
          <p>
            This verification requires manual review. Please check the Checkr
            dashboard for details.
          </p>
        </div>
      )}

      {verification.status === "suspended" && (
        <div className={styles.suspendedMessage}>
          <h4>❌ Verification Suspended</h4>
          <p>
            This verification has been suspended. Please contact support for
            assistance.
          </p>
        </div>
      )}

      <div className={styles.checkrInfo}>
        <h4>About Checkr</h4>
        <p>
          Checkr is a leading background check provider that helps businesses
          make informed hiring decisions. All background checks are conducted in
          compliance with FCRA (Fair Credit Reporting Act) regulations.
        </p>
      </div>
    </div>
  );
}

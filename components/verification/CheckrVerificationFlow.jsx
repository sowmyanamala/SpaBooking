import React, { useState } from "react";
import styles from "../../styles/verification.module.css";

export default function CheckrVerificationFlow({ therapist, onComplete }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    first_name: therapist?.name?.split(" ")[0] || "",
    last_name: therapist?.name?.split(" ").slice(1).join(" ") || "",
    email: "",
    package: "tasker_standard",
    work_state: "NY",
    work_city: "New York",
  });

  const packages = [
    {
      id: "tasker_standard",
      name: "Standard Background Check",
      description:
        "Basic background check including identity verification and criminal history",
      price: "$25",
      features: [
        "Identity Verification",
        "Criminal History Check",
        "SSN Verification",
      ],
    },
    {
      id: "tasker_plus",
      name: "Enhanced Background Check",
      description: "Comprehensive screening with additional checks",
      price: "$45",
      features: [
        "Identity Verification",
        "Criminal History Check",
        "SSN Verification",
        "Motor Vehicle Records",
        "Employment Verification",
      ],
    },
    {
      id: "tasker_premium",
      name: "Premium Background Check",
      description: "Most comprehensive background check available",
      price: "$75",
      features: [
        "Identity Verification",
        "Criminal History Check",
        "SSN Verification",
        "Motor Vehicle Records",
        "Employment Verification",
        "Education Verification",
        "Professional License Check",
      ],
    },
  ];

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePackageSelect = (packageId) => {
    setFormData({
      ...formData,
      package: packageId,
    });
  };

  const handleStartVerification = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "https://tsm.spagram.com/api/checkr-start-verification.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formData,
            therapist_id: therapist.id,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to start verification");
      }

      // Debug: Log the response data
      console.log("Checkr API Response:", data);

      // Check if invitation_url exists in the response
      if (!data.invitation_url) {
        throw new Error(
          "No invitation URL received from Checkr API. Response: " +
            JSON.stringify(data)
        );
      }

      // Redirect to Checkr's hosted flow
      window.location.href = data.invitation_url;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className={styles.step}>
      <h3>Choose Your Verification Package</h3>
      <p>Select the background check package that best fits your needs:</p>

      <div className={styles.packageGrid}>
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            className={`${styles.packageCard} ${
              formData.package === pkg.id ? styles.selectedPackage : ""
            }`}
            onClick={() => handlePackageSelect(pkg.id)}
          >
            <div className={styles.packageHeader}>
              <h4>{pkg.name}</h4>
              <div className={styles.packagePrice}>{pkg.price}</div>
            </div>
            <p className={styles.packageDescription}>{pkg.description}</p>
            <ul className={styles.packageFeatures}>
              {pkg.features.map((feature, index) => (
                <li key={index}>✓ {feature}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <button
        className={styles.nextButton}
        onClick={() => setStep(2)}
        disabled={!formData.package}
      >
        Continue
      </button>
    </div>
  );

  const renderStep2 = () => (
    <div className={styles.step}>
      <h3>Personal Information</h3>
      <p>Please provide your information for the background check:</p>

      <div className={styles.formGroup}>
        <label htmlFor="first_name">First Name *</label>
        <input
          type="text"
          id="first_name"
          name="first_name"
          value={formData.first_name}
          onChange={handleInputChange}
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="last_name">Last Name *</label>
        <input
          type="text"
          id="last_name"
          name="last_name"
          value={formData.last_name}
          onChange={handleInputChange}
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="email">Email Address *</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="work_state">Work State *</label>
        <select
          id="work_state"
          name="work_state"
          value={formData.work_state}
          onChange={handleInputChange}
          required
        >
          <option value="NY">New York</option>
          <option value="CA">California</option>
          <option value="TX">Texas</option>
          <option value="FL">Florida</option>
          <option value="IL">Illinois</option>
        </select>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="work_city">Work City *</label>
        <input
          type="text"
          id="work_city"
          name="work_city"
          value={formData.work_city}
          onChange={handleInputChange}
          required
        />
      </div>

      <div className={styles.buttonGroup}>
        <button className={styles.backButton} onClick={() => setStep(1)}>
          Back
        </button>
        <button
          className={styles.nextButton}
          onClick={handleStartVerification}
          disabled={
            loading ||
            !formData.first_name ||
            !formData.last_name ||
            !formData.email
          }
        >
          {loading ? "Starting Verification..." : "Start Background Check"}
        </button>
      </div>
    </div>
  );

  return (
    <div className={styles.verificationFlow}>
      {error && (
        <div className={styles.error}>
          <p>{error}</p>
        </div>
      )}

      <div className={styles.progressBar}>
        <div className={styles.progressStep}>
          <div
            className={`${styles.stepIndicator} ${
              step >= 1 ? styles.active : ""
            }`}
          >
            1
          </div>
          <span>Choose Package</span>
        </div>
        <div className={styles.progressStep}>
          <div
            className={`${styles.stepIndicator} ${
              step >= 2 ? styles.active : ""
            }`}
          >
            2
          </div>
          <span>Personal Info</span>
        </div>
        <div className={styles.progressStep}>
          <div
            className={`${styles.stepIndicator} ${
              step >= 3 ? styles.active : ""
            }`}
          >
            3
          </div>
          <span>Complete on Checkr</span>
        </div>
      </div>

      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}

      <div className={styles.disclaimer}>
        <h4>Important Information:</h4>
        <ul>
          <li>
            You will be redirected to Checkr.com to complete the background
            check process
          </li>
          <li>Checkr is a secure, FCRA-compliant background check provider</li>
          <li>
            Your personal information is handled securely and never stored on
            our servers
          </li>
          <li>The process typically takes 1-3 business days to complete</li>
        </ul>
      </div>
    </div>
  );
}

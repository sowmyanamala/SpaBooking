// components/verification/VerificationFlow.jsx
import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import styles from "./verification.module.css";
import { API_ENDPOINTS } from "./api-config";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
);

const VerificationForm = ({ therapistId, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();

  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: package selection, 2: personal info, 3: payment, 4: success

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    date_of_birth: "",
    ssn_last4: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "US",
  });

  const [disclosuresAccepted, setDisclosuresAccepted] = useState(false);
  const [authorizationAccepted, setAuthorizationAccepted] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.packages);
      const data = await response.json();

      if (data.success) {
        // Ensure packages have valid includes field
        const validPackages = data.data.map((pkg) => ({
          ...pkg,
          includes: pkg.includes || "[]",
        }));
        setPackages(validPackages);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error("Error loading packages:", error);
      onError("Failed to load verification packages");
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.first_name.trim())
      newErrors.first_name = "First name is required";
    if (!formData.last_name.trim())
      newErrors.last_name = "Last name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.date_of_birth)
      newErrors.date_of_birth = "Date of birth is required";
    if (!formData.address_line1.trim())
      newErrors.address_line1 = "Address is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.state.trim()) newErrors.state = "State is required";
    if (!formData.postal_code.trim())
      newErrors.postal_code = "Postal code is required";

    if (!disclosuresAccepted)
      newErrors.disclosures = "You must accept the disclosures";
    if (!authorizationAccepted)
      newErrors.authorization = "You must accept the authorization";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card: elements.getElement(CardElement),
      });

      if (error) {
        throw new Error(error.message);
      }

      const response = await fetch(API_ENDPOINTS.checkout, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          therapist_id: therapistId,
          package_id: selectedPackage.package_id,
          provider: selectedPackage.provider,
          candidate: formData,
          disclosuresAccepted,
          authorizationAccepted,
          paymentMethodId: paymentMethod.id,
          ip_address: await getClientIP(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setStep(4);
        onSuccess(data.data);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error("Verification error:", error);
      onError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getClientIP = async () => {
    try {
      const response = await fetch("https://api.ipify.org?format=json");
      const data = await response.json();
      return data.ip;
    } catch {
      return null;
    }
  };

  const handleInputChange = (field) => (event) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: "16px",
        color: "#424770",
        "::placeholder": {
          color: "#aab7c4",
        },
      },
      invalid: {
        color: "#9e2146",
      },
    },
  };

  if (step === 1) {
    return (
      <div className={styles.step}>
        <h2>Choose Verification Package</h2>
        <p>Select a background check package for identity verification:</p>

        <div className={styles.packages}>
          {packages.map((pkg) => (
            <div
              key={`${pkg.provider}-${pkg.package_id}`}
              className={`${styles.package} ${
                selectedPackage?.package_id === pkg.package_id
                  ? styles.selected
                  : ""
              }`}
              onClick={() => setSelectedPackage(pkg)}
            >
              <div className={styles.packageHeader}>
                <h3>{pkg.package_name}</h3>
                <div className={styles.price}>${pkg.price}</div>
              </div>
              <p className={styles.description}>{pkg.description}</p>
              <div className={styles.includes}>
                <strong>Includes:</strong>
                <ul>
                  {(() => {
                    try {
                      const includes = JSON.parse(pkg.includes || "[]");
                      return Array.isArray(includes) ? includes : [];
                    } catch (e) {
                      console.error("Error parsing includes:", e);
                      return [];
                    }
                  })().map((item, index) => (
                    <li key={index}>
                      {item && typeof item === "string"
                        ? item.replace(/_/g, " ")
                        : "Unknown item"}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.actions}>
          <button
            onClick={() => setStep(2)}
            disabled={!selectedPackage}
            className={styles.primaryButton}
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className={styles.step}>
        <h2>Personal Information</h2>
        <p>
          Please provide your personal information for the background check:
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setStep(3);
          }}
        >
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="first_name">First Name *</label>
              <input
                type="text"
                id="first_name"
                value={formData.first_name}
                onChange={handleInputChange("first_name")}
                className={errors.first_name ? styles.error : ""}
              />
              {errors.first_name && (
                <span className={styles.errorText}>{errors.first_name}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="last_name">Last Name *</label>
              <input
                type="text"
                id="last_name"
                value={formData.last_name}
                onChange={handleInputChange("last_name")}
                className={errors.last_name ? styles.error : ""}
              />
              {errors.last_name && (
                <span className={styles.errorText}>{errors.last_name}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={handleInputChange("email")}
                className={errors.email ? styles.error : ""}
              />
              {errors.email && (
                <span className={styles.errorText}>{errors.email}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="phone">Phone Number *</label>
              <input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={handleInputChange("phone")}
                className={errors.phone ? styles.error : ""}
              />
              {errors.phone && (
                <span className={styles.errorText}>{errors.phone}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="date_of_birth">Date of Birth *</label>
              <input
                type="date"
                id="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleInputChange("date_of_birth")}
                className={errors.date_of_birth ? styles.error : ""}
              />
              {errors.date_of_birth && (
                <span className={styles.errorText}>{errors.date_of_birth}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="ssn_last4">SSN Last 4 Digits</label>
              <input
                type="text"
                id="ssn_last4"
                value={formData.ssn_last4}
                onChange={handleInputChange("ssn_last4")}
                maxLength="4"
                pattern="[0-9]{4}"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="address_line1">Address Line 1 *</label>
              <input
                type="text"
                id="address_line1"
                value={formData.address_line1}
                onChange={handleInputChange("address_line1")}
                className={errors.address_line1 ? styles.error : ""}
              />
              {errors.address_line1 && (
                <span className={styles.errorText}>{errors.address_line1}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="address_line2">Address Line 2</label>
              <input
                type="text"
                id="address_line2"
                value={formData.address_line2}
                onChange={handleInputChange("address_line2")}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="city">City *</label>
              <input
                type="text"
                id="city"
                value={formData.city}
                onChange={handleInputChange("city")}
                className={errors.city ? styles.error : ""}
              />
              {errors.city && (
                <span className={styles.errorText}>{errors.city}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="state">State *</label>
              <input
                type="text"
                id="state"
                value={formData.state}
                onChange={handleInputChange("state")}
                className={errors.state ? styles.error : ""}
              />
              {errors.state && (
                <span className={styles.errorText}>{errors.state}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="postal_code">Postal Code *</label>
              <input
                type="text"
                id="postal_code"
                value={formData.postal_code}
                onChange={handleInputChange("postal_code")}
                className={errors.postal_code ? styles.error : ""}
              />
              {errors.postal_code && (
                <span className={styles.errorText}>{errors.postal_code}</span>
              )}
            </div>
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              onClick={() => setStep(1)}
              className={styles.secondaryButton}
            >
              Back
            </button>
            <button type="submit" className={styles.primaryButton}>
              Continue
            </button>
          </div>
        </form>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className={styles.step}>
        <h2>Disclosures & Authorization</h2>

        <div className={styles.disclosures}>
          <h3>Background Check Disclosure</h3>
          <p>
            We may obtain information about you from a third party consumer
            reporting agency for employment purposes. Thus, you may be the
            subject of a "consumer report" and/or an "investigative consumer
            report" which may include information about your character, general
            reputation, personal characteristics, and/or mode of living, and
            which can involve personal interviews with sources such as your
            neighbors, friends, or associates.
          </p>

          <h3>Authorization</h3>
          <p>
            I hereby authorize the procurement of a consumer report and/or
            investigative consumer report by the Company. If any adverse
            decision is made based upon the consumer report, I will be provided
            with the name, address, and telephone number of the consumer
            reporting agency, a copy of the report, and a written description of
            my rights under the Fair Credit Reporting Act.
          </p>
        </div>

        <div className={styles.checkboxes}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={disclosuresAccepted}
              onChange={(e) => setDisclosuresAccepted(e.target.checked)}
            />
            <span>I have read and understand the disclosures above *</span>
          </label>
          {errors.disclosures && (
            <span className={styles.errorText}>{errors.disclosures}</span>
          )}

          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={authorizationAccepted}
              onChange={(e) => setAuthorizationAccepted(e.target.checked)}
            />
            <span>I authorize the background check *</span>
          </label>
          {errors.authorization && (
            <span className={styles.errorText}>{errors.authorization}</span>
          )}
        </div>

        <div className={styles.paymentSection}>
          <h3>Payment Information</h3>
          <div className={styles.packageSummary}>
            <strong>{selectedPackage.package_name}</strong>
            <span className={styles.price}>${selectedPackage.price}</span>
          </div>

          <div className={styles.cardElement}>
            <CardElement options={cardElementOptions} />
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.actions}>
            <button
              type="button"
              onClick={() => setStep(2)}
              className={styles.secondaryButton}
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading || !stripe || !elements}
              className={styles.primaryButton}
            >
              {loading ? "Processing..." : `Pay $${selectedPackage.price}`}
            </button>
          </div>
        </form>
      </div>
    );
  }

  if (step === 4) {
    return (
      <div className={styles.step}>
        <div className={styles.success}>
          <h2>✅ Verification Initiated</h2>
          <p>
            Your background check has been initiated successfully. You will
            receive updates via email as the process progresses.
          </p>
          <p>Expected completion time: 1-3 business days</p>
        </div>
      </div>
    );
  }

  return null;
};

const VerificationFlow = ({ therapistId, onClose }) => {
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSuccess = (data) => {
    setSuccess(data);
  };

  const handleError = (message) => {
    setError(message);
  };

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <div className={styles.header}>
          <h1>Therapist Verification</h1>
          <button onClick={onClose} className={styles.closeButton}>
            ×
          </button>
        </div>

        {error && (
          <div className={styles.error}>
            <p>{error}</p>
            <button onClick={() => setError(null)}>Dismiss</button>
          </div>
        )}

        <Elements stripe={stripePromise}>
          <VerificationForm
            therapistId={therapistId}
            onSuccess={handleSuccess}
            onError={handleError}
          />
        </Elements>
      </div>
    </div>
  );
};

export default VerificationFlow;

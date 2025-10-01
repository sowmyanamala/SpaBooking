// pages/components/LoginModal.js
import { useMemo, useState } from "react";
import styles from "../styles/loginModal.module.css";
import { BASE_URL } from "../baseurl/Baseurl";
import axios from "axios";
import Router from "next/router";
import ModelLogin from "./onboarding/ModelLogin";
import ClientLogin from "./onboarding/ClientLogin";
import ModelReg from "./onboarding/ModelReg";
import ClientReg from "./onboarding/ClientReg";
import ClientRegStep2 from "./onboarding/ClientRegStep2";

// --- helper: decode JWT payload safely ---
function parseJwt(token) {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export default function LoginModal({ onClose, user }) {
  const [regType, setRegType] = useState("signup");
  const [step, setStep] = useState(1);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
  });
  const [clientFormData, setClientFormData] = useState({
    phone: "",
    name: "",
    email: "",
    password: "",
    address: "",
    zip: "",
    city: "",
  });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validateLogin = () => {
    const e = {};
    console.log("Validating login data:", loginData);
    if (!loginData.email) e.email = "required";
    if (!loginData.password) e.password = "required";
    console.log("Validation errors:", e);
    setErrors(e);
    const isValid = Object.keys(e).length === 0;
    console.log("Login validation result:", isValid);
    return isValid;
  };

  const validateModel = () => {
    const e = {};
    if (!formData.phone) e.phone = "required";
    if (!formData.name) e.name = "required";
    if (!formData.email) e.email = "required";
    if (!formData.password) e.password = "required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateClient = () => {
    const e = {};
    if (!clientFormData.phone) e.phone = "required";
    if (!clientFormData.name) e.name = "required";
    if (!clientFormData.email) e.email = "required";
    if (!clientFormData.password) e.password = "required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateClient2 = () => {
    const newErrors = {};
    if (!clientFormData.address) newErrors.address = "required";
    if (!clientFormData.zip) newErrors.zip = "required";
    if (!clientFormData.city) newErrors.city = "required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleClientChange = (field) => (e) => {
    setClientFormData({ ...clientFormData, [field]: e.target.value });
  };

  const handleLoginChange = (field) => (e) => {
    setLoginData({ ...loginData, [field]: e.target.value });
  };

  // Phone validation
  const usPhoneRegex = /^(\+1\s?)?(\d{3}|\(\d{3}\))[-.\s]?\d{3}[-.\s]?\d{4}$/;
  const phoneInvalid = useMemo(() => {
    const v = clientFormData?.phone || "";
    return v && !usPhoneRegex.test(v);
  }, [clientFormData?.phone]);

  const validatePhoneInline = (value) => {
    if (typeof setErrors !== "function") return;
    if (value && !usPhoneRegex.test(value)) {
      setErrors((prev) => ({
        ...prev,
        phone: "Please enter a valid US phone number",
      }));
    } else {
      setErrors((prev) => ({ ...prev, phone: "" }));
    }
  };

  const digitsOnly = (s = "") => (s.match(/\d+/g) || []).join("");
  const normalizeZip = (s = "") => {
    const d = (s.match(/\d+/g) || []).join("");
    if (d.length === 9) return `${d.slice(0, 5)}-${d.slice(5)}`;
    if (d.length === 5) return d;
    return s.trim();
  };

  // --- normalize saving tokens + modelId ---
  const saveAuthAndRedirect = ({ token, id, name }, isModel, nameFallback) => {
    console.log("saveAuthAndRedirect called with:", {
      token,
      id,
      name,
      isModel,
      nameFallback,
    });
    if (isModel) {
      console.log("Processing model login...");
      localStorage.setItem("token", token);
      localStorage.setItem("modelName", name || nameFallback || "");
      // store modelId from API or decode from token
      const payload = parseJwt(token);
      console.log("Parsed JWT payload:", payload);
      const modelId = id ?? payload?.id ?? payload?.userId ?? null;
      console.log("ModelId determined:", modelId);
      if (modelId != null) {
        localStorage.setItem("modelId", String(modelId));
        console.log("ModelId stored:", modelId);
      }
      console.log("Login successful, token stored:", token);

      // Verify token is actually stored
      const storedToken = localStorage.getItem("token");
      console.log("Verification - stored token:", storedToken);

      if (!storedToken || storedToken !== token) {
        console.error("Token storage failed!");
        setError("Login failed - please try again");
        return;
      }

      // Close modal first
      if (onClose) {
        onClose();
      }

      // Use window.location.href for a hard redirect to ensure the page reloads
      // and withAuth can properly detect the token
      setTimeout(() => {
        console.log("Redirecting to model-backend/orders");
        window.location.href = "/model-backend/orders";
      }, 200);
    } else {
      localStorage.setItem("customertoken", token);
      localStorage.setItem("customerName", name || nameFallback || "");
      onClose?.();
      window.location.reload();
    }
  };

  // Client registration submit
  const submit = async () => {
    setError("");
    if (phoneInvalid) return;
    if (!validateClient2()) return;
    console.log("form", clientFormData);
    try {
      setLoading(true);
      // match msgdb.customers columns
      const payload = {
        name: (clientFormData?.name || "").trim(),
        email: (clientFormData?.email || "").trim(),
        phone: digitsOnly(clientFormData?.phone || ""),
        password: clientFormData?.password || "",
        address: clientFormData?.address || "",
        city: (clientFormData?.city || "").trim(),
        zip: normalizeZip(clientFormData?.zip || ""),
        current_models: String(
          clientFormData?.current_models ??
            clientFormData?.selected_model ??
            clientFormData?.current_modelid ??
            ""
        ),
        squre_customer_id: String(
          clientFormData?.squre_customer_id ??
            clientFormData?.square_customer_id ??
            "pending"
        ),
      };
      const resp = await axios.post(
        `${BASE_URL}register-customer.php`,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      if (resp?.data?.success === "1") {
        setRegType("login");
      } else {
        setError(resp?.data?.message || "Registration failed.");
      }
    } catch (e) {
      console.log(e);
      setError(e?.response?.data?.message || e?.message || "Network error.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    console.log("handleLogin called with event:", e);
    e.preventDefault();
    console.log("About to validate login...");
    if (!validateLogin()) {
      console.log("Login validation failed, returning early");
      return;
    }
    console.log("Login validation passed, proceeding with login");
    setError("");
    setLoading(true);
    try {
      const url =
        user === "model"
          ? `${BASE_URL}login-model.php`
          : `${BASE_URL}login-customer.php`;

      console.log("Login attempt:", { url, loginData, user });
      console.log("Login data being sent:", JSON.stringify(loginData));
      const res = await axios.post(url, loginData);
      console.log("Login response:", res.data);
      console.log("Response status:", res.status);
      console.log("Response success value:", res.data?.success);
      console.log("Response usertoken:", res.data?.usertoken);
      console.log("Response token:", res.data?.token);

      if (res.data?.success == "1") {
        // API can return either 'token' or 'usertoken'
        const token = res.data.usertoken || res.data.token;
        const { name, id } = res.data;

        // If no separate id is provided and token is numeric, use token as id
        const actualId = id || (/^\d+$/.test(token) ? token : null);

        console.log("Login successful, about to save auth:", {
          token: token,
          name,
          id: actualId,
        });
        saveAuthAndRedirect(
          { token: token, id: actualId, name },
          user === "model",
          loginData.email
        );
      } else {
        console.log("Login failed:", res.data);
        setError(
          res.data?.message || "Email/Password do not match. Please try again!"
        );
      }
    } catch (e) {
      console.error("Login error:", e);
      setError("An error occurred during login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      {user === "model" ? (
        <div className={styles.modalContent}>
          <div className={styles.closeButton} onClick={onClose}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke="#333"
                strokeWidth="2"
                strokeLinecap="round"
                d="M6 6l12 12M18 6L6 18"
              />
            </svg>
          </div>

          {regType === "signup" ? (
            <ModelReg
              handleChange={handleChange}
              setRegType={setRegType}
              validateModel={validateModel}
              formData={formData}
              setFormData={setFormData}
              errors={errors}
              error={error}
              loading={loading}
            />
          ) : (
            <ModelLogin
              handleLoginChange={handleLoginChange}
              handleLogin={handleLogin}
              loginData={loginData}
              error={error}
              errors={errors}
              validateLogin={validateLogin}
              setRegType={setRegType}
              loading={loading}
            />
          )}
        </div>
      ) : (
        <div className={styles.modalContent}>
          <div className={styles.closeButton} onClick={onClose}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke="#333"
                strokeWidth="2"
                strokeLinecap="round"
                d="M6 6l12 12M18 6L6 18"
              />
            </svg>
          </div>

          {regType === "signup" ? (
            <>
              {step === 1 && (
                <ClientReg
                  handleChange={handleClientChange}
                  setRegType={setRegType}
                  validateClient={validateClient}
                  formData={clientFormData}
                  errors={errors}
                  setStep={setStep}
                  error={error}
                  validatePhoneInline={validatePhoneInline}
                />
              )}

              {step === 2 && (
                <ClientRegStep2
                  handleChange={handleClientChange}
                  handleSubmit={submit}
                  formData={clientFormData}
                  errors={errors}
                  setFormData={setClientFormData}
                  setStep={setStep}
                  error={error}
                  loading={loading}
                />
              )}
            </>
          ) : (
            <ClientLogin
              handleLoginChange={handleLoginChange}
              handleLogin={handleLogin}
              loginData={loginData}
              error={error}
              errors={errors}
              validateLogin={validateLogin}
              setRegType={setRegType}
              loading={loading}
            />
          )}
        </div>
      )}
    </div>
  );
}

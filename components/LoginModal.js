// pages/components/LoginModal.js
import { useState } from "react";
import styles from "../styles/LoginModal.module.css";
import { BASE_URL } from "../baseurl/Baseurl";
import axios from "axios";
import Router from "next/router";
import ModelLogin from "./onboarding/ModelLogin";
import ClientLogin from "./onboarding/ClientLogin";
import ModelReg from "./onboarding/ModelReg";
import ClientReg from "./onboarding/ClientReg";

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

  const handleChange = (field) => (e) =>
    setFormData({ ...formData, [field]: e.target.value });
  const handleClientChange = (field) => (e) =>
    setClientFormData({ ...clientFormData, [field]: e.target.value });
  const handleLoginChange = (field) => (e) =>
    setLoginData({ ...loginData, [field]: e.target.value });

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

  const handleFinalSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      const payload = user === "model" ? formData : clientFormData;
      const url =
        user === "model"
          ? `${BASE_URL}cmodel.php`
          : `${BASE_URL}register-customer.php`;
      const res = await axios.post(url, payload, {
        headers: { "Content-Type": "application/json" },
      });

      if (res.data?.success == "1") {
        const { usertoken, name, id } = res.data;
        saveAuthAndRedirect(
          { token: usertoken, id, name },
          user === "model",
          user === "model" ? formData.name : clientFormData.name
        );
      } else {
        setError(
          res.data?.message || "Email/Password do not match. Please try again!"
        );
      }
    } catch (e) {
      console.error(e);
      setError("An error occurred. Please try again.");
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

        {user === "model" ? (
          regType === "signup" ? (
            <ModelReg
              handleChange={handleChange}
              setRegType={setRegType}
              validateModel={validateModel}
              formData={formData}
              setFormData={setFormData}
              errors={errors}
              handleFinalSubmit={handleFinalSubmit}
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
          )
        ) : regType === "signup" ? (
          <ClientReg
            handleChange={handleClientChange}
            setRegType={setRegType}
            validateClient={validateClient}
            formData={clientFormData}
            errors={errors}
            setFormData={setClientFormData}
            handleFinalSubmit={handleFinalSubmit}
            error={error}
            loading={loading}
          />
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
    </div>
  );
}

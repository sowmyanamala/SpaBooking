// pages/model-registration.js
import { useState } from "react";
import Head from "next/head";
import Layout from "../components/layout";
import styles from "../styles/LoginModal.module.css";
import { BASE_URL } from "../baseurl/Baseurl";
import axios from "axios";
import Router from "next/router";
import ModelLogin from "../components/onboarding/ModelLogin";
import ModelReg from "../components/onboarding/ModelReg";

// Helper: decode JWT payload safely
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

export default function ModelRegistration() {
  const [regType, setRegType] = useState("login");
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    image: "",
  });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Validation functions
  const validateLogin = () => {
    const e = {};
    if (!loginData.email) e.email = "required";
    if (!loginData.password) e.password = "required";
    setErrors(e);
    return Object.keys(e).length === 0;
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

  // Change handlers
  const handleChange = (field) => (e) =>
    setFormData({ ...formData, [field]: e.target.value });

  const handleLoginChange = (field) => (e) =>
    setLoginData({ ...loginData, [field]: e.target.value });

  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateLogin()) return;

    setError("");
    setLoading(true);

    try {
      const url = `${BASE_URL}login-model.php`;
      const res = await axios.post(url, loginData);

      console.log("Login API Response:", res.data);
      console.log("Success value:", res.data?.success);
      console.log("Success type:", typeof res.data?.success);

      if (res.data?.success === "1" || res.data?.success === 1) {
        // API can return either 'token' or 'usertoken'
        const token = res.data.usertoken || res.data.token;
        const { name, id } = res.data;

        console.log("Login successful!");
        console.log("Token:", token);
        console.log("Name:", name);
        console.log("ID:", id);

        // Save auth data
        localStorage.setItem("token", token);
        localStorage.setItem("modelName", name || "");

        // Verify token was saved
        const savedToken = localStorage.getItem("token");
        console.log("Saved token:", savedToken);
        console.log("Token saved successfully:", savedToken === token);

        // Store modelId from API or decode from token
        // If token is numeric, use it as modelId; otherwise try to decode JWT
        let modelId = id;
        if (!modelId && /^\d+$/.test(token)) {
          modelId = token;
        } else if (!modelId) {
          const payload = parseJwt(token);
          console.log("Parsed JWT payload:", payload);
          modelId = payload?.id ?? payload?.userId ?? null;
        }
        console.log("Model ID:", modelId);

        if (modelId != null) {
          localStorage.setItem("modelId", String(modelId));
        }

        // Use window.location.href for a hard redirect to ensure the page reloads
        // and withAuth can properly detect the token
        console.log("Redirecting to model-backend/orders...");
        setTimeout(() => {
          window.location.href = "/model-backend/orders";
        }, 200);
      } else {
        console.log("Login failed - API returned success != 1");
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
    <Layout>
      <Head>
        <title>Therapist Register / Login</title>
      </Head>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "80vh",
          padding: "2rem",
        }}
      >
        <div
          style={{
            background: "white",
            borderRadius: "16px",
            padding: "2rem",
            maxWidth: "420px",
            width: "100%",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          }}
        >
          {regType === "login" ? (
            <ModelLogin
              handleLoginChange={handleLoginChange}
              loginData={loginData}
              errors={errors}
              error={error}
              validateLogin={validateLogin}
              setRegType={setRegType}
              loading={loading}
              handleLogin={handleLogin}
            />
          ) : (
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
          )}
        </div>
      </div>
    </Layout>
  );
}

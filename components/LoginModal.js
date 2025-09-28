// import { useState } from 'react';
// import styles from '../styles/LoginModal.module.css';

// export default function LoginModal({ onClose }) {
//   const [phone, setPhone] = useState('');

//   return (
//     <div className={styles.modalOverlay}>
//       <div className={styles.modalContent}>
//       <div className={styles.closeButton} onClick={onClose}>
//   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
//     <path stroke="#333" strokeWidth="2" strokeLinecap="round" d="M6 6l12 12M18 6L6 18"/>
//   </svg>
// </div>
//         <h2>Log in or sign up</h2>

//         <div className={styles.inputGroup}>
//           <label>Country code</label>
//           <select defaultValue="+1">
//             <option value="+1">United States (+1)</option>
//             <option value="+91">India (+91)</option>
//             {/* Add more countries here */}
//           </select>
//           <input
//             type="text"
//             placeholder="Phone number"
//             value={phone}
//             onChange={(e) => setPhone(e.target.value)}
//           />
//         </div>

//         <button className={styles.continueBtn}>Continue</button>
//         <p className={styles.privacyText}>
//           We’ll call or text you to confirm your number. Standard message and data rates apply. <a href="#">Privacy Policy</a>
//         </p>

//         <div className={styles.divider}><span>or</span></div>

//         {/* <button className={styles.authBtn}><img src="/google-icon.png" /> Continue with Google</button>
//         <button className={styles.authBtn}><img src="/apple-icon.png" /> Continue with Apple</button>
//         <button className={styles.authBtn}><img src="/email-icon.png" /> Continue with email</button>
//         <button className={styles.authBtn}><img src="/facebook-icon.png" /> Continue with Facebook</button> */}
//         <button className={styles.authBtn}>
//     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20"><path fill="#fbc02d" d="M43.6 20.5H42V20H24v8h11.3C33.2 32.7 29 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.3 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.5-.4-3.5z"/><path fill="#e53935" d="M6.3 14.7l6.6 4.8C14.3 15.7 18.8 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.3 29.6 4 24 4c-7.5 0-14 4.2-17.7 10.7z"/><path fill="#4caf50" d="M24 44c5.2 0 10.2-2 13.9-5.3l-6.4-5.4C29.4 34.9 26.8 36 24 36c-5 0-9.2-3.3-10.7-7.9l-6.6 5.1C10 39.6 16.5 44 24 44z"/><path fill="#1565c0" d="M43.6 20.5H42V20H24v8h11.3c-1.1 2.9-3.3 5.2-6.1 6.5l.1.1 6.4 5.4c-.4.3 6.3-4.6 6.3-14.5 0-1.2-.1-2.5-.4-3.5z"/></svg>
//     Continue with Google
//   </button>

//   <button className={styles.authBtn}>
//     <svg xmlns="http://www.w3.org/2000/svg" width="20" viewBox="0 0 24 24"><path fill="black" d="M16.365 1.43c-1.148.093-2.543.783-3.327 1.701-.684.799-1.265 2.093-1.11 3.294 1.242.029 2.533-.702 3.293-1.617.736-.888 1.293-2.147 1.144-3.378zM19.845 9.64c-.063-2.244 1.827-3.321 1.911-3.373-1.041-1.516-2.657-1.722-3.224-1.742-1.37-.139-2.668.802-3.358.802-.69 0-1.763-.782-2.9-.761-1.488.022-2.862.865-3.625 2.197-1.553 2.688-.396 6.66 1.119 8.841.741 1.069 1.616 2.271 2.765 2.23 1.103-.045 1.521-.723 2.853-.723 1.334 0 1.704.723 2.863.7 1.182-.018 1.927-1.086 2.646-2.163.827-1.206 1.167-2.381 1.184-2.44-.026-.012-2.271-.871-2.297-3.448zM15.66 2.95z"/></svg>
//     Continue with Apple
//   </button>

//   <button className={styles.authBtn}>
//     <svg xmlns="http://www.w3.org/2000/svg" width="20" viewBox="0 0 24 24"><path fill="#000" d="M3 4h18a1 1 0 0 1 1 1v2.18l-10 5.32L2 7.18V5a1 1 0 0 1 1-1m0 4.24l8.37 4.46a1 1 0 0 0 .94 0L21 8.24V19a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/></svg>
//     Continue with email
//   </button>

//   <button className={styles.authBtn}>
//     <svg xmlns="http://www.w3.org/2000/svg" width="20" viewBox="0 0 320 512"><path fill="#1877f2" d="M279.14 288l14.22-92.66h-88.91V127.56c0-25.35 12.42-50.06 52.24-50.06H293V6.26S259.64 0 225.36 0C141.09 0 89.53 54.42 89.53 153.27V195.3H0v92.66h89.53V512h107.71V288z"/></svg>
//     Continue with Facebook
//   </button>
//       </div>
//     </div>
//   );
// }

// pages/components/LoginModal.js
import { useMemo, useState } from "react";
import styles from "../styles/LoginModal.module.css";
import { BASE_URL } from "../baseurl/Baseurl";
import axios from "axios";
import Router from "next/router";
import ModelLogin from "./onboarding/ModelLogin";
import ClientLogin from "./onboarding/ClientLogin";
import ModelReg from "./onboarding/ModelReg";
import ClientReg from "./onboarding/ClientReg";
import ClientRegStep2 from "./onboarding/ClientRegStep2";

export default function LoginModal({ onClose, user }) {
  const [regType, setRegType] = useState("signup");
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    // address: "",
    // selected_model: "",
    // cardname: "",
    // card: "",
    // expiration: "",
    // security_code: ""
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
    const newErrors = {};
    if (!loginData.email) newErrors.email = "required";
    if (!loginData.password) newErrors.password = "required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const validateModel = () => {
    const newErrors = {};
    if (!formData.phone) newErrors.phone = "required";
    if (!formData.name) newErrors.name = "required";
    if (!formData.email) newErrors.email = "required";
    if (!formData.password) newErrors.password = "required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const validateClient = () => {
    const newErrors = {};
    if (!clientFormData.phone) newErrors.phone = "required";
    if (!clientFormData.name) newErrors.name = "required";
    if (!clientFormData.email) newErrors.email = "required";
    if (!clientFormData.password) newErrors.password = "required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

  // const handleFinalSubmit = async () => {
  //   setError("");
  //   setLoading(true);
  //   try {
  //     const payload = user === "model" ? formData : clientFormData;

  //     console.log("Payload", payload);

  //     const response = await axios.post(
  //       user === "model"
  //         ? `${BASE_URL}cmodel.php`
  //         : `${BASE_URL}register-customer.php`,
  //       payload,
  //       {
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //       }
  //     );
  //     console.log(response);
  //     if (response.data.success == "1") {
  //       const { token, name } = response.data;

  //       if (user === "model") {
  //         localStorage.setItem("token", token);
  //         localStorage.setItem("modelName", name || formData.name);
  //         window.location.reload();
  //         Router.push("/model-backend/orders");
  //       } else {
  //         localStorage.setItem("customertoken", token);
  //         localStorage.setItem("customerName", name || clientFormData.name);
  //         //Router.push("/");
  //         onClose();
  //         window.location.reload();
  //       }
  //     } else {
  //       setError(
  //         response.data.message ||
  //           "Email/Password do not match. Please try again!"
  //       );
  //     }
  //   } catch (error) {
  //     console.error(error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const doValidate = validateClient2 || (() => true);
  const usPhoneRegex = /^(\+1\s?)?(\d{3}|\(\d{3}\))[-.\s]?\d{3}[-.\s]?\d{4}$/;
  const phoneInvalid = useMemo(() => {
    const v = formData?.phone || "";
    return v && !usPhoneRegex.test(v);
  }, [formData?.phone]);

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

  const submit = async () => {
    setError("");
    if (phoneInvalid) return;
    if (!doValidate()) return;
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
        `${BASE_URL}/register-customer.php`,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      if (resp?.data?.success === "1") {
        setRegType?.("login");
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
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await axios.post(
        user === "model"
          ? `${BASE_URL}login-model.php`
          : `${BASE_URL}login-customer.php`,
        loginData
      );

      if (response.data && response.data.success == "1") {
        const { usertoken: token, name } = response.data;
        if (user === "model") {
          localStorage.setItem("token", token);
          localStorage.setItem("modelName", name || loginData.email);
          onClose();
          Router.push("/model-backend/orders");
        } else {
          localStorage.setItem("customertoken", token);
          localStorage.setItem("customerName", name || loginData.email);
          onClose();
          window.location.reload(); // redirect home
        }
      } else {
        setError(
          (response.data && response.data.message) ||
            "Email/Password do not match. Please try again!"
        );
      }
    } catch (error) {
      console.error(error);
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
              viewBox="0 0 24 24">
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
              // handleFinalSubmit={handleFinalSubmit}
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
              viewBox="0 0 24 24">
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

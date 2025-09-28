import React, { useState } from "react";
import axios from "axios";
import styles from "../../styles/LoginModal.module.css";
import { Eye, EyeOff } from "lucide-react";

const usPhoneRegex = /^(\+1\s?)?(\d{3}|\(\d{3}\))[-.\s]?\d{3}[-.\s]?\d{4}$/;

const ModelReg = ({
  handleChange,
  setRegType,
  validateModel,
  formData,
  errors,
  // handleFinalSubmit, // no longer used; we post directly here
  setFormData,
  error, // parent-provided error (still shown if present)
  loading, // parent-provided loading (still shown if present)
}) => {
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [hide, setHide] = useState(false);
  const handlePhoneChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, phone: value }));
  };

  const handleImage = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      // Store base64 in formData so we can convert to Blob on submit
      setFormData((prev) => ({ ...prev, image: reader.result }));
    };
    reader.readAsDataURL(f);
  };

  // Convert base64 data URL to Blob for multipart uploads
  function dataURLtoBlob(dataurl) {
    const [meta, b64] = dataurl.split(",");
    const mimeMatch = meta.match(/data:(.*?);base64/);
    const mime = (mimeMatch && mimeMatch[1]) || "image/png";
    const bytes = atob(b64);
    const buf = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) buf[i] = bytes.charCodeAt(i);
    return new Blob([buf], { type: mime });
  }

  const submit = async () => {
    setSubmitError("");

    // basic inline phone validation (in addition to your validateModel())
    const phoneOk =
      !formData.phone || (formData.phone && usPhoneRegex.test(formData.phone));
    if (!phoneOk) {
      setPhoneTouched(true);
      return;
    }

    // run your existing form validator
    if (!validateModel()) return;

    try {
      setSubmitting(true);

      // Build multipart form-data
      const fd = new FormData();
      fd.append("name", (formData.name || "").trim());
      fd.append("phone", formData.phone || "");
      fd.append("email", (formData.email || "").trim());
      fd.append("password", formData.password || "");

      if (formData.image) {
        const blob = dataURLtoBlob(formData.image);
        // filename is a hint; server should generate unique name internally
        fd.append("image", blob, "profile.png");
      }

      const resp = await axios.post(
        "https://tsm.spagram.com/api/create-model.php",
        fd,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      // Expecting JSON like { success: "1", id: ..., message: ... }
      if (resp?.data?.success === "1") {
        // Optional: flip UI to login or show a success message
        setRegType("login");
      } else {
        // If server returns text or different JSON, surface it
        const msg =
          (typeof resp?.data === "string" && resp.data) ||
          resp?.data?.message ||
          "Registration failed. Please try again.";
        setSubmitError(msg);
      }
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "Network error. Please try again.";
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const phoneInvalid =
    phoneTouched && formData.phone && !usPhoneRegex.test(formData.phone);

  return (
    <>
      <h2>Sign up / Log in as Therapist</h2>

      <div className={styles.inputGroup}>
        <input
          type="tel"
          placeholder="Phone number"
          value={formData.phone}
          onChange={handlePhoneChange}
          onBlur={() => setPhoneTouched(true)}
          inputMode="tel"
        />
        {(errors.phone || phoneInvalid) && (
          <p className={"required"}>
            {errors.phone || "Please enter a valid US phone number"}
          </p>
        )}

        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange("email")}
          autoComplete="email"
        />
        {errors.email && <p className={"required"}>{errors.email}</p>}

        <input
          type="text"
          placeholder="Full name"
          value={formData.name}
          onChange={handleChange("name")}
          autoComplete="name"
        />
        {errors.name && <p className={"required"}>{errors.name}</p>}
        <div className="password-div">
          <input
            type={hide ? "text" : "password"}
            placeholder="Password"
            value={formData.password}
            onChange={handleChange("password")}
            autoComplete="new-password"
          />
          {hide && (
            <Eye
              onClick={() => {
                setHide(false);
              }}
              className="eye-m"
            />
          )}
          {!hide && (
            <EyeOff
              onClick={() => {
                setHide(true);
              }}
              className="eye-m"
            />
          )}
        </div>
        {errors.password && <p className={"required"}>{errors.password}</p>}

        {/* Optional profile image (saved as base64 in formData.image; we convert to Blob on submit) */}
        <input type="file" accept="image/*" onChange={handleImage} />
        {errors.image && <p className={"required"}>{errors.image}</p>}
      </div>

      <div className={styles.switchText}>
        Already have an account?{" "}
        <span className={styles.linkText} onClick={() => setRegType("login")}>
          Log In
        </span>
      </div>

      {(error || submitError) && (
        <p className="required">{submitError || error}</p>
      )}

      <button
        className={styles.continueBtn}
        onClick={submit}
        disabled={submitting || loading}>
        {submitting || loading ? "processing..." : "Submit"}
      </button>
    </>
  );
};

export default ModelReg;

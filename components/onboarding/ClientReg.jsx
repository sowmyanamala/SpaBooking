import React, { useState, useMemo } from "react";
import styles from "../../styles/loginModal.module.css";
import { Eye, EyeOff } from "lucide-react";

const usPhoneRegex = /^(\+1\s?)?(\d{3}|\(\d{3}\))[-.\s]?\d{3}[-.\s]?\d{4}$/;

// const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://tsm.spagram.com";
const API_BASE = "https://tsm.spagram.com";

const ClientReg = ({
  handleChange,
  setRegType,
  validateClient,
  formData,
  errors,
  setErrors,
  error,
  setStep,
}) => {
  const [hide, setHide] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const hc = handleChange || (() => () => {});
  const doValidate = validateClient || (() => true);

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
    if (phoneInvalid) return;
    if (validateClient()) {
      setStep(2);
    }
  };

  return (
    <>
      <h2>Log in / sign up as client</h2>

      <div
        className={styles.inputGroup}
        onKeyDown={(e) => e.key === "Enter" && submit()}>
        <label htmlFor="phone">Phone number</label>
        <input
          id="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="Phone number"
          value={formData?.phone ?? ""}
          onChange={handleChange("phone")}
          onBlur={(e) => validatePhoneInline(e.target.value)}
          aria-invalid={Boolean(errors?.phone || phoneInvalid)}
        />
        {(errors?.phone || phoneInvalid) && (
          <p className="required">
            {errors?.phone || "Please enter a valid US phone number"}
          </p>
        )}

        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="Email"
          value={formData?.email ?? ""}
          onChange={handleChange("email")}
          aria-invalid={Boolean(errors?.email)}
        />
        {!!errors?.email && <p className="required">{errors.email}</p>}

        <label htmlFor="name">Full name</label>
        <input
          id="name"
          type="text"
          autoComplete="name"
          placeholder="Full name"
          value={formData?.name ?? ""}
          onChange={handleChange("name")}
          aria-invalid={Boolean(errors?.name)}
        />
        {!!errors?.name && <p className="required">{errors.name}</p>}
        <div className="password-div">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type={hide ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Password"
            value={formData?.password ?? ""}
            onChange={handleChange("password")}
            aria-invalid={Boolean(errors?.password)}
          />
          {hide && (
            <Eye
              onClick={() => {
                setHide(false);
              }}
              className="eye"
            />
          )}
          {!hide && (
            <EyeOff
              onClick={() => {
                setHide(true);
              }}
              className="eye"
            />
          )}
          {!!errors?.password && (
            <p className="required-p">{errors.password}</p>
          )}
        </div>
      </div>

      <div className={styles.switchText}>
        Already have an account?{" "}
        <span
          className={styles.linkText}
          onClick={() => setRegType("login")}
          role="button"
          tabIndex={0}>
          Log In
        </span>
      </div>

      {(error || submitError) && (
        <p className="required">{submitError || error}</p>
      )}

      <button
        className={styles.continueBtn}
        disabled={phoneInvalid}
        onClick={submit}>
        {"Next"}
      </button>
    </>
  );
};

export default ClientReg;

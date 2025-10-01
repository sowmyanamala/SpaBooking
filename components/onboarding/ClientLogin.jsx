import { useState } from "react";
import styles from "../../styles/LoginModal.module.css";
import { Eye, EyeOff } from "lucide-react";

const ClientLogin = ({
  handleLoginChange,
  loginData,
  errors,
  error,
  validateLogin,
  setRegType,
  loading,
  handleLogin,
}) => {
  const [hide, setHide] = useState(false);
  return (
    <>
      <h2> Login up as Client</h2>
      <div className={styles.inputGroup}>
        <label>Email </label>
        <input
          type="email"
          placeholder="Email"
          value={loginData.email}
          onChange={handleLoginChange("email")}
        />
        {errors.email && <p className={"required"}>{errors.email}</p>}
        <div className="password-div">
          <input
            type={hide ? "text" : "password"}
            placeholder="Password"
            value={loginData.password}
            onChange={handleLoginChange("password")}
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
      </div>
      {error && <p className="required">{error}</p>}
      <div className={styles.switchText}>
        Don’t have an account?{" "}
        <span className={styles.linkText} onClick={() => setRegType("signup")}>
          Sign Up
        </span>
      </div>
      <div className="flex">
        <button
          className={styles.continueBtn}
          onClick={(e) => {
            if (validateLogin()) {
              handleLogin(e);
            }
          }}>
          {loading ? "please wait..." : "Log In"}
        </button>
        {loading ? <img width="30px" src="images/loading.gif" /> : " "}
      </div>
    </>
  );
};

export default ClientLogin;

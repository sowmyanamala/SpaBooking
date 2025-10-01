import styles from "../../styles/loginModal.module.css";

const ModelLogin = ({
  handleLoginChange,
  loginData,
  errors,
  error,
  validateLogin,
  setRegType,
  loading,
  handleLogin,
}) => {
  return (
    <>
      <h2> Login up as a Therapist</h2>
      <div className={styles.inputGroup}>
        <label>Email </label>
        <input
          type="email"
          placeholder="Email"
          value={loginData.email}
          onChange={handleLoginChange("email")}
        />
        {errors.email && <p className={"required"}>{errors.email}</p>}
        <input
          type="password"
          placeholder="Password"
          value={loginData.password}
          onChange={handleLoginChange("password")}
        />
        {errors.password && <p className={"required"}>{errors.password}</p>}
      </div>
      {error && <p className="required">{error}</p>}
      {/* <div className="container">
        <p>Don't have an account?</p>
        <button className="regBtn" onClick={() => setRegType("signup")}>
          Sign Up
        </button>
      </div> */}
      <div className={styles.switchText}>
        Don’t have an account?{" "}
        <span className={styles.linkText} onClick={() => setRegType("signup")}>
          Sign Up
        </span>
      </div>
      <div className="flex">
        <button
          className={styles.continueBtn}
          onClick={handleLogin}
          type="button"
        >
          {loading ? "please wait..." : "Log In"}
        </button>
        {loading ? <img width="30px" src="images/loading.gif" /> : " "}
      </div>
    </>
  );
};

export default ModelLogin;

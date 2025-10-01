import styles from "../../styles/LoginModal.module.css";

const ClientRegStep3 = ({
  handleChange,
  validateStep3,
  formData,
  errors,
  setStep,
  handleFinalSubmit,
}) => {
  return (
    <>
      <input
        type="text"
        placeholder="Address"
        value={formData.address}
        onChange={handleChange("address")}
      />
      {errors.address && <p className={"required-date"}>{errors.address}</p>}
      <input
        type="password"
        placeholder="Password"
        value={formData.password}
        onChange={handleChange("password")}
      />
      <input
        type="text"
        placeholder="Card name"
        value={formData.cardname}
        onChange={handleChange("cardname")}
      />
      {errors.cardname && <p className={"required-date"}>{errors.cardname}</p>}
      <input
        type="text"
        placeholder="Card number"
        value={formData.card}
        onChange={handleChange("card")}
      />
      {errors.card && <p className={"required-date"}>{errors.card}</p>}
      <input
        type="text"
        placeholder="Expiration"
        value={formData.expiration}
        onChange={handleChange("expiration")}
      />
      {errors.expiration && (
        <p className={"required-date"}>{errors.expiration}</p>
      )}
      <input
        type="text"
        placeholder="Security code"
        value={formData.security_code}
        onChange={handleChange("security_code")}
      />
      {errors.security_code && (
        <p className={"required-date"}>{errors.security_code}</p>
      )}
      <input
        type="text"
        placeholder="Preferred therapist (optional)"
        value={formData.selected_model}
        onChange={handleChange("selected_model")}
      />
      <button
        className={styles.continueBtn}
        onClick={() => {
          if (validateStep3()) {
            handleFinalSubmit();
          }
        }}>
        Register
      </button>
    </>
  );
};

export default ClientRegStep3;

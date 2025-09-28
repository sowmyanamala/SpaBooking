import styles from "../../styles/LoginModal.module.css";

const ClientRegStep2 = ({
  handleChange,
  formData,
  errors,
  setStep,
  loading,
  handleSubmit,
}) => {
  return (
    <div className={styles.inputGroup}>
      <label htmlFor="address">Address</label>
      <input
        id="address"
        type="text"
        autoComplete="address-line1"
        placeholder="Street address"
        value={formData?.address ?? ""}
        onChange={handleChange("address")}
      />
      {errors.address && <p className={"required"}>{errors.address}</p>}
      <label htmlFor="city">City</label>
      <input
        id="city"
        type="text"
        autoComplete="address-level2"
        placeholder="City"
        value={formData?.city ?? ""}
        onChange={handleChange("city")}
      />
      {errors.city && <p className={"required"}>{errors.city}</p>}
      <label htmlFor="zip">ZIP</label>
      <input
        id="zip"
        type="text"
        inputMode="numeric"
        autoComplete="postal-code"
        placeholder="ZIP"
        value={formData?.zip ?? ""}
        onChange={handleChange("zip")}
      />

      {errors.zip && <p className={"required"}>{errors.zip}</p>}
      <button className={styles.continueBtn} onClick={handleSubmit}>
        {loading ? "Processing..." : "Submit"}
      </button>
    </div>
  );
};

export default ClientRegStep2;

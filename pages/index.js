import React, { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import Layout from "../components/layout";
import styles from "../styles/Home.module.css";
import Ethnicities from "../components/data/ethnicities.js";
import services from "../components/data/services";

export default function Home() {
  const API_BASE = "https://tsm.spagram.com/api/filter-models.php";

  const [therapists, setTherapists] = useState([]);
  const [verifiedTherapists, setVerifiedTherapists] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [filteredUrl, setFilteredUrl] = useState(API_BASE);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    location: "",
    gender: "",
    ethnicity: "",
    age: "",
    serviceType: "",
  });
  const [searchName, setSearchName] = useState("");

  // Check if user was redirected here due to auth issues
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const authRedirect = urlParams.get("auth_redirect");
    if (authRedirect === "model") {
      // Auto-show model login modal with small delay to ensure layout is ready
      setTimeout(() => {
        const event = new CustomEvent("showModelLoginModal");
        window.dispatchEvent(event);
      }, 100);
    }
  }, []);

  // fetch therapists and verification status together
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch therapists
      const therapistsResponse = await fetch(filteredUrl);
      const therapistsData = await therapistsResponse.json();
      console.log("Therapists API Response", therapistsData);
      const therapistData = Array.isArray(therapistsData) ? therapistsData : [];
      setTherapists(therapistData);

      // Fetch verification status
      const verificationResponse = await fetch(
        "https://tsm.spagram.com/api/get-verification-status.php"
      );
      const verificationData = await verificationResponse.json();
      if (verificationData.success && verificationData.verified_ids) {
        setVerifiedTherapists(new Set(verificationData.verified_ids));
        console.log(
          "Verified therapists loaded:",
          verificationData.verified_ids
        );
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // fetch whenever URL changes
  useEffect(() => {
    fetchData();
  }, [filteredUrl]);

  const handleInputChange = (e) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Build URL from current filters + name
  const buildUrl = (next = {}) => {
    const q = new URLSearchParams();
    const merged = { ...filters, ...next };
    Object.entries(merged).forEach(([k, v]) => {
      if (v) q.append(k, v);
    });
    if (searchName) q.append("name", searchName.trim());
    return q.toString() ? `${API_BASE}?${q.toString()}` : API_BASE;
  };

  const applyFilters = () => setFilteredUrl(buildUrl());

  // OPTIONAL: make chips instant (update URL whenever filters/searchName change)
  useEffect(() => {
    setFilteredUrl(buildUrl());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, searchName]);

  return (
    <Layout home>
      <Head>
        <title>Find Your Therapist</title>
        <meta
          name="description"
          content="Book trusted therapy & wellness services across NY, NJ, and CT. Filter by location, gender, ethnicity, age, and service type—or search by name."
        />
      </Head>

      {/* HERO INTRO (moved INSIDE return) */}
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <h1 className={styles.title}>Find Your Therapist</h1>
          <p className={styles.description}>
            Book trusted, on-demand therapy & wellness services across New York,
            New Jersey, and Connecticut. Filter by location, gender, ethnicity,
            age, and service type—or search by name.
          </p>

          {/* quick service chips */}
          <div className={styles.badges} aria-label="Popular services">
            {services.slice(0, 6).map((s) => (
              <button
                key={s.id}
                className={styles.badge}
                onClick={() =>
                  setFilters((f) => ({ ...f, serviceType: String(s.id) }))
                }
              >
                {s.name}
              </button>
            ))}
          </div>

          {/* tiny stats */}
          <div className={styles.kpis} role="status" aria-live="polite">
            <div className={styles.kpi}>
              <strong>{therapists.length}</strong>
              <span>available providers</span>
            </div>
            <div className={styles.kpi}>
              <strong>3</strong>
              <span>states covered</span>
            </div>
            <div className={styles.kpi}>
              <strong>Same-day</strong>
              <span>appointments</span>
            </div>
          </div>
        </div>
      </header>

      {/* SEARCH BAR */}
      <div className={styles.searchHeader}>
        <input
          type="text"
          placeholder="Search by name..."
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          className={styles.searchInput}
        />
        <button
          onClick={() => setShowFilters((s) => !s)}
          className={styles.toggleButton}
        >
          {showFilters ? "Hide Filters" : "Show Filters"}
        </button>
      </div>

      {/* FILTERS */}
      {showFilters && (
        <div className={styles.filtersContainer}>
          <select
            className={styles.filterItem}
            name="location"
            value={filters.location}
            onChange={handleInputChange}
          >
            <option value="">Location</option>
            <option value="newyork">New York</option>
            <option value="newjersey">New Jersey</option>
            <option value="connecticut">Connecticut</option>
          </select>

          <select
            className={styles.filterItem}
            name="gender"
            value={filters.gender}
            onChange={handleInputChange}
          >
            <option value="">Gender</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="trans">Trans</option>
          </select>

          <select
            className={styles.filterItem}
            name="ethnicity"
            value={filters.ethnicity}
            onChange={handleInputChange}
          >
            {/* ensure Ethnicities[0] is a placeholder like "Ethnicity" */}
            {Ethnicities.map((eth, index) => (
              <option
                key={index}
                value={
                  index === 0 ? "" : eth.toLowerCase().replace(/[^a-z]/gi, "")
                }
              >
                {eth}
              </option>
            ))}
          </select>

          <select
            className={styles.filterItem}
            name="age"
            value={filters.age}
            onChange={handleInputChange}
          >
            <option value="">Age</option>
            <option value="18-19">18-19</option>
            <option value="20-30">20-30</option>
            <option value="30-40">30-40</option>
            <option value="40-50">40-50</option>
            <option value="60+">60+</option>
          </select>

          <select
            className={styles.filterItem}
            name="serviceType"
            value={filters.serviceType}
            onChange={handleInputChange}
          >
            <option value="">Service Type</option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name}
              </option>
            ))}
          </select>

          {/* keep if you want manual apply; otherwise you can remove this */}
          <button className={styles.applyButton} onClick={applyFilters}>
            Apply Filters
          </button>
        </div>
      )}

      {/* RESULTS GRID */}
      {isLoading ? (
        <p style={{ textAlign: "center", margin: "2rem 0", color: "#666" }}>
          Loading therapists...
        </p>
      ) : therapists.length === 0 ? (
        <p style={{ textAlign: "center", margin: "2rem 0", color: "#666" }}>
          No therapists match those filters yet—try clearing a filter or
          searching a different area.
        </p>
      ) : (
        <section className={styles.grid}>
          {therapists
            .filter((t) => t.name && t.name.trim() !== "") // Filter out therapists with empty names (temporarily removed verification filter)
            .map((t, i) => (
              <div
                key={i}
                className={styles.card}
                onClick={() => {
                  localStorage.setItem("selectedTherapist", JSON.stringify(t));
                  window.location.href = "/therapistDetails";
                }}
              >
                <img
                  src={t.picture_url || "/images/model.jpeg"}
                  alt={t.name || "Therapist"}
                  className={styles.image}
                />
                <div className={styles.cardOverlay}>
                  <h3>{t.name || "Unknown Therapist"}</h3>
                  <p>
                    {t.service_area_primary || t.service_area || "Service Area"}
                  </p>
                </div>
              </div>
            ))}
        </section>
      )}
    </Layout>
  );
}

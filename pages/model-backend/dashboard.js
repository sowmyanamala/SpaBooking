import React, { useState, useEffect } from "react";
import Head from "next/head";
import Layout, { siteTitle } from "../../components/model/layout";
import utilStyles from "../../styles/utils.module.css";
import Models from "../../components/models";
import withAuth from "../../components/model/withAuth";

const Dashboard = () => {
  const originalUrl = "https://tsm.spagram.com/api/models.php";
  const [area, setArea] = useState("");
  const [gender, setGender] = useState("");
  const [ethnicity, setEthnicity] = useState("");
  const [height, setHeight] = useState("");
  const [filteredUrl, setFilteredUrl] = useState(originalUrl);

  // Create filter URL with proper parameters
  function createFilterUrl() {
    const params = new URLSearchParams();
    if (area) params.append("service_area", area);
    if (gender) params.append("gender", gender);
    if (ethnicity) params.append("ethnicity", ethnicity);
    if (height) params.append("height", height);

    const url = params.toString()
      ? `${originalUrl}?${params.toString()}`
      : originalUrl;
    setFilteredUrl(url);
    console.log("Filter URL:", url);
  }

  function handleFilter() {
    createFilterUrl();
  }

  function handleAreaChange(e) {
    setArea(e.target.value);
  }

  function handleGenderChange(e) {
    setGender(e.target.value);
  }

  function handleEthnicityChange(e) {
    setEthnicity(e.target.value);
  }

  function handleHeightChange(e) {
    setHeight(e.target.value);
  }

  // Auto-filter when parameters change
  useEffect(() => {
    createFilterUrl();
  }, [area, gender, ethnicity, height]);

  return (
    <Layout dashboard>
      <Head>
        <title>{siteTitle}</title>
      </Head>

      <div className={utilStyles.dashboard}>
        <h2>Model Dashboard</h2>

        {/* Filter Section */}
        <div className={utilStyles.filters}>
          <h3>Filter Models</h3>
          <div className={utilStyles.filterRow}>
            <div className={utilStyles.filterGroup}>
              <label>Service Area:</label>
              <input
                type="text"
                value={area}
                onChange={handleAreaChange}
                placeholder="Enter service area"
              />
            </div>

            <div className={utilStyles.filterGroup}>
              <label>Gender:</label>
              <select value={gender} onChange={handleGenderChange}>
                <option value="">All</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Trans">Trans</option>
              </select>
            </div>

            <div className={utilStyles.filterGroup}>
              <label>Ethnicity:</label>
              <input
                type="text"
                value={ethnicity}
                onChange={handleEthnicityChange}
                placeholder="Enter ethnicity"
              />
            </div>

            <div className={utilStyles.filterGroup}>
              <label>Height:</label>
              <input
                type="text"
                value={height}
                onChange={handleHeightChange}
                placeholder="Enter height"
              />
            </div>
          </div>

          <button onClick={handleFilter} className={utilStyles.filterButton}>
            Apply Filters
          </button>
        </div>

        {/* Models Display */}
        <div className={utilStyles.modelsSection}>
          <h3>Models</h3>
          <Models apiUrl={filteredUrl} photoOnlyView={false} />
        </div>
      </div>
    </Layout>
  );
};

export default withAuth(Dashboard);

import React, { useState, useEffect } from "react";
import Head from "next/head";
import Layout, { siteTitle } from "../../components/model/layout";
import utilStyles from "../../styles/utils.module.css";
import Models from "../../components/models";
import withAuth from "../../components/model/withAuth";

const PastOrders = () => {
  const originalUrl = "https://tsm.spagram.com/api/models.php";
  const [baseUrl, setBaseUrl] = useState(originalUrl);

  const [area, setArea] = useState("");
  const [gender, setGender] = useState("");
  const [race, setRace] = useState("");
  const [height, setHeight] = useState("");
  const [filteredUrl, setFilteredUrl] = useState(originalUrl);

  //area, gender, race, height
  function createFilterUrl() {
    setFilteredUrl(
      originalUrl +
        "?service_area=" +
        area +
        "&gender=" +
        gender +
        "&race=" +
        race +
        "&height=" +
        height
    );
    console.log("hi", filteredUrl);
  }

  function handleFilter() {
    setFilteredUrl(
      originalUrl +
        "?service_area=" +
        area +
        "&gender=" +
        gender +
        "&race=" +
        race +
        "&height=" +
        height
    );
  }

  function handleAreaChange(e) {
    setArea(e.target.value);
  }
  function handleGenderChange(e) {
    setGender(e.target.value);
  }

  function handleRaceChange(e) {
    setRace(e.target.value);
  }

  function handleHeightChange(e) {
    setHeight(e.target.value);
  }

  return (
    <Layout pastOrders>
      <Head>
        <title>{siteTitle}</title>
      </Head>

      <h2> PastOrders Coming soon... </h2>
    </Layout>
  );
};

export default withAuth(PastOrders);

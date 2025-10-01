// pages/model-backend/copyCrudTble.js
import React, { useState, useEffect } from "react";
import Head from "next/head";
import Layout, { siteTitle } from "../../components/model/layout";
import modelStyle from "../../styles/model.module.css";
import withAuth from "../../components/admin/withAuth";
import axios from "axios";
import CopyCrudSingle from "./copyCrudSingle.js";

function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

const CopyCrudTble = () => {
  const [copyCrudData, setCopyCrudData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [noCopyCrud, setNoCopyCrud] = useState(false);
  const [status, setStatus] = useState("");

  const changeCopyCrudStatus = (s) =>
    setStatus(s === "Approved" ? "Approved" : "Denied");

  useEffect(() => {
    if (typeof window === "undefined") return;

    // prefer stored modelId; fallback to decoding token
    let id = localStorage.getItem("modelId");
    if (!id || id === "undefined") {
      const token = localStorage.getItem("token");
      const payload = token ? parseJwt(token) : null;
      id = payload?.id || payload?.userId || null;
      if (id) localStorage.setItem("modelId", String(id));
    }
    if (!id) return; // do not fetch without a valid id

    const url = `https://tsm.spagram.com/api/getpendingorders.php?modelid=${encodeURIComponent(
      id
    )}`;

    setLoading(true);
    setError("");
    setNoCopyCrud(false);

    axios
      .get(url)
      .then((res) => {
        const rows = Array.isArray(res.data) ? res.data : [];
        setCopyCrudData(rows);
        setNoCopyCrud(rows.length === 0);
      })
      .catch((e) => setError(e.message || "Failed to load"))
      .finally(() => setLoading(false));
  }, [status]);

  return (
    <Layout copyCruds>
      <Head>
        <title>{siteTitle}</title>
      </Head>

      <div className="copyCrudlist">
        <h2>Your Service Request</h2>

        {loading && <p>Loading pending requests…</p>}
        {!loading && error && <div className={modelStyle.error}>{error}</div>}

        {!loading && !error && noCopyCrud && (
          <strong>You don&apos;t have any pending service request</strong>
        )}

        {!loading && !error && !noCopyCrud && (
          <div className={modelStyle.table}>
            <table className="table">
              <thead>
                <tr>
                  <th>Request Time</th>
                  <th>Address</th>
                  <th>Call Type</th>
                  <th>Service Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {copyCrudData.map((copyCrud, index) => (
                  <CopyCrudSingle
                    key={copyCrud?.id ?? index}
                    changeCopyCrudStatus={changeCopyCrudStatus}
                    copyCrud={copyCrud}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default withAuth(CopyCrudTble);

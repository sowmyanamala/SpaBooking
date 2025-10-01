import React, { useState, useEffect } from "react";
import axios from "axios";
import Model from "./model";
import utilStyles from "../styles/utils.module.css";

const modelist = [
  {
    image: "/images/model.jpeg",
    name: "Jane Doe",
    service_area: "New York",
    phone: "555-555-5555",
    email: "jane.doe@example.com",
    availability: "Available",
  },
  {
    image: "/images/model.jpeg",
    name: "Johny depp",
    service_area: "Los Angeles",
    phone: "555-555-5556",
    email: "john.doe@example.com",
    availability: "Unavailable",
  },
  {
    image: "/images/model.jpeg",
    name: "Jane Smith",
    service_area: "San Francisco",
    phone: "555-555-5557",
    email: "jane.smith@example.com",
    availability: "Available",
  },
  {
    image: "/images/model.jpeg",
    name: "Jane Doe",
    service_area: "New York",
    phone: "555-555-5555",
    email: "jane.doe@example.com",
    availability: "Available",
  },
  {
    image: "/images/model.jpeg",
    name: "Johny depp",
    service_area: "Los Angeles",
    phone: "555-555-5556",
    email: "john.doe@example.com",
    availability: "Unavailable",
  },
  {
    image: "/images/model.jpeg",
    name: "Jane Smith",
    service_area: "San Francisco",
    phone: "555-555-5557",
    email: "jane.smith@example.com",
    availability: "Available",
  },
];

function Models({ photoOnlyView, apiUrl }) {
  // const base_endpoint = 'https://tsm.spagram.com/api/models.php';
  //const [api_enpoint, setApi_enpoint] = useState(base_endpoint);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  console.log("ses", apiUrl);

  useEffect(() => {
    // console.log('show mm', photoOnlyView);
    const urlParams = new URLSearchParams(apiUrl);
    let mdy = "";
    if (urlParams.get("date") == "") {
      const date = new Date();
      const month = date.getMonth() + 1; // Months are zero-based in JavaScript
      const day = date.getDate();
      const year = date.getFullYear();
      mdy = `${month}/${day}/${year}`;
      setDate(mdy);
    } else {
      setDate(urlParams.get("date"));
    }

    setTime(urlParams.get("time"));

    setLoading(true);
    const getData = async () => {
      try {
        const response = await axios.get(apiUrl);
        // Deduplicate models by id or slug and filter out duplicate with id 132 as temporary workaround
        const uniqueModelsMap = new Map();
        response.data.forEach((model) => {
          // Skip model with id 132 (duplicate Teresa Cronin)
          if (model.id === "132") {
            return;
          }
          const key = model.slug || model.name;
          if (!uniqueModelsMap.has(key)) {
            uniqueModelsMap.set(key, model);
          }
        });
        const uniqueModels = Array.from(uniqueModelsMap.values());
        setData(uniqueModels);
        console.log("alldata", uniqueModels);
        setError(null);
      } catch (err) {
        setError(err.message);
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, [apiUrl]);

  return (
    <div className={utilStyles.models}>
      {loading && <div>Loading...</div>}
      {error && (
        <div>{`There is a problem fetching the post data - ${error}`}</div>
      )}
      {data &&
        data.map((model, index) => (
          <Model
            slug={model.slug}
            photoOnlyView={photoOnlyView}
            date={date}
            time={time}
            key={index}
            {...model}
          />
        ))}
      {data && !loading && data.length < 1
        ? " No Therapist matched your searched criteria.  "
        : ""}
    </div>
  );
}

export default Models;

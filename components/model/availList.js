import React, { useState, useEffect } from "react";
import Head from "next/head";
import Layout, { siteTitle } from "./layout";
import modelCss from "../../styles/model.module.css";
import Models from "../models";
import withAuth from "./withAuth";
import DatePicker from "react-datepicker";
import setHours from "date-fns/setHours";
import setMinutes from "date-fns/setMinutes";
import "react-datepicker/dist/react-datepicker.css";

const AvailList = () => {
  const originalUrl = "https://tsm.spagram.com/api/models.php";
  const [baseUrl, setBaseUrl] = useState(originalUrl);

  const [startDate, setStartDate] = useState(
    setHours(setMinutes(new Date(), 0), 9)
  );
  const [endDate, setEndDate] = useState(
    setHours(setMinutes(new Date(), 0), 17)
  );
  let handleColor = (time) => {
    return time.getHours() > 12 ? "text-success" : "text-error";
  };

  function getCurrentDateGMT() {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth() + 1;
    const day = now.getUTCDate();
    const hour = now.getUTCHours();
    const minute = now.getUTCMinutes();
    const second = now.getUTCSeconds();
    const milliseconds = now.getUTCMilliseconds();
    const dateGMT = new Date(
      Date.UTC(year, month, day, hour, minute, second, milliseconds)
    );
    return convertDateStringToTimestamp(dateGMT);
  }

  function convertDateStringToTimestamp(dateString) {
    const timestamp = Date.parse(dateString) / 1000;
    return timestamp;
  }

  const showdate = () => {
    console.log("so", convertDateStringToTimestamp(startDate));
  };

  return (
    <div className={modelCss.availBox}>
      <div className="timeBox">
        <div>Start Date</div>
        <DatePicker
          showTimeSelect
          selected={startDate}
          onChange={(date) => setStartDate(date)}
          timeClassName={handleColor}
          dateFormat="MMMM d, yyyy | h:mm aa"
        />
      </div>

      <div className={modelCss.timeBox2}>
        <div>End Date</div>
        <DatePicker
          showTimeSelect
          selected={endDate}
          onChange={(date) => setEndDate(date)}
          timeClassName={handleColor}
          dateFormat="MMMM d, yyyy | h:mm aa"
        />
      </div>

      <button className={modelCss.save}> Save </button>
    </div>
  );
};

export default withAuth(AvailList);

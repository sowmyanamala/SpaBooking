import React, { useState, useEffect } from "react";
import Head from "next/head";
import Layout, { siteTitle } from "../../components/model/layout";
import { CURRENT_URL } from "../../components/config";
import withAuth from "../../components/admin/withAuth";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import modelCss from "../../styles/model.module.css";
import moment from "moment-timezone";
import { DateTime } from "luxon";
import uuid from "react-uuid";
import axios from "axios";

const Availability = () => {
  const originalUrl = "https://tsm.spagram.com/api/models.php";
  const [baseUrl, setBaseUrl] = useState(originalUrl);
  const [formData, setFormData] = useState({
    modelId: "",
    availability: null,
  });

  const [unavailable, setunavailable] = useState("");

  const [unavailSubmitData, setUnavailSubmitData] = useState({
    modelId: "",
    availability: null,
  });

  const [formDataWeekSubmit, setformDataWeekSubmit] = useState({
    modelId: "",
    availability: null,
  });

  const [weeeklyAvailData, setWeeeklyAvailData] = useState({
    everydayStart: "",
    everydayEnd: "",
    excludeEvery1: "",
    excludeEvery2: "",
    excludeFutureDate: null,
    excludeFutureRangeFrom: null,
    excludeFutureRangeTo: null,
  });
  const [id, setId] = useState(null);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  // const [availArr, setAvailArr] = useState([{"id": 1, "start": "1676596068", "end": "1676591018"}, {"id": 2, "start": "1676516068", "end": "1676291018"}]);
  const [availArr, setAvailArr] = useState([]);
  const [loading, setLoading] = useState(null);
  const [isUpdate, setIsUpdate] = useState(false);
  const [excludespecificdate, setExcludespecificdate] = useState(null);
  const [message, setMessage] = useState("");
  const [unavailMessage, setUnavailMessage] = useState("");

  const [error, setError] = useState(null);
  let handleColor = (time) => {
    return time.getHours() > 12 ? "text-success" : "text-error";
  };

  let loading_url = CURRENT_URL + "images/loading.gif";

  const availHeaderClass = `${modelCss.availList} ${modelCss.availList_header}`;

  function formatDateString(inputDateString, format) {
    const date = new Date(inputDateString);

    // Helper function to pad with leading zeros
    function pad(value, length) {
      return value.toString().padStart(length, "0");
    }

    const formatMapping = {
      yyyy: date.getFullYear(),
      MM: pad(date.getMonth() + 1, 2), // JavaScript month is zero-based
      dd: pad(date.getDate(), 2),
      HH: pad(date.getHours(), 2),
      mm: pad(date.getMinutes(), 2),
      ss: pad(date.getSeconds(), 2),
    };

    return format.replace(
      /(yyyy|MM|dd|HH|mm|ss)/g,
      (matched) => formatMapping[matched]
    );
  }

  const handleUncertainChange = (e) => {
    if (e.target.value == "yes") {
      setunavailable("");
    } else {
      setunavailable("yes");
    }
  };

  const handleWeeklyChange = (e) => {
    setWeeeklyAvailData({
      ...weeeklyAvailData,
      [e.target.name]: e.target.value,
    });
  };

  const handleChange = (e) => {
    setExcludespecificdate(e.target.value);
    // setFormData({
    //   ...formData,
    //   [e.target.name]: e.target.value
    // });
  };

  // // Example usage:
  // const inputDateString = 'Fri Apr 07 2023 03:30:00';
  // // const outputFormat = 'dd-MM-yyyy HH:mm:ss';
  // const outputFormat = 'yyyy-MM-dd HH:mm';
  // const formattedDateString = formatDateString(inputDateString, outputFormat);

  // console.log('formated date string', formattedDateString); // Output: "07-04-2023 03:30:00"

  function convertDateStringToTimestamp(dateString) {
    // console.log('dsss', dateString);
    // const momentObj = moment(dateString, 'MMMM d, yyyy | h:mm aa');
    // // Set the timezone to EST
    // momentObj.tz('America/New_York');
    // // Convert the Moment object to a timestamp
    // const timestamp = momentObj.valueOf();

    // const timezoneString = Intl.DateTimeFormat().resolvedOptions().timeZone;
    // // Create a moment.js object from the input date string and timezone
    // const momentObject = moment.tz(dateString, timezoneString);
    // const utcDateString = momentObject.utc().format();
    // // const timestamp = Date.parse(dateString) / 1000;
    // const timestamp = Date.parse(utcDateString) / 1000;

    // Your date and time (use your desired format)
    // const dateTime = '2023-04-06 13:30';
    const dateTime = "Fri Apr 07 2023 03:30:00";
    //  GMT-0700 (Pacific Daylight Time)

    console.log("date string unformated", dateString);
    const outputFormat = "yyyy-MM-dd HH:mm";
    dateString = formatDateString(dateString, outputFormat);
    console.log("date string formated", dateString);

    // Set the input format
    // const inputFormat = 'yyyy-MM-dd HH:mm:ss';
    // const inputFormat = 'yyyy-MM-dd HH:mm';
    const inputFormat = "yyyy-MM-dd HH:mm";

    // Parse the date and time using luxon
    const dateObj = DateTime.fromFormat(dateString, inputFormat, {
      zone: "America/New_York",
    });

    // Convert the luxon DateTime object to a timestamp
    const timestamp = dateObj.toMillis();

    console.log("Timestamp in EST timezone:", timestamp);

    return timestamp;
  }

  const saveTSSate = (e) => {
    // setAvailArr({...availArr, {startDate:e.}});
  };

  const getTimefromTS = (ts) => {
    // const dateObject = new Date(ts * 1000);

    // // Extract the Month, Day, Year, and Time in 12 hour format from the date object
    // const month = dateObject.toLocaleString('default', { month: 'long' });
    // const day = dateObject.getDate();
    // const year = dateObject.getFullYear();
    // const hours = dateObject.getHours();
    // const minutes = dateObject.getMinutes();
    // const ampm = hours >= 12 ? 'pm' : 'am';
    // const time = hours % 12 + ':' + (minutes < 10 ? '0' : '') + minutes + ' ' + ampm;

    // // Combine the extracted values into the desired format
    // const formattedDate = month + ' ' + day + ', ' + year + ', ' + time;

    // EST-based timestamp (in milliseconds)
    // const estTimestamp = 1677922800000;

    // Create a Date object from the timestamp
    const date = new Date(ts);

    // Set the desired time zone (e.g., 'America/New_York' for Eastern Time)
    const timeZone = "America/New_York";

    // Options for displaying the date, time, and year
    const options = {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false, // Set to false for 24-hour format
    };

    // Format the date and time using toLocaleString()
    const formattedDateTime = date.toLocaleString("en-CA", options); // Use 'en-CA' locale for "year-month-date" format

    console.log(formattedDateTime); // Output: "2023-02-03 14:00:00" (for example)

    return formattedDateTime;
  };

  const showdate = () => {
    console.log("so", convertDateStringToTimestamp(startDate));
  };
  const removeTime = (id, e) => {
    setAvailArr(availArr.filter((time) => time.id !== id));
    setIsUpdate(true);
    setId(121211122);
  };
  const addTime = () => {
    let id = uuid();
    console.log("avail count", id);
    let start_time = convertDateStringToTimestamp(startDate);
    let end_time = convertDateStringToTimestamp(endDate);
    setAvailArr([...availArr, { id: id, start: start_time, end: end_time }]);
  };

  const handleAvaiability = async (e) => {
    if (e !== undefined) e.preventDefault();
    try {
      setLoading(true);
      const modelid = localStorage.getItem("token");
      formData.modelId = modelid;
      formData.availability = JSON.stringify(availArr);
      const response = await axios.post(
        "https://tsm.spagram.com/api/update-model-time.php",
        formData
      );
      console.log("rest from php", response.data);
      setLoading(false);

      if (response.data == "1") {
        console.log("updated the time");
        // window.location.href = location.state ? location.state.from.pathname : '/';
      }
    } catch (error) {
      console.error(error);
    }
    setIsUpdate(false);
  };

  const saveUnavailablity = async (e) => {
    e.preventDefault();
    try {
      console.log("weeklydata", unavailable);
      setUnavailMessage("Saving.....");
      const modelid = localStorage.getItem("token");
      unavailSubmitData.modelId = modelid;
      unavailSubmitData.availability = JSON.stringify(unavailable);
      console.log("to send unavail", unavailSubmitData);
      const response = await axios.post(
        "https://tsm.spagram.com/api/update-uncertain-unavailability.php",
        unavailSubmitData
      );
      console.log("rest", response.data);
      if (response.data == "1") {
        setUnavailMessage(" Uncertain unavailability saved.");
      } else {
        setError(
          "Uncertain unavailability could not saved. Please contact admin"
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

  const saveWeeklyData = async (e) => {
    e.preventDefault();
    try {
      console.log("weeklydata", weeeklyAvailData);
      setMessage("Saving.....");
      const modelid = localStorage.getItem("token");
      formDataWeekSubmit.modelId = modelid;
      formDataWeekSubmit.availability = JSON.stringify(weeeklyAvailData);
      const response = await axios.post(
        "https://tsm.spagram.com/api/update-weekly-avail-time.php",
        formDataWeekSubmit
      );
      console.log("rest", response.data);
      if (response.data == "1") {
        setMessage("Weekly changes are successfully saved.");
      } else {
        setError("Email/Password do not match. Please try again!");
      }
    } catch (error) {
      console.error(error);
    }
  };

  // useEffect(() => {
  //   // call your function here
  //   handleAvaiability();
  // }, [availArr]);

  useEffect(() => {
    const modelid = localStorage.getItem("token");
    setExcludespecificdate("2024-02-19");
    setId(modelid);
    let url =
      "https://tsm.spagram.com/api/single-model.php?id=" +
      localStorage.getItem("token");

    const getData = async (id) => {
      try {
        setLoading(true);
        const response = await axios.get(url);
        const result = response.data;
        // setModel({...model, phone: '89999'})

        // setModel({availability: result.availability })
        console.log("received data", result);
        if (result.availability != null) {
          setAvailArr(result.availability);
          console.log("hello", result.availableweekly, result.unavailable);
        }
        if (result.availableweekly != null) {
          setWeeeklyAvailData(result.availableweekly);
        }
        if (result.unavailable != null) {
          setunavailable(result.unavailable);
        }

        setLoading(false);
        setError(null);
      } catch (err) {
        setError(err.message);
        // setData(null);
      } finally {
        setLoading(false);
      }
    };

    isUpdate ? handleAvaiability() : getData();
  }, [id]);

  return (
    <Layout availability>
      <Head>
        <title>{siteTitle}</title>
      </Head>

      <h2> My Availability </h2>
      <form className={modelCss.unavailForm} onSubmit={saveUnavailablity}>
        <div className={modelCss.unavailable}>
          <input
            type="checkbox"
            name="unavailable"
            checked={"yes" == unavailable}
            value={unavailable}
            onChange={handleUncertainChange}
            id="unavailable"
          />
          <label for="unavailable">
            Make me Unavailable for a uncertain period of time
          </label>
        </div>
        {/* <button   value="Save" ><button/> */}
        <button type="submit" className={modelCss.weeklysavebtn}>
          Save
        </button>
        <p className={modelCss.message}> {unavailMessage} </p>
      </form>

      <div className={modelCss.daily}>
        <form onSubmit={saveWeeklyData} className={modelCss.form}>
          <h3 className={modelCss.title}>Weekly Availability</h3>
          <p className={modelCss.subtitle}>
            If you are available almost every day, set your default weekly
            schedule:
          </p>

          {/* Everyday Start & End */}
          <div className={modelCss.row}>
            <label>Everyday from</label>
            <select
              className={modelCss.select}
              name="everydayStart"
              value={weeeklyAvailData.everydayStart}
              onChange={handleWeeklyChange}>
              <option value="">Select</option>
              {[
                "9 am",
                "10 am",
                "11 am",
                "12 pm",
                "1 pm",
                "2 pm",
                "3 pm",
                "4 pm",
                "5 pm",
                "6 pm",
                "7 pm",
                "8 pm",
                "9 pm",
                "10 pm",
                "11 pm",
                "12 am",
                "1 am",
                "2 am",
                "3 am",
                "4 am",
                "5 am",
                "6 am",
                "7 am",
                "8 am",
              ].map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>

            <span>to</span>

            <select
              className={modelCss.select}
              name="everydayEnd"
              value={weeeklyAvailData.everydayEnd}
              onChange={handleWeeklyChange}>
              <option value="">Select</option>
              {[
                "9 am",
                "10 am",
                "11 am",
                "12 pm",
                "1 pm",
                "2 pm",
                "3 pm",
                "4 pm",
                "5 pm",
                "6 pm",
                "7 pm",
                "8 pm",
                "9 pm",
                "10 pm",
                "11 pm",
                "12 am",
                "1 am",
                "2 am",
                "3 am",
                "4 am",
                "5 am",
                "6 am",
                "7 am",
                "8 am",
              ].map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </div>

          {/* Exclude Weekly Days */}
          <div className={modelCss.row}>
            <label>Exclude Weekly (Day 1)</label>
            <select
              className={modelCss.select}
              name="excludeEvery1"
              value={weeeklyAvailData.excludeEvery1}
              onChange={handleWeeklyChange}>
              <option value="">Select</option>
              {[
                "Saturday",
                "Sunday",
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
              ].map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
          </div>

          <div className={modelCss.row}>
            <label>Exclude Weekly (Day 2)</label>
            <select
              className={modelCss.select}
              name="excludeEvery2"
              value={weeeklyAvailData.excludeEvery2}
              onChange={handleWeeklyChange}>
              <option value="">Select</option>
              {[
                "Saturday",
                "Sunday",
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
              ].map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
          </div>

          {/* Exclude Future Dates */}
          <div className={modelCss.row}>
            <label>Exclude a future date</label>
            <input
              type="date"
              name="excludeFutureDate"
              value={weeeklyAvailData.excludeFutureDate}
              onChange={handleWeeklyChange}
              className={modelCss.input}
            />
          </div>

          <div className={modelCss.row}>
            <label>Exclude future date range</label>
            <div className={modelCss.inline}>
              <input
                type="date"
                name="excludeFutureRangeFrom"
                value={weeeklyAvailData.excludeFutureRangeFrom}
                onChange={handleWeeklyChange}
                className={modelCss.input}
              />
              <span>to</span>
              <input
                type="date"
                name="excludeFutureRangeTo"
                value={weeeklyAvailData.excludeFutureRangeTo}
                onChange={handleWeeklyChange}
                className={modelCss.input}
              />
            </div>
          </div>

          {/* Submit */}
          <div className={modelCss.actions}>
            <button type="submit" className={modelCss.weeklysavebtn}>
              Save Changes
            </button>
          </div>
          <p className={modelCss.message}>{message}</p>
        </form>
      </div>

      <div className={modelCss.sometimes}>
        <div>
          <strong>If you are sometimes available</strong>
          <ul className={availHeaderClass}>
            <li className={modelCss.timeList}>Start</li>
            <li className={modelCss.timeList}>End</li>
            <li className={modelCss.timeList}>Action</li>
          </ul>

          {availArr &&
            availArr.map((avail) => (
              <ul className={modelCss.availList} key={avail.id}>
                <li className={modelCss.timeList}>
                  {getTimefromTS(avail.start)}
                </li>
                <li className={modelCss.timeList}>
                  {getTimefromTS(avail.end)}
                </li>
                <li className={modelCss.timeList}>
                  <button
                    className={modelCss.deleteBtn}
                    onClick={() => removeTime(avail.id, this)}>
                    Delete
                  </button>
                </li>
              </ul>
            ))}
        </div>

        {/* <form onSubmit={handleAvaiability}>
          <div className={modelCss.availBox}>
            <div className={modelCss.timeBox}>
              <label>Start Date</label>
              <DatePicker
                showTimeSelect
                timeFormat="HH:mm"
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                timeClassName={handleColor}
                timeIntervals={60}
                dateFormat="yyyy-MM-dd HH:mm"
              />
            </div>

            <div className={modelCss.timeBox}>
              <label>End Date</label>
              <DatePicker
                showTimeSelect
                timeFormat="HH:mm"
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                timeClassName={handleColor}
                timeIntervals={60}
                dateFormat="yyyy-MM-dd HH:mm"
              />
            </div>

            <div className={modelCss.submitBox}>
              <button type="submit" className={modelCss.save} onClick={addTime}>
                Add
              </button>
              {loading ? <img width="30px" src={loading_url} /> : ""}
            </div>
          </div>
        </form> */}

        <form onSubmit={handleAvaiability}>
          <div className={modelCss.availcard}>
            <h3>If you are sometimes available</h3>

            <div className={modelCss.timerow}>
              <div className={modelCss.timebox}>
                <label>Start Date</label>
                <DatePicker
                  showTimeSelect
                  timeFormat="HH:mm"
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  timeClassName={handleColor}
                  timeIntervals={60}
                  dateFormat="yyyy-MM-dd HH:mm"
                  className="date-input"
                />
              </div>

              <div className={modelCss.timebox}>
                <label>End Date</label>
                <DatePicker
                  showTimeSelect
                  timeFormat="HH:mm"
                  selected={endDate}
                  onChange={(date) => setEndDate(date)}
                  timeClassName={handleColor}
                  timeIntervals={60}
                  dateFormat="yyyy-MM-dd HH:mm"
                  className="date-input"
                />
              </div>
            </div>

            <div className={modelCss.submitrow}>
              <button type="submit" className={modelCss.btn} onClick={addTime}>
                Add
              </button>
              {loading && <img width="30px" src={loading_url} alt="loading" />}
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default withAuth(Availability);

import React, { useState, useEffect } from "react";
import Head from "next/head";
import Layout, { siteTitle } from "../../components/model/layoutCustomer";
import modelStyle from "../../styles/model.module.css";
import withAuth from "../../components/admin/withAuthCustomer";
import axios from "axios";
import OrderSingle from "./orderSingle.js";

const Orders = () => {
  const [orderData, setOrderData] = useState(null);
  const [id, setId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [noOrder, setNoOrder] = useState(false);
  const [status, setStatus] = useState(false);

  // const rowclass = `${modelStyle.row} ${modelStyle.header}`;

  //area, gender, race, height

  const changeOrderStatus = (status) => {
    if (status == "Approved") {
      setStatus("Approved");
      console.log("stats", status);
    } else {
      setStatus("Denied");
      console.log("stats d", status);
    }
  };

  useEffect(() => {
    const customerid = localStorage.getItem("customertoken");
    console.log("cs id", customerid);
    setLoading(true);
    const queryUrl =
      "https://tsm.spagram.com/api/getcustomerorders.php?customerid=" +
      customerid;
    const getData = async () => {
      try {
        const response = await axios.get(queryUrl);
        console.log(" api response", response.data, typeof response.data);
        setOrderData(response.data);
        response.data.length < 1 ? setNoOrder(true) : "";
        setLoading(true);
      } catch (err) {
        console.log(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    // let modid = singleApiUrl.split("=")[1];

    getData();
    //       const availabilityUrl = 'https://tsm.spagram.com/api/availability.php?id=' + singleApiUrl.split("=")[1] + 'date=' + isDateSelected + 'time=' + isTimeSelected;
  }, [status]);

  // if (!orderData || orderData.length === 0) {
  //   return <div>Loading...</div>; // You can display a loading state while data is being fetched
  // }

  return (
    <Layout orders>
      <Head>
        <title>{siteTitle}</title>
      </Head>

      <div className="orderlist">
        <h2> Your Service Request </h2>
        <div className="orders">
          <div className={modelStyle.table}>
            <table className="table">
              <thead>
                <tr>
                  <th> Request Time </th>
                  <th> Address </th>
                  <th> Call Type </th>
                  <th> Service Time </th>
                  <th> Status </th>
                </tr>
              </thead>
              <tbody>
                {orderData &&
                  orderData.map((order, index) => (
                    // <OrderSingle key={index} {...order} changeOrderStatus={changeOrderStatus} />
                    // <OrderSingle changeOrderStatus={changeOrderStatus} key={index} order={order} />
                    <OrderSingle
                      key={index}
                      changeOrderStatus={changeOrderStatus}
                      order={order}
                    />
                  ))}
              </tbody>
            </table>
          </div>
          <strong>
            {" "}
            {noOrder ? "You don't have any pending service request" : ""}{" "}
          </strong>
        </div>
      </div>
    </Layout>
  );
};

export default withAuth(Orders);

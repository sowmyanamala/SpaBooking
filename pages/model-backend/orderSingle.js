import React, { useState } from "react";
import Link from "next/link";
import modelStyle from "../../styles/model.module.css";
import axios from "axios";

function OrderSingle({ changeOrderStatus, order }) {
  // const changestats = (status) => {
  //     const xx = changeOrderStatus(status);
  //     updateOrder(status);

  // }

  const changestats = async (status) => {
    try {
      const orderUpdate = {
        id: order.id,
        order_status: status,
        customer_id: order.customer_id,
      };
      const response = await axios.post(
        "https://tsm.spagram.com/api/update-order.php",
        orderUpdate
      );
      console.log("s response", response.data);
      changeOrderStatus(status);
    } catch (err) {
      console.log(err);
      // setError(err.message);
    } finally {
      // setLoading(false);
    }
  };

  // console.log('sssss', order);
  {
    /* <td> {order.order_status} <br/> {order.order_status == "Initiated"?  <div><button onClick={()=>changestats("Approved")}>Approve</button>  <button onClick={()=>changestats("Denied")}>Deny</button> </div> : ''} </td>  */
  }

  return (
    <tr>
      <td> {order ? order.request_time : ""} </td>
      <td> {order ? order.address : ""} </td>
      <td> {order ? order.call_type : ""} </td>
      <td> {order ? order.service_time : ""} </td>
      <td> {order ? order.status : ""} </td>
    </tr>
  );
}

export default OrderSingle;

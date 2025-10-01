import React, { useEffect } from "react";
import Router from "next/router";

const withAuth = (WrappedComponent) => {
  const HOC = (props) => {
    useEffect(() => {
      const adminToken = localStorage.getItem("token");
      if (!adminToken) {
        Router.push("/admin/login");
      }
    }, []);

    return <WrappedComponent {...props} />;
  };

  return HOC;
};

export default withAuth;

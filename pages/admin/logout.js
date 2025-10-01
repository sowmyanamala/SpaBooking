import React, { useEffect } from "react";

const Logout = () => {
  useEffect(() => {
    localStorage.removeItem("token");
    // redirect to login page
    window.location.href = "/admin/login";
  }, []);

  return <div>Logging out...</div>;
};

export default Logout;



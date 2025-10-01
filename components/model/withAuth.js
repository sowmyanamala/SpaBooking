import React, { useEffect, useState } from "react";
import Router from "next/router";

const withAuth = (WrappedComponent) => {
  const HOC = (props) => {
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
      const checkAuth = () => {
        // Check if we're on the homepage (where the modal will appear)
        if (typeof window !== "undefined" && window.location.pathname === "/") {
          console.log(
            "On homepage, skipping auth check - modal will handle login"
          );
          setIsChecking(false);
          return;
        }

        const token = localStorage.getItem("token");
        console.log(
          "withAuth checking token:",
          token,
          "pathname:",
          window.location.pathname
        );
        console.log("Token type:", typeof token, "Length:", token?.length);

        if (
          !token ||
          token === "undefined" ||
          token === "null" ||
          token.trim() === ""
        ) {
          console.log(
            "No valid token, clearing localStorage and redirecting to homepage for modal login"
          );
          // Clear invalid tokens
          localStorage.removeItem("token");
          localStorage.removeItem("modelId");
          localStorage.removeItem("modelName");
          Router.push("/?auth_redirect=model");
        } else {
          console.log("Valid token found:", token, "allowing access");
          setIsChecking(false);
        }
      };

      // Add a small delay to ensure localStorage is available
      setTimeout(checkAuth, 100);
    }, []);

    // Show loading or nothing while checking
    if (isChecking) {
      return <div>Loading...</div>;
    }

    return <WrappedComponent {...props} />;
  };

  return HOC;
};

export default withAuth;

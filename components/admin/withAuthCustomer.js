import React, { useEffect, useState } from "react";
import Router from "next/router";

const withAuthCustomer = (WrappedComponent) => {
  const AuthenticatedComponent = (props) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      // Ensure we're on the client-side before accessing localStorage
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("customertoken");
        if (!token) {
          // Redirect to login if no token
          Router.push("/customer-backend/login");
        } else {
          setIsAuthenticated(true);
        }
      }
      setIsLoading(false); // Mark loading as complete
    }, []);

    // Show loading state while checking authentication
    if (isLoading) {
      return <div>Loading...</div>; // Replace with a proper loading component if available
    }

    // Only render the wrapped component if authenticated
    return isAuthenticated ? <WrappedComponent {...props} /> : null;
  };

  return AuthenticatedComponent;
};

export default withAuthCustomer;

import React, { useState } from "react";
import axios from "axios";
import Router from "next/router";
import { CURRENT_URL } from "../../components/config";
import loginCss from "../../components/admin/login.module.css";

const Login = (location) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "https://tsm.spagram.com/api/admin-backend/login.php",
        { email, password }
      );
      console.log(response.data.ok);
      if (!response.data.ok) {
        throw new Error("Login failed");
      }

      const { token } = response.data;
      localStorage.setItem("token", token);
      let admin_url = CURRENT_URL + "admin";
      Router.push(admin_url);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form className={loginCss.form} onSubmit={handleSubmit}>
      <input
        className={loginCss.input}
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className={loginCss.input}
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button className={loginCss.button} type="submit">
        Login
      </button>
    </form>
  );
};

export default Login;





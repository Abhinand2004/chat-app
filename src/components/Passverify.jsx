import React, { useState } from "react";
import axios from "axios";
import "./Passverify.scss";
import url from "../assets/url";
const PassVerify = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleVerify = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${url}/verifypass`, {
        email,
      });
      if (response.status==200) {
      setMessage(response.data.msg || `Verification email sent to ${email}`);
        localStorage.setItem("email",email)
      }
    } catch (error) {
      setMessage(error.response?.data?.msg || "An error occurred. Please try again.");
    }
  };

  return (
    <div className="passverify-container">
      <div className="passverify-box">
        <h2 className="passverify-title">Verify Your Email</h2>
        <form onSubmit={handleVerify} className="passverify-form">
          <label htmlFor="email" className="form-label">
            Email:
          </label>
          <input
            type="email"
            id="email"
            className="form-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" className="verify-button">
            Verify
          </button>
        </form>
        {message && <p className="message">{message}</p>}
        <div className="links">
          <a href="/login" className="link">
            Login
          </a>
          <a href="/register" className="link">
            Register
          </a>
        </div>
      </div>
    </div>
  );
};

export default PassVerify;

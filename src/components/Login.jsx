import React, { useState } from "react";
import axios from "axios";
import { TextField, Button } from "@mui/material";
import "./Login.scss";
import logo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";
import url from "../assets/url";
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${url}/login`, {
        email,
        pass: password,
      });
      if (res.status === 200) {
        localStorage.setItem("token", res.data.token);
        navigate("/");
        window.location.reload();
      } else {
        setError("Incorrect username or password");
      }
    } catch (err) {
      setError("Username or password is incorrect");
    }
  };

  const handleGoogleResponse = async (response) => {
    if (response.credential) {
      try {
        const res = await axios.post(`${url}/auth/google`, {
          token: response.credential, 
        });
  
        if (res.status === 200) {
          localStorage.setItem("token", res.data.authToken);
          navigate("/");
          window.location.reload();
        }
      } catch (error) {
        setError("Google login failed. Please try again.");
      }
    }
  };
  

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="logo-section">
          <img src={logo} alt="Logo" className="logo" />
        </div>
        <form className="login-form" onSubmit={handleSubmit}>
          <h2 className="login-title">Welcome Back</h2>
          {error && <p className="error-message">{error}</p>}
          <TextField
            label="Email"
            variant="standard"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <TextField
            label="Password"
            type="password"
            variant="standard"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            className="login-button"
          >
            Login
          </Button>
          <div className="links">
            <a href="/pverify" className="link">Forgot Password?</a>
            <a href="/verify" className="link">Register</a>
          </div>
        </form>

        <div className="google-login">
          <GoogleLogin
            onSuccess={handleGoogleResponse}
            onError={() => setError("Google login failed. Please try again.")}
          />
        </div>
      </div>
    </div>
  );
};

export default Login;
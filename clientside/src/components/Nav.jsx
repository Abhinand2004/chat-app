import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Nav.css";
import logo from "../assets/logo.png";
import url from "../assets/url";
const Navbar = ({ setSearch }) => {
  const navigate = useNavigate();
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [profileImage, setProfileImage] = useState(""); 
  const [username, setUsername] = useState(""); 

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const logout = () => {
    setDropdownVisible(false); 
    localStorage.removeItem("token");
    navigate("/login");
    window.location.reload()
  };

  const fetchProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found");
      return;
    }

    try {
      const response = await axios.get(`${url}/navdata`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (response.status === 200) {
        console.log(response.data);

        setProfileImage(response.data.data.image);
        setUsername(response.data.data.username);
      } else {
        navigate("/login");
        console.error("Failed to fetch user data");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      // navigate("/login");
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const profilego = () => {
    setDropdownVisible(false); 
    navigate("/profile");
  };

  const handleSearchChange = (e) => {
    // console.log(e.target.value);
    
    setSearch(e.target.value);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <Link to={"/"}>
            <img src={logo} alt="Logo" className="logo-image" />
          </Link>
        </div>

        <div className="navbar-search">
          <input
            type="text"
            className="search-input"
            placeholder="Search..."
            onChange={handleSearchChange}
          />
        </div>

        <div className="navbar-profile">
          <div className="username">{username}</div>
          <img
            src={profileImage || "/default-profile.jpg"} 
            alt={username || "Profile"} 
            className="profile-image"
            onClick={toggleDropdown} 
          />
          {dropdownVisible && (
            <div className="dropdown-menu">
              <div className="dropdown-item" onClick={profilego}>
                Profile
              </div>
              <div className="dropdown-item" onClick={logout}>
                Logout
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

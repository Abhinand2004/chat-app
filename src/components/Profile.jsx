import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { FaEdit, FaSave } from "react-icons/fa";
import Navbar from "./Nav";
import "./Profile.scss";
import logo from "../assets/logo.png";
import url from "../assets/url";
const Profile = () => {
    const [userData, setUserData] = useState({ image: "", username: "", about: "", email: "", phone: "" });
    const [isEditing, setIsEditing] = useState(false);
    const fileInputRef = useRef(null);

    const fetchUserData = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`${url}/navdata`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.status === 200) {
                setUserData(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
    };

    useEffect(() => {
        fetchUserData();
    }, []);

    const handleEditClick = async () => {
        if (isEditing) {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.put(
                    `${url}/editprofile`,
                    { ...userData },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                if (res.status === 200) {
                    alert("Profile updated successfully!");
                    fetchUserData();
                } else {
                    console.log("Failed");
                }
            } catch (error) {
                alert("Failed to update profile. Please try again.");
            }
        }
        setIsEditing(!isEditing);
    };

    const handleFieldChange = (field, value) => {
        setUserData({ ...userData, [field]: value });
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setUserData((prevData) => ({
                    ...prevData,
                    image: reader.result,
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const triggerFileInput = () => {
        if (isEditing) {
            fileInputRef.current.click();
        }
    };

    return (
        <div className="profile-container">
            <div className="left-panel">
                <div className="profile-card">
                    <div className="profile-image">
                        <img
                            src={userData.image || "https://via.placeholder.com/150"}
                            alt="Profile"
                            onClick={triggerFileInput}
                            style={{ cursor: isEditing ? "pointer" : "default" }}
                        />
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            ref={fileInputRef}
                            style={{ display: "none" }}
                        />
                    </div>
                    <div className="profile-details">
                        <button className="edit-button" onClick={handleEditClick}>
                            {isEditing ? <FaSave /> : <FaEdit />}
                        </button>
                        <div className="profile-field">
                            <label>Username:</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={userData.username}
                                    onChange={(e) => handleFieldChange("username", e.target.value)}
                                    className="editable-field"
                                />
                            ) : (
                                <span>{userData.username}</span>
                            )}
                        </div>
                        <div className="profile-field">
                            <label>About:</label>
                            {isEditing ? (
                                <textarea
                                    value={userData.about}
                                    onChange={(e) => handleFieldChange("about", e.target.value)}
                                    className="editable-field"
                                />
                            ) : (
                                <span>{userData.about}</span>
                            )}
                        </div>
                        <div className="profile-field">
                            <label>Email:</label>
                            {isEditing ? (
                                <input
                                    type="email"
                                    value={userData.email}
                                    onChange={(e) => handleFieldChange("email", e.target.value)}
                                    className="editable-field"
                                />
                            ) : (
                                <span>{userData.email}</span>
                            )}
                        </div>
                        <div className="profile-field">
                            <label>Phone:</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={userData.phone}
                                    onChange={(e) => handleFieldChange("phone", e.target.value)}
                                    className="editable-field"
                                />
                            ) : (
                                <span>{userData.phone}</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="right-panel">
                <div className="right-card">
                    <img src={logo} alt="Company Logo" className="company-logo" />
                    <h1 className="company-name">Msg-Mate</h1>
                    <p className="company-description">
                    No Messages Yet, Start Chatting!
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Profile;
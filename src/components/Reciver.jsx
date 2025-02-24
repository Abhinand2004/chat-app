import React, { useEffect, useState } from "react";
import Navbar from "./Nav";
import "./Profile.scss"; 
import { useParams } from "react-router-dom";
import logo from "../assets/logo.png";
import url from "../assets/url";
const Receiver = () => {
    const [receiverData, setReceiverData] = useState({ image: "", username: "", about: "", email: "", phone: "" });
    const { id } = useParams();

    const fetchReceiverData = async () => {
        try {
            const response = await fetch(`${url}/reciver/${id}`);
            if (response.ok) {
                const data = await response.json();
                setReceiverData(data);
            } else {
                console.error("Failed to fetch receiver data");
            }
        } catch (error) {
            console.error("Error fetching receiver data:", error);
        }
    };

    useEffect(() => {
        fetchReceiverData();
    }, [id]);

    return (
        <div className="profile-container">
            <div className="left-panel">
                <div className="profile-card">
                    <div className="profile-image">
                        <img
                            src={receiverData.image || "https://via.placeholder.com/150"}
                            alt="Profile"
                        />
                    </div>
                    <div className="profile-details">
                        <div className="profile-field">
                            <label>Username:</label>
                            <span>{receiverData.username || "N/A"}</span>
                        </div>
                        <div className="profile-field">
                            <label>About:</label>
                            <span>{receiverData.about || "N/A"}</span>
                        </div>
                        <div className="profile-field">
                            <label>Email:</label>
                            <span>{receiverData.email || "N/A"}</span>
                        </div>
                        <div className="profile-field">
                            <label>Phone:</label>
                            <span>{receiverData.phone || "N/A"}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="right-panel">
                           <div className="right-card">
                               <img src={logo} alt="Company Logo" className="company-logo" />
                               <h1 className="company-name">Msg-Mate</h1>
                               <p className="company-description">
                               Discover New Profiles.
                               </p>
                           </div>
                       </div>
        </div>
    );
};

export default Receiver;

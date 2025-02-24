import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Contacts.css"; // Import the CSS file
import ChatBox from "./ChatBox"; // Import ChatBox component
import { FaRegComments } from "react-icons/fa";
import logo from "../assets/logo.png";
import url from "../assets/url";

const Contact = ({ search }) => {
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null); // State to track the selected contact
  const [screenWidth, setScreenWidth] = useState(window.innerWidth); // Track the screen width for responsive layout
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await axios.get(`${url}/showcontacts`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setContacts(response.data.contacts);
      } catch (error) {
        console.error("Error fetching contacts:", error);
      }
    };

    fetchContacts(); 
  }, []); 

  // Ensure serch is always a string and handle undefined search terms
  const searchValue = search ? search.toLowerCase() : "";

  const filteredContacts = contacts.filter((contact) => {
    const username = contact.username || ""; 
    const about = contact.about || ""; 

    return (
      username.toLowerCase().includes(searchValue) ||
      about.toLowerCase().includes(searchValue)
    );
  });

  const handleContactClick = (contact) => {
    if (screenWidth < 760) {
      navigate(`/chat/${contact._id}`);
    } else {
      setSelectedContact(contact._id); 
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="container">
      <div className="left-panel">
        <div className="contact-list">
          {filteredContacts.length > 0 ? (
            filteredContacts.map((contact) => (
              <div
                className="contact-item"
                key={contact._id}
                onClick={() => handleContactClick(contact)} 
              >
                <img src={contact.image} alt="Profile" className="contact-image" />
                <div className="contact-details">
                  <span className="contact-username">{contact.username}</span>
                  <span className="contact-about">{contact.about}</span>
                </div>
              </div>
            ))
          ) : (
            <p>No contacts found</p>
          )}
        </div>
      </div>

      {screenWidth > 760 && (
        <div className="right-panel">
          {selectedContact ? (
            <ChatBox chatId={selectedContact} />
          ) : (
            <div className="welcome-container">
              <img src={logo} alt="Company Logo" className="company-logo" />
              <h1 className="company-name">Msg-Mate</h1>
              <p className="company-description">Start chatting with your contacts now.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Contact;

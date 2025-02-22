import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import "./ChatList.css";
import { FaRegComments } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import ChatBox from "./ChatBox";
import logo from "../assets/logo.png";
import io from "socket.io-client"; 
import url from "../assets/url";

const ChatList = ({ search }) => {
  console.log(search);
  
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const navigate = useNavigate();
  const socket = useRef(null); 
  const token = localStorage.getItem("token");

  useEffect(() => {
    socket.current = io("http://localhost:3000", { transports: ["websocket"] });
    socket.current.on("updatechatlist", () => {
      fetchChats(); 
    });

    if (token) {
      fetchProfile();
      fetchChats();
    } else {
      navigate("/login");
    }

    return () => {
      socket.current.disconnect();
    };
  }, [token]);

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchChats = async () => {
    try {
      const response = await axios.get(`${url}/showchatlist`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const sortedChats = response.data.sort((a, b) => new Date(b.time) - new Date(a.time));
      const formattedChats = sortedChats.map((chat) => ({
        ...chat,
        time: new Date(chat.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }));
      
      setChats(formattedChats);
    } catch (error) {
      console.error("Error fetching chat list:", error);
    }
  };

  const fetchProfile = async () => {
    if (!token) {
      console.error("No token found");
      return;
    }

    try {
      const response = await axios.get(`${url}/navdata`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 200) {
        // Profile fetched successfully.
      } else {
        // alert("Token expired, login again");
        navigate("/login");
      }
    } catch (error) {
      // alert("Token expired, login again");
      navigate("/login");
    }
  };

  const handleChatClick = (id) => {
    if (screenWidth <= 760) {
      navigate(`/chat/${id}`);
    } else {
      setSelectedChat(id);
    }
  };

  const contacts = () => {
    navigate("/contact");
  };

  const truncateMessage = (message, maxLength = 30) => {
    if (!message) return "";
    return message.length > maxLength ? `${message.slice(0, maxLength)}...` : message;
  };

  return (
    <div className="container">
      <div className="left-panel">
        <ul className="chat-list">
          {chats.length === 0 ? (
            <p>Start your first conversation<br />and stay connected.</p>
          ) : (
            chats
              .filter((chat) => {
                const searchValue = search?.toLowerCase() || "";
                return chat.username?.toLowerCase().includes(searchValue);
              })
              .map((chat) => (
                <li
                  className="chat-item"
                  key={chat.chatId}
                  onClick={() => handleChatClick(chat.otherUserId)}
                >
                  <img src={chat.image} alt={chat.username} className="chat-user-image" />
                  <div className="chat-user-details">
                    <span className="chat-user-name">{truncateMessage(chat.username, 15)}</span>
                    <span className="chat-last-message">{truncateMessage(chat.lastmsg, 20)}</span>

                    {chat.lastSender !== chat.my_id && chat.count > 0 && (
                      <span className="chat-count">{chat.count}</span>
                    )}

                    <span className="chat-time">{chat.time}</span>
                  </div>
                </li>
              ))
          )}
        </ul>
        <button className="chat-message-button1" onClick={contacts}>
          <FaRegComments />
        </button>
      </div>

      {screenWidth > 760 && (
        <div className="right-panel">
          {selectedChat ? (
            <ChatBox chatId={selectedChat} />
          ):(
            <div className="welcome-container">
              <img src={logo} alt="Company Logo" className="company-logo" />
              <h1 className="company-name">Msg-Mate</h1>
              <p className="company-description">Stay connected with the people who matter most.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatList;
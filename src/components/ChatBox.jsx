import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import { FaPaperPlane, FaEllipsisV, FaArrowDown } from "react-icons/fa";
import io from "socket.io-client";
import Picker from "emoji-picker-react"; 
import "./ChatBox.css";
import url from "../assets/url";
import Receiver from "./Reciver";

const ChatBox = ({ chatId }) => {
    const { id } = useParams();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [user, setUser] = useState({});
    const [my_id, setMyId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const messagesEndRef = useRef(null);
    const socket = useRef(null);
    const [isOnline, setIsOnline] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false); 

    const fetchId = id || chatId;

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 50);
    };

    const fetchMessages = async () => {
        // console.log(fetchId);
        
        try {
            const response = await axios.get(`${url}/displaymsg/${fetchId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            if (response.status === 200) {
                setMessages(response.data.messages);
                setLoading(false);
                updatecount();
            } else if (response.status === 404) {
                setLoading(false);
            } else {
                alert("Failed to fetch messages.");
            }
        } catch (error) {
            setLoading(false);
            setMessages("")
        }
    };

    const fetchUserDetails = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("No token found");
            return;
        }

        try {
            const response = await axios.get(
                `${url}/user/${fetchId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.status === 200) {
                setUser(response.data.user);
                setMyId(response.data.my_id);
                if (socket.current) {
                    socket.current.emit('join-room', response.data.user._id);
                }
                scrollToBottom();
            } else {
                console.error("Failed to fetch user details", response.status);
            }
        } catch (error) {
            console.error("Error fetching user details:");
        }
    };

    const initializeChatList = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                console.error("No token found");
                return;
            }
            const response = await axios.post(
                `${url}/createchatlist/${fetchId}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.status === 200) {
                socket.current.emit("chat message", response.data.message);
                // console.log("Chat list initialized successfully.");
            }
        } catch (error) {
            if (error.response && error.response.status === 400) {
                console.log("Chat list already exists.");
            } else {
                console.error("Error initializing chat list:", error);
            }
        }
    };

    const sendMessage = async (messageContent) => {
        if (messageContent.trim() === "" || my_id === null) return;

        const message = {
            receiver_id: fetchId,
            sender_id: my_id,
            message: messageContent,
            time: new Date().toISOString(),
            seen: false,
        };

        try {
            if (messages.length === 0) {
                await initializeChatList();
            }

            await axios.post(
                `${url}/sendmsg/${fetchId}`,
                { message: messageContent },
                { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
            );
            updatecount();
            updatelastmessage();
            setMessages((prevMessages) => [...prevMessages, message]);
            setNewMessage("");
            setShowEmojiPicker(false);
            scrollToBottom();

            socket.current.emit("chat message", message);
        } catch (error) {
            console.error("Failed to send message:", error);
        }
    };

    const handleSend = () => {
        sendMessage(newMessage);
        updatecount();
        updatelastmessage();
        scrollToBottom();
    };

    const updatelastmessage = async () => {
        try {
            const res = await axios.put(`${url}/setlastmsg/${fetchId}`, {}, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }    );
          
        } catch (error) {
            console.error("Error updating unseen message count:", error);
        }
    };

    const updatecount = async () => {
        try {
            await axios.put( `${url}/setcount/${fetchId}`, {},  { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } } );
        } catch (error) {
            console.error("Error updating unseen message count:", error);
        }
    };

    const handleChange = (e) => {
        setNewMessage(e.target.value);
    };

    const handleEmojiClick = (emoji) => {
        setNewMessage((prevMessage) => prevMessage + emoji.emoji);
    };

    const markMessagesAsSeen = async () => {
        try {
            await axios.put(  `${url}/setseen/${fetchId}`, {},   { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } } );
            socket.current.emit("mark-seen", { userId: fetchId });                        
        } catch (error) {
            setError("Error marking messages as seen.");
            console.error("Error marking messages as seen:", error);
        }
    };

    const formatTime = (timestamp) => {
        const messageTime = new Date(timestamp);
        const hours = messageTime.getHours();
        const minutes = messageTime.getMinutes();
        const isAM = hours < 12;
        return `${hours % 12 || 12}:${minutes < 10 ? "0" : ""}${minutes} ${isAM ? "AM" : "PM"}`;
    };

    useEffect(() => {
        socket.current = io("http://localhost:3000", { transports: ["websocket"] });
        scrollToBottom();
        socket.current.on("connect", () => {
            if (my_id) {
                socket.current.emit("user-online", my_id);
            }
        });

        socket.current.on("chat message", (msg) => {
            if (msg.sender_id !== my_id) {
                setMessages((prevMessages) => [...prevMessages, msg]);
                scrollToBottom();
            }
        });

        socket.current.on("refresh-messages", () => {
            fetchMessages();
        });

        socket.current.on("update-online-status", (onlineUsers) => {
            setIsOnline(onlineUsers.includes(fetchId));
        });

        socket.current.on("disconnect", () => {
            if (my_id) {
                socket.current.emit("user-offline", my_id);
            }
        });

        fetchMessages();
        fetchUserDetails();

        return () => {
            if (my_id) {
                socket.current.emit("user-offline", my_id);
            }
            socket.current.disconnect();
        };
    }, [fetchId, my_id]);

    useEffect(() => {
        markMessagesAsSeen();
    }, [messages]);

    useEffect(() => {
         fetchUserDetails();
        scrollToBottom();
    }, [fetchId]);

    useEffect(() => {
        fetchMessages();
    }, [fetchId]);

    const godown = () => {
        scrollToBottom();
    };

    return (
        <div className="chat-box-fullscreen">
            <Link to={`/receiver/${user._id}`}>
                <div className="chat-header">
                    <div className="chat-user-info">
                        <img src={user.image} alt={user.username} className="chat-user-photo" />
                        <span className="chat-username">{user.username}</span>
                        {isOnline && <span className="online-indicator">💚</span>}
                    </div>
                    <FaEllipsisV className="dropdown-icon" />
                </div>
            </Link>

            <div className="messages-list">
                {loading ? (
                    <p>Loading...</p>
                ) : messages.length === 0 ? (
                    <p>No messages yet</p>
                ) : (
                    messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`message ${msg.sender_id === my_id ? "sent" : "received"}`}
                        >
                            <p>{msg.message}</p>
                            <div className="message-footer">
                                <small>{formatTime(msg.time)}</small>
                                {msg.sender_id === my_id && (
                                    <div className="tick-marks">
                                        <span className="tick">
                                            {msg.seen ? (
                                                <span className="seen-tick">✔</span>
                                            ) : (
                                                <span className="sent-tick">✔✔</span>
                                            )}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />

                <FaArrowDown size={24} color="green" className="arrow" onClick={godown} />
            </div>

            <div className="message-box">
                <div className="message-input-container">
                    <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="emoji-btn">
                        😊
                    </button>
                    <input
                        type="text"
                        value={newMessage}
                        onChange={handleChange}
                        placeholder="Type a message..."
                        className="message-input"
                    />
                    <button onClick={handleSend} className="send-btn">
                        <FaPaperPlane />
                    </button>
                </div>
                {showEmojiPicker && (
                    <div className="emoji-picker emoji-picker-container">
                        <Picker onEmojiClick={handleEmojiClick} width={"100%"}/>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatBox;
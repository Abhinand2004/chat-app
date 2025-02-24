import express from "express";
import connection from "./connection.js";
import dotenv from "dotenv";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import passport from "passport";
import authRoutes from "./Authentication/Auth.js"; 
import Router from "./router.js"; 

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:5173", "https://chat-app-puce-six.vercel.app"],
    methods: ["GET", "POST"],
    credentials: true,
  }
});

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json({ limit: "50mb" }));
app.use(passport.initialize()); 

app.use("/api", Router); 

// Store online users
const onlineUsers = new Map(); // userId -> socketId mapping

io.on("connection", (socket) => {
  // console.log("A user connected:", socket.id);

  // When a user joins, store their ID
  socket.on("user-online", (userId) => {
    onlineUsers.set(userId, socket.id);
    io.emit("update-online-status", Array.from(onlineUsers.keys())); // Send online users list
    // console.log(`User ${userId} is online`);
    socket.join(userId); // Join the user to a room with their userId
  });

  // When a user goes offline
  socket.on("user-offline", (userId) => {
    onlineUsers.delete(userId);
    io.emit("update-online-status", Array.from(onlineUsers.keys())); // Notify all clients
    // console.log(`User ${userId} is offline`);
  });

  // Handling chat messages
  socket.on("chat message", (msg) => {
    io.emit("chat message", msg);
    io.emit("updatechatlist", msg);
    io.emit("createnotification", msg);
  });

  // Handling marking messages as seen
  socket.on("mark-seen", (data) => {
    const { userId } = data;
    io.to(userId).emit("refresh-messages"); // Notify the other user to refresh their messages
  });

  // Handling user disconnect
  socket.on("disconnect", () => {
    let userId = [...onlineUsers.entries()].find(([_, id]) => id === socket.id)?.[0];
    if (userId) {
      onlineUsers.delete(userId);
      io.emit("update-online-status", Array.from(onlineUsers.keys())); // Notify all users
      // console.log(`User ${userId} disconnected`);
    }
  });
});

connection()
  .then(() => {
    httpServer.listen(process.env.PORT || 3000, () => {
      console.log(`Server started at http://localhost:${process.env.PORT || 3000}`);
    });
  })
  .catch((error) => {
    console.error("Database connection failed:", error);
  });
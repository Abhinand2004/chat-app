import express from 'express';
import userSchema from "./models/User.js";
import bcrypt from 'bcrypt';
import pkg from 'jsonwebtoken';
const { sign } = pkg;
import nodemailer from 'nodemailer'; 
import ChatBox from "./models/ChatBox.js";
import chatListSchema from './models/ChatList.js';  
const app = express();
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
const client = new OAuth2Client("105958806746-rioiiafbpp4uo7a0vtjomi239j9pb9kk.apps.googleusercontent.com");



 
export async function register(req, res) {
    // console.log(req.body);
    const { username, phone, pwd, cpwd,image,email} = req.body
    const user = await userSchema.findOne({ email })
    if (!user) {
        if (!(username && email && pwd && cpwd))
            return res.status(500).send({ msg: "fields are empty" })
        if (pwd != cpwd)
            return res.status(500).send({ msg: "pass not match" })
        bcrypt.hash(pwd, 10).then((hpwd) => {
            userSchema.create({ username, email,phone, pass: hpwd ,image,about:null})
            res.status(200).send({ msg: "Successfull" })
        }).catch((error) => {
            console.log(error);
        })
      
        
    } else {
        res.status(500).send({ msg: "email already used " })
    }
}


const transporter = nodemailer.createTransport({
    service: "gmail",
    // host: "sandbox.smtp.mailtrap.io",
    // port: 2525,
    // secure: false, // true for port 465, false for other ports
    auth: {
        user: "abhinandc293@gmail.com",
        pass: "xfrk uoxu ipfs lhjj",
    },
});

export async function verifyEmail(req, res) {
    const { email } = req.body;

    if (!email) {
        return res.status(500).send({ msg: "Fields are empty" });
    }

    try {
        const user = await userSchema.findOne({ email });

        if (!user) {
            const info = await transporter.sendMail({
                from: 'no-reply@msgmate.com', 
                to: email, 
                subject: "Welcome to Msg-Mate! Confirm Your Account", 
                text: "Please confirm your account", 
                html: `
                    <div style="font-family: Arial, sans-serif; text-align: center; background-color: #f9f9f9; padding: 40px;">
                        <div style="background-color: #fff; border-radius: 8px; padding: 30px; max-width: 500px; margin: auto; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);">
                            <h1 style="color: #4caf50;">Welcome to Msg-Mate!</h1>
                            <p style="font-size: 16px; color: #333;">Hello,</p>
                            <p style="font-size: 16px; color: #555;">Thank you for signing up with Msg-Mate. Please confirm your email address to activate your account:</p>
                            <a href="http://localhost:5173/register" 
                               style="display: inline-block; padding: 12px 25px; color: #fff; background-color: #4caf50; text-decoration: none; font-size: 16px; border-radius: 5px; margin-top: 20px;">
                               Confirm Account
                            </a>
                            <p style="font-size: 14px; color: #888; margin-top: 20px;">If you did not create this account, please ignore this email.</p>
                            <p style="font-size: 14px; color: #888; margin-top: 10px;">Need help? Contact us at support@msgmate.com.</p>
                        </div>
                    </div>
                `,
            });
            console.log("Message sent: %s", info.messageId);
            res.status(200).send({ msg: "Confirmation email sent" });
        } else {
            return res.status(500).send({ msg: "Email already exists" });
        }
    } catch (error) {
        console.error("Error sending email:", error);
        res.status(500).send({ msg: "Error sending email" });
    }
}



export async function login(req, res) {
    // console.log(req.body);
    const { email, pass } = req.body
    if (!(email && pass))
        return res.status(500).send({ msg: "fields are empty" })
    const user = await userSchema.findOne({ email })
    if (!user)
        return res.status(500).send({ msg: "email donot exist" })
    const success = await bcrypt.compare(pass, user.pass)
    // console.log(success);
    if (success !== true)
        return res.status(500).send({ msg: "email or password not exist" })
    const token = await sign({ UserID: user._id }, process.env.JWT_KEY, { expiresIn: "24h" })
    // const token=await sign({userid:user._id},process.env.jwt,{expiresIn:"24h"})
    // console.log(token);
    res.status(200).send({ token })
}



export async function verifyforpasschange(req, res) {
    const { email } = req.body;
    // console.log(email);
    
    if (!email) {
        return res.status(500).send({ msg: "Fields are empty" });
    }

    try {
        const user = await userSchema.findOne({ email });

        if (user) {
            const info = await transporter.sendMail({
                from: 'support@msgmate.com', 
                to: email, 
                subject: "Password Change Request - MsgMate", 
                text: "Reset Your Password", 
                html: `
                    <div style="font-family: Arial, sans-serif; text-align: center; background-color: #f4f4f4; padding: 40px;">
                        <div style="background-color: #fff; border-radius: 8px; padding: 30px; max-width: 500px; margin: auto; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);">
                            <h1 style="color: #1d55cd;">MsgMate Password Reset</h1>
                            <p style="font-size: 16px; color: #555;">Hello ${user.username},</p>
                            <p style="font-size: 16px; color: #555;">
                                We received a request to reset your password for your MsgMate account. Please click the button below to proceed with changing your password:
                            </p>
                            <a href="http://localhost:5173/passchange" 
                               style="display: inline-block; padding: 12px 25px; color: #fff; background-color: #1d55cd; text-decoration: none; font-size: 16px; border-radius: 5px; margin-top: 20px;">
                               Reset Password
                            </a>
                            <p style="font-size: 14px; color: #888; margin-top: 20px;">
                                If you did not request this change, please ignore this email or contact support.
                            </p>
                        </div>
                    </div>
                `,
            });
            console.log("Message sent: %s", info.messageId);
            res.status(200).send({ msg: "Password reset email sent" });
        } else {
            return res.status(500).send({ msg: "Email doesn't exist" });
        }
    } catch (error) {
        res.status(500).send({ msg: "Error sending email" });
    }
}



export async function passchange(req, res) {
    const { email, pwd, cpwd } = req.body; 
    if (!email || !pwd || !cpwd) {
        return res.status(400).send({ msg: "Email and both passwords are required" });
    }
    if (pwd !== cpwd) {
        return res.status(400).send({ msg: "Passwords do not match" });
    }

    try {
        const user = await userSchema.findOne({ email });
        if (!user) {
            return res.status(404).send({ msg: "User not found" });
        }
        const hashedPassword = await bcrypt.hash(pwd, 10);
        const result = await userSchema.updateOne(
            { email: email },
            { $set: { pass: hashedPassword } }
        );
        if (result.modifiedCount === 0) {
            return res.status(500).send({ msg: "Password update failed" });
        }
        res.status(200).send({ msg: "Password updated successfully" });
    } catch (error) {
        res.status(500).send({ msg: "Something went wrong" });
    }
}


export async function showContacts(req, res) {
    try {
        const userId = req.user.UserID; // Get the authenticated user's ID

        // Fetch all contacts, but exclude the authenticated user's own data
        const contacts = await userSchema.find({ _id: { $ne: userId } });

        return res.status(200).send({ contacts });
    } catch (error) {
        return res.status(500).send({ error: "An error occurred while fetching contacts." });
    }
}

import { encryptMessage } from "./Authentication/encryption.js";

export async function message(req, res) {
    try {
        const { message } = req.body;
        const sender_id = req.user?.UserID;
        const { id } = req.params;
        const time = new Date().toISOString();

        if (!message || !sender_id || !id) {
            return res.status(400).send({ msg: "Missing required fields" });
        }

        // 🔒 Encrypt the message before saving
        const encryptedMessage = encryptMessage(message);

        const data = await ChatBox.create({ 
            message: encryptedMessage, 
            sender_id, 
            receiver_id: id, 
            time 
        });

        if (data) {
            return res.status(200).send({ msg: "Success" });
        } else {
            return res.status(500).send({ msg: "Failed to create message" });
        }
    } catch (error) {
        return res.status(500).send({ msg: "Internal Server Error" });
    }
}



import { decryptMessage } from "./Authentication/encryption.js";

export async function displaymessage(req, res) {
    try {
        const sender_id = req.user.UserID;
        const { id } = req.params;

        const messages = await ChatBox.find({
            $or: [
                { sender_id, receiver_id: id },
                { sender_id: id, receiver_id: sender_id }
            ]
        }).sort({ time: 1 });

        if (!messages || messages.length === 0) {
            return res.status(404).send({ msg: "No messages found" });
        }

        const decryptedMessages = messages.map(msg => ({
            ...msg._doc, 
            message: decryptMessage(msg.message)
        }));

        return res.status(200).send({ messages: decryptedMessages });
    } catch (error) {
        console.error("Error fetching messages:", error);
        return res.status(500).send({ msg: "Failed to fetch messages", error });
    }
}




export async function showuser(req, res) {
    const { id } = req.params;
    // console.log(req.user.UserID);

    try {
        const user = await userSchema.findById(id);

        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }

        res.status(200).send({ user, my_id: req.user.UserID });

    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Server error' });
    }
}


export async function navdata (req, res){
    // console.log(req.user.UserID);
    
    const data = await userSchema.findById(req.user.UserID);

if (data) {
    return res.status(200).send({
       data
      });
      
    
}else{
    return res.status(500).send({msg:"error"})
}
  
};

export async function editprofile(req, res) {
    try {
      const { ...data } = req.body; 
      
      const update = await userSchema.updateOne(
        { _id: req.user.UserID }, 
        { $set: data } 
      );
  
      if (!update) {
        return res.status(400).send({ msg: 'No fields were updated.' });
      }
  
      res.status(200).send({ msg: 'Profile updated successfully!' });
  
    } catch (error) {
      res.status(500).send({ msg: 'An error occurred while updating the profile.' });
    }
  }

  export async function reciverdetails(req, res) {
    const { id } = req.params;

    try {
        const data = await userSchema.findById(id); 
        if (!data) {
            return res.status(404).send({ message: "User not found" }); 
        }
        return res.status(200).send(data);
    } catch (error) {
        return res.status(500).send({ message: "Internal Server Error" });
    }
}




export async function seemsg(req, res) {
    try {
        const sender_id = req.user.UserID; 
        const { id: receiver_id } = req.params; 

        const result = await ChatBox.updateMany(  { sender_id: receiver_id, receiver_id: sender_id, seen: { $ne: true } },{ $set: { seen: true } } );

        if (!result) {
            return res.status(404).send({ msg: "No unseen messages found" });
        }

        return res.status(200).send({ msg: "Messages marked as seen" });
    } catch (error) {
        console.error("Error marking messages as seen:", error);
        return res.status(500).send({ msg: "Failed to mark messages as seen", error });
    }
}


export async function createChatList(req, res) {
    try {
        const sender_id = req.user.UserID;
        const { id: receiver_id } = req.params;

        if (sender_id === receiver_id) {
            return res.status(400).send({ msg: "Sender and receiver cannot be the same user." });
        }

        const existingChatList = await chatListSchema.findOne({
            $or: [
                { sender_id: sender_id, receiver_id: receiver_id },
                { sender_id: receiver_id, receiver_id: sender_id }
            ]
        });

        if (existingChatList) {
            return res.status(400).send({ msg: "Chat list already exists between these users." });
        }
        const chatList = await chatListSchema.create({
            sender_id,
            receiver_id,
            lastmsg:null,
            time:null,
            count:0,
            lastSender:null
        });

        return res.status(200).send({ msg: "Chat list created successfully", chatList });
    } catch (error) {
        return res.status(500).send({ msg: "Internal server error." });
    }
}


export async function setlastmsg(req, res) {
    try {
        const sender_id = req.user.UserID;  
        const { id: receiver_id } = req.params; 
        const lastMessage = await ChatBox.findOne(
            {
                $or: [
                    { sender_id: sender_id, receiver_id: receiver_id },
                    { sender_id: receiver_id, receiver_id: sender_id },
                ]
            },
            {}, 
            { sort: { time: -1 } } 
        );

        if (!lastMessage) {
            return res.status(404).send({ msg: "No messages found between these users" });
        }
// console.log(lastMessage);
       
        const result = await chatListSchema.findOneAndUpdate(
            {
                $or: [
                    { sender_id: sender_id, receiver_id: receiver_id },
                    { sender_id: receiver_id, receiver_id: sender_id }
                ]
            },
            { 
                $set: { 
                    lastmsg: lastMessage.message, 
                    time: lastMessage.time,
                    lastSender: lastMessage.sender_id  
                } 
            }, 
            { new: true }  
        );

        if (!result) {
            return res.status(404).send({ msg: "Chat list not found" });
        }

        return res.status(200).send({
            msg: "Last message and sender updated successfully"
        });
    } catch (error) {
        return res.status(500).send({ msg: "Failed to update last message", error: error.message });
    }
}


export async function setcount(req, res) {
    try {
        const sender_id = req.user.UserID;  
        const { id: receiver_id } = req.params; 
        const unseenMessages = await ChatBox.find(
            {
                $or: [
                    { sender_id: sender_id, receiver_id: receiver_id, seen: false },
                    { sender_id: receiver_id, receiver_id: sender_id, seen: false }
                ]
            }
        );
        const unseenCount = unseenMessages.length;
        const updatedCount = unseenCount === 0 ? 0 : unseenCount;
        const result = await chatListSchema.findOneAndUpdate(
            {
                $or: [
                    { sender_id: sender_id, receiver_id: receiver_id },
                    { sender_id: receiver_id, receiver_id: sender_id }
                ]
            },
            { $set: { count: updatedCount } }, 
            { new: true } 
        );

        if (!result) {
            return res.status(404).send({ msg: "Chat list not found" });
        }

        return res.status(200).send({
            msg: "Message count updated successfully",
            count: updatedCount
        });
    } catch (error) {
        return res.status(500).send({ msg: "Failed to update message count", error: error.message });
    }
}




export async function displayChatList(req, res) {
    try {
        const userId = req.user.UserID;

        const chatLists = await chatListSchema.find({
            $or: [{ sender_id: userId }, { receiver_id: userId }]
        });

        const chatListData = await Promise.all(chatLists.map(async (chat) => {
            const decryptedLastMsg = chat.lastmsg ? decryptMessage(chat.lastmsg) : null;

            let otherUser;

            if (chat.sender_id === userId) {
                otherUser = await userSchema.findById(chat.receiver_id);
            } else {
                otherUser = await userSchema.findById(chat.sender_id);
            }

            if (otherUser) {
                return {
                    username: otherUser.username,
                    image: otherUser.image,
                    chatId: chat._id,
                    otherUserId: otherUser._id,
                    lastmsg: decryptedLastMsg,
                    time: chat.time,
                    count: chat.count,
                    lastSender: chat.lastSender,
                    my_id: req.user.UserID
                };
            } else {
                return null;
            }
        }));

        const validChatListData = chatListData.filter(chat => chat !== null);

        return res.status(200).send(validChatListData);
    } catch (error) {
        console.error(error);
        return res.status(500).send({ msg: "Internal server error." });
    }
}




export async function getgoogleresponser(req, res) {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).send({ error: "No token provided" });
        }
        const ticket = await client.verifyIdToken({  idToken: token,
  audience: "105958806746-rioiiafbpp4uo7a0vtjomi239j9pb9kk.apps.googleusercontent.com",
        });

        const payload = ticket.getPayload();
        const { sub, email, name, picture } = payload;

        let user = await userSchema.findOne({ email });

        if (!user) {
            user = new userSchema({
                username: name,
                email: email,
                image: picture,
                googleId: sub,
                phone: null,   
                about: null, 
            });

            await user.save();
        }

        const authToken = jwt.sign( { UserID: user._id },  process.env.JWT_KEY,   { expiresIn: "24h" }  );
        // console.log(authToken);
        res.status(200).send({ authToken });
    } catch (error) {
        console.error("Google Authentication Error:", error);
        res.status(500).send({ error: "Failed to authenticate with Google" });
    }
}

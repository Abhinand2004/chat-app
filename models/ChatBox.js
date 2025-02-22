import mongoose from "mongoose";

const chatBoxSchema = new mongoose.Schema({
    sender_id: { type: String, required: true },
    receiver_id: { type: String, required: true },
    message: { type: String, required: true },
    time: { type: Date, default: Date.now },
    seen: { type: Boolean, default: false }
});

export default mongoose.models.ChatBox || mongoose.model('ChatBox', chatBoxSchema);

import mongoose from "mongoose";
import { type } from "os";

const chatListSchema = new mongoose.Schema({
    sender_id: { type: String, required: true },
    receiver_id: { type: String, required: true },
    lastmsg:{type:String},
    time: { type: Date},
    count:{type:Number},
    lastSender:{type:String}
    

});

export default mongoose.models.ChatList || mongoose.model('ChatList', chatListSchema);

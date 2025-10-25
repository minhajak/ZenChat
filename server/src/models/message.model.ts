import mongoose, { Schema } from "mongoose";
import { IMessage } from "../types/message.type";

const messageSchema = new Schema<IMessage>({
    senderId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    receiverId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    text: {
        type: String,
        required: false
    },
    image: {
        type: String,
        required: false
    },  
    seen:{
        type:Boolean,
        required:true,
        default:false
    }      
}, {
    timestamps: true
});

export const Message = mongoose.model<IMessage>("Message", messageSchema);
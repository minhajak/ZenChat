import { Types } from "mongoose";

export interface IMessage extends Document {
  senderId: Types.ObjectId;
  receiverId: Types.ObjectId;
  text?: string;
  image?: string;
  seen: boolean;
  createdAt: Date;
  updatedAt: Date;
}

import mongoose from "mongoose";

export interface IFriend extends Document {
  requester: mongoose.Types.ObjectId;
  recipient: mongoose.Types.ObjectId;
  status: friendStatus;
  createdAt: Date;
  updatedAt: Date;
}

export enum friendStatus {
  PENDING = "pending",
  ACCEPTED = "accepted",
  DECLINED = "declined",
  BLOCKED = "blocked",
}

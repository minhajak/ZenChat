import mongoose, { Schema } from "mongoose";
import { friendStatus, IFriend } from "../types/friend.type";

const friendSchema = new Schema<IFriend>(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: friendStatus,
      default: friendStatus.PENDING,
    },
  },
  { timestamps: true }
);

// Indexes for better query performance
friendSchema.index({ requester: 1, recipient: 1 }, { unique: true });
friendSchema.index({ status: 1 });
friendSchema.index({ requester: 1, status: 1 });
friendSchema.index({ recipient: 1, status: 1 });

// Prevent duplicate friend requests (A->B and B->A)
friendSchema.pre("save", async function (next) {
  const existingFriendship = await mongoose.model("Friend").findOne({
    $or: [
      { requester: this.requester, recipient: this.recipient },
      { requester: this.recipient, recipient: this.requester },
    ],
  });

  if (
    existingFriendship &&
    existingFriendship._id.toString() !== this.id.toString()
  ) {
    throw new Error("Friendship already exists");
  }

  next();
});

export const Friend = mongoose.model<IFriend>("Friend", friendSchema);

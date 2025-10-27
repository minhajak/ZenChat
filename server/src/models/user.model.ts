import { model, Schema } from "mongoose";
import { IUser, userEnum } from "../types/user.type";
import bcryptjs from "bcryptjs";


const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    password: { type: String, required: true, minLength: 6 },
    role: {
      type: String,
      enum: userEnum,
      default: "User",
      required: true,
    },
    profileImage: { type: String, default: "" },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);
// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (
  enteredPassword: string
): Promise<boolean> {
  return await bcryptjs.compare(enteredPassword, this.password);
};
export const User = model<IUser>("User", userSchema);

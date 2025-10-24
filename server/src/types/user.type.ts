import { Document } from "mongoose";
import { UserType } from "../validations/user.validation";

// MongoDB interface
export interface IUser extends Document, UserType {
  role: string;
  comparePassword(enteredPassword: string): Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}
export enum userEnum {
  USER="user",
  ADMIN="admin"
}

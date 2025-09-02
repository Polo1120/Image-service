import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  email: string;
  password: string;
  username: string;
  profilePictureUrl?: string;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  profilePictureUrl: { type: String },
});

export const User = mongoose.model<IUser>("User", UserSchema);

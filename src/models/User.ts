import mongoose, { Schema, Document } from "mongoose";

export interface IUser {
  _id: string;
  username: string;
  email: string;
  password: string;
  avatar?: string;
  isAdmin: boolean;
  preferences?: {
    language?: string;
    autoPlay?: boolean;
    subtitleLanguage?: string;
    playbackSpeed?: number;
  };
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface IUserDocument extends Document {
  _id: mongoose.Types.ObjectId;
  username: string;
  email: string;
  password: string;
  avatar?: string;
  isAdmin: boolean;
  preferences?: {
    language?: string;
    autoPlay?: boolean;
    subtitleLanguage?: string;
    playbackSpeed?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    avatar: { type: String },
    isAdmin: { type: Boolean, default: false },
    preferences: {
      language: { type: String },
      autoPlay: { type: Boolean, default: true },
      subtitleLanguage: { type: String },
      playbackSpeed: { type: Number, default: 1 },
    },
  },
  { timestamps: true }
);

UserSchema.index({ email: 1 });
UserSchema.index({ username: 1 });

const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;

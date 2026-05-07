import mongoose, { Schema, Document } from "mongoose";

export interface IWatchProgress {
  _id: string;
  userId: mongoose.Types.ObjectId;
  contentId: mongoose.Types.ObjectId;
  seasonNumber?: number;
  episodeNumber?: number;
  progress: number;
  duration: number;
  updatedAt: Date | string;
}

export interface IWatchProgressDocument extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  contentId: mongoose.Types.ObjectId;
  seasonNumber?: number;
  episodeNumber?: number;
  progress: number;
  duration: number;
  updatedAt: Date;
}

const WatchProgressSchema = new Schema<IWatchProgress>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    contentId: { type: Schema.Types.ObjectId, ref: "Content", required: true },
    seasonNumber: { type: Number },
    episodeNumber: { type: Number },
    progress: { type: Number, default: 0 },
    duration: { type: Number, default: 0 },
  },
  { timestamps: true }
);

WatchProgressSchema.index({ userId: 1, contentId: 1, seasonNumber: 1, episodeNumber: 1 }, { unique: true });
WatchProgressSchema.index({ userId: 1, updatedAt: -1 });

const WatchProgress = mongoose.models.WatchProgress || mongoose.model<IWatchProgress>("WatchProgress", WatchProgressSchema);

export default WatchProgress;

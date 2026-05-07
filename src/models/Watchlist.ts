import mongoose, { Schema, Document } from "mongoose";

export interface IWatchlist {
  _id: string;
  userId: mongoose.Types.ObjectId;
  contentId: mongoose.Types.ObjectId;
  createdAt: Date | string;
}

export interface IWatchlistDocument extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  contentId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const WatchlistSchema = new Schema<IWatchlist>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    contentId: { type: Schema.Types.ObjectId, ref: "Content", required: true },
  },
  { timestamps: true }
);

WatchlistSchema.index({ userId: 1, contentId: 1 }, { unique: true });
WatchlistSchema.index({ userId: 1, createdAt: -1 });

const Watchlist = mongoose.models.Watchlist || mongoose.model<IWatchlist>("Watchlist", WatchlistSchema);

export default Watchlist;

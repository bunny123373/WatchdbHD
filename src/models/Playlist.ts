import mongoose, { Schema, Document } from "mongoose";

export interface IPlaylistItem {
  contentId: mongoose.Types.ObjectId;
  order: number;
  addedAt: Date;
}

export interface IPlaylist {
  _id: string;
  userId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  isPublic: boolean;
  items: IPlaylistItem[];
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface IPlaylistDocument extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  isPublic: boolean;
  items: IPlaylistItem[];
  createdAt: Date;
  updatedAt: Date;
}

const PlaylistItemSchema = new Schema<IPlaylistItem>({
  contentId: { type: Schema.Types.ObjectId, ref: "Content", required: true },
  order: { type: Number, default: 0 },
  addedAt: { type: Date, default: Date.now },
});

const PlaylistSchema = new Schema<IPlaylist>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String },
    isPublic: { type: Boolean, default: false },
    items: [PlaylistItemSchema],
  },
  { timestamps: true }
);

PlaylistSchema.index({ userId: 1 });
PlaylistSchema.index({ isPublic: 1, createdAt: -1 });

const Playlist = mongoose.models.Playlist || mongoose.model<IPlaylist>("Playlist", PlaylistSchema);

export default Playlist;

import mongoose, { Schema, Document } from "mongoose";

export interface ISubtitle {
  _id: string;
  contentId: mongoose.Types.ObjectId;
  seasonNumber?: number;
  episodeNumber?: number;
  language: string;
  label: string;
  url: string;
  format: "srt" | "vtt";
  createdAt: Date | string;
}

export interface ISubtitleDocument extends Document {
  _id: mongoose.Types.ObjectId;
  contentId: mongoose.Types.ObjectId;
  seasonNumber?: number;
  episodeNumber?: number;
  language: string;
  label: string;
  url: string;
  format: "srt" | "vtt";
  createdAt: Date;
}

const SubtitleSchema = new Schema<ISubtitle>(
  {
    contentId: { type: Schema.Types.ObjectId, ref: "Content", required: true },
    seasonNumber: { type: Number },
    episodeNumber: { type: Number },
    language: { type: String, required: true },
    label: { type: String, required: true },
    url: { type: String, required: true },
    format: { type: String, enum: ["srt", "vtt"], required: true },
  },
  { timestamps: true }
);

SubtitleSchema.index({ contentId: 1, language: 1 });
SubtitleSchema.index({ contentId: 1, seasonNumber: 1, episodeNumber: 1 });

const Subtitle = mongoose.models.Subtitle || mongoose.model<ISubtitle>("Subtitle", SubtitleSchema);

export default Subtitle;

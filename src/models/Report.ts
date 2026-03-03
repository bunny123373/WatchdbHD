import mongoose, { Schema, Document, Types } from "mongoose";

export interface IReport {
  _id: string;
  contentId: Types.ObjectId;
  contentTitle: string;
  type: "movie" | "series";
  episodeNumber?: number;
  seasonNumber?: number;
  issueType: "broken" | "no-play" | "slow" | "other";
  description?: string;
  status: "pending" | "fixed" | "rejected";
  createdAt: Date | string;
}

export interface IReportDocument extends Document {
  _id: mongoose.Types.ObjectId;
  contentId: mongoose.Types.ObjectId;
  contentTitle: string;
  type: "movie" | "series";
  episodeNumber?: number;
  seasonNumber?: number;
  issueType: "broken" | "no-play" | "slow" | "other";
  description?: string;
  status: "pending" | "fixed" | "rejected";
  createdAt: Date;
}

const ReportSchema = new Schema<IReport>(
  {
    contentId: { type: Schema.Types.ObjectId, ref: "Content", required: true },
    contentTitle: { type: String, required: true },
    type: { type: String, required: true, enum: ["movie", "series"] },
    episodeNumber: { type: Number },
    seasonNumber: { type: Number },
    issueType: {
      type: String,
      required: true,
      enum: ["broken", "no-play", "slow", "other"],
    },
    description: { type: String },
    status: {
      type: String,
      enum: ["pending", "fixed", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

ReportSchema.index({ createdAt: -1, status: 1 });

const Report = mongoose.models.Report || mongoose.model<IReport>("Report", ReportSchema);

export default Report;

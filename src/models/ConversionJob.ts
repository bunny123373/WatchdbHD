import mongoose, { Schema, Document } from "mongoose";

export interface IConversionJob {
  _id: string;
  contentId?: string;
  mp4Url: string;
  status: "pending" | "downloading" | "converting" | "processing" | "complete" | "failed";
  progress: number;
  message: string;
  hlsUrl?: string;
  error?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface IConversionJobDocument extends Document {
  _id: mongoose.Types.ObjectId;
  contentId?: string;
  mp4Url: string;
  status: "pending" | "downloading" | "converting" | "processing" | "complete" | "failed";
  progress: number;
  message: string;
  hlsUrl?: string;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ConversionJobSchema = new Schema<IConversionJob>(
  {
    contentId: { type: String },
    mp4Url: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "downloading", "converting", "processing", "complete", "failed"],
      default: "pending",
    },
    progress: { type: Number, default: 0 },
    message: { type: String, default: "Queued" },
    hlsUrl: { type: String },
    error: { type: String },
  },
  { timestamps: true }
);

ConversionJobSchema.index({ status: 1 });
ConversionJobSchema.index({ createdAt: -1 });

const ConversionJob = mongoose.models.ConversionJob || mongoose.model<IConversionJob>("ConversionJob", ConversionJobSchema);

export default ConversionJob;

import mongoose, { Schema, Document } from "mongoose";

export interface IContentRequest {
  _id: string;
  title: string;
  type: "movie" | "series";
  year?: string;
  language?: string;
  description?: string;
  status: "pending" | "completed" | "rejected";
  createdAt: Date | string;
}

export interface IContentRequestDocument extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  type: "movie" | "series";
  year?: string;
  language?: string;
  description?: string;
  status: "pending" | "completed" | "rejected";
  createdAt: Date;
}

const ContentRequestSchema = new Schema<IContentRequest>(
  {
    title: { type: String, required: true },
    type: { type: String, required: true, enum: ["movie", "series"] },
    year: { type: String },
    language: { type: String },
    description: { type: String },
    status: {
      type: String,
      enum: ["pending", "completed", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

ContentRequestSchema.index({ createdAt: -1 });

const ContentRequest =
  mongoose.models.ContentRequest ||
  mongoose.model<IContentRequest>("ContentRequest", ContentRequestSchema);

export default ContentRequest;

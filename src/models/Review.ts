import mongoose, { Schema, Document } from "mongoose";

export interface IReview {
  _id: string;
  contentId: mongoose.Types.ObjectId;
  userName: string;
  rating: number;
  comment: string;
  createdAt: Date | string;
}

export interface IReviewDocument extends Document {
  _id: mongoose.Types.ObjectId;
  contentId: mongoose.Types.ObjectId;
  userName: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    contentId: { type: Schema.Types.ObjectId, ref: "Content", required: true },
    userName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

ReviewSchema.index({ contentId: 1, createdAt: -1 });

const Review = mongoose.models.Review || mongoose.model<IReview>("Review", ReviewSchema);

export default Review;

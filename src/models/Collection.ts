import mongoose, { Schema, Document } from "mongoose";

export interface ICollection {
  _id: string;
  name: string;
  description?: string;
  contentIds: mongoose.Types.ObjectId[];
  isPublic: boolean;
  isTopTen: boolean;
  createdAt: Date | string;
}

export interface ICollectionDocument extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  contentIds: mongoose.Types.ObjectId[];
  isPublic: boolean;
  isTopTen: boolean;
  createdAt: Date;
}

const CollectionSchema = new Schema<ICollection>(
  {
    name: { type: String, required: true },
    description: { type: String },
    contentIds: [{ type: Schema.Types.ObjectId, ref: "Content" }],
    isPublic: { type: Boolean, default: true },
    isTopTen: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Collection = mongoose.models.Collection || mongoose.model<ICollection>("Collection", CollectionSchema);

export default Collection;

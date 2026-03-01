import mongoose, { Schema, Document } from "mongoose";

export interface IEpisode {
  episodeNumber: number;
  episodeTitle: string;
  embedIframeLink?: string;
  downloadLink?: string;
  quality?: string;
}

export interface ISeason {
  seasonNumber: number;
  episodes: IEpisode[];
}

export interface IContent {
  _id: string;
  type: "movie" | "series";
  title: string;
  poster: string;
  banner?: string;
  description?: string;
  year?: string;
  language?: string;
  category?: string;
  quality?: string;
  rating?: number;
  tags?: string[];
  embedIframeLink?: string;
  downloadLink?: string;
  seasons?: ISeason[];
  tmdbId?: number;
  tmdbGenreIds?: number[];
  tmdbGenres?: string[];
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface IContentDocument extends Document {
  _id: mongoose.Types.ObjectId;
  type: "movie" | "series";
  title: string;
  poster: string;
  banner?: string;
  description?: string;
  year?: string;
  language?: string;
  category?: string;
  quality?: string;
  rating?: number;
  tags?: string[];
  embedIframeLink?: string;
  downloadLink?: string;
  seasons?: ISeason[];
  tmdbId?: number;
  tmdbGenreIds?: number[];
  tmdbGenres?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const EpisodeSchema = new Schema<IEpisode>({
  episodeNumber: { type: Number, required: true },
  episodeTitle: { type: String, required: true },
  embedIframeLink: { type: String },
  downloadLink: { type: String },
  quality: { type: String },
});

const SeasonSchema = new Schema<ISeason>({
  seasonNumber: { type: Number, required: true },
  episodes: [EpisodeSchema],
});

const ContentSchema = new Schema<IContent>(
  {
    type: { type: String, required: true, enum: ["movie", "series"] },
    title: { type: String, required: true },
    poster: { type: String, required: true },
    banner: { type: String },
    description: { type: String },
    year: { type: String },
    language: { type: String },
    category: { type: String },
    quality: { type: String },
    rating: { type: Number },
    tags: [{ type: String }],
    embedIframeLink: { type: String },
    downloadLink: { type: String },
    seasons: [SeasonSchema],
    tmdbId: { type: Number },
    tmdbGenreIds: [{ type: Number }],
    tmdbGenres: [{ type: String }],
  },
  { timestamps: true }
);

const Content = mongoose.models.Content || mongoose.model<IContent>("Content", ContentSchema);

export default Content;

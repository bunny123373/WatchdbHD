import mongoose, { Schema, Document } from "mongoose";
import { generateSlug } from "@/lib/slug";

export interface ICast {
  name: string;
  character?: string;
  image?: string;
}

export interface ICrew {
  name: string;
  job?: string;
  image?: string;
}

export interface IEpisode {
  episodeNumber: number;
  episodeTitle: string;
  episodeDescription?: string;
  episodeThumbnail?: string;
  embedIframeLink?: string;
  embedIframeLink2?: string;
  hlsUrl?: string;
  downloadLink?: string;
  quality?: string;
  languageSources?: ILanguageSource[];
  audioLinks?: IAudioLink[];
}

export interface ISeason {
  seasonNumber: number;
  episodes: IEpisode[];
}

export interface ICollection {
  _id: string;
  name: string;
  description?: string;
  contentIds: string[];
  isPublic: boolean;
  createdAt: Date | string;
}

export interface ICollectionDocument extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  contentIds: mongoose.Types.ObjectId[];
  isPublic: boolean;
  createdAt: Date;
}

export interface IContent {
  _id: string;
  type: "movie" | "series";
  title: string;
  slug?: string;
  poster: string;
  banner?: string;
  description?: string;
  year?: string;
  language?: string;
  audioLanguages?: string[];
  category?: string;
  quality?: string;
  rating?: number;
  tags?: string[];
  embedIframeLink?: string;
  embedIframeLink2?: string;
  downloadLink?: string;
  seasons?: ISeason[];
  tmdbId?: number;
  tmdbGenreIds?: number[];
  tmdbGenres?: string[];
  cast?: ICast[];
  crew?: ICrew[];
  trailerUrl?: string;
  hlsUrl?: string;
  views?: number;
  autoPlay?: boolean;
  languageSources?: ILanguageSource[];
  audioLinks?: IAudioLink[];
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface ILanguageSource {
  language: string;
  embedLink?: string;
  hlsUrl?: string;
  downloadLink?: string;
}

export interface IAudioLink {
  language: string;
  url: string;
  label?: string;
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
  audioLanguages?: string[];
  category?: string;
  quality?: string;
  rating?: number;
  tags?: string[];
  embedIframeLink?: string;
  embedIframeLink2?: string;
  downloadLink?: string;
  hlsUrl?: string;
  seasons?: ISeason[];
  tmdbId?: number;
  tmdbGenreIds?: number[];
  tmdbGenres?: string[];
  cast?: ICast[];
  crew?: ICrew[];
  trailerUrl?: string;
  views?: number;
  autoPlay?: boolean;
  languageSources?: ILanguageSource[];
  audioLinks?: IAudioLink[];
  createdAt: Date;
  updatedAt: Date;
}

const EpisodeSchema = new Schema<IEpisode>({
  episodeNumber: { type: Number, required: true },
  episodeTitle: { type: String, required: true },
  embedIframeLink: { type: String },
  embedIframeLink2: { type: String },
  hlsUrl: { type: String },
  downloadLink: { type: String },
  quality: { type: String },
  languageSources: [{
    language: { type: String },
    embedLink: { type: String },
    hlsUrl: { type: String },
    downloadLink: { type: String },
  }],
  audioLinks: [{
    language: { type: String },
    url: { type: String },
    label: { type: String },
  }],
});

const SeasonSchema = new Schema<ISeason>({
  seasonNumber: { type: Number, required: true },
  episodes: [EpisodeSchema],
});

const CastSchema = new Schema<ICast>({
  name: { type: String, required: true },
  character: { type: String },
  image: { type: String },
});

const CrewSchema = new Schema<ICrew>({
  name: { type: String, required: true },
  job: { type: String },
  image: { type: String },
});

const ContentSchema = new Schema<IContent>(
  {
    type: { type: String, required: true, enum: ["movie", "series"] },
    title: { type: String, required: true },
    slug: { type: String },
    poster: { type: String, required: true },
    banner: { type: String },
    description: { type: String },
    year: { type: String },
    language: { type: String },
    audioLanguages: [{ type: String }],
    category: { type: String },
    quality: { type: String },
    rating: { type: Number },
    tags: [{ type: String }],
    embedIframeLink: { type: String },
    embedIframeLink2: { type: String },
    hlsUrl: { type: String },
    downloadLink: { type: String },
    seasons: [SeasonSchema],
    tmdbId: { type: Number },
    tmdbGenreIds: [{ type: Number }],
    tmdbGenres: [{ type: String }],
    cast: [CastSchema],
    crew: [CrewSchema],
    trailerUrl: { type: String },
    views: { type: Number, default: 0 },
    autoPlay: { type: Boolean, default: false },
    languageSources: [{
      language: { type: String },
      embedLink: { type: String },
      hlsUrl: { type: String },
      downloadLink: { type: String },
    }],
    audioLinks: [{
      language: { type: String },
      url: { type: String },
      label: { type: String },
    }],
  },
  { timestamps: true }
);

ContentSchema.index({ slug: 1 }, { unique: true, sparse: true });

ContentSchema.pre("save", function (next) {
  if (this.title && !this.slug) {
    this.slug = generateSlug(this.title);
  }
  next();
});

ContentSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate() as Record<string, unknown>;
  if (update?.title && !update?.slug) {
    update.slug = generateSlug(update.title as string);
  }
  next();
});

const Content = mongoose.models.Content || mongoose.model<IContent>("Content", ContentSchema);

export default Content;

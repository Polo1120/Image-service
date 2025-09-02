import mongoose, { Document, Schema } from "mongoose";

export interface IImage extends Document {
  filename: string;
  url: string;
  format: string;
  public_id: string;
  userId: mongoose.Schema.Types.ObjectId;
  title?: string;
  description?: string;
  location?: string;
  dateSpecial?: Date;
  tags?: string[];
  taggedUsers?: mongoose.Schema.Types.ObjectId[];
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

const imageSchema = new Schema<IImage>(
  {
    filename: { type: String, required: true },
    url: { type: String, required: true },
    format: { type: String, required: true },
    public_id: { type: String, required: true, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String },
    description: { type: String },
    location: { type: String },
    dateSpecial: { type: Date },
    tags: [{ type: String }],
    taggedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

export const Image = mongoose.model<IImage>("Image", imageSchema);
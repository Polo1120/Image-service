import mongoose, { Document, Schema, Types } from "mongoose";

export interface IImage extends Document {
  _id: Types.ObjectId; 
  filename: string;
  public_id: string;
  url: string;
  userId: Types.ObjectId;
  format?: string;
  title?: string;
  description?: string;
  dateSpecial?: Date;
  location?: string;
  tags?: string[];
  createdAt: Date;
}

const ImageSchema = new Schema<IImage>(
  {
    filename: { type: String, required: true },
    url: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    public_id: { type: String, required: true },
    format: String,
    title: String,
    description: String,
    dateSpecial: Date,
    location: String,
    tags: [String],
  },
  { timestamps: true }
);

export const Image = mongoose.model<IImage>("Image", ImageSchema);

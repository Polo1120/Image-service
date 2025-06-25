import mongoose, { Document, Schema } from "mongoose";

export interface IImage extends Document {
  filename: string;
  format: string;
  url: string;
  public_id?: string; // Optional, used for Cloudinary public_id
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const ImageSchema = new Schema<IImage>(
  {
    filename: { type: String, required: true },
    url: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    format: { type: String, required: true },
    public_id: { type: String, required: true}, // Optional for Cloudinary
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const Image = mongoose.model<IImage>("Image", ImageSchema);

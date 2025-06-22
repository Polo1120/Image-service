import mongoose, { Document, Schema } from "mongoose";

export interface IImage extends Document {
  filename: string;
  url: string;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const ImageSchema = new Schema<IImage>(
  {
    filename: { type: String, required: true },
    url: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const Image = mongoose.model<IImage>("Image", ImageSchema);

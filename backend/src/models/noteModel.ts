import mongoose, { Document, Schema, Types } from "mongoose";

export interface INote extends Document {
  title: string;
  content: string;
  author: Types.ObjectId;
  public: boolean;
  updatedAt: Date;
}

const noteSchema = new Schema<INote>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    public: { type: Boolean, default: false },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Note = mongoose.model<INote>("Note", noteSchema);

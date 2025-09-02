import mongoose from "../config/db.js";

const snippetSchema = new mongoose.Schema(
  {
    authorUserName: {
      type: String,
      required: true,
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    snippetTitle: {
      type: String,
      required: true,
    },
    snippetCode: {
      type: String,
      required: true,
    },
    snippetType: {
      type: Boolean,
      required: true,
    },
    snippetLanguage: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
export const Snippet = mongoose.model("Snippet", snippetSchema);

import mongoose from "../config/db.js";

const visitorSchema = new mongoose.Schema(
  {
    visitorCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const Visitor = mongoose.model("Visitor", visitorSchema);

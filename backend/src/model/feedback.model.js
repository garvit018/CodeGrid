import mongoose from "../config/db.js";

const feedBackSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

feedBackSchema.statics.deleteById = function (id, cb) {
  return this.deleteOne({ _id: id }, cb);
};

export const Feedback = mongoose.model("Feedback", feedBackSchema);

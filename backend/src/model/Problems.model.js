import mongoose from "../config/db.js";

const problemSchema = new mongoose.Schema(
  {
    problem_slug: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    sampleInput: {
      type: String,
      required: true,
    },
    sampleOutput: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      required: true,
    },
    tags: {
      type: Array,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    testCasesInput: {
      type: String,
      required: true,
    },
    testCasesOutput: {
      type: String,
      required: true,
    },
    editorial: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const Problem = mongoose.model("Problem", problemSchema);

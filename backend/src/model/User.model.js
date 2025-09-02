import mongoose from "../config/db.js";
import bcrypt from "bcrypt";

const userSchema = new Schema(
  {
    username: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      index: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, "password is required"],
    },
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
    },
    picture: {
      type: String,
      default:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcToK4qEfbnd-RN82wdL2awn_PMviy_pelocqQ",
    },
    isAccountVerified: {
      type: Boolean,
      default: false,
    },
    roles: {
      type: Object,
      required: true,
    },
    problemSolved: {
      type: [
        {
          problemSlug: String,
          solvedDate: Date,
        },
      ],
      default: [],
    },
    refreshToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", (next) => {
  const user = this;
  if (!user.isModified("password")) return next();
  bcrypt.hash(user.password, 12, (err, hash) => {
    if (err) return next(err);
    user.password = hash;
    next();
  });
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  const match = await bcrypt.compare(candidatePassword, this.password);
  return match;
};

export const User = mongoose.model("User", userSchema);
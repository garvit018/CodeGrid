import mongoose from "../config/MongoConnect.js";

const accountVerificationSchema = new mongoose.Schema({
  authCode: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
});

export const AccountVerification = mongoose.model("AccountVerification", accountVerificationSchema);
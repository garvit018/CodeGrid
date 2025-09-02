import mongoose from "../config/MongoConnect.js";

const accountRecoverSchema = new mongoose.Schema({
  authCode: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
});

export const AccountRecover = mongoose.model("AccountRecover", accountRecoverSchema);
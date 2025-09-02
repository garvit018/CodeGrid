import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
import dotenv from "dotenv";

dotenv.config();

mongoose
  .connect(`${process.env.MONGODB_URI}/${DB_NAME}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log(
      `MONGO-DB : Connection Established at DB Host: ${mongoose.connection.host}`
    );
  })
  .catch((error) => {
    console.error("MONGO-DB : Connection Failed", error);
    process.exit(1);
  });

export default mongoose;

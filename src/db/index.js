import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGO_LOCALHOST_URL}/${DB_NAME}`
    );
    console.log(
      `\nMongoDB Connected !! Db Host: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log("Error: ", error);
    process.exit(1);
  }
};

export default connectDB;

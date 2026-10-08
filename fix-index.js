import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("Connected to MongoDB");
    try {
      await mongoose.connection.collection('users').dropIndex('phoneNumber_1');
      console.log("Successfully dropped phoneNumber unique index!");
    } catch (err) {
      console.error("Error dropping index (it might not exist):", err.message);
    }
    process.exit(0);
  });

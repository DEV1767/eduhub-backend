import mongoose from "mongoose";

const URL = process.env.MONGO_URL;

export const connect_db = async () => {
    try {
        console.log("MONGO URL:", process.env.MONGO_URL);
        if (!URL) {
            throw new Error("MONGO_URL is missing");
        }

        await mongoose.connect(URL);   // ✅ IMPORTANT

        console.log("✅ Database is connected !!");

    } catch (error) {
        console.log("❌ DB connection failed:", error);
        process.exit(1);
    }
};

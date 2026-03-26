import mongoose from "mongoose";

const URL = process.env.MONGO_URL;
let cached = global.mongoose || { conn: null, promise: null };

export const connect_db = async () => {
    try {
        if (!URL) throw new Error("MONGO_URL is missing");

        // Return existing connection if available
        if (cached.conn) {
            console.log("✅ Using cached DB connection");
            return cached.conn;
        }

        if (!cached.promise) {
            cached.promise = mongoose.connect(URL, {
                serverSelectionTimeoutMS: 10000,
                bufferCommands: false, // ← disables the buffering that caused your error
            });
        }

        cached.conn = await cached.promise;
        global.mongoose = cached;
        console.log("✅ Database connected!");
        return cached.conn;

    } catch (error) {
        console.log("❌ DB connection failed:", error);
        process.exit(1);
    }
};

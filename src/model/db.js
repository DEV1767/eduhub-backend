import mongoose from "mongoose";

let cached = global.mongoose || { conn: null, promise: null };

export const connect_db = async () => {
    const URL = process.env.MONGO_URL;
    if (!URL) throw new Error("MONGO_URL is missing");

    if (cached.conn) return cached.conn; // reuse existing connection

    if (!cached.promise) {
        cached.promise = mongoose.connect(URL, {
            serverSelectionTimeoutMS: 10000,
            bufferCommands: false,
        });
    }

    cached.conn = await cached.promise;
    global.mongoose = cached;
    console.log(" Database connected!");
    return cached.conn;
};
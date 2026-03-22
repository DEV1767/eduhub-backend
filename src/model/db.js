
//Database connection 
import mongoose from "mongoose";

const URL = process.env.MONGO_URL

//Database connect
export const connect_db = async () => {
    try {
        mongoose.connect(URL)
        console.log("Database is connected !!")
    } catch (error) {
        console.log("Something went wrong!!", error)
        process.exit(1)
    }
}

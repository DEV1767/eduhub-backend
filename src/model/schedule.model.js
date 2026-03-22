
//Event schedule details (date,time,endtime,description of event)
import mongoose from "mongoose";

const scheduleschema = new mongoose.Schema({
    title: {
        type: String,       
        required: true,
        trim: true
    },
    starttime: {
        type: String,
        required: true
    },
    endtime: {
        type: String
    },
    description: {
        type: String,
        trim: true
    },
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    order: {
        type: Number,
    }
}, { timestamps: true })
export default mongoose.model("Schedule", scheduleschema);
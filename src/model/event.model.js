
//Event database model 
import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        enum: ["Hackathon", "Quiz", "Cultural", "Techtalk", "Sports"],
        required: true
    },
    status: {
        type: String,
        enum: ["Upcoming", "Live", "Completed"],
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String
    },
    venue: {
        type: String,
        trim: true
    },
    maxTeams: {
        type: Number
    },
    prize: {
        type: String
    },
    description: {
        type: String
    },
    teams: {              
        type: Number,
        default: 0
    },
    collegename: {        
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
}, {
    timestamps: true
});

export default mongoose.model("Event", eventSchema);
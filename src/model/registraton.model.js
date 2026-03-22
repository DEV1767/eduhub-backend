
// Team registration for events(for students)
import mongoose from "mongoose";


const Registrationschema = new mongoose.Schema({
    teamname: {
        type: String,
        required: true,
    },
    leadname: {
        type: String,
        required:true
    },
    members: {
        type: [String],
        required: true
    },
    collegeid: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true
    },
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event"
    },
    registeredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    status: {
        type: String,
        enum: ["Confirmed", "Cancelled"],
        default: "Confirmed"
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }

}, {
    timestamps: true
})

export default mongoose.model("Teams", Registrationschema);
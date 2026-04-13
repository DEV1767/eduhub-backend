
// Team registration for events(for students)
import mongoose from "mongoose";


const Registrationschema = new mongoose.Schema({
    teamname: {
        type: String,
        required: true,
    },
    leadname: {
        type: String,
        required: true
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
    },
    phone: {
        type: String,
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
        enum: ["Pending", "Approved", "Rejected", "Confirmed"],
        default: "Confirmed"
    },
    
    // Payment Fields
    paymentStatus: {
        type: String,
        enum: ["Pending", "Paid", "Failed"],
        default: "Pending"
    },
    paymentAmount: {
        type: Number,
        default: null
    },
    paymentMethod: {
        type: String,
        enum: ["UPI", "Cash", "Card", "Bank Transfer", null],
        default: null
    },
    transactionId: {
        type: String,
        default: null
    },
    paymentDate: {
        type: Date,
        default: null
    },
    
    // Approval/Rejection Fields
    approvedAt: {
        type: Date,
        default: null
    },
    rejectionReason: {
        type: String,
        default: null
    },
    rejectionNotes: {
        type: String,
        default: null
    },
    rejectedAt: {
        type: Date,
        default: null
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }

}, {
    timestamps: true
})

export default mongoose.model("Teams", Registrationschema);
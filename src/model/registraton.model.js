import mongoose from "mongoose";

const Registrationschema = new mongoose.Schema({

    teamname: { type: String, required: true },
    leadname: { type: String, required: true },
    members: { type: [String], required: true },
    collegeid: { type: String, required: true },
    email: { type: String },
    phone: { type: String },

    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event"
    },

    registeredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    Registrationstatus: {
        type: String,
        enum: ["Pending", "Approved", "Rejected", "Confirmed"],
        default: "Confirmed"
    },

    // 🔥 Payment Fields
    paymentProofUrl: {
        type: String,
        default: null
    },

    paymentStatus: {
        type: String,
        enum: ["pending", "submitted", "approved", "rejected"],
        default: "pending"
    },

    paymentMethod: {
        type: String,
        enum: ["UPI", "Cash", "Card", "Bank Transfer", null],
        default: null
    },

    paymentAmount: {
        type: Number,
        default: null
    },

    transactionId: {
        type: String,
        default: null
    },

    submittedAt: {
        type: Date,
        default: null
    },

    approvedAt: {
        type: Date,
        default: null
    },

    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },

    rejectedAt: {
        type: Date,
        default: null
    },

    rejectionReason: {
        type: String,
        default: null
    },

    isPaymentVerified: {
        type: Boolean,
        default: false
    }

}, { timestamps: true });

export default mongoose.model("Registration", Registrationschema);
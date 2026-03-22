
//Student,Faculty,Organiser data base model

import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const userSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true,
        trim: true
    },

    lastname: {
        type: String,
        trim: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },

    collegename: {
        type: String,
        required: true,
        trim: true
    },

    role: {
        type: String,
        enum: ["Student", "Organiser", "Faculty"],
        default: "Student"
    },

    password: {
        type: String,
        required: true,
        select: false
    },

    //  refresh token (hidden)
    refreshToken: {
        type: String,
        select: false
    },

    //  password reset fields
    resetPasswordToken: String,
    resetPasswordExpiry: Date

}, { timestamps: true });


//  Hash password before saving
userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    this.password = await bcrypt.hash(this.password, 10);
});


//  Compare password
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};


//  Generate Access Token
userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            role: this.role
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    );
};


//  Generate Refresh Token
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            role: this.role
        },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    );
};


//  Generate Temporary Token (for password reset)
userSchema.methods.generateTemporaryToken = function () {
    const unHashedToken = crypto.randomBytes(20).toString("hex");

    const hashedToken = crypto
        .createHash("sha256")
        .update(unHashedToken)
        .digest("hex");

    // store hashed token in DB
    this.resetPasswordToken = hashedToken;

    // expiry (20 minutes)
    this.resetPasswordExpiry = new Date(Date.now() + (20 * 60 * 1000));

    // return actual token to send via email
    return unHashedToken;
};


export default mongoose.model("Users", userSchema);
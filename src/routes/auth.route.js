
//All routes for (login,register,getme and logoutuser) Authentication

import express from "express";
import { registerUser, loginUser, logoutUser, getMe, refreshAccessToken } from "../controller/auth.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.js";
import { sendOTPlogin } from "../utils/sendemail.js";
import { verifyOTP } from "../utils/verify.email.js";

const router = express.Router();

// Public routes
router.post("/signup", registerUser);
router.post("/login", loginUser);
router.post("/refresh", refreshAccessToken)
router.post("/send-otp", sendOTPlogin)
router.post("/verify-otp", verifyOTP)



// Protected routes
router.post("/logout", authMiddleware, logoutUser);
router.get("/me", authMiddleware, getMe);

export default router;
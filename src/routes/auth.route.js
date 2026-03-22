
//All routes for (login,register,getme and logoutuser) Authentication

import express from "express";
import { registerUser, loginUser, logoutUser, getMe } from "../controller/auth.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.js";

const router = express.Router();

// Public routes
router.post("/signup", registerUser);
router.post("/login",  loginUser);

// Protected routes
router.post("/logout", authMiddleware, logoutUser);
router.get("/me",      authMiddleware, getMe);

export default router;
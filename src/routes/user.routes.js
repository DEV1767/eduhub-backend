import express from "express"
import { validate } from "../middleware/validate.js"
import { authMiddleware } from "../middleware/auth.middleware.js"
import { getuser } from "../controller/user.controller.js"

const router = express.Router()


router.get("/me", authMiddleware, getuser)

export default router


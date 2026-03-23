import express from "express"
import { validate } from "../middleware/validate.js"
import { authMiddleware } from "../middleware/auth.middleware.js"
import { getuser, updateme, updatepassword } from "../controller/user.controller.js"

const router = express.Router()


router.get("/me", authMiddleware, getuser)
router.put("/updateme",authMiddleware,updateme)
router.put("/updatepassword",authMiddleware,updatepassword)

export default router


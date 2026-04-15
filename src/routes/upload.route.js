import express from "express"
import { upload } from "../middleware/upload.middleware.js"
import { uploadupiimage } from "../controller/upload.controller.js"
import { authorized } from "../middleware/role.middleware.js"
import { authMiddleware } from "../middleware/auth.middleware.js"

const router = express.Router()

router.post("/", upload.single("image"), authMiddleware, authorized("Student"),uploadupiimage)

export default router;
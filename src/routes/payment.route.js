import express from "express"
import { upload } from "../middleware/upload.middleware.js"
import { UpiPaymentProof, approveupiPayment, rejectupiPayment, getpaymentstatus } from "../controller/payment.controller.js"
import { authMiddleware } from "../middleware/auth.middleware.js"
import { authorized } from "../middleware/role.middleware.js"

const router = express.Router()

// POST payment proof with image upload
router.post("/:regId", upload.single("image"), authMiddleware, UpiPaymentProof)
router.put("/:regid/approve", authMiddleware, authorized("Organiser", "Faculty"), approveupiPayment)
router.put("/:regid/reject", authMiddleware, authorized("Organiser", "Faculty"), rejectupiPayment)
router.get("/:regid/getstatus", authMiddleware, authorized("Organiser", "Faculty","Student"), getpaymentstatus)
export default router;

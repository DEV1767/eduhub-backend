import express from "express"
import { validate } from "../middleware/validate.js"
import { Schedulevalidator } from "../validators/joi.validate.js"
import { authMiddleware } from "../middleware/auth.middleware.js"
import { authorized } from "../middleware/role.middleware.js"
import { addslot, getschedule, updateslot, deleteslot } from "../controller/schedule.controller.js"



const router = express.Router()

router.post("/:eventId", authMiddleware, authorized("Organiser", "Faculty"), validate(Schedulevalidator), addslot)
router.get("/:eventId", authMiddleware, getschedule)
router.put("/:eventId/:slotId", authMiddleware, authorized("Organiser", "Faculty"),validate(Schedulevalidator), updateslot)
router.delete("/:eventId/:slotId", authMiddleware, authorized("Organiser", "Faculty"),deleteslot)

export default router

//All routes for team registration(registerteam,getteams,studentownregistration,cancleregistration)

import express from "express"
import { validate } from "../middleware/validate.js"
import { authMiddleware } from "../middleware/auth.middleware.js"
import { registerevent } from "../validators/joi.validate.js"
import { registerteam, getTeams, studentownregistration, cancleregistration, Approveregistratation, Rejectregistration, getRegistrationsByEvent, checkregistration } from "../controller/teams.controller.js"
import { authorized } from "../middleware/role.middleware.js"




const router = express.Router()

// Specific routes MUST come before generic parameter routes
router.post("/register", authMiddleware, validate(registerevent), registerteam)
router.get("/registrations/:eventId", authMiddleware, getRegistrationsByEvent)  // ← Frontend endpoint
router.put("/registrations/:registrationId/approve", authMiddleware, authorized("Organiser", "Faculty"), Approveregistratation)
router.put("/registrations/:registrationId/reject", authMiddleware, authorized("Organiser", "Faculty"), Rejectregistration)
router.get("/registrations/mine", authMiddleware, studentownregistration)  // ← Specific route FIRST
router.get("/:id/teams", authMiddleware, authorized("Organiser", "Faculty"), getTeams)  // ← Generic route SECOND
router.get('/checkregistration/:eventId', authMiddleware, checkregistration);
router.delete("/:tid", authMiddleware, authorized("Organiser", "Faculty"), cancleregistration)

export default router

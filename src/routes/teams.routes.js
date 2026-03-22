
//All routes for team registration(registerteam,getteams,studentownregistration,cancleregistration)

import express from "express"
import { validate } from "../middleware/validate.js"
import { authMiddleware } from "../middleware/auth.middleware.js"
import { registerevent } from "../validators/joi.validate.js"
import { registerteam, getTeams, studentownregistration, cancleregistration } from "../controller/teams.controller.js"
import { authorized } from "../middleware/role.middleware.js"



const router = express.Router()

router.post("/register", authMiddleware, validate(registerevent), registerteam)
router.get("/:id/teams", authMiddleware, authorized("Organiser", "Faculty"), getTeams)
router.get("/registrations/mine", authMiddleware, studentownregistration)
router.delete("/:tid", authMiddleware, authorized("Organiser", "Faculty"), cancleregistration)

export default router

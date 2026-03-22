
//All routes for event management(event create,get event, getsingleevent, upateevent, deletevent)

import express from "express"
import { validate } from "../middleware/validate.js"
import { Createevent, getevent, getsingleevent, updateevent, deleteevent } from "../controller/event.controller.js"
import { createeventschema } from "../validators/joi.validate.js"
import { authMiddleware } from "../middleware/auth.middleware.js"
import { authorized } from "../middleware/role.middleware.js"

const router = express.Router()

//routes
router.post("/", authMiddleware, authorized('Organiser', 'Faculty'), validate(createeventschema), Createevent)
router.get("/", authMiddleware, getevent)
router.get("/:id", authMiddleware, getsingleevent)
router.put("/:id", authMiddleware, authorized('Organiser', 'Faculty'), updateevent)
router.delete("/:id", authMiddleware, authorized('Organiser', 'Faculty'), deleteevent)


export default router
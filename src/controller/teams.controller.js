
//student  event (Teams detail) registration controller 

import mongoose from "mongoose";
import Teams from "../model/registraton.model.js";
import Event from "../model/event.model.js";
import { sendEventConfirmation } from "../utils/sendemail.js";

// ── REGISTER TEAM ──
export const registerteam = async (req, res) => {
    try {
        const { teamname, teamName, leadname, leadName, members, collegeid, collegeId, email, eventId } = req.body;

        const _teamname = teamname || teamName;
        const _leadname = leadname || leadName;
        const _collegeid = collegeid || collegeId;
        const _eventId = eventId || req.body.event;

        if (!_eventId) {
            return res.status(400).json({ message: "Event ID is required" });
        }

        // Check event exists and is not completed
        const event = await Event.findById(_eventId);
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }
        if (event.status === "Completed") {
            return res.status(400).json({ message: "Registration closed for this event" });
        }

        // Check max teams limit
        if (event.maxTeams && event.teams >= event.maxTeams) {
            return res.status(400).json({ message: "This event is full" });
        }

        // Check duplicate registration
        const existing = await Teams.findOne({ event: _eventId, email });
        if (existing) {
            return res.status(400).json({ message: "This email is already registered for this event" });
        }

        const register = await Teams.create({
            teamname: _teamname,
            leadname: _leadname,
            members,
            collegeid: _collegeid,
            email,
            event: _eventId,
            registeredBy: req.user._id
        });

        await sendEventConfirmation({
            email,
            teamname: _teamname,
            leadname: _leadname,
            eventName: event.name
        });

        // Increment teams count on event
        await Event.findByIdAndUpdate(_eventId, { $inc: { teams: 1 } });

        res.status(201).json({
            success: true,
            message: "Team registered successfully",
            registration: register
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};


// ── GET ALL TEAMS FOR AN EVENT ──
export const getTeams = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid event ID" });
        }

        // Removed .populate() — caused MissingSchemaError
        // because User model is registered as "Users" not "user"
        const teams = await Teams.find({ event: id });

        res.status(200).json({
            success: true,
            count: teams.length,
            teams
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
};


// ── STUDENT OWN REGISTRATIONS ──
export const studentownregistration = async (req, res) => {
    try {
        const userId = req.user._id;

        // populate event — ref must match your Event model name exactly ("Event")
        const myregistration = await Teams.find({ registeredBy: userId })
            .populate("event", "name type status date venue prize");

        res.status(200).json({
            success: true,
            count: myregistration.length,
            myregistration
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
};


// ── CANCEL REGISTRATION ──
export const cancleregistration = async (req, res) => {
    try {
        const { tid } = req.params;

        if (!mongoose.Types.ObjectId.isValid(tid)) {
            return res.status(400).json({ message: "Invalid registration ID" });
        }

        const registered = await Teams.findById(tid);
        if (!registered) {
            return res.status(404).json({ message: "Registration not found" });
        }

        const isOwner = registered.registeredBy.toString() === req.user._id.toString();
        const isOrgOrFaculty = req.user.role === "Organiser" || req.user.role === "Faculty";

        if (!isOwner && !isOrgOrFaculty) {
            return res.status(403).json({ message: "Not authorized to cancel this registration" });
        }

        await Teams.findByIdAndDelete(tid);

        // Decrement teams count on event
        await Event.findByIdAndUpdate(registered.event, { $inc: { teams: -1 } });

        return res.status(200).json({
            success: true,
            message: "Registration cancelled successfully"
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
};
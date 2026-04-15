//student  event (Teams detail) registration controller 
import mongoose from "mongoose";
import Teams from "../model/registraton.model.js";
import Event from "../model/event.model.js";
import { sendEventConfirmation } from "../utils/sendemail.js";
import { registerevent } from "../validators/joi.validate.js";

import {
    cacheEventData,
    getCachedEventData,
    cacheRegistrationCount,
    getCachedRegistrationCount,
    getCachedUserEventRegistration,
    cacheUserEventRegistration,
    cacheEventTeams,
    getCachedEventTeams,
    cacheUserRegistrations,
    getCachedUserRegistrations,
    invalidateEventRegistrationCache,
    invalidateUserRegistrationCache
} from "../utils/redisHelper.js";

// REGISTER TEAM 
export const registerteam = async (req, res) => {
    try {

        if (!req.user || !req.user._id) {
            return res.status(401).json({
                success: false,
                message: "User not authenticated"
            });
        }

        const { teamname, teamName, leadname, leadName, members, collegeid, collegeId, phone, eventId } = req.body;

        const _teamname = teamname || teamName;
        const _leadname = leadname || leadName;
        const _collegeid = collegeid || collegeId;
        const _eventId = eventId || req.body.event;
        const _email = req.user.email;
        const _phone = phone;

        const { error, value } = registerevent.validate({
            teamname: _teamname,
            leadname: _leadname,
            members,
            collegeid: _collegeid,
            phone: _phone,
            eventId: _eventId
        }, { abortEarly: false });

        if (error) {
            const validationErrors = error.details.map(err => ({
                field: err.path.join('.'),
                message: err.message
            }));
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: validationErrors
            });
        }

        if (!mongoose.Types.ObjectId.isValid(_eventId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Event ID format"
            });
        }

        const cachedRegistration = await getCachedUserEventRegistration(_email, _eventId);
        if (cachedRegistration) {
            return res.status(409).json({
                success: false,
                message: "You have already registered for this event",
                existingRegistrationId: cachedRegistration._id
            });
        }

        let event = await getCachedEventData(_eventId);
        if (!event) {
            event = await Event.findById(_eventId);
            if (!event) {
                return res.status(404).json({
                    success: false,
                    message: "Event not found"
                });
            }
            await cacheEventData(_eventId, {
                _id: event._id,
                name: event.name,
                registatus: event.status,
                maxTeams: event.maxTeams,
                teams: event.teams
            });
        } else if (!event) {
            return res.status(404).json({
                success: false,
                message: "Event not found"
            });
        }

        if (event.status === "Completed") {
            return res.status(400).json({
                success: false,
                message: "Registration closed for this event",
                event: _eventId
            });
        }

        if (event.maxTeams) {
            let registrationsCount = await getCachedRegistrationCount(_eventId);

            if (registrationsCount === null) {
                registrationsCount = await Teams.countDocuments({ event: _eventId });
                await cacheRegistrationCount(_eventId, registrationsCount, 60);
            }

            if (registrationsCount >= event.maxTeams) {
                return res.status(400).json({
                    success: false,
                    message: "Event is full. No more teams can be registered",
                    maxTeams: event.maxTeams,
                    currentRegistrations: registrationsCount
                });
            }
        }
        const existingRegistration = await Teams.findOne({
            email: _email,
            event: _eventId
        });

        if (existingRegistration) {
            await cacheUserEventRegistration(_email, _eventId, existingRegistration._id);
            return res.status(409).json({
                success: false,
                message: "You have already registered for this event",
                existingRegistrationId: existingRegistration._id
            });
        }
        const register = await Teams.create({
            teamname: _teamname,
            leadname: _leadname,
            members,
            collegeid: _collegeid,
            email: _email,
            phone: _phone,
            event: _eventId,
            registeredBy: req.user._id,
            Registrationstatus: "Confirmed",
            paymentStatus: "pending",
            paymentAmount: null,
            paymentMethod: null,
            transactionId: null
        });
        await Event.findByIdAndUpdate(_eventId, { $inc: { teams: 1 } });

        await cacheUserEventRegistration(_email, _eventId, register._id);
        await invalidateEventRegistrationCache(_eventId);
        await invalidateUserRegistrationCache(req.user._id);
        try {
            await sendEventConfirmation({
                email: _email,
                teamname: _teamname,
                leadname: _leadname,
                eventName: event.name
            });
        } catch (emailError) {
            console.error("Email sending failed:", emailError);
        }

        res.status(200).json({
            success: true,
            message: "Team registered successfully",
            teamId: register._id,
            registration: register
        });

    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};


//  GET ALL TEAMS FOR AN EVENT 
export const getTeams = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid event ID"
            });
        }

        // TRY TO GET CACHED TEAMS FIRST
        const cachedTeams = await getCachedEventTeams(id);
        if (cachedTeams) {
            return res.status(200).json({
                success: true,
                count: cachedTeams.length,
                teams: cachedTeams,
                cached: true
            });
        }

        // CACHE MISS - QUERY DATABASE
        const teams = await Teams.find({ event: id });

        // CACHE THE RESULTS (2 minutes for list data)
        await cacheEventTeams(id, teams, 120);

        res.status(200).json({
            success: true,
            count: teams.length,
            teams,
            cached: false
        });

    } catch (error) {
        console.error("Get teams error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


// STUDENT OWN REGISTRATIONS 
export const studentownregistration = async (req, res) => {
    try {
        const userId = req.user._id;

        // TRY TO GET CACHED USER REGISTRATIONS
        const cachedRegistrations = await getCachedUserRegistrations(userId);
        if (cachedRegistrations) {
            return res.status(200).json({
                success: true,
                count: cachedRegistrations.length,
                myregistration: cachedRegistrations,
                cached: true
            });
        }

        // CACHE MISS - QUERY DATABASE
        const myregistration = await Teams.find({ registeredBy: userId })
            .populate("event", "name type status date venue prize");

        // CACHE THE RESULTS (5 minutes for user registrations)
        await cacheUserRegistrations(userId, myregistration, 300);

        res.status(200).json({
            success: true,
            count: myregistration.length,
            myregistration,
            cached: false
        });

    } catch (error) {
        console.error("Student registrations error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export const checkregistration = async (req, res) => {
    try {
        const email = req.user.email;
        const eventId = req.params.eventId;

        // VALIDATE EVENT ID FORMAT
        if (!mongoose.Types.ObjectId.isValid(eventId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Event ID format"
            });
        }

        // TRY TO GET CACHED REGISTRATION
        const cachedReg = await getCachedUserEventRegistration(email, eventId);
        if (cachedReg) {
            return res.status(200).json({
                success: true,
                message: "User is registered for this event",
                teamId: cachedReg._id,
                paymentStatus: cachedReg.paymentStatus || 'pending',
                cached: true
            });
        }

        // CACHE MISS - QUERY DATABASE
        const registered = await Teams.findOne({
            email,
            event: eventId
        });

        if (registered) {
            // Cache the result
            await cacheUserEventRegistration(email, eventId, registered._id);

            return res.status(200).json({
                success: true,
                message: "User is registered for this event",
                teamId: registered._id,
                paymentStatus: registered.paymentStatus || 'pending',
                cached: false
            });
        }

        return res.status(200).json({
            success: false,
            message: "Not registered for this event"
        });
    } catch (error) {
        console.error('Registration check error:', error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// CANCEL REGISTRATION 
export const cancleregistration = async (req, res) => {
    try {
        const { tid } = req.params;

        if (!mongoose.Types.ObjectId.isValid(tid)) {
            return res.status(400).json({
                success: false,
                message: "Invalid registration ID"
            });
        }

        const registered = await Teams.findById(tid);
        if (!registered) {
            return res.status(404).json({
                success: false,
                message: "Registration not found"
            });
        }

        const isOwner = registered.registeredBy.toString() === req.user._id.toString();
        const isOrgOrFaculty = req.user.role === "Organiser" || req.user.role === "Faculty";

        if (!isOwner && !isOrgOrFaculty) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to cancel this registration"
            });
        }

        await Teams.findByIdAndDelete(tid);

        // DECREMENT TEAMS COUNT ON EVENT
        await Event.findByIdAndUpdate(registered.event, { $inc: { teams: -1 } });

        // INVALIDATE ALL RELATED CACHES
        await invalidateEventRegistrationCache(registered.event);
        await invalidateUserRegistrationCache(registered.registeredBy);

        return res.status(200).json({
            success: true,
            message: "Registration cancelled successfully"
        });

    } catch (error) {
        console.error("Cancel registration error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

//approve registration
export const Approveregistratation = async (req, res) => {
    try {
        const { registrationId } = req.params
        const registration = await Teams.findById(registrationId)
        if (!registration) {
            return res.status(404).json({
                success: false,
                message: "Registration not found"
            })
        }

        // Check if user is event organizer
        const event = await Event.findById(registration.event)
        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Event not found"
            });
        }
        if (event.createdBy.toString() !== req.user._id.toString() && req.user.role !== "Admin") {
            return res.status(403).json({
                success: false,
                message: "Unauthorized: Only event organizer can approve"
            });
        }

        registration.Registrationstatus = "Approved"
        registration.approvedAt = new Date()
        await registration.save()
        return res.status(200).json({
            success: true,
            message: "Registration approved successfully",
            registration,
            Registrationstatus: "Approved",
            approvedAt: registration.approvedAt
        });


    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

//reject registration
export const Rejectregistration = async (req, res) => {
    try {
        const { registrationId } = req.params
        const { reason, notes } = req.body

        const registration = await Teams.findById(registrationId)
        if (!registration) {
            return res.status(404).json({
                success: false,
                message: "Registration not found"
            })
        }

        // Check if user is event organizer
        const event = await Event.findById(registration.event)
        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Event not found"
            });
        }
        if (event.createdBy.toString() !== req.user._id.toString() && req.user.role !== "Admin") {
            return res.status(403).json({
                success: false,
                message: "Unauthorized: Only event organizer can reject"
            });
        }

        registration.Registrationstatus = "Rejected"
        registration.rejectionReason = reason || null
        registration.rejectionNotes = notes || null
        registration.rejectedAt = new Date()
        await registration.save()
        return res.status(200).json({
            success: true,
            message: "Registration rejected successfully",
            registration,
            Registrationstatus: "Rejected",
            rejectionReason: registration.rejectionReason,
            rejectionNotes: registration.rejectionNotes,
            rejectedAt: registration.rejectedAt
        });


    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

// GET ALL REGISTRATIONS FOR AN EVENT (Frontend endpoint)
export const getRegistrationsByEvent = async (req, res) => {
    try {
        const { eventId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(eventId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid event ID"
            });
        }

        // Check if event exists
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Event not found"
            });
        }

        // Fetch all registrations for the event
        const registrations = await Teams.find({ event: eventId }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: registrations.length,
            registrations
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

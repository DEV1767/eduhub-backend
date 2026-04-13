
//student  event (Teams detail) registration controller 
import mongoose from "mongoose";
import Teams from "../model/registraton.model.js";
import Event from "../model/event.model.js";
import { sendEventConfirmation } from "../utils/sendemail.js";

// REGISTER TEAM 
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


//  GET ALL TEAMS FOR AN EVENT 
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


// STUDENT OWN REGISTRATIONS 
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

// CANCEL REGISTRATION 
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
        
        registration.status = "Approved"
        registration.approvedAt = new Date()
        await registration.save()
        return res.status(200).json({
            success: true,
            message: "Registration approved successfully",
            registration,
            status: "Approved",
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
        
        registration.status = "Rejected"
        registration.rejectionReason = reason || null
        registration.rejectionNotes = notes || null
        registration.rejectedAt = new Date()
        await registration.save()
        return res.status(200).json({
            success: true,
            message: "Registration rejected successfully",
            registration,
            status: "Rejected",
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

        // Format response with proper camelCase field names
        const formattedRegistrations = registrations.map(reg => ({
            _id: reg._id,
            eventId: reg.event,
            teamName: reg.teamname,
            leadName: reg.leadname,
            email: reg.email,
            phone: reg.phone || null,
            members: reg.members,
            collegeId: reg.collegeid,
            status: reg.status,
            paymentStatus: reg.paymentStatus,
            paymentAmount: reg.paymentAmount,
            paymentMethod: reg.paymentMethod,
            transactionId: reg.transactionId,
            paymentDate: reg.paymentDate,
            createdAt: reg.createdAt,
            approvedAt: reg.approvedAt,
            rejectionReason: reg.rejectionReason,
            rejectionNotes: reg.rejectionNotes,
            rejectedAt: reg.rejectedAt
        }));

        return res.status(200).json({
            success: true,
            count: formattedRegistrations.length,
            registrations: formattedRegistrations
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

// UPDATE PAYMENT STATUS FOR REGISTRATION
export const updatePaymentStatus = async (req, res) => {
    try {
        const { registrationId } = req.params;
        const { status, amount, method, transactionId, date } = req.body;

        // Validate registrationId
        if (!mongoose.Types.ObjectId.isValid(registrationId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid registration ID"
            });
        }

        // Validate payment status
        const validStatuses = ["Pending", "Paid", "Failed"];
        if (status && !validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment status. Must be 'Pending', 'Paid', or 'Failed'"
            });
        }

        // Find registration
        const registration = await Teams.findById(registrationId);
        if (!registration) {
            return res.status(404).json({
                success: false,
                message: "Registration not found"
            });
        }

        // Check authorization (only event organiser can update payment)
        const event = await Event.findById(registration.event);
        if (event.createdBy.toString() !== req.user._id.toString() && req.user.role !== "Admin") {
            return res.status(403).json({
                success: false,
                message: "Unauthorized: Only event organiser can update payment"
            });
        }

        // Update payment fields
        if (status) registration.paymentStatus = status;
        if (amount) registration.paymentAmount = amount;
        if (method) registration.paymentMethod = method;
        if (transactionId) registration.transactionId = transactionId;
        if (date) registration.paymentDate = new Date(date);

        await registration.save();

        return res.status(200).json({
            success: true,
            message: "Payment status updated successfully",
            registration: {
                _id: registration._id,
                paymentStatus: registration.paymentStatus,
                paymentAmount: registration.paymentAmount,
                paymentMethod: registration.paymentMethod,
                transactionId: registration.transactionId,
                paymentDate: registration.paymentDate
            }
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

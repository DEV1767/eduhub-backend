//schedule controller for event schedule details
import mongoose from "mongoose";
import Schedule from "../model/schedule.model.js";
import Event from "../model/event.model.js";


// ── ADD SLOT ──
export const addslot = async (req, res) => {
    try {
        const { eventId } = req.params;
        const { title, starttime, endtime, description, order } = req.body;

        if (!mongoose.Types.ObjectId.isValid(eventId)) {
            return res.status(400).json({ message: "Invalid event ID" });
        }

        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        const slot = await Schedule.create({
            title,
            starttime,
            endtime,
            description,
            order,
            event: eventId,
            createdBy: req.user._id
        });

        res.status(201).json({
            success: true,
            message: "Slot added successfully",
            slot
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
};


// ── GET SCHEDULE ──
export const getschedule = async (req, res) => {
    try {
        console.log("hitted")
        const { eventId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(eventId)) {
            return res.status(400).json({ message: "Invalid event ID" });
        }

        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        const schedule = await Schedule.find({ event: eventId })
            .sort({ order: 1, starttime: 1 });

        res.status(200).json({
            success: true,
            count: schedule.length,
            schedule
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
};


// ── UPDATE SLOT ──
export const updateslot = async (req, res) => {
    try {
        const { slotId } = req.params;
        const { title, starttime, endtime, description, order } = req.body;

        if (!mongoose.Types.ObjectId.isValid(slotId)) {
            return res.status(400).json({ message: "Invalid slot ID" });
        }

        const slot = await Schedule.findById(slotId);
        if (!slot) {
            return res.status(404).json({ message: "Slot not found" });
        }

        const updated = await Schedule.findByIdAndUpdate(
            slotId,
            { title, starttime, endtime, description, order },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: "Slot updated successfully",
            slot: updated
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
};


// ── DELETE SLOT ──
export const deleteslot = async (req, res) => {
    try {
        const { slotId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(slotId)) {
            return res.status(400).json({ message: "Invalid slot ID" });
        }

        const slot = await Schedule.findById(slotId);
        if (!slot) {
            return res.status(404).json({ message: "Slot not found" });
        }

        await Schedule.findByIdAndDelete(slotId);

        res.status(200).json({
            success: true,
            message: "Slot deleted successfully"
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
};
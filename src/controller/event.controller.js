
//Event Controller for create event, get event, update and delete
import mongoose from "mongoose";
import Event from "../model/event.model.js";


//create_Event
export const Createevent = async (req, res) => {
    try {
        const {
            name,
            type,
            status,
            date,
            time,
            venue,
            maxTeams,
            prize,
            description,
        } = req.body;

        //  Check required fields only
        if (!name || !type || !date) {
            return res.status(400).json({
                message: "Name, type and date are required"
            });
        }

        //  Check user authentication
        if (!req.user) {
            return res.status(401).json({
                message: "Unauthorized"
            });
        }

        const event = await Event.create({
            name,
            type,
            status,
            date,
            time,
            venue,
            maxTeams,
            prize,
            description,
            collegename: req.user.collegename,
            createdBy: req.user._id
        });

        res.status(201).json({
            success: true,
            message: "Event created successfully",
            event
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
};


//get_all_event
export const getevent = async (req, res) => {
    try {
        const events = await Event.find({ collegename: req.user.collegename })
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: events.length,
            events
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
};

//get_single_event
export const getsingleevent = async (req, res) => {
    try {
        const { id } = req.params
        const event = await Event.findById(id)
        if (!event) {
            return res.status(404).json({
                message: "Event not found"
            })
        }
        res.status(200).json({
            success: true,
            event
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Internal servel error"

        })
    }
}

//update_event
export const updateevent = async (req, res) => {
    try {
        const { id } = req.params
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(200).json({
                message: "Invalid Event id"
            })
        }
        const event = await Event.findByIdAndUpdate(
            id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        )
        if (!event) {
            return res.status(400).json({
                message: "Event not found"
            })
        }
        res.status(200).json({
            message: "Updated successfully",
            event
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Internal server error"
        })
    }
}

//deleteevent
export const deleteevent = async (req, res) => {
    try {
        const { id } = req.params
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid Event ID"
            });
        }
        const event = await Event.findById(id)
        if (!event) {
            return res.status(404).json({
                message: "Event not found"
            })
        }
        await Event.findByIdAndDelete(id);
        return res.status(200).json({
            message: "Event deleted successfully"
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Internal server error"
        })
    }
}
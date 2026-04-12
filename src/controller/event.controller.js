
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


//get_all_event(Ai-help)
export const getevent = async (req, res) => {
    try {
        const { search, type, status, startDate, endDate, page, limit } = req.query;

        // Base filter - always filter by college
        const filter = {
            collegename: req.user.collegename
        };

        // Search by event name
        if (search) {
            filter.name = { $regex: search, $options: "i" };
        }

        // Filter by event type
        if (type) {
            filter.type = type;
        }

        // Filter by event status
        if (status) {
            filter.status = status;
        }

        // Filter by date range
        if (startDate || endDate) {
            filter.date = {};
            if (startDate) filter.date.$gte = new Date(startDate);
            if (endDate) filter.date.$lte = new Date(endDate);
        }

        // Pagination
        const currentPage = parseInt(page) || 1;
        const pageLimit = parseInt(limit) || 10;
        const skip = (currentPage - 1) * pageLimit;

        // Get total count and events
        const totalEvents = await Event.countDocuments(filter);
        const events = await Event.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(pageLimit);

        return res.status(200).json({
            success: true,
            totalEvents,
            totalPages: Math.ceil(totalEvents / pageLimit),
            currentPage,
            count: events.length,
            events
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
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
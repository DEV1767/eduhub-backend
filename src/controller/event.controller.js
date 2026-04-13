
//Event Controller for create event, get event, update and delete
import mongoose from "mongoose";
import Event from "../model/event.model.js";
import Teams from "../model/registraton.model.js"
import { cacheEvent, getCachedEvent, invalidateCollegeEventCache } from "../utils/redisHelper.js"
import { EventRules } from "../validators/joi.validate.js";
import { cacheEventRules, cacheEventInfo } from "../utils/redisHelper.js";



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

        // Invalidate event cache when new event is created
        await invalidateCollegeEventCache(req.user.collegename);

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

        // Check Redis cache first
        let cachedData = await getCachedEvent(req.user.collegename, filter);

        if (cachedData) {
            return res.status(200).json({
                success: true,
                totalEvents: cachedData.totalEvents,
                totalPages: cachedData.totalPages,
                currentPage: cachedData.currentPage,
                count: cachedData.count,
                events: cachedData.events,
                source: "cache"
            });
        }

        // Cache miss - fetch from database
        const totalEvents = await Event.countDocuments(filter);
        const events = await Event.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(pageLimit);

        // Cache the result for 5 minutes
        const responseData = {
            totalEvents,
            totalPages: Math.ceil(totalEvents / pageLimit),
            currentPage,
            count: events.length,
            events
        };
        await cacheEvent(req.user.collegename, filter, responseData, 300);

        return res.status(200).json({
            success: true,
            ...responseData
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

//adding rules
export const eventRules = async (req, res) => {
    try {
        const { eventId } = req.params;
        const { error, value } = EventRules.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Event not found"
            });
        }
        if (event.createdBy.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized: Only event owner can update info"
            });
        }

        const { rules, rulesVisible } = value;

        event.rules = rules;
        event.rulesVisible = rulesVisible;

        await event.save();

        await cacheEventRules(event.rules, event.rulesVisible, eventId);

        return res.status(200).json({
            success: true,
            message: "Event rules updated successfully",
            data: event
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

//adding info
export const updateEventInfo = async (req, res) => {
    try {
        const { eventId } = req.params;
        const infoData = req.body;
        const event = await Event.findById(eventId);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Event not found"
            });
        }
        if (event.createdBy.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized: Only event owner can update info"
            });
        }
        event.info = infoData;
        await event.save();

        await cacheEventInfo(eventId, event.info);

        return res.status(200).json({
            success: true,
            message: "Event info updated successfully",
            event,
            info: event.info
        });

    } catch (error) {
        console.error("Update Event Info Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};



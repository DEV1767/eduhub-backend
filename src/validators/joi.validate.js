
//joi validator

import joi from "joi"

export const createeventschema = joi.object({
    name: joi.string().min(3).required(),
    type: joi.string().valid("Hackathon", "Quiz", "Cultural", "Techtalk", "Sports").required(),
    status: joi.string().valid("Upcoming", "Live", "Completed").optional(),
    date: joi.date().required(),
    time: joi.string().optional(),
    venue: joi.string().optional(),
    maxTeams: joi.number().min(1).optional(),
    prize: joi.string().optional(),
    description: joi.string().optional()

})

export const registerevent = joi.object({
    teamname: joi.string().min(3).required(),
    leadname: joi.string().min(2).required(),
    members: joi.array().items(joi.string().min(2)).min(1).max(5).required(),
    collegeid: joi.string().required(),
    email: joi.string().email().required(),
    eventId: joi.string().required(),
})

export const Schedulevalidator = joi.object({
    title: joi.string().min(4).required(),
    starttime: joi.string().required(),
    endtime: joi.string().optional(),
    description: joi.string().optional(),
    order: joi.number().optional()
})



//joi validator

import joi from "joi"


export const registeruserSchema = joi.object({
    firstname: joi.string().min(5).required(),
    lastname: joi.string(),
    email: joi.string().email().required(),
    role: joi.string().valid("Student", "Faculty", "Organiser").default("Student"),
    collegename: joi.string().min(5).required(),
    password: joi.string().min(6).pattern(/[a-zA-Z0-9]/).required()
});

export const loginuserSchema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().required()
});

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

export const EventRules = joi.object({
    rules: joi.string().min(3).required(),
    rulesVisible: joi.boolean().required()
});

export const EventCoordinator = joi.object({
    name: joi.string().min(4).required(),
    phone: joi.string().min(10).required(), 
    email: joi.string().email().required()
});

export const EventInfoLink = joi.object({
    label: joi.string().min(2).required(), 
    url: joi.string().uri().required()
});

export const EventFaqInfoSchema = joi.object({
    q: joi.string().min(3).required(),
    a: joi.string().min(3).required()
});

export const EventInfoSchema = joi.object({
    description: joi.string().min(10).required(),
    eligibility: joi.string().allow(""),

    coordinator: EventCoordinator.required(), 

    links: joi.array().items(EventInfoLink).default([]), 

    faqs: joi.array().items(EventFaqInfoSchema).default([]) 
});
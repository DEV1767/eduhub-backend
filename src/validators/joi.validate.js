
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
    teamname: joi.string()
        .min(3)
        .max(50)
        .pattern(/^[a-zA-Z0-9\s\-_]+$/)
        .required()
        .messages({
            'string.pattern.base': 'Team name can only contain letters, numbers, spaces, hyphens, and underscores',
            'string.min': 'Team name must be at least 3 characters',
            'string.max': 'Team name cannot exceed 50 characters'
        }),
    leadname: joi.string()
        .min(2)
        .max(50)
        .pattern(/^[a-zA-Z\s]+$/)
        .required()
        .messages({
            'string.pattern.base': 'Lead name can only contain letters and spaces',
            'string.min': 'Lead name must be at least 2 characters',
            'string.max': 'Lead name cannot exceed 50 characters'
        }),
    phone: joi.string()
        .pattern(/^\d{10}$/)
        .required()
        .messages({
            'string.pattern.base': 'Phone must be exactly 10 digits'
        }),
    members: joi.array()
        .items(joi.string().min(2))
        .min(1)
        .max(5)
        .required()
        .messages({
            'array.min': 'At least 1 member is required',
            'array.max': 'Maximum 5 members allowed',
            'array.includes': 'Each member name must be at least 2 characters'
        }),
    collegeid: joi.string()
        .min(6)
        .pattern(/^[a-zA-Z0-9]+$/)
        .required()
        .messages({
            'string.min': 'College ID must be at least 6 characters',
            'string.pattern.base': 'College ID can only contain letters and numbers'
        }),
    eventId: joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
            'string.pattern.base': 'Invalid Event ID format'
        }),
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
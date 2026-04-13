
import redisClient from "../config/redis.js"


export const cacheUserSession = async (userId, userData) => {
    try {
        const key = `user:${userId}`
        await redisClient.setEx(key, 3600, JSON.stringify(userData))

    } catch (error) {
        console.error("Redis cacheUsersession error :", error.message);
    }
}

export const getCachedUserSession = async (userId) => {
    try {
        const key = `user:${userId}`;
        const data = await redisClient.get(key)
        return data ? JSON.parse(data) : null
    } catch (error) {
        console.error("Redis getCachedUserSession error: ", error.message)
        return null
    }
}

export const cacheOTP = async (email, otp, ttl = 300) => {
    try {
        const key = `otp:${email}`
        await redisClient.setEx(key, ttl, String(otp))
    } catch (error) {
        console.error("Redis OTP: ", error.message)
    }
}

export const getOTP = async (email) => {
    try {
        const key = `otp:${email}`
        return await redisClient.get(key)
    } catch (error) {
        console.error("Redis getOTP error :", error.message)
    }
}

export const clearOTP = async (email) => {
    try {
        const key = `otp:${email}`
        await redisClient.del(key)

    } catch (error) {
        console.error("Redis clearOTP error:", error.message)
    }
}

export const cacheEvent = async (collegename, filters, data, ttl = 300) => {
    try {
        const key = `events:${collegename}:${JSON.stringify(filters)}`
        await redisClient.setEx(key, ttl, JSON.stringify(data))
    } catch (error) {
        console.error("Redis cacheEvent error:", error.message)
    }
}

export const getCachedEvent = async (collegename, filters) => {
    try {
        const key = `events:${collegename}:${JSON.stringify(filters)}`
        const data = await redisClient.get(key)
        return data ? JSON.parse(data) : null
    } catch (error) {
        console.error(" Redis getcacheEvent error ", error.message)
    }
}

export const invalidateCollegeEventCache = async (collegename) => {
    try {
        let cursor = 0;
        do {
            const result = await redisClient.scan(cursor, {
                MATCH: `events:${collegename}:*`,
                COUNT: 100,
            });
            cursor = result.cursor;
            if (result.keys.length > 0) {
                await redisClient.del(result.keys);
            }
        } while (cursor !== 0);
    } catch (error) {
        console.error("Redis invalidateCollegeEventCache error:", error.message);
    }
};

export const cacheSchedule = async (eventId, data, ttl = 300) => {
    try {
        const key = `schedule:${eventId}`
        await redisClient.setEx(key, ttl, JSON.stringify(data))
    } catch (error) {
        console.error("Redis cacheSchedule error: ", error.message)
    }
}

export const getCachedSchedule = async (eventId) => {
    try {
        const key = `schedule:${eventId}`
        const data = await redisClient.get(key)
        return data ? JSON.parse(data) : null
    } catch (error) {
        console.error("Redis getcacheSchedule error:", error.message)
    }
}

export const invalidateScheduleCache = async (eventId) => {
    try {
        const key = `schedule:${eventId}`;
        await redisClient.del(key);
    } catch (error) {
        console.error("Redis invalidateScheduleCache error:", error.message);
    }
};

export const cacheEventRules = async (rules, rulesVisible, eventId) => {
    try {
        const key = `event:${eventId}:rules`;

        await redisClient.set(
            key,
            JSON.stringify({
                rules,
                rulesVisible
            }),
            "EX",
            60 * 60
        );

    } catch (err) {
        console.error("Redis Cache Error:", err);
    }
};

export const cacheEventInfo = async (eventId, info) => {
    try {
        const key = `event:${eventId}:info`;

        await redisClient.set(
            key,
            JSON.stringify(info),
            "EX",
            60 * 60 
        );

    } catch (error) {
        console.error("Redis cache error:", error);
    }
};


export const cacheEventData = async (eventId, eventData, ttl = 300) => {
    try {
        const key = `event:${eventId}:data`;
        await redisClient.setEx(key, ttl, JSON.stringify(eventData));
    } catch (error) {
        console.error("Redis cacheEventData error:", error.message);
    }
};

// Get cached event data
export const getCachedEventData = async (eventId) => {
    try {
        const key = `event:${eventId}:data`;
        const data = await redisClient.get(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error("Redis getCachedEventData error:", error.message);
        return null;
    }
};

// Cache registration count per event (updated frequently)
export const cacheRegistrationCount = async (eventId, count, ttl = 60) => {
    try {
        const key = `event:${eventId}:registration_count`;
        await redisClient.setEx(key, ttl, String(count));
    } catch (error) {
        console.error("Redis cacheRegistrationCount error:", error.message);
    }
};

// Get cached registration count
export const getCachedRegistrationCount = async (eventId) => {
    try {
        const key = `event:${eventId}:registration_count`;
        const count = await redisClient.get(key);
        return count ? parseInt(count) : null;
    } catch (error) {
        console.error("Redis getCachedRegistrationCount error:", error.message);
        return null;
    }
};

// Cache user registrations (for checking duplicates)
export const cacheUserEventRegistration = async (email, eventId, registrationId, ttl = 600) => {
    try {
        const key = `registration:${email}:${eventId}`;
        await redisClient.setEx(key, ttl, JSON.stringify({ _id: registrationId, email, event: eventId }));
    } catch (error) {
        console.error("Redis cacheUserEventRegistration error:", error.message);
    }
};

// Get cached user registration for event
export const getCachedUserEventRegistration = async (email, eventId) => {
    try {
        const key = `registration:${email}:${eventId}`;
        const data = await redisClient.get(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error("Redis getCachedUserEventRegistration error:", error.message);
        return null;
    }
};

// Cache all teams for an event
export const cacheEventTeams = async (eventId, teamsData, ttl = 120) => {
    try {
        const key = `event:${eventId}:teams`;
        await redisClient.setEx(key, ttl, JSON.stringify(teamsData));
    } catch (error) {
        console.error("Redis cacheEventTeams error:", error.message);
    }
};

// Get cached teams for event
export const getCachedEventTeams = async (eventId) => {
    try {
        const key = `event:${eventId}:teams`;
        const data = await redisClient.get(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error("Redis getCachedEventTeams error:", error.message);
        return null;
    }
};

// Cache user's registrations
export const cacheUserRegistrations = async (userId, registrationsData, ttl = 300) => {
    try {
        const key = `user:${userId}:registrations`;
        await redisClient.setEx(key, ttl, JSON.stringify(registrationsData));
    } catch (error) {
        console.error("Redis cacheUserRegistrations error:", error.message);
    }
};

// Get cached user registrations
export const getCachedUserRegistrations = async (userId) => {
    try {
        const key = `user:${userId}:registrations`;
        const data = await redisClient.get(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error("Redis getCachedUserRegistrations error:", error.message);
        return null;
    }
};

// Invalidate all registration-related caches for an event
export const invalidateEventRegistrationCache = async (eventId) => {
    try {
        const patterns = [
            `event:${eventId}:data`,
            `event:${eventId}:registration_count`,
            `event:${eventId}:teams`,
            `registration:*:${eventId}`
        ];
        
        for (const pattern of patterns) {
            let cursor = 0;
            do {
                const result = await redisClient.scan(cursor, {
                    MATCH: pattern,
                    COUNT: 100,
                });
                cursor = result.cursor;
                if (result.keys.length > 0) {
                    await redisClient.del(result.keys);
                }
            } while (cursor !== 0);
        }
    } catch (error) {
        console.error("Redis invalidateEventRegistrationCache error:", error.message);
    }
};

// Invalidate user's registration cache
export const invalidateUserRegistrationCache = async (userId) => {
    try {
        const key = `user:${userId}:registrations`;
        await redisClient.del(key);
    } catch (error) {
        console.error("Redis invalidateUserRegistrationCache error:", error.message);
    }
};

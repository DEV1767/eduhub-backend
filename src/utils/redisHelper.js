

import { concat } from "ethers";
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

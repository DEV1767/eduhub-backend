
import redisClient from "../config/redis.js"


export const cacheUsersession = async (userId, userData) => {
    try {
        const key = `user:${userId}`
        await redisClient.setEx(key, 3600, JSON.stringify(userData))

    } catch (error) {
        console.log("Redis cacheUsersession error :", error.message);
    }
}


export const getCachedUserSession = async (userId) => {
    try {
        const key = `user:${userId}`;
        const data = await redisClient.get(key)
        return data ? JSON.parse(data) : null
    } catch (error) {
        console.log("Redis getCachedUserSession error: ", error.message)
        return null
    }
}

export const cacheOTP = async (email, otp, ttl = 300) => {
    try {
        const key = `otp:${email}`
        await redisClient.setEx(key, ttl, String(otp))
    } catch (error) {
        console.log("Redis OTP: ", error.message)
    }
}

export const getOTp = async (email) => {
    try {
        const key = `otp:${email}`
        return await redisClient.get(key)
    } catch (error) {
        console.log("Redis getOTP error :", error.message)
    }
}

export const clearOTP = async (email) => {
    try {
        const key = `otp:${email}`
        await redisClient.del(key)

    } catch (error) {
        console.log("Redis clearOTP error:", error.message)
    }
}



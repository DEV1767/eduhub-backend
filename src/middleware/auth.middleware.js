//Authentication middleware for login ,check and verify jwt cookies
import jwt from "jsonwebtoken";
import Users from "../model/user.model.js";
import { connect_db } from "../model/db.js";

export const authMiddleware = async (req, res, next) => {
    try {
        console.log("Auth middleware:", {
            origin: req.headers.origin,
            hasCookieHeader: Boolean(req.headers.cookie),
            hasAccessTokenCookie: Boolean(req.cookies?.accessToken),
            hasBearerHeader: Boolean(req.headers.authorization?.startsWith("Bearer "))
        });
       
        let token;

        if (req.cookies?.accessToken) {
            token = req.cookies.accessToken;
        } else if (req.headers.authorization?.startsWith("Bearer ")) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized — no token provided"
            });
        }

        const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
        if (!accessTokenSecret) {
            console.error("ACCESS_TOKEN_SECRET is missing in environment");
            return res.status(500).json({
                success: false,
                message: "Server auth configuration error"
            });
        }

        const unverifiedPayload = jwt.decode(token);
        console.log("Auth token payload:", {
            userId: unverifiedPayload?._id,
            exp: unverifiedPayload?.exp,
            now: Math.floor(Date.now() / 1000)
        });

        const decoded = jwt.verify(token, accessTokenSecret);

        await connect_db();
        const user = await Users.findById(decoded._id).select("-password -refreshToken");

        console.log("Auth user lookup:", {
            decodedUserId: decoded?._id,
            userFound: Boolean(user)
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized — user no longer exists"
            });
        }

        req.user = user;
        next();

    } catch (error) {
        console.error("Auth middleware error:", {
            name: error.name,
            message: error.message
        });
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Session expired — please login again"
            });
        }
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({
                success: false,
                message: "Invalid token — please login again"
            });
        }
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};
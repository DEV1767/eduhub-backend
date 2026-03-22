
//Authentication middleware for login ,check and verify jwt cookies
import jwt from "jsonwebtoken";
import Users from "../model/user.model.js";

export const authMiddleware = async (req, res, next) => {
    try {
       
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

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await Users.findById(decoded._id).select("-password -refreshToken");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized — user no longer exists"
            });
        }

        req.user = user;
        next();

    } catch (error) {
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
        return res.status(401).json({
            success: false,
            message: "Unauthorized"
        });
    }
};
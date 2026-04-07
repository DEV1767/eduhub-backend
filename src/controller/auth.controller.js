// Authentication controller for login, register etc
import Users from "../model/user.model.js";
import { generateTokens } from "../utils/generateTokens.js";
import jwt from "jsonwebtoken";
import { connect_db } from "../model/db.js";

const isHostedDeployment =
    process.env.NODE_ENV === "production" ||
    process.env.VERCEL === "1" ||
    process.env.VERCEL === "true";

const cookieSecure = process.env.COOKIE_SECURE
    ? process.env.COOKIE_SECURE === "true"
    : isHostedDeployment;

const requestedSameSite = (process.env.COOKIE_SAME_SITE || (cookieSecure ? "none" : "lax")).toLowerCase();
const allowedSameSiteValues = ["lax", "strict", "none"];
const safeSameSite = allowedSameSiteValues.includes(requestedSameSite) ? requestedSameSite : "lax";

// sameSite=none is only valid with secure=true in modern browsers.
const cookieSameSite = safeSameSite === "none" && !cookieSecure ? "lax" : safeSameSite;
const shouldUsePartitionedCookies =
    process.env.COOKIE_PARTITIONED === "true" && cookieSecure && cookieSameSite === "none";

// Shared auth cookie options for cross-site frontend + API deployments.
const baseCookieOptions = {
    httpOnly: true,
    secure: cookieSecure,
    sameSite: cookieSameSite,
    path: '/',
    ...(shouldUsePartitionedCookies ? { partitioned: true } : {})
};

const accessCookieOptions = {
    ...baseCookieOptions,
    maxAge: 15 * 60 * 1000
};

const refreshCookieOptions = {
    ...baseCookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000
};

const setAuthCookies = (res, accessToken, refreshToken) => {
    console.log("Setting auth cookies:", {
        secure: accessCookieOptions.secure,
        sameSite: accessCookieOptions.sameSite,
        partitioned: Boolean(baseCookieOptions.partitioned),
        accessMaxAge: accessCookieOptions.maxAge,
        refreshMaxAge: refreshCookieOptions.maxAge
    });
    return res
        .cookie("accessToken", accessToken, accessCookieOptions)
        .cookie("refreshToken", refreshToken, refreshCookieOptions);
};

const clearAuthCookies = (res) => {
    return res
        .clearCookie("accessToken", baseCookieOptions)
        .clearCookie("refreshToken", baseCookieOptions);
};

// REGISTER 
export const registerUser = async (req, res) => {
    try {
        await connect_db(); // ✅ Added connection here too
        console.log("Register request:", {
            origin: req.headers.origin,
            hasCookies: Boolean(req.headers.cookie),
            cookieHeaderLength: req.headers.cookie?.length || 0
        });

        const { firstname, lastname, email, role, collegename, password } = req.body;

        if (!firstname || !email || !collegename || !password) {
            return res.status(400).json({
                success: false,
                message: "Required fields missing"
            });
        }

        const existingUser = await Users.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists with this email"
            });
        }

        const newUser = await Users.create({
            firstname,
            lastname,
            email,
            collegename,
            role: role || "Student",
            password
        });

        // Auto login after register — generate tokens and set cookies
        const { accessToken, refreshToken } = await generateTokens(newUser._id);

        return setAuthCookies(res.status(201), accessToken, refreshToken)
            .json({
                success: true,
                message: "Registered successfully",
                user: {
                    _id: newUser._id,
                    firstname: newUser.firstname,
                    lastname: newUser.lastname,
                    email: newUser.email,
                    role: newUser.role,
                    collegename: newUser.collegename
                }
            });

    } catch (error) {
        console.error("Register error:", error);
        return res.status(500).json({
            success: false,
            message: "Registration failed",
            error: error.message
        });
    }
};

// LOGIN 
export const loginUser = async (req, res) => {
    try {
        await connect_db();
        console.log("Login request:", {
            origin: req.headers.origin,
            hasCookies: Boolean(req.headers.cookie),
            cookieHeaderLength: req.headers.cookie?.length || 0
        });
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        const user = await Users.findOne({ email }).select("+password");
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "No account found with this email"
            });
        }

        const isMatch = await user.isPasswordCorrect(password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Incorrect password"
            });
        }

        const { accessToken, refreshToken } = await generateTokens(user._id);

        const loggedInUser = await Users.findById(user._id).select("-password -refreshToken");

        return setAuthCookies(res.status(200), accessToken, refreshToken)
            .json({
                success: true,
                message: "Login successful",
                user: loggedInUser
            });

    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({
            success: false,
            message: "Login failed",
            error: error.message
        });
    }
};


//  LOGOUT 
export const logoutUser = async (req, res) => {
    try {
        // Clear refresh token from DB
        await Users.findByIdAndUpdate(req.user._id, {
            $unset: { refreshToken: 1 }
        });

        return clearAuthCookies(res.status(200))
            .json({
                success: true,
                message: "Logged out successfully"
            });

    } catch (error) {
        console.error("Logout error:", error);
        return res.status(500).json({
            success: false,
            message: "Logout failed"
        });
    }
};

//  GET CURRENT USER 
export const getMe = async (req, res) => {
    try {
        const user = await Users.findById(req.user._id);
        return res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Could not fetch user"
        });
    }
};

// Get refreshToken
export const refreshAccessToken = async (req, res) => {
    try {
        const incomingrefreshToken = req.cookies?.refreshToken;
        console.log("Refresh request:", {
            origin: req.headers.origin,
            hasCookieHeader: Boolean(req.headers.cookie),
            hasRefreshTokenCookie: Boolean(incomingrefreshToken)
        });
        if (!incomingrefreshToken) {
            return res.status(403).json({
                message: "Refresh Token is missing"
            })
        }

        const decode = jwt.verify(
            incomingrefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
        const user = await Users.findById(decode._id).select("+refreshToken")
        if (!user || user.refreshToken !== incomingrefreshToken) {
            return res.status(401).json({
                message: "Invalid refresh Token"
            })
        }
        const { accessToken, refreshToken } = await generateTokens(user._id);

        return setAuthCookies(res.status(200), accessToken, refreshToken)
            .json({
                success: true,
                message: "Access token refreshed successfully",
                accessToken
            })
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                message: "Refresh token expired, please login again"
            })
        }
        return res.status(500).json({
            message: "Internal server error"
        })
    }
}
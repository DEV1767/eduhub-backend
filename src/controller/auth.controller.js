

//Authentication controller for login ,register etc
import Users from "../model/user.model.js";
import { generateTokens } from "../utils/generateTokens.js";

// ── COOKIE OPTIONS ──
const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

// ── REGISTER ──
export const registerUser = async (req, res) => {
    try {
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

        return res.status(201)
            .cookie("accessToken", accessToken, cookieOptions)
            .cookie("refreshToken", refreshToken, cookieOptions)
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


// ── LOGIN ──
export const loginUser = async (req, res) => {
    try {
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

        return res.status(200)
            .cookie("accessToken", accessToken, cookieOptions)
            .cookie("refreshToken", refreshToken, cookieOptions)
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


// ── LOGOUT ──
export const logoutUser = async (req, res) => {
    try {
        // Clear refresh token from DB
        await Users.findByIdAndUpdate(req.user._id, {
            $unset: { refreshToken: 1 }
        });

        return res.status(200)
            .clearCookie("accessToken", cookieOptions)
            .clearCookie("refreshToken", cookieOptions)
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


// ── GET CURRENT USER ──
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

import Users from "../model/user.model.js";
import { generateTokens } from "../utils/generateTokens.js";
import { setAuthCookies, clearAuthCookies } from "../utils/setAuthCookies.js";
import jwt from "jsonwebtoken";
import { registeruserSchema, loginuserSchema } from "../validators/joi.validate.js";
import { validate } from "../middleware/validate.js"



// REGISTER  
export const registerUser = async (req, res) => {
    try {

        const { error, value } = registeruserSchema.validate(req.body)
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            })
        }
        const { firstname, lastname, email, role, collegename, password } = value;

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
                accessToken,
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
            ...(process.env.NODE_ENV === 'development' && { error: error.message })
        });
    }
};

// LOGIN 
export const loginUser = async (req, res) => {
    try {

        const { error, value } = loginuserSchema.validate(req.body);

        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        
        const { email, password } = value;

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

        const loggedInUser = await Users.findById(user._id)
            .select("-password -refreshToken");

        return setAuthCookies(res.status(200), accessToken, refreshToken)
            .json({
                success: true,
                message: "Login successful",
                accessToken,
                user: loggedInUser
            });

    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({
            success: false,
            message: "Login failed",
            ...(process.env.NODE_ENV === 'development' && { error: error.message })
        });
    }
};


//  LOGOUT 
export const logoutUser = async (req, res) => {
    try {

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
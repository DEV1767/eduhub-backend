import User from "../model/user.model.js";

export const getuser = async (req, res) => {
    try {
        return res.status(200).json({
            success: true,
            message: "User found",
            user: req.user  // ← already fetched by authMiddleware
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
};
//User controller for updating password and own profile
import User from "../model/user.model.js"


export const getuser = async (req, res) => {
    try {
        return res.status(200).json({
            success: true,
            message: "User found",
            user: req.user
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const updateme = async (req, res) => {
    try {
        const { firstname, lastname, collegename } = req.body
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { firstname, lastname, collegename },
            { new: true, runValidators: true }
        ).select("-password -refreshToken")

        return res.status(200).json({
            success: true,
            message: "Profile updated",
            user
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Internal server error"
        })
    }
}


export const updatepassword = async (req, res) => {
    try {
        const { oldpassword, newpassword } = req.body;
        const user = await User.findById(req.user._id).select("+password")
        const isMatch = await user.isPasswordCorrect(oldpassword)
        if (!isMatch) {
            return res.status(400).json({
                message: "Old password is incorrect"
            })
        }
        user.password = newpassword;
        await user.save()
        return res.status(200).json({
            success: true,
            message: "Password update successfully"
        })
    } catch (error) {
        console.log(error),
            res.status(500).json({
                message: "Internal server error"
            })
    }
}
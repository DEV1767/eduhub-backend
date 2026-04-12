
//verify sended email with Redis
import { getOTP, clearOTP } from "./redisHelper.js";

export const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        
        if (!email || !otp) {
            return res.status(400).json({
                message: "Email and OTP are required"
            });
        }

        // Get OTP from Redis
        const storedOtp = await getOTP(email);
        console.log("Stored OTP:", storedOtp);
        
        if (!storedOtp) {
            return res.status(404).json({
                message: "OTP not found or expired"
            });
        }

        // Compare OTP (Redis automatically handles expiration)
        if (storedOtp !== otp) {
            return res.status(400).json({
                message: "Invalid OTP"
            });
        }

        // Clear OTP from Redis after successful verification
        await clearOTP(email);
        
        res.status(200).json({
            success: true,
            message: "OTP verified successfully"
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
};
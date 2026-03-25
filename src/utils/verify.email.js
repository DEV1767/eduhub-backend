

//verify sended email
import OTP from "../model/emailotp.model.js"
export const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body
        const record = await OTP.findOne({ email });
        console.log(record)
        if (!record) {
            return res.status(404).json({
                message: "No found OTP"
            })
        }

        if (record.expiresAt < Date.now()) {
            return res.status(400).json({
                message: "OTP expired"
            })
        }

        if (record.otp !== otp) {
            return res.status(400).json({
                message: "Invalid OTP"
            })
        }

        await OTP.deleteOne({ email })
        res.json({
            message: "OTP verified sucessfully"
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            messag: "Internal server issue"
        })
    }
}
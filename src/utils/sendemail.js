import OTP from "../model/emailotp.model.js"
import transporter from "../config/email.js"


//send verification email
export const sendOTP = async (req, res) => {
    try {
        const { email } = req.body

        function generateOTP() {
            return Math.floor(100000 + Math.random() * 900000).toString()
        }

        const otp = generateOTP()
        await OTP.findOneAndUpdate(
            { email },
            { otp, expiresAt: Date.now() + 3 * 60 * 1000 },
            { upsert: true }
        )

        await transporter.sendMail({
            from: process.env.APP_EMAIL,
            to: email,
            subject: "Your Eduhub OTP Code",
            html: `
            <h2>Your OTP is :${otp}</h2>
            <p>Valid for 5 minutes</p>
            `
        })
        const all = await OTP.find();
        console.log("All OTPs:", all);
        res.json({
            message: "OTP sent sucessfully"
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Internal server issue"
        })
    }
}


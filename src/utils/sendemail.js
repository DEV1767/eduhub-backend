import OTP from "../model/emailotp.model.js"
import transporter from "../config/email.js"


//send verification email
export const sendOTPlogin = async (req, res) => {
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
            from: `"Eduhub Support" <${process.env.APP_EMAIL}>`,
            to: email,
            subject: `${otp} is your Eduhub verification code`,
            html: `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #00466a; padding: 20px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Eduhub</h1>
      </div>
      <div style="padding: 30px; color: #333; line-height: 1.6;">
        <p style="font-size: 16px;">Hello,</p>
        <p style="font-size: 16px;">To securely log in to your account, please use the following One-Time Password (OTP):</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="display: inline-block; background: #f4f4f4; border: 1px dashed #00466a; color: #00466a; font-size: 32px; font-weight: bold; letter-spacing: 5px; padding: 10px 25px; border-radius: 5px;">
            ${otp}
          </span>
        </div>
        <p style="font-size: 14px; color: #666; text-align: center;">This code is valid for <b>5 minutes</b>. Please do not share this code with anyone.</p>
      </div>
      <div style="background-color: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
        <p style="margin: 0; font-size: 13px; color: #888;">
          Crafted with ❤️ by <b>Shivam </b>
        </p>
        <p style="margin: 5px 0 0; font-size: 13px;">
          <a href="https://my-portfoliyo-nine.vercel.app/" style="color: #00466a; text-decoration: none; font-weight: 600;">View Portfolio</a>
        </p>
      </div>
    </div>
    `
        });
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




import OTP from "../model/emailotp.model.js";
import transporter from "../config/email.js";
import crypto from 'crypto';


const generateSecureOTP = () => crypto.randomInt(100000, 999999).toString();

//  SEND OTP FOR LOGIN
export const sendOTPlogin = async (req, res) => {
    try {
        const { email } = req.body;
        const otp = generateSecureOTP();
        console.log(otp)
        await OTP.findOneAndUpdate(
            { email },
            { otp, expiresAt: Date.now() + 5 * 60 * 1000 },
            { upsert: true, new: true }
        );

        await transporter.sendMail({
            from: `"Eduhub Support" <${process.env.APP_EMAIL}>`,
            to: email,
            subject: `${otp} is your Eduhub login code`,
            html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden;">
                <div style="background-color: #00466a; padding: 20px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Eduhub Login</h1>
                </div>
                <div style="padding: 30px; color: #333; line-height: 1.6;">
                    <p>Hello,</p>
                    <p>Use the code below to securely sign in to your Eduhub account. This code expires in 3 minutes.</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <span style="display: inline-block; background: #f4f4f4; border: 1px dashed #00466a; color: #00466a; font-size: 32px; font-weight: bold; letter-spacing: 5px; padding: 10px 25px; border-radius: 8px;">
                            ${otp}
                        </span>
                    </div>
                </div>
                <div style="background-color: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
                    <p style="margin: 0; font-size: 12px; color: #888;">Crafted with ❤️ by <b>Shivam Chaudhary</b></p>
                    <a href="https://my-portfoliyo-nine.vercel.app/" style="color: #00466a; font-size: 12px; text-decoration: none;">View Portfolio</a>
                </div>
            </div>`
        });

        res.status(200).json({ success: true, message: "Login OTP sent successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server issue" });
    }
};

// SEND OTP FOR SIGNUP 
export const sendOTPsignup = async (req, res) => {
    try {
        const { email } = req.body;
        const otp = generateSecureOTP();
        console.log(otp)
        await OTP.findOneAndUpdate(
            { email },
            { otp, expiresAt: Date.now() + 5 * 60 * 1000 },
            { upsert: true, new: true }
        );

        await transporter.sendMail({
            from: `"Eduhub Support" <${process.env.APP_EMAIL}>`,
            to: email,
            subject: `Welcome to Eduhub! Verify your account: ${otp}`,
            html: `
            <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
                <div style="background: linear-gradient(135deg, #00466a 0%, #006b9d 100%); padding: 30px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Welcome to Eduhub!</h1>
                    <p style="color: #cce4f0; margin: 10px 0 0; font-size: 14px;">Your journey starts here.</p>
                </div>
                <div style="padding: 40px 30px; color: #333; line-height: 1.6; background-color: #ffffff;">
                    <h2 style="font-size: 20px; color: #00466a; margin-top: 0;">Verify Your New Account</h2>
                    <p>Thank you for joining us! Please use the verification code below to complete your registration:</p>
                    <div style="text-align: center; margin: 35px 0;">
                        <div style="display: inline-block; background: #f0f7ff; border: 2px solid #00466a; color: #00466a; font-size: 36px; font-weight: 800; letter-spacing: 8px; padding: 15px 35px; border-radius: 10px;">
                            ${otp}
                        </div>
                    </div>
                    <p style="font-size: 13px; color: #999; text-align: center;">This code is valid for 3 minutes.</p>
                </div>
                <div style="background-color: #fcfcfc; padding: 25px; text-align: center; border-top: 1px solid #eeeeee;">
                    <p style="margin: 0; font-size: 14px; color: #555; font-style: italic;">"Transforming campus moments into lifetime memories."</p>
                    <div style="margin-top: 15px; padding-top: 15px; border-top: 1px dotted #ccc;">
                        <p style="margin: 0; font-size: 12px; color: #888;">Crafted with ❤️ by <b>Shivam Chaudhary</b></p>
                        <a href="https://my-portfoliyo-nine.vercel.app/" style="display: inline-block; margin-top: 10px; color: #00466a; text-decoration: none; font-size: 13px; font-weight: bold; border: 1px solid #00466a; padding: 5px 15px; border-radius: 20px;">Visit My Portfolio</a>
                    </div>
                </div>
            </div>`
        });

        res.status(200).json({ success: true, message: "Welcome email sent successfully" });
    } catch (error) {
        console.error("Signup Mail Error:", error);
        res.status(500).json({ success: false, message: "Could not send verification email." });
    }
};

export const sendEventConfirmation = async ({
    email,
    teamname,
    leadname,
    eventName
}) => {
    try {
        console.log("Email received:", email);
        console.log("Email function triggered");

        await transporter.sendMail({
            from: `"Eduhub Events" <${process.env.APP_EMAIL}>`,
            to: email,
            subject: `Registration Confirmed: ${eventName || "Your Event"} 🎊`,
            html: `
    <div style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
        
        <div style="background: linear-gradient(135deg, #00466a 0%, #006b9d 100%); padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Registration Successful!</h1>
            <p style="color: #cce4f0; margin: 10px 0 0; font-size: 14px;">
                Team <b>${teamname}</b> is officially in.
            </p>
        </div>

        <div style="padding: 30px; color: #333; line-height: 1.6; background-color: #ffffff;">
            <p style="font-size: 15px;">Hi <b>${leadname}</b>,</p>
            <p style="font-size: 15px;">
                Congratulations! Your team registration for <b>${eventName}</b> has been confirmed.
            </p>

            <div style="background: #f0f7ff; border-left: 4px solid #00466a; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0; font-size: 14px; font-weight: 600; color: #00466a;">Next Steps:</p>
                <ul style="margin: 5px 0 0; padding-left: 20px; font-size: 13px; color: #444;">
                    <li>Check your dashboard</li>
                    <li>View event schedule</li>
                    <li>Contact coordinator if needed</li>
                </ul>
            </div>
        </div>

        <div style="background-color: #fcfcfc; padding: 25px; text-align: center; border-top: 1px solid #eeeeee;">
            <p style="margin: 0 0 15px 0; font-size: 13px; color: #555; font-style: italic;">
                "Transforming campus moments into lifetime memories."
            </p>
            
            <div style="padding-top: 15px; border-top: 1px dotted #ccc;">
                <p style="margin: 0; font-size: 12px; color: #888;">
                    Crafted with ❤️ by <b>Shivam Chaudhary</b>
                </p>
                <a href="https://my-portfoliyo-nine.vercel.app/" 
                   style="display: inline-block; margin-top: 12px; color: #00466a; text-decoration: none; font-size: 12px; font-weight: bold; border: 1px solid #00466a; padding: 6px 18px; border-radius: 20px;">
                    Visit My Portfolio
                </a>
            </div>
        </div>
    </div>`
        });

        console.log("Email sent successfully");

    } catch (error) {
        console.error("Email Error:", error);
    }
};
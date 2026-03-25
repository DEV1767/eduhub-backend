
//email-sender

import nodemailer from "nodemailer"
import dotenv from "dotenv"
dotenv.config();


const transporter = nodemailer.createTransport({
    service: 'gmail',

    auth: {

        user: process.env.APP_EMAIL,
        pass: process.env.APP_EMAIL_PASSWORD
    }
});

export default transporter

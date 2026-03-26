import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,

  auth: {
    user: process.env.APP_EMAIL,
    pass: process.env.APP_EMAIL_PASSWORD,
  },

  family: 4   // ✅ THIS LINE FIXES YOUR ISSUE
});

export default transporter
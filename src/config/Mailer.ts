import * as dotenv from "dotenv";
dotenv.config();
import nodemailer from "nodemailer"



const EMAIL = process.env.MAILER_EMAIL
const PASSWORD = process.env.MAILER_PASSWORD




export default nodemailer.createTransport({
  host: "smtp.hostinger.com",
  // host: "smtp.titan.email",
  port: 465,
  secure: true,
  auth: {
    user: EMAIL,
    pass: PASSWORD,
  },
});

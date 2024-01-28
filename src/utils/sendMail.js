import nodemailer from "nodemailer";
import { EMAIL_TYPES } from "../constants/emailTypes.js";

var transporter = nodemailer.createTransport({
    host: process.env.HOST,
    port: 465,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
    },
});

export async function sendEmail(emailType, toEmail, userId, params) {
    let subject, htmlContent;

    switch (emailType) {
        case EMAIL_TYPES.ACCOUNT_ACTIVATION:
            subject = "Account Activation";
            htmlContent = `
                <html>
                    <head>Account Activation Link</head>
                    <body>
                        <h1>Account Activation</h1>
                        <p>Click the link below to activate your account:</p>
                        <a href="${process.env.WEBSITE}/activateAccount/${userId}/${params}">Activate Account</a>
                    </body>
                </html>
        `;
            break;
        default:
            return Promise.reject("Invalid email type");
    }
    const mailOptions = {
        from: process.env.EMAIL,
        to: toEmail,
        subject: subject,
        html: htmlContent,
    };

    return transporter.sendMail(mailOptions);
}

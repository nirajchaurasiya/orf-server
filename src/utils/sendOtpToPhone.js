import twilio from "twilio";
import readline from "readline";

const accountSid = process.env.Account_SID;
const authToken = process.env.AUTH_TOKEN;
const verifySid = process.env.VERIFY_SID;

export async function sendOtpToPhone(phone) {
    try {
        const client = twilio(accountSid, authToken);
        console.log("sent-");

        const verification = await client.verify.v2
            .services(verifySid)
            .verifications.create({
                to: phone,
                channel: "sms",
            });

        console.log(verification.status);

        const otpCode = await new Promise((resolve) => {
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout,
            });

            rl.question("Please enter the OTP:", (otp) => {
                resolve(otp);
                rl.close();
            });
        });

        const verificationCheck = await client.verify.v2
            .services(verifySid)
            .verificationChecks.create({ to: phone, code: otpCode });

        console.log(verificationCheck.status);
        return verificationCheck.toJSON();
    } catch (error) {
        console.error(error);
        return null;
    }
}

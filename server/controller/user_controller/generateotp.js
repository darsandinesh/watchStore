const nodemailer = require("nodemailer");
// require('dotenv').config();

const otpGenerator = require('otp-generator')


const sendmail = async (email) => {

    try {
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.SMTP_MAIL,
                pass: process.env.SMTP_PASSWORD
            }
        });

        const otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            specialChars: false,
            lowerCaseAlphabets: false
        });
        // req.session.otp = otp

        var mailOptions = {
            from: 'WatchStore <process.env.SMTP_MAIL>',
            to: email,
            subject: 'E-Mail Verification',
            text: 'Your OTP is:' + otp,
        };

        transporter.sendMail(mailOptions);

        console.log("E-mail sent sucessfully");
        const time = Date.now()
        return [otp,time]
        //   res.redirect('/otp_verification')
    }
    catch (err) {
        console.log("error in sending mail:", err);
    }
}

module.exports = { sendmail }

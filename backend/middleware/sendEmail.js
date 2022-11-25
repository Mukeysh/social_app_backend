const nodeMailer = require("nodemailer");

exports.sendEmail = async (options) => {
    let transporter = nodeMailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    let message = {
        from: `"${process.env.SMTP_FROM_NAME}" '&lt;'${process.env.SMTP_FROM_EMAIL}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
    };

    let info = await transporter.sendMail(message);

    console.log("Message sent: %s", info.messageId);
};

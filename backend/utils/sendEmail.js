import nodemailer from "nodemailer";
import fs from "fs";

const sendEmail = async ({ email, subject, message }) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || "smtp.gmail.com", // fallback or placeholder
      port: process.env.EMAIL_PORT || 587,
      secure: process.env.EMAIL_PORT === "465", // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Mock for development if no creds
    if (!process.env.EMAIL_USER && process.env.NODE_ENV !== "production") {
      console.log("DEV MODE: Mocking email send");
      console.log("Subject:", subject);
      console.log("Message:", message);
      fs.writeFileSync("otp.txt", message);
      return true;
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || '"NITK Knot" <noreply@NITKnot.com>',
      to: email,
      subject: subject,
      text: message,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #fce7f3; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
          <div style="width: 100%; background-color: #fce7f3; padding: 40px 0;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);">
              
              <!-- Header -->
              <div style="background: linear-gradient(135deg, #ec4899 0%, #db2777 100%); padding: 30px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">NITK Knot</h1>
              </div>

              <!-- Content -->
              <div style="padding: 40px 30px; color: #374151; line-height: 1.6;">
                <h2 style="color: #db2777; margin-top: 0; margin-bottom: 20px; font-size: 20px; font-weight: 700;">Hello there! 👋</h2>
                <div style="font-size: 16px; color: #4b5563; background-color: #fdf2f8; padding: 20px; border-radius: 12px; border: 1px solid #fbcfe8;">
                   ${message.replace(/\n/g, "<br>")}
                </div>
              </div>

              <!-- Footer -->
              <div style="background-color: #fdf2f8; padding: 20px; text-align: center; color: #db2777; font-size: 14px; border-top: 1px solid #fbcfe8;">
                <p style="margin: 0; font-weight: 600;">Happy connecting!</p>
                <p style="margin: 5px 0 0 0; opacity: 0.7; font-size: 12px;">&copy; ${new Date().getFullYear()} NITK Knot. All rights reserved.</p>
              </div>

            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: %s", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};

export default sendEmail;

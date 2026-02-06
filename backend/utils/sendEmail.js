import nodemailer from "nodemailer";

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
      return true;
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || '"NITK Knot" <noreply@nitkknot.com>',
      to: email,
      subject: subject,
      text: message,
      html: `<div>${message.replace(/\n/g, "<br>")}</div>`,
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

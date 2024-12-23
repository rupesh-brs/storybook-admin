import ejs from 'ejs';
import nodemailer from 'nodemailer';
import { fileURLToPath } from 'url';
import { dirname } from 'path';


const currentFilePath = import.meta.url;
const currentDirectory = dirname(fileURLToPath(currentFilePath));


const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,  
  auth: {
    user: "mrrupesh6309@gmail.com", 
    pass: "xmvhwwjplahgoctm", 
  },
});

// Send email verification link for StoryBook
const sendEmailVerificationLink = async (email, token, name) => {
  try {
    const renderedContent = await ejs.renderFile(
      `${currentDirectory}/../templates/confirm_email.ejs`,
      { token, name }
    );

    const mailOptions = {
      from: "mrrupesh6309@gmail.com",
      to: email,
      subject: "StoryBook - Email Confirmation",
      html: renderedContent,
    };

    const verificationInfo = await transporter.sendMail(mailOptions);
    console.log("Email Sent Successfully!");
    return verificationInfo;
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw new Error("Failed to send verification email.");
  }
};

export default sendEmailVerificationLink;

let transporter: any = null

const initializeTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return null;
  }

  try {
    const nodemailer = require("nodemailer");
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  } catch (error) {
    console.error("Failed to initialize email transporter:", error);
    return null;
  }
};

export const sendOTPEmail = async (email: string, otp: string): Promise<void> => {
  if (!transporter) {
    transporter = initializeTransporter()
  }

  if (!transporter) {
    console.log("Email transporter not available, skipping email send")
    return
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "BazaarBuddy - OTP Verification",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ea580c;">BazaarBuddy OTP Verification</h2>
        <p>Your OTP for verification is:</p>
        <div style="background-color: #f3f4f6; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
          ${otp}
        </div>
        <p>This OTP will expire in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    `,
  }

  try {
    await transporter.sendMail(mailOptions)
  } catch (error) {
    console.error("Email sending failed:", error)
    // Don't throw error to prevent build failures
  }
}

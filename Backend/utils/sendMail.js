const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER, 
    pass: process.env.MAIL_PASS  
  }
});

const sendWelcomeMail = async ({ to, fullname, email, password }) => {
  const mailOptions = {
    from: `"CodeFusion" <${process.env.MAIL_USER}>`,
    to,
    subject: 'Welcome to CodeFusion 🎉',
    html: `
      <h2>Welcome to CodeFusion, ${fullname}!</h2>
      <p>Your account has been successfully created.</p>
      <p><strong>Login Credentials:</strong></p>
      <ul>
        <li>Email: ${email}</li>
        <li>Password: ${password}</li>
      </ul>
      <p>Please change your password after logging in for security purposes.</p>
      <br/>
      <p>Best regards,</p>
      <p><strong>CodeFusion Team</strong></p>
    `
  };

  await transporter.sendMail(mailOptions);
};

const sendPasswordResetMail = async ({ to, fullname, token }) => {
  const resetLink = `${process.env.FRONTEND_URL}/resetpassword/${token}`;

  const mailOptions = {
    from: `"CodeFusion" <${process.env.MAIL_USER}>`,
    to,
    subject: "Reset Your Password",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; background-color: #f9f9f9;">
        <h2 style="color: #333;">Hi ${fullname},</h2>
        <p style="font-size: 15px; color: #555;">
          We received a request to reset your password. Click the link below to set a new password. This link is valid for <strong>1 hour</strong>.
        </p>
        
        <p style="margin: 25px 0;">
          <a href="${resetLink}" style="display: inline-block; padding: 10px 16px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px; font-size: 15px;">
            Reset Password
          </a>
        </p>

        <p style="font-size: 14px; color: #777;">
          If you didn’t request this, you can safely ignore this email.
        </p>

        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;" />

        <p style="font-size: 13px; color: #aaa;">— CodeFusion Team</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};


module.exports = {sendWelcomeMail,sendPasswordResetMail};

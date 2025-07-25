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

module.exports = sendWelcomeMail;

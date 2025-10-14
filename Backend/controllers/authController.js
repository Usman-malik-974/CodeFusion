const { User } = require("../models/index");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {sendWelcomeMail,sendPasswordResetMail} = require("../utils/sendMail");
const isAdmin = require("../utils/isAdmin");
const generatePassword = require("../utils/generatePassword");

const loginUser = async (req, res) => {
  console.log(req.body);
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(401).json({ error: "Please provide all details" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.fullname,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};



const signupUser = async (req, res) => {
  try {
    if (!(await isAdmin(req.user.id))) {
      return res.status(403).json({ error: "Unauthorized Access." });
    }
    const { fullname, email, role, course, session, rollno } = req.body;
    console.log(req.body);
    if (!fullname || !email || !role) {
      return res.status(400).json({ error: "All fields are required." });
    }
    if (role === "user") {
      if (!course || !session || !rollno) {
        return res.status(400).json({ error: "Please provide all details." });
      }
    }
    const plainPassword = generatePassword();
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    const newUser = new User({
      fullname,
      email,
      password: hashedPassword,
      role,
    });
    if (role === "user") {
      newUser.course = course;
      newUser.session = session;
      newUser.rollno = rollno;
    }
    let signupres = await newUser.save();
    await sendWelcomeMail({
      to: email,
      fullname,
      email,
      password: plainPassword,
    });
    return res.status(201).json({
      id: signupres._id,
      message: "User created and welcome email sent.",
    });
  } catch (err) {
    if (err.code === 11000 && err.keyPattern?.email) {
      return res.status(409).json({ error: "Email already registered." });
    }
    if (err.name === "ValidationError") {
      const field = Object.keys(err.errors)[0];
      const errorMessage = err.errors[field].message;
      return res.status(400).json({ error: errorMessage });
    }
    console.error("Signup Error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "No user found with this email." });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    user.resetToken = token;
    await user.save();

    await sendPasswordResetMail({
      to: email,
      fullname: user.fullname,
      token,
    });

    return res.status(200).json({ message: "Reset password email sent." });
  } catch (err) {
    console.error("Reset Password Error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword)
    return res.status(400).json({ error: 'Please provide all details.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;
    const user = await User.findOne({ _id: userId, resetToken: token });
    if (!user)
    {
      return res.status(400).json({ error: 'Invalid or expired email' });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetToken = undefined;
    await user.save();
    res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'Internal Server error' });
  }
};

module.exports = { loginUser, signupUser,requestPasswordReset,resetPassword};

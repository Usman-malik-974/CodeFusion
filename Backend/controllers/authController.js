const {User} = require('../models/index');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendWelcomeMail = require('../utils/sendMail');

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name, 
      },
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const generatePassword = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$';
  let pass = '';
  for (let i = 0; i < 8; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pass;
};

const signupUser = async (req, res) => {
  try {
    console.log(req.body);
    const { fullname, email, role } = req.body;
    if (!fullname || !email || !role) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    const plainPassword = generatePassword();
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    const newUser = new User({
      fullname,
      email,
      password: hashedPassword,
      role
    });
    await newUser.save();
    await sendWelcomeMail({
      to: email,
      fullname,
      email,
      password: plainPassword
    });
    return res.status(201).json({ message: 'User created and welcome email sent.' });
  } catch (err) {
    if (err.code === 11000 && err.keyPattern?.email) {
      return res.status(409).json({ message: 'Email already registered.' });
    }
    if (err.name === 'ValidationError') {
      const field = Object.keys(err.errors)[0];
      const errorMessage = err.errors[field].message;
      return res.status(400).json({ message: errorMessage });
    }
    console.error('Signup Error:', err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};


module.exports = { loginUser,signupUser };

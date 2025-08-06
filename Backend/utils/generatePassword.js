const generatePassword = () => {
  return Math.random().toString(36).slice(-8); // e.g. "a9s1x2qz"
};

module.exports = generatePassword;

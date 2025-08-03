const {User} = require('../models/index');

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, '_id fullname email role');
    res.status(200).json({
      users: users.map(user => ({
        id: user._id,
        name: user.fullname,
        email: user.email,
        role: user.role
      }))
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

const updateUser = async (req, res) => {
    try {
      const { id } = req.params;
      const updatedUser = await User.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true
      }).select('_id fullname email role');;
      if (!updatedUser) {

        return res.status(404).json({ error: 'User not found' });
      }
      const user={
        id:updatedUser._id,
        name:updatedUser.fullname,
        email:updatedUser.email,
        role:updatedUser.role
      }
      res.status(200).json({ message: 'User updated successfully', updatedUser:user });
    } catch (err) {
      console.error(err);
      if (err.name === 'ValidationError') {
        const field = Object.keys(err.errors)[0];
        const errorMessage = err.errors[field].message;
        return res.status(400).json({ error: errorMessage });
      }
      res.status(500).json({ error: 'Internal Server error' });
    }
  };
  

  const deleteUser = async (req, res) => {
    try {
      const { id } = req.params;
  
      const deletedUser = await User.findByIdAndDelete(id);
  
      if (!deletedUser) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      return res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Delete error:', error);
      return res.status(500).json({ error: 'Server error while deleting user' });
    }
  };

  const searchUsers=async (req, res) => {
    try {
      const { query } = req.query;
  
      let users;
  
      if (query) {
        const searchRegex = new RegExp(query, 'i');
  
        users = await User.find(
          {
            $or: [
              { fullname: { $regex: searchRegex } },
              { email: { $regex: searchRegex } },
            ],
          },
          '_id fullname email role'
        );
      } else {
        users = await User.find({}, '_id fullname email role');
      }
  
      res.status(200).json({
        users: users.map(user => ({
          id: user._id,
          name: user.fullname,
          email: user.email,
          role: user.role
        }))
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  };

module.exports = { getAllUsers,updateUser,deleteUser,searchUsers };

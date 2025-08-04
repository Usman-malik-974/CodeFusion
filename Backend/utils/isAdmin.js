const {User} = require('../models/index');

async function isAdmin(userId) {
    try {
        const user = await User.findById(userId);
        if (!user) {
            return false; 
        }
        return user.role === 'admin'
    } catch (err) {
        console.error('Error checking admin status:', err);
        return false;
    }
}

module.exports = isAdmin;

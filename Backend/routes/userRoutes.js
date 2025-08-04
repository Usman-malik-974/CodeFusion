const express = require('express');
const { getAllUsers, updateUser, deleteUser, searchUsers } = require('../controllers/userController');
const authenticateToken = require('../middlewares/authenticateToken');
const router = express.Router();

router.use(authenticateToken);

router.get('/',getAllUsers);

router.put('/:id',updateUser);

router.delete('/:id',deleteUser);

router.get('/search',searchUsers);

module.exports = router;

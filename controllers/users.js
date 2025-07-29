const { StatusCodes } = require('http-status-codes');
const User = require('../models/users');
const Expense = require('../models/expenses');

// Get all users
const getAllUsers = async (req, res) => {
  const users = await User.find().select('-password');
  res.status(StatusCodes.OK).json({ success: true, data: users });
};

// Get a single user by ID
const getSingleUser = async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) {
    return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'User not found' });
  }
  res.status(StatusCodes.OK).json({ success: true, data: user });
};

// Update a user by ID
const updateUser = async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).select('-password');
  if (!user) {
    return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'User not found' });
  }
  res.status(StatusCodes.OK).json({ success: true, data: user });
};

// Delete a user by ID
const deleteUser = async (req, res) => {
  const { id: user_id} = req.params
  const user = await User.findByIdAndDelete(user_id);
  if (!user) {
    return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'User not found' });
  }
  await Expense.deleteMany({spentBy: user_id})
  res.status(StatusCodes.OK).json({ success: true, message: 'User deleted successfully' });
}


module.exports = {
  getAllUsers,
  getSingleUser,
  updateUser,
  deleteUser,
};
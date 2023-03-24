const asyncHandler = require("express-async-handler");
const { default: mongoose } = require("mongoose");
const User = require("../models/userModel");
const Account = require("../models/accountModel");

//@desc Get all users
//@route GET /users/
//@access public
const getUsers = asyncHandler(async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

//@desc Create a new user
//@route POST /users/
//@access public
const createUser = asyncHandler(async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = new User({
      name,
      email,
      isActive: true,
      accounts: [],
    });
    await user.save();
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
});

//@desc Get user
//@route GET /users/:id
//@access public
const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  res.status(200).json(user);
});

//@desc Update user
//@route PUT /users/:id
//@access public
const updateUser = asyncHandler(async (req, res) => {
  let user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const { name, email, isActive, accounts } = req.body;
  if (name != null) {
    user.name = name;
  }
  if (email != null) {
    user.email = email;
  }
  if (isActive != null) {
    product.isActive = isActive;
  }
  if (accounts != null) {
    product.accounts = accounts;
  }

  const updatedUser = await User.findByIdAndUpdate(req.params.id, user);

  res.status(200).json(updatedUser);
});

//@desc Delete user
//@route DELETE /users/:id
//@access public
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  const deleteResult = await Account.deleteMany({ owner: user._id });
  if (!deleteResult.acknowledged) {
    res.status(500);
    throw new Error("Couldn't delete user accounts");
  }

  await User.findByIdAndDelete(req.params.id);
  res.status(200).json(user);
});

//@desc Get all active users
//@route GET /users/active
//@access public
const getActiveUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ isActive: true });
  if (!users) {
    res.status(500);
    throw new Error("Server error");
  }
  res.json({ success: true, data: users });
});

//@desc Get all inactive users
//@route GET /users/inactive
//@access public
const getInActiveUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ isActive: false });
  if (!users) {
    res.status(500);
    throw new Error("Server error");
  }
  res.json({ success: true, data: users });
});

module.exports = {
  getUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  getActiveUsers,
  getInActiveUsers,
};

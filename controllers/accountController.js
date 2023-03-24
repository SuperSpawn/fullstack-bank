const asyncHandler = require("express-async-handler");
const Account = require("../models/accountModel");
const User = require("../models/userModel");

//@desc Get all accounts for a user
//@route GET /accounts
//@access public
const getAccounts = asyncHandler(async (req, res) => {
  try {
    const accounts = await Account.find();
    res.status(200).json({ success: true, data: accounts });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

//@desc Create a new account for a user
//@route POST /accounts/:id
//@access public
const createAccount = asyncHandler(async (req, res) => {
  const { cash, credit, owner } = req.body;
  if (!cash || !credit || !owner) {
    res.status(400);
    throw new Error("All fields are required");
  }
  let user = await User.findById(owner);
  if (!user) {
    res.status(404);
    throw new Error("Cannot find user");
  }
  const account = await Account.create({
    owner: owner,
    cash: cash,
    credit: credit,
  });
  if (!account) {
    throw new Error("Server error");
  }

  user.accounts.push(account._id);
  await User.findByIdAndUpdate(owner, user);
  res.status(201).send(account);
});

//@desc Get account
//@route GET /accounts/:id
//@access public
const getAccount = asyncHandler(async (req, res) => {
  const account = await Account.findById(req.params.id);
  if (!account) {
    res.status(404);
    throw new Error("Product not found");
  }
  res.status(200).json(account);
});

//@desc Update account
//@route PUT /accounts/:id
//@access public
const updateAccount = asyncHandler(async (req, res) => {
  let account = await Account.findById(req.params.id);
  if (!account) {
    res.status(404);
    throw new Error("Product not found");
  }

  const { cash, credit, email } = req.body;
  if (cash != null) {
    account.cash = cash;
  }
  if (credit != null) {
    account.credit = credit;
  }

  const updatedAccount = await Account.findByIdAndUpdate(
    req.params.id,
    account
  );

  res.status(200).json(updatedAccount);
});

//@desc Delete account
//@route DELETE /accounts/:id
//@access public
const deleteAccount = asyncHandler(async (req, res) => {
  const account = await Account.findById(req.params.id);
  if (!account) {
    res.status(404);
    throw new Error("Product not found");
  }
  let user = await User.findById(account.owner);
  let index = user.accounts.indexOf(req.params.id);
  if (index === -1) {
    res.status(500);
    throw new Error("Server Error");
  }
  user.accounts.splice(index, 1);
  await User.findByIdAndUpdate(account.owner, user);
  await Account.findByIdAndDelete(req.params.id);
  res.status(200).json(account);
});

//@desc Update account
//@route PUT /accounts/:id
//@access public
const depositAccount = asyncHandler(async (req, res) => {
  let account = await Account.findById(req.params.id);
  if (!account) {
    res.status(404);
    throw new Error("Product not found");
  }

  const { cash, credit } = req.body;
  if (cash != null) {
    account.cash += cash;
  }
  if (credit != null) {
    if (account.credit + credit < 0) {
      res.status(403);
      throw new Error("Credit limit exceeded");
    }
    account.credit += credit;
  }

  const updatedAccount = await Account.findByIdAndUpdate(
    req.params.id,
    account
  );

  res.status(200).json(updatedAccount);
});

module.exports = {
  getAccounts,
  createAccount,
  getAccount,
  updateAccount,
  deleteAccount,
};

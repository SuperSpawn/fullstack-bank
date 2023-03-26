const asyncHandler = require("express-async-handler");
const Account = require("../models/accountModel");
const User = require("../models/userModel");

//@desc Get all accounts for a user
//@route GET /accounts
//@access public
const getAccounts = asyncHandler(async (req, res) => {
  res.status(500);
  const accounts = await Account.find();
  res.status(200).json({ success: true, data: accounts });
});

//@desc Create a new account for a user
//@route POST /accounts/:id
//@access public
const createAccount = asyncHandler(async (req, res) => {
  const { cash, credit, owner } = req.body;
  res.status(500);
  if (!cash || !credit || !owner) {
    res.status(403);
    throw new Error("All fields are required");
  }
  let user = await User.findById(owner);
  if (!user) {
    res.status(404);
    throw new Error("Cannot find user");
  }
  if (user.isActive === false) {
    res.status(403);
    throw new Error("Cannot create account for inactive user");
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
    throw new Error("Account not found");
  }
  res.status(200).json(account);
});

//@desc Update account
//@route PUT /accounts/:id
//@access public
const updateAccount = asyncHandler(async (req, res) => {
  res.status(500);
  let account = await Account.findById(req.params.id);
  if (!account) {
    res.status(404);
    throw new Error("Account not found");
  }
  let user = await User.findById(account.owner);
  if (!user) {
    res.status(404);
    throw new Error("Owner not found");
  }

  if (user.isActive === false) {
    res.status(403);
    throw new Error("Account is not active, cannot update");
  }

  const { cash, credit } = req.body;
  if (cash != null) {
    account.cash = cash;
  }
  if (credit != null) {
    if (credit < 0) {
      res.status(403);
      throw new Error("Invalid update request: credit cannot be negative");
    }
    account.credit = credit;
  }

  await Account.findByIdAndUpdate(req.params.id, account);
  res.status(200).json(account);
});

//@desc Delete account
//@route DELETE /accounts/:id
//@access public
const deleteAccount = asyncHandler(async (req, res) => {
  const account = await Account.findById(req.params.id);
  if (!account) {
    res.status(404);
    throw new Error("Account not found");
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
//@route PUT /accounts/interact/:id
//@access public
const changeAccount = asyncHandler(async (req, res) => {
  res.status(500);
  let account = await Account.findById(req.params.id);
  if (!account) {
    res.status(404);
    throw new Error("Account not found");
  }
  let user = await User.findById(account.owner);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  if (user.isActive === false) {
    res.status(403);
    throw new Error("User is inactive");
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

//@desc Transfer money
//@route PUT /accounts/:from/transfer/:to
//@access public
const transferMoney = asyncHandler(async (req, res) => {
  const from = req.params.from;
  const to = req.params.to;
  const { cash, credit } = req.body;

  res.status(500);
  if (!from || !to || (!cash && !credit)) {
    res.status(403);
    throw new Error("Invalid transfer request");
  }
  if (cash && cash < 0) {
    res.status(403);
    throw new Error("Invalid cash transfer request");
  }
  if (credit && credit < 0) {
    res.status(403);
    throw new Error("Invalid credit transfer request");
  }

  let fromAccount = await Account.findById(from);
  let toAccount = await Account.findById(to);

  if (!fromAccount || !toAccount) {
    res.status(404);
    throw new Error("Couldn't find account");
  }

  let fromUser = await User.findById(fromAccount.owner);
  if (credit && credit > fromAccount.credit) {
    res.status(403);
    throw new Error("Invalid credit request");
  }
  if (fromUser.isActive === false) {
    res.status(403);
    throw new Error("User is inactive cannot send money");
  }

  if (credit) {
    fromAccount.credit -= credit;
    toAccount.credit += credit;
  }
  if (cash) {
    fromAccount.cash -= cash;
    toAccount.cash += cash;
  }
  await Account.findByIdAndUpdate(from, fromAccount);
  await Account.findByIdAndUpdate(to, toAccount);
  res.status(200).send({ success: true, fromAccount, toAccount });
});

//@desc Get all users with greater cash value or credit value than given value
//@route GET /accounts/greater-than/
//@access public
const getAccountsGreaterThan = asyncHandler(async (req, res) => {
  const minCash = req.query.cash;
  const minCredit = req.query.credit;

  let query = {};
  if (minCash != null && minCredit != null) {
    query = {
      $and: [{ cash: { $gt: minCash } }, { credit: { $gt: minCredit } }],
    };
  } else if (minCash != null) {
    query = { cash: { $gt: minCash } };
  } else if (minCredit != null) {
    query = { credit: { $gt: minCredit } };
  } else {
    res.status(403);
    throw new Error("Invalid query parameters");
  }

  const accounts = await Account.find(query);
  if (!accounts) {
    res.status(500);
    throw new Error("Couldn't get accounts");
  }
  res.status(200).json({ success: true, data: accounts });
});

//@desc Get all users with lesser cash value or credit value than given value
//@route GET /accounts/lesser-than/
//@access public
const getAccountsLesserThan = asyncHandler(async (req, res) => {
  const maxCash = req.query.cash;
  const maxCredit = req.query.credit;

  let query = {};
  if (maxCash != null && maxCredit != null) {
    query = {
      $and: [{ cash: { $lt: maxCash } }, { credit: { $lt: maxCredit } }],
    };
  } else if (maxCash != null) {
    query = { cash: { $lt: maxCash } };
  } else if (maxCredit != null) {
    query = { credit: { $lt: maxCredit } };
  } else {
    res.status(403);
    throw new Error("Invalid query parameters");
  }

  const accounts = await Account.find(query);
  if (!accounts) {
    res.status(500);
    throw new Error("Couldn't get accounts");
  }
  res.status(200).json({ success: true, data: accounts });
});

module.exports = {
  getAccounts,
  createAccount,
  getAccount,
  updateAccount,
  deleteAccount,
  transferMoney,
  getAccountsGreaterThan,
  getAccountsLesserThan,
  changeAccount,
};

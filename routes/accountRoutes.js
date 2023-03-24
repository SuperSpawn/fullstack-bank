const express = require("express");
const {
  getAccounts,
  createAccount,
  getAccount,
  updateAccount,
  deleteAccount,
  transferMoney,
  getAccountsGreaterThan,
  getAccountsLesserThan,
} = require("../controllers/accountController");

const router = express.Router();

router.get("/", getAccounts);
router.post("/", createAccount);
router.get("/greater-than", getAccountsGreaterThan);
router.get("/lesser-than", getAccountsLesserThan);
router.get("/:id", getAccount);
router.put("/:id", updateAccount);
router.delete("/:id", deleteAccount);
router.put("/:from/transfer/:to", transferMoney);

module.exports = router;

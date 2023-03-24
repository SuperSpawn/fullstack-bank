const express = require("express");
const {
  getAccounts,
  createAccount,
  getAccount,
  updateAccount,
  deleteAccount,
} = require("../controllers/accountController");

const router = express.Router();

router.get("/", getAccounts);
router.post("/", createAccount);
router.get("/:id", getAccount);
router.put("/:id", updateAccount);
router.delete("/:id", deleteAccount);

module.exports = router;

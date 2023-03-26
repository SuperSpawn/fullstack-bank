const express = require("express");
const {
  getUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  getActiveUsers,
  getInActiveUsers,
} = require("../controllers/userController");

const router = express.Router();

router.get("/", getUsers);
router.post("/", createUser);
router.get("/active", getActiveUsers);
router.get("/inactive", getInActiveUsers);
router.get("/:id", getUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

module.exports = router;

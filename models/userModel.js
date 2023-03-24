const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
  },
  name: {
    type: String,
    required: [true, "Please add user name"],
  },
  email: {
    type: String,
    required: [true, "Please add user email"],
  },
  isActive: {
    type: Boolean,
  },
  accounts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Account" }],
});

module.exports = mongoose.model("User", userSchema);

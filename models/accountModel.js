const mongoose = require("mongoose");

const accountSchema = mongoose.Schema({
  account_id: {
    type: mongoose.Schema.Types.ObjectId,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, "Account has to be owned"],
  },
  cash: {
    type: Number,
    required: [true, "Please add cash to your account"],
  },
  credit: {
    type: Number,
    required: [true, "Please add credit to your account"],
  },
});

module.exports = mongoose.model("Account", accountSchema);

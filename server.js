const express = require("express");
const connectDb = require("./config/dbConnection");
const errorHandler = require("./middleware/errorHandler");
const dotenv = require("dotenv").config();

connectDb();

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use("/users", require("./routes/userRoutes"));
app.use("/accounts", require("./routes/accountRoutes"));
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

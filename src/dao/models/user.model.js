const mongoose = require("mongoose");

const userCollection = "users";

const userSchema = new mongoose.Schema({
  firstname: String,
  lastname: String,
  email: String,
  age: Number,
  password: String,
  role: String,
});

mongoose.set("strictQuery", false);

const userModel = mongoose.model(userCollection, userSchema);

module.exports = userModel;

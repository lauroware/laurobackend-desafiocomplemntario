import mongoose from "mongoose";

const userCollection = "users";

const userSchema = new mongoose.Schema({
  first_name: String,
  last_name: String,
  email: {
    type: String,
    unique: true,
  },
  age: Number,
  password: String,
  cart: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "cartModel",
  },
  role: {
    type: String,
    default: "user",
  },
});

mongoose.set("strictQuery", false);
const userModel = mongoose.model(userCollection, userSchema);

export default userModel;

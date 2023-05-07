const mongoose = require("mongoose");
const cartsCollection = "carts1";

const cartsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
});

const cartsModel = mongoose.model(cartsCollection, cartsSchema);

module.exports = cartsModel;

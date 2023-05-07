const express = require("express");
const router = express.Router();
const fs = require("fs");
const productsData = fs.readFileSync("./src/products.json", "utf-8");
const products = JSON.parse(productsData);
const path = require("path");
const handlebars = require("express-handlebars");

router.get("/", (req, res) => {
  res.render("index", { products });
});

module.exports = router;

const express = require("express");
const router = express.Router();
const Productos = require("../dao/models/productos.models");

router.get("/productos", async (req, res) => {
  try {
    const products = await Productos.find({});
    res.render("index", { products });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error interno del servidor");
  }
});

module.exports = router;

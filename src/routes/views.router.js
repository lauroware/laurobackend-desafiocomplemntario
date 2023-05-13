const express = require("express");
const router = express.Router();
const productosModel = require("../dao/models/productos.models");

router.get("/productos", async (req, res) => {
  try {
    const products = await Productos.find({});
    res.render("productos", { products });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error interno del servidor");
  }
});

module.exports = router;

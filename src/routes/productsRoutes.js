// Configura las rutas para manejar los productos
const express = require("express");
const { Router } = require("express");
const router = Router();
const productosModel = require("../dao/models/productos.models");

router.use(express.json());

// 1.- Ruta Raiz GET trae todos los productos cargados en el archivo json, tengo una base de  10 productos ficticios ya cargados
router.get("/", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 0;
    const products = await productosModel.find().limit(limit);
    res.json(products);
  } catch (err) {
    console.log("Error al obtener productos: ", err);
    res.status(500).send("Error al obtener productos");
  }
});

// Ruta GET / ID trae el producto con el id seleccionado
router.get("/:id", async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await productosModel.findById(productId);
    if (product) {
      res.json(product);
    } else {
      res.status(404).send(`El ID ${productId} no se encuentra registrado`);
    }
  } catch (err) {
    console.log("Error al obtener producto: ", err);
    res.status(500).send("Error al obtener producto");
  }
});

// Ruta raiz post agrega un producto.
router.post("/", async (req, res) => {
  try {
    const newProduct = new productosModel(req.body);
    const savedProduct = await newProduct.save();
    res.json(savedProduct);
  } catch (err) {
    console.log("Error al guardar producto: ", err);
    res.status(500).send("Error al guardar producto");
  }
});

// Ruta put modifica un producto debo escribir los datos a actualizar y también escribir los datos del producto que no modifico (sino se borran)
router.put("/:id", async (req, res) => {
  try {
    const productId = req.params.id;
    const updatedProduct = await productosModel.findByIdAndUpdate(
      productId,
      req.body,
      { new: true }
    );
    if (updatedProduct) {
      res.json(updatedProduct);
    } else {
      res.status(404).send(`El ID ${productId} no se encuentra registrado`);
    }
  } catch (err) {
    console.log("Error al actualizar producto: ", err);
    res.status(500).send("Error al actualizar producto");
  }
});

// DELETE /api/products/:id
router.delete("/:id", async (req, res) => {
  try {
    const deletedProduct = await productosModel.findByIdAndDelete(
      req.params.id
    );
    if (deletedProduct) {
      res.send(`Producto con ID ${req.params.id} eliminado correctamente`);
    } else {
      res
        .status(404)
        .send({ error: `El ID ${req.params.id} no se encuentra registrado` });
    }
  } catch (err) {
    console.log("Error al eliminar el producto: ", err);
    res.status(500).send("Error al eliminar el producto");
  }
});

module.exports = router;

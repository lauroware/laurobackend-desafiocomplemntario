const express = require("express");
const { Router } = require("express");
const router = Router();
const productosModel = require("./models/productos.models");

router.use(express.json());

router.get("/", async (req, res) => {
  const limit = parseInt(req.query.limit);
  try {
    const products = await productosModel.find();
    if (limit) {
      res.send({ products: products.slice(0, limit) });
    } else {
      res.send({ products });
    }
  } catch (err) {
    console.log("Error al obtener los productos: ", err);
    res.status(500).send("Error al obtener los productos");
  }
});

router.get("/:id", async (req, res) => {
  const productId = req.params.id;
  try {
    const product = await productosModel.findOne({ id: productId });
    if (product) {
      res.send({ product });
    } else {
      res
        .status(404)
        .send({ error: `El ID ${productId} no se encuentra registrado` });
    }
  } catch (err) {
    console.log("Error al obtener el producto: ", err);
    res.status(500).send("Error al obtener el producto");
  }
});

router.post("/", async (req, res) => {
  const newProduct = {
    id: req.body.id,
    title: req.body.title,
    price: req.body.price,
    description: req.body.description,
    thumbnail: req.body.thumbnail,
    stock: req.body.stock,
    code: req.body.code,
    category: req.body.category,
  };
  try {
    const product = await productosModel.create(newProduct);
    res.json(product);
  } catch (err) {
    console.log("Error al crear el producto: ", err);
    res.status(500).send("Error al crear el producto");
  }
});

router.post("/", async (req, res) => {
  const newProduct = {
    id: req.body.id,
    title: req.body.title,
    price: req.body.price,
    description: req.body.description,
    thumbnail: req.body.thumbnail,
    stock: req.body.stock,
    code: req.body.code,
    category: req.body.category,
  };
  try {
    const product = await productosModel.create(newProduct);
    res.json(product);
  } catch (err) {
    console.log("Error al crear el producto: ", err);
    res.status(500).send("Error al crear el producto");
  }
});

// Ruta put modifica un producto
router.put("/:pid", async (req, res) => {
  try {
    const productId = req.params.pid;
    const updatedProduct = await productosModel.findOneAndUpdate(
      { _id: productId },
      req.body,
      { new: true }
    );
    if (updatedProduct) {
      res.json(updatedProduct);
    } else {
      res.status(404).send("Producto no encontrado");
    }
  } catch (err) {
    console.log("Error al actualizar el producto: ", err);
    res.status(500).send("Error al actualizar el producto");
  }
});

// DELETE /api/products/:id
router.delete("/:id", async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
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

// Exporta el módulo
module.exports = router;

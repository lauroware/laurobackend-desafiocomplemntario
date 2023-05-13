const express = require("express");
const { Router } = require("express");
const router = Router();
const productosModel = require("./models/productos.models");

router.use(express.json());

router.get("/", async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;
  const query = req.query.query || "";
  const description = req.query.description || "";
  const skip = (page - 1) * limit;

  const sort = {};
  if (req.query.sort) {
    if (req.query.sort === "desc") {
      sort.price = -1;
    } else {
      sort.price = 1;
    }
  }

  const filter = {};
  if (query) {
    if (req.query.category) {
      filter.category = req.query.category;
    }
  }

  if (description) {
    filter.description = { $regex: description, $options: "i" };
  }

  try {
    const products = await productosModel
      .find(filter)
      .skip(skip)
      .limit(limit)
      .sort(sort);

    const count = await productosModel.countDocuments(filter);

    const totalPages = Math.ceil(count / limit);
    const hasPrevPage = page > 1;
    const hasNextPage = page < totalPages;
    const prevPage = hasPrevPage ? page - 1 : null;
    const nextPage = hasNextPage ? page + 1 : null;
    const prevLink = hasPrevPage
      ? `${req.protocol}://${req.get("host")}${
          req.baseUrl
        }/?limit=${limit}&page=${prevPage}&sort=${
          req.query.sort
        }&query=${query}&description=${description}`
      : null;
    const nextLink = hasNextPage
      ? `${req.protocol}://${req.get("host")}${
          req.baseUrl
        }/?limit=${limit}&page=${nextPage}&sort=${
          req.query.sort
        }&query=${query}&description=${description}`
      : null;

    res.send({
      status: "success",
      payload: products,
      totalPages,
      prevPage,
      nextPage,
      page,
      hasPrevPage,
      hasNextPage,
      prevLink,
      nextLink,
    });
  } catch (err) {
    console.log("Error al obtener los productos: ", err);
    res.status(500).send("Error al obtener los productos");
  }
});

// GET /api/products/:id
// Obtiene un producto por su ID
router.get("/:id", async (req, res) => {
  try {
    const product = await productosModel.findById(req.params.id);
    if (product) {
      res.send(product);
    } else {
      res.status(404).send("Producto no encontrado");
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

// Exporta el módulo
module.exports = router;

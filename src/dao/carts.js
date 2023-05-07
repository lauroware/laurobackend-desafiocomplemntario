const express = require("express");
const { Router } = require("express");
const router = Router();
const cartsModel = require("./cartsModel");

router.use(express.json());

// Ruta raiz para crear un nuevo carrito
router.post("/", async (req, res) => {
  try {
    const newCart = await cartsModel.create({ products: [] });
    res.json(newCart);
  } catch (err) {
    console.log("Error al crear el carrito: ", err);
    res.status(500).send("Error al crear el carrito");
  }
});

// Ruta para ver el carrito por id
router.get("/:id", async (req, res) => {
  const cartId = req.params.id;
  try {
    const cart = await cartsModel.findById(cartId);
    if (cart) {
      res.send({ cart });
    } else {
      res.status(404).send({
        error: `El carrito con ID ${cartId} no se encuentra registrado`,
      });
    }
  } catch (err) {
    console.log("Error al leer el carrito: ", err);
    res.status(500).send("Error al leer el carrito");
  }
});

//Ruta para agregar un producto
router.post("/:id/product/:productId", async (req, res) => {
  const cartId = req.params.id;
  const productId = req.params.productId;
  try {
    const cart = await cartsModel.findById(cartId);
    if (!cart) {
      return res
        .status(404)
        .send(`El carrito con ID ${cartId} no se encuentra registrado`);
    }
    cart.products.push(productId);
    await cart.save();
    res.json(cart);
  } catch (err) {
    console.log("Error al actualizar el carrito: ", err);
    res.status(500).send("Error al actualizar el carrito");
  }
});

module.exports = router;

const express = require("express");
const { Router } = require("express");
const router = Router();
const Cart = require("../dao/models/carts.models");

router.use(express.json());

// Ruta raiz para crear un nuevo carrito
router.post("/", async (req, res) => {
  try {
    const newCart = await Cart.create({ title: "New Cart", price: 0 });
    res.json(newCart);
  } catch (error) {
    console.log("Error al crear el carrito: ", error);
    res.status(500).send("Error al crear el carrito");
  }
});

// Ruta para ver el carrito por id
router.get("/:cid", async (req, res) => {
  const cartId = req.params.cid;
  try {
    const cart = await Cart.findById(cartId);
    if (cart) {
      res.send({ cart });
    } else {
      res.status(404).send({
        error: `El carrito con ID ${cartId} no se encuentra registrado`,
      });
    }
  } catch (error) {
    console.log("Error al buscar el carrito: ", error);
    res.status(500).send("Error al buscar el carrito");
  }
});

// Ruta para agregar un producto
router.post("/:cid/product/:pid", async (req, res) => {
  const productId = req.params.pid;
  const cartId = req.params.cid;
  try {
    const cart = await Cart.findById(cartId);
    if (!cart) {
      return res
        .status(404)
        .send(`El carrito con ID ${cartId} no se encuentra registrado`);
    }
    cart.products.push(productId);
    await cart.save();
    res.json(cart);
  } catch (error) {
    console.log("Error al agregar el producto al carrito: ", error);
    res.status(500).send("Error al agregar el producto al carrito");
  }
});

module.exports = router;

const express = require("express");
const router = express.Router();
const Cart = require("../dao/models/carts.models");
const Product = require("../dao/models/productos.models");

router.post("/", async (req, res) => {
  try {
    const cart = new Cart();
    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error del servidor" });
  }
});

// Actualizar el carrito con un array de productos
router.put("/:cid", async (req, res) => {
  try {
    const { cid } = req.params;
    const { products } = req.body;

    const cart = await Cart.findByIdAndUpdate(cid, { products }, { new: true });
    res.status(200).json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error del servidor" });
  }
});

router.post("/:cid/products", async (req, res) => {
  try {
    const { cid } = req.params;
    const { product, quantity } = req.body;

    const cart = await Cart.findById(cid);
    const productInfo = await Product.findById(product);

    if (!productInfo) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    const index = cart.products.findIndex((p) => p.product == product);
    if (index !== -1) {
      cart.products[index].quantity += quantity;
      cart.products[index].totalPrice =
        cart.products[index].quantity * productInfo.price;
    } else {
      cart.products.push({
        product,
        title: productInfo.title,
        quantity,
        unitPrice: productInfo.price,
        totalPrice: quantity * productInfo.price,
      });
    }

    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error del servidor" });
  }
});

// Actualizar la cantidad de un producto en el carrito
router.put("/:cid/products/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const { quantity } = req.body;

    const cart = await Cart.findById(cid);

    const index = cart.products.findIndex((p) => p.product == pid);
    if (index === -1) {
      return res
        .status(404)
        .json({ message: "Producto no encontrado en el carrito" });
    }

    const product = await Product.findById(pid);

    cart.products[index].quantity = quantity;
    cart.products[index].totalPrice = quantity * product.price;

    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error del servidor" });
  }
});

// Eliminar un producto del carrito
router.delete("/:cid/products/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;

    const cart = await Cart.findById(cid);

    const index = cart.products.findIndex((p) => p.product == pid);
    if (index === -1) {
      return res
        .status(404)
        .json({ message: "Producto no encontrado en el carrito" });
    }

    cart.products.splice(index, 1);

    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error del servidor" });
  }
});

// Eliminar todos los productos del carrito
router.delete("/:cid", async (req, res) => {
  try {
    const { cid } = req.params;

    const cart = await Cart.findById(cid);

    cart.products = [];

    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error del servidor" });
  }
});

module.exports = router;

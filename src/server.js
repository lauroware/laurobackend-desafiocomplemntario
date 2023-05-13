const express = require("express");
const productRoutes = require("./dao/products");
const cartRoutes = require("./dao/carts");
const app = express();
const handlebars = require("handlebars");
const { Server } = require("socket.io");
const routerViews = require("./routes/views.router.js");
const httpServer = app.listen(8080, () => console.log("Server Up "));
const socketServer = new Server(httpServer);
const mongoose = require("mongoose");
const fs = require("fs");
const Product = require("./dao/models/productos.models");
const exphbs = require("express-handlebars");

mongoose
  .connect(
    "mongodb+srv://lauroware:totinas@totinas.z2xnjel.mongodb.net/ecommerce?retryWrites=true&w=majority",
    { useNewUrlParser: true }
  )
  .then(() => console.log("Conexión a MongoDB establecida"))
  .catch((err) => console.log(`Error al conectar a MongoDB: ${err}`));

app.use(express.json());
app.use("/api/products", productRoutes);
app.use("/api/carts", cartRoutes);
app.set("views", __dirname + "/views");
app.use(express.static(__dirname + "/public"));

const app1 = express();
const hbs = exphbs.create({
  /* config */
});

app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");

async function server() {
  // No estoy seguro si tengo que manejar todo lo que sigue desde product manager, pero como involucra tema del servidor (por websocket lo dejo aca)
  let products = await Product.find({});

  // Rutas
  app.get("/", (req, res) => {
    res.render("home", { title: "Mi sitio web", message: "¡Bienvenidos!" });
  });

  let log = [];

  app.get("/realTimeProducts", (req, res) => {
    res.render("realTimeProducts", { products });
  });

  // Manejo de errores para rutas no encontradas
  app.use((req, res, next) => {
    const error = new Error(`Ruta no encontrada: ${req.originalUrl}`);
    error.status = 404;
    next(error);
  });

  // Middleware de manejo de errores
  app.use((err, req, res, next) => {
    const status = err.status || 500;
    const message = err.message || "Error interno del servidor";
    console.error(err.stack);
    res.status(status).json({ error: message });
  });

  app.get("/ruta-con-error", (req, res, next) => {
    const error = new Error("Este es un mensaje de error");
    error.status = 400;
    next(error);
  });

  socketServer.on("connection", (socket) => {
    console.log(`Nuevo cliente ${socket.id} conectado...`);

    // Emitir todos los productos cuando un cliente se conecta
    socket.emit("products", products);

    // Agregar un nuevo producto
    socket.on("add-product", (newProduct) => {
      // Encontrar el ID más grande y asignar el ID al nuevo producto
      const lastProduct = products[products.length - 1];
      const newProductId = lastProduct ? lastProduct.id + 1 : 1;
      newProduct.id = newProductId;

      // Agregar el nuevo producto al arreglo de productos
      products.push(newProduct);

      // Emitir el nuevo producto a todos los clientes conectados
      socketServer.emit("product-added", newProduct);

      // Escribir los productos actualizados en el archivo products.json
      fs.writeFile("./src/products.json", JSON.stringify(products), (err) => {
        if (err) {
          console.error(err);
          return;
        }
        console.log("Archivo products.json actualizado.");
      });
    });

    // Eliminar un producto
    socket.on("delete-product", (productId) => {
      console.log(
        `Evento 'delete-product' recibido para el producto con ID ${productId}`
      );

      // Encontrar el índice del producto en el arreglo de productos
      const productIndex = products.findIndex(
        (product) => product.id === productId
      );

      if (productIndex === -1) {
        // Si el producto no se encuentra, emitir un mensaje de error al cliente
        socket.emit(
          "product-not-found",
          `No se encontró el producto con ID ${productId}`
        );
        return;
      }

      // Eliminar el producto del arreglo de productos
      const [removedProduct] = products.splice(productIndex, 1);

      // Emitir el ID del producto eliminado a todos los clientes conectados
      socketServer.emit("product-deleted", removedProduct.id);

      // Escribir los productos actualizados en el archivo products.json
      fs.writeFile("./src/products.json", JSON.stringify(products), (err) => {
        if (err) {
          console.error(err);
          return;
        }
        console.log("Archivo products.json actualizado.");
      });

      console.log(
        `Producto ${removedProduct.id} eliminado del arreglo 'products'.`
      );
    });

    // Agregar un nuevo mensaje al chat
    socket.on("new-message", (message) => {
      // Agregar el mensaje al arreglo de mensajes
      log.push(message);

      // Emitir el nuevo mensaje a todos los clientes conectados
      socketServer.emit("message", message);
    });

    // Emitir el historial de mensajes al cliente que se acaba de conectar
    socket.emit("log", log);
  });
}

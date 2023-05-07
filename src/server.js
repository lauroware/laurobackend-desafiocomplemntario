const express = require("express");
const productRoutes = require("./routes/productsRoutes");
const cartRoutes = require("./routes/cartRoutes");
const app = express();
const handlebars = require("express-handlebars");
const { Server } = require("socket.io");
const routerViews = require("./routes/views.router.js");
const fs = require("fs");
const httpServer = app.listen(8080, () => console.log("Server Up "));
const socketServer = new Server(httpServer);
const mongoose = require("mongoose");

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
app.engine("handlebars", handlebars.engine());
app.set("views", __dirname + "/views");
app.set("views", "./src/views");
app.set("view engine", "handlebars");
app.use(express.static(__dirname + "/public"));

// No estoy seguro si tengo que manejar todo lo que sigue desde product manager, pero como involucra tema del servidor (por websocket lo dejo aca)
const productsData = fs.readFileSync("./src/products.json", "utf-8");
let products = JSON.parse(productsData);

app.get("/", (req, res) => {
  res.render("index", { products });
});

let log = [];

app.get("/realTimeProducts", (req, res) => {
  res.render("realTimeProducts", { products });
});

socketServer.on("connection", (socket) => {
  console.log(`Nuevo cliente ${socket.id} conectado...`);
  //agregar productos del realtime products
  socket.on("add-product", (newProduct) => {
    const lastProduct = products[products.length - 1];
    const newProductId = lastProduct ? lastProduct.id + 1 : 1;
    newProduct.id = newProductId;
    products.push(newProduct);
    socketServer.emit("product-added", newProduct);
    fs.writeFile("./src/products.json", JSON.stringify(products), (err) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log("Archivo products.json actualizado.");
    });
  });
  //borrar productos de realtime productos
  socket.on("delete-product", (productId) => {
    console.log(
      `Evento 'delete-product' recibido para el producto con ID ${productId}`
    );

    // Encuentra el índice del producto en el arreglo "products"
    const productIndex = products.findIndex(
      (product) => product.id === productId
    );

    if (productIndex === -1) {
      // Si no se encuentra el producto, envía un mensaje al cliente de que no se encontró el producto
      socket.emit(
        "product-not-found",
        `No se encontró el producto con ID ${productId}`
      );
      return;
    }

    // Elimina el producto del arreglo "products"
    const [removedProduct] = products.splice(productIndex, 1);

    // Escribe el archivo "products.json" con el arreglo actualizado
    fs.writeFile("./src/products.json", JSON.stringify(products), (err) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log("Archivo products.json actualizado.");
    });

    // Envía un mensaje al cliente indicando que el producto fue eliminado
    socketServer.emit("product-deleted", removedProduct.id);

    console.log(
      `Producto ${removedProduct.id} eliminado del arreglo 'products'.`
    );
  });
});

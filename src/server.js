const express = require("express");
const productRoutes = require("./dao/products");
const cartRoutes = require("./dao/carts");
const app = express();
const { Server } = require("socket.io");
const viewsRouter = require("./routes/views.router.js");
const httpServer = app.listen(8080, () => console.log("Server Up "));
const socketServer = new Server(httpServer);
const mongoose = require("mongoose");
const fs = require("fs");
const Product = require("./dao/models/productos.models");
const session = require("express-session");
const path = require("path");
const sessionRouter = require("./routes/sessions.router");
const MongoStore = require("connect-mongo");
const handlebars = require("express-handlebars");

mongoose
  .connect(
    "mongodb+srv://lauroware:totinas@totinas.z2xnjel.mongodb.net/ecommerce?retryWrites=true&w=majority",
    { useNewUrlParser: true }
  )
  .then(() => console.log("Conexión a MongoDB establecida"))
  .catch((err) => console.log(`Error al conectar a MongoDB: ${err}`));

app.use(viewsRouter);
app.use(express.json());
app.use("/api/products", productRoutes);
app.use("/api/carts", cartRoutes);
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use("/sessions", sessionRouter);
app.engine("handlebars", handlebars.engine);
app.set("view engine", "handlebars");

app.use(
  session({
    store: MongoStore.create({
      mongoUrl:
        "mongodb+srv://lauroware:totinas@totinas.z2xnjel.mongodb.net/ecommerce?retryWrites=true&w=majority",
      dbName: "session-mongo-storage",
    }),
    secret: "mysecret",
    resave: true,
    saveUninitialized: true,
  })
);

app.get("/preference", (req, res) => {
  const address = {
    calle: "calle 1",
    zipcode: 1416,
    city: "San Martín",
  };
  req.session.manor_adress = address;
  res.send("dirección guardada con éxito");
});

app.get("/profile", (req, res) => {
  if (!req.session.manor_adress)
    return res.send("no has registrado ninguna dirección de envío");
  const direccion = req.session.manor_adress;
  res.send(
    `Tu dirección de envío es: Calle: ${direccion.calle} - CIUDAD: ${direccion.city}`
  );
});

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.send("error al hacer logout");
  });
  return res.send("logout");
});

const DB = [
  {
    username: "coder",
    password: "secret",
    role: "admin",
  },
];

const auth = (req, res, next) => {
  if (req.session.user) return next();
  return res.send("error de autenticación");
};

app.get("/api/login", (req, res) => {
  const { username, password } = req.query;
  const user = DB.find(
    (u) => u.username === username && u.password === password
  );
  if (!user) return res.send("credenciales inválidas");
  req.session.user = user;
  res.send("login exitoso");
});

app.get("/api/private", auth, (req, res) => res.send("bienvenidos"));

app.get("/cookie/set", (req, res) => {
  res.cookie("oreo", "es una masita muy rica").send("cookie seteada!");
});

app.get("/cookie/get", (req, res) => {
  res.send(req.cookies.oreo);
});

async function server() {
  let products = await Product.find({});

  // Rutas
  app.get("/", (req, res) => {
    res.render("index", { products });
  });

  app.get("/productos", async (req, res) => {
    try {
      const products = await Product.find({});
      res.render("index", { products });
    } catch (err) {
      console.error(err);
      res.status(500).send("Error al obtener los productos");
    }
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

server();

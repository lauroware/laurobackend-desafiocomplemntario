import productRouter from "./routes/products.router.js";
import cartRouter from "./routes/cart.router.js";
import chatRouter from "./routes/chat.router.js";
import messagesModel from "./dao/models/messages.model.js";
import productViewsRouter from "./routes/products.views.router.js";
import sessionRouter from "./routes/session.router.js";
import { obtenerProductos } from "./routes/products.router.js";

// Resto del código del archivo

const run = (socketServer, app) => {
  app.use((req, res, next) => {
    req.io = socketServer;
    next();
  });

  app.use("/session", sessionRouter);

  app.use("/api/products", productRouter);
  app.use("/api/carts", cartRouter);
  app.use("/api/chat", chatRouter);

  app.use("/products", (req, res, next) => {
    // Obtener la lista de productos desde algún origen de datos
    const products = obtenerProductos();

    // Renderizar la plantilla "products.handlebars" y pasar los datos de los productos
    res.render("products", { data: { docs: products } });
  });

  socketServer.on("connection", (socket) => {
    console.log("New client connected");
    socket.on("message", async (data) => {
      await messagesModel.create(data);
      let messages = await messagesModel.find().lean().exec();
      socketServer.emit("logs", messages);
    });
  });

  // Eliminar esta parte del código
  // app.use("/", (req, res) => {
  //   // Renderiza la plantilla "products.handlebars"
  //   res.render("products");
  // });
};

export default run;

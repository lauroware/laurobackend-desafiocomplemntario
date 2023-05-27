import express from "express";
import handlebars from "express-handlebars";
import { Server } from "socket.io";
import mongoose from "mongoose";
import session from "express-session";
import MongoStore from "connect-mongo";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import userModel from "./dao/models/user.model.js";
import __dirname from "./utils.js";
import run from "./run.js";
import initializePassport from "./passport.config.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.engine("handlebars", handlebars.engine());
app.set("views", __dirname + "/views");
app.set("view engine", "handlebars");

const httpServer = app.listen(8080, () => console.log("Server Up "));
const socketServer = new Server(httpServer);

mongoose
  .connect(
    "mongodb+srv://lauroware:totinas@totinas.z2xnjel.mongodb.net/ecommerce?retryWrites=true&w=majority",
    { useNewUrlParser: true }
  )
  .then(() => console.log("Conexión a MongoDB establecida"))
  .catch((err) => console.log(`Error al conectar a MongoDB: ${err}`));

app.use(
  session({
    store: MongoStore.create({
      mongoUrl:
        "mongodb+srv://lauroware:totinas@totinas.z2xnjel.mongodb.net/ecommerce?retryWrites=true&w=majority",
      dbName: "ecommerce",
    }),
    secret: "mysecret",
    resave: true,
    saveUninitialized: true,
  })
);

initializePassport();
app.use(passport.initialize());
app.use(passport.session());

run(socketServer, app);

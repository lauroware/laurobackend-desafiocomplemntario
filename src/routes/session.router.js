import { fileURLToPath } from "url";
import { dirname } from "path";
import { Router } from "express";
import userModel from "../dao/models/user.model.js";
import path from "path";
import { createHash, isValidPassword } from "../utils.js";
import passport from "passport";
import { passportCall } from "../utils.js";
import { authToken } from "../utils.js";
import { generateToken } from "../utils.js";
import { authorization } from "../utils.js";
import axios from "axios";

const token = "marvel"; //
const router = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

//Vista para registrar usuarios
router.get("/register", (req, res) => {
  res.render("sessions/register");
});

// API para crear usuarios en la DB
router.post("/register", passport.authenticate("register"), (req, res) => {
  const user = req.body;

  const access_token = generateToken(user);
  res.json({ status: "success", access_token });
});

router.get("/failRegister", (req, res) => {
  res.send({ error: "Failed!" });
});

// Vista de Login
router.get("/login", (req, res) => {
  res.render("sessions/login");
});

// API para login
router.post(
  "/login",
  passport.authenticate("login"),
  async (req, res, next) => {
    if (!req.user) {
      return res
        .status(400)
        .json({ status: "error", error: "Invalid credentials" });
    }

    // Verificar si el usuario es administrador
    if (
      req.user.email === "adminCoder@coder.com" &&
      req.body.password === "123"
    ) {
      req.user.role = "admin";
    } else {
      req.user.role = "user";
    }

    req.session.user = {
      first_name: req.user.first_name,
      last_name: req.user.last_name,
      email: req.user.email,
      age: req.user.age,
      role: req.user.role,
    };

    const access_token = generateToken(req.user); // Generar el token JWT

    res.cookie("marvel", access_token);
    res.redirect("/session/profile");
  }
);

router.get("/failLogin", (req, res) => {
  res.render("sessions/failLogin", {
    error: "Su usuario o contraseña no son correctos",
  });
});

const config = {
  headers: {
    Authorization: "Bearer [marvel]",
  },
};

// router.get current
router.get(
  "/current",
  passportCall("jwt"),
  authorization("admin"),
  (req, res) => {
    res.json({ status: "success", payload: req.user });
  }
);

// verificar si imprime la cockie lo puse porque tenía errores
router.get("/cookies", (req, res) => {
  console.log(req.cookies);
  res.send("Cookies printed in the console");
});

router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] }),
  (req, res) => {}
);

router.get(
  "/githubcallback",
  passport.authenticate("github", { failureRedirect: "/api/session/login" }),
  async (req, res) => {
    req.session.user = req.user;
    res.redirect("/session/profile");
  }
);

router.get("/profile", (req, res) => {
  const profilePath = path.join(
    __dirname,
    "../views/sessions/profile.handlebars"
  );
  res.render(profilePath, { user: req.session.user });
});

// Cerrar sesión
router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
      res.status(500).render("errors/base", { error: err });
    } else res.redirect("/session/login");
  });
});

export default router;

import { fileURLToPath } from "url";
import { dirname } from "path";
import { Router } from "express";
import userModel from "../dao/models/user.model.js";
import path from "path";
import { createHash, isValidPassword } from "../utils.js";
import passport from "passport";

const router = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

//Vista para registrar usuarios
router.get("/register", (req, res) => {
  res.render("sessions/register");
});

// API para crear usuarios en la DB
router.post(
  "/register",
  passport.authenticate("register", {
    failureRedirect: "/session/failRegister",
  }),
  async (req, res) => {
    res.redirect("/session/login");
  }
);

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
  passport.authenticate("login", {
    failureRedirect: "/session/failLogin",
  }),
  async (req, res) => {
    if (!req.user) {
      return res
        .status(400)
        .send({ status: "error", error: "Invalid credentials" });
    }

    // Verificar si el usuario es administrador
    if (
      req.user.email === "adminCoder@coder.com" &&
      req.body.password === "123"
    ) {
      req.user.role = "admin";
    } else {
      req.user.role = "usuario";
    }

    req.session.user = {
      first_name: req.user.first_name,
      last_name: req.user.last_name,
      email: req.user.email,
      age: req.user.age,
      role: req.user.role,
    };

    res.redirect("/session/profile");
  }
);
router.get("/failLogin", (req, res) => {
  res.send({ error: "Fail Login" });
});

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

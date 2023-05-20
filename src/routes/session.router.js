import { fileURLToPath } from "url";
import { dirname } from "path";
import { Router } from "express";
import userModel from "../dao/models/user.model.js";
import path from "path";

const router = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Vista para registrar usuarios
router.get("/register", (req, res) => {
  res.render("sessions/register");
});

// API para crear usuarios en la DB
router.post("/register", async (req, res) => {
  const userNew = req.body;
  console.log(userNew);

  const user = new userModel(userNew);
  await user.save();

  res.redirect("/session/login");
});

// Vista de Login
router.get("/login", (req, res) => {
  res.render("sessions/login");
});

// API para login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await userModel.findOne({ email, password }).lean().exec();
  if (!user) {
    return res.status(401).render("errors/base", {
      error: "Error en email y/o password",
    });
  }

  // Verificar si el usuario es administrador
  if (email === "adminCoder@coder.com" && password === "123") {
    user.role = "admin";
  } else {
    user.role = "usuario";
  }

  req.session.user = user;
  res.redirect("/session/profile");
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

const { Router } = require("express");
const userModel = require("../dao/models/user.model");

const router = Router();

router.get("/register", (req, res) => {
  res.render("sessions/register");
});

router.post("/register", async (req, res) => {
  const userNew = req.body;
  const user = new userModel(userNew);
  await user.save();
  res.redirect("/sessions/login");
});

router.get("/login", (req, res) => {
  res.render("sessions/login");
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await userModel.findOne({ email, password }).lean().exec();
  if (!user) {
    return res.status(401).render("errors/base", {
      error: "Error en email o contraseña",
    });
  }
  req.session.user = user;
  res.redirect("/productos");
});

router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) res.status(500).render("errors/base", { error: err });
    else res.redirect("/sessions/login");
  });
});

module.exports = router;

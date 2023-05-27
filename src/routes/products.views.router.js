import { Router } from "express";
import productModel from "../dao/models/products.model.js";

const router = Router();

router.get("/", async (req, res) => {
  const filter = req.query?.filter || "";

  const search = {};
  if (filter) {
    search.title = filter;
  }

  try {
    const products = await productModel.find(search).lean().exec();
    const user = req.session.user;

    res.render("products", { products, user });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al obtener los productos");
  }
});

export default router;

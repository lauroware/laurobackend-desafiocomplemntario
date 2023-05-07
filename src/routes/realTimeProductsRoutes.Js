const express = require("express");
const router = express.Router();

router.get("/realtimeproducts", (req, res) => {
  res.render("realTimeProducts");
});

module.exports = router;

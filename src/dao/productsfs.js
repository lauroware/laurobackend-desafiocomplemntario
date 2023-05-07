const fs = require("fs");

function leerProductos(callback) {
  fs.readFile("src/products.json", "utf-8", (err, data) => {
    if (err) {
      console.log("Error al leer el archivo de productos: ", err);
      return callback("Error al leer el archivo de productos", null);
    }
    const products = JSON.parse(data);
    callback(null, products);
  });
}

module.exports = {
  leerProductos,
};

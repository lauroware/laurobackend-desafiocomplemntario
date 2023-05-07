const socket = io();

socket.on("connect", () => {
  console.log("Conexión establecida con el servidor de socket.io");
});

// Eliminación de producto
const deleteProductForm = document.querySelector("#deleteProductForm");
deleteProductForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const productIdInput = deleteProductForm.querySelector("#deleteProductId");
  const productId = productIdInput.value;
  socket.emit("delete-product", productId);

  // Notificación de sweet alert
  Swal.fire({
    title: "Producto eliminado",
    text: `El producto con ID ${productId} fue eliminado.`,
    icon: "success",
  });

  deleteProductForm.reset();
});

//agregar producto
const addProductForm = document.querySelector("#addProductForm");
addProductForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const nameInput = addProductForm.querySelector("#title");
  const descriptionInput = addProductForm.querySelector("#description");
  const priceInput = addProductForm.querySelector("#price");
  const thumbnailInput = addProductForm.querySelector("#thumbnail");
  const codeInput = addProductForm.querySelector("#code");
  const stockInput = addProductForm.querySelector("#stock");
  const categoryInput = addProductForm.querySelector("#category");

  const newProduct = {
    title: nameInput.value,
    description: descriptionInput.value,
    price: parseFloat(priceInput.value),
    thumbnail: thumbnailInput.value,
    code: parseInt(codeInput.value),
    stock: parseInt(stockInput.value),
    category: categoryInput.value,
  };

  socket.emit("add-product", newProduct);

  //Notificación de sweet alert
  Swal.fire({
    title: "Producto agregado",
    text: `El producto ${newProduct.title} fue agregado.`,
    icon: "success",
  });

  addProductForm.reset();
});

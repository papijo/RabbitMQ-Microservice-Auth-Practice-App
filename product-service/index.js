const express = require("express");
const app = express();
const PORT = 7071;
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const amqp = require("amqplib");
const Product = require("./Product");
const isAuthenticated = require("../isAuthenticated");
app.use(express.json());

let channel, connection, order;

mongoose.connect(
  "mongodb://localhost/product-service",
  { useNewUrlParser: true },
  () => {
    console.log(`Product-Service DB Connected`);
  }
);

async function connect() {
  const amqpServer = "amqp://localhost:5672";
  connection = await amqp.connect(amqpServer);
  channel = await connection.createChannel();
  await channel.assertQueue("PRODUCT");
}
connect();

//Buy a product
app.post("/product/buy", isAuthenticated, async (req, res) => {
  const { ids } = req.body;
  const products = await Product.find({ _id: { $in: ids } });
  channel.sendToQueue(
    "ORDER",
    Buffer.from(
      JSON.stringify({
        products,
        userEmail: req.user.email,
      })
    )
  );
  channel.consume("PRODUCT", (data) => {
    console.log("Consuming PRODUCT Queue");
    order = JSON.parse(data.content);
    channel.ack(data);
  });

  //Code can be added to save Order in this database as a backup
  return res.json(order);
});

//Create a new Product
app.post("/product/create", isAuthenticated, async (req, res) => {
  const { name, description, price } = req.body;
  const newProduct = new Product({
    name,
    description,
    price,
  });
  await newProduct.save();
  return res.json(newProduct);
});

app.listen(PORT, () => {
  console.log(`Product-Service Microservice is running at PORT: ${PORT}`);
});

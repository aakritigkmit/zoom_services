const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const { sequelize } = require("./src/models");
const { connectToRedis } = require("./src/config/redis");
const { registerRoutes } = require("./src/routes/index.js");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

registerRoutes(app);

const connectDb = async function () {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully");
  } catch (error) {
    console.log("error generated while connected to databse", error);
  }
};

// app.use;
connectDb();
connectToRedis();

app.get("/", (req, res) => {
  res.send("Hello world");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

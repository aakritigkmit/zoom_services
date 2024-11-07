const express = require("express");
const { sequelize } = require("./src/models");
const dotenv = require("dotenv");

dotenv.config();

const connectDb = async function () {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully");
  } catch (error) {
    console.log("error generated while connected to databse", error);
  }
};

connectDb();

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello world");
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

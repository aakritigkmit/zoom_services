const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const { sequelize } = require("./src/models");
const { connectToRedis } = require("./src/config/redis");
const { registerRoutes } = require("./src/routes/index.js");
const { initializeSchedulers } = require("./src/schedulers");

const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const path = require("path");

const app = express();

const swaggerDocument = YAML.load(
  path.join(__dirname, "/src/swaggers/swagger.yaml"),
);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

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

connectDb();
connectToRedis();
initializeSchedulers();

app.get("/", (req, res) => {
  res.send("Hello world");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

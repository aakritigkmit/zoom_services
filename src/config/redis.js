const redis = require("redis");
const dotenv = require("dotenv");
dotenv.config();

const client = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
});

async function connectToRedis() {
  client.connect().catch(console.error);
  client.on("connect", () => {
    console.log("Connected to Redis successfully");
  });
  client.on("error", (err) => {
    console.error("Redis connection error:", err.message);
  });
}

module.exports = { connectToRedis, client };

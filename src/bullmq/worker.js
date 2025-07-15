const { Worker } = require("bullmq");
const axios = require("axios");
require("dotenv").config();

const worker = new Worker(
  process.env.QUEUE_NAME,
  async (job) => {
    const { url, payload } = job.data;
    try {
const { headers, body: base64Body } = payload;

const buffer = Buffer.from(base64Body, "base64"); // decode back to Buffer

      const response = await axios.post(url, buffer, { headers }); // Include headers in the request
      return response.data; // Optional: store response as job result
    } catch (err) {
      // console.log("error", err);
      console.error("HTTP task failed:", err.message);
      throw err; // Will trigger retry if attempts > 1
    }
  },
  {
    connection: {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      password: process.env.REDIS_PASSWORD,
    },
    concurrency: 200,
    // Optional: concurrency, limiter, etc.
  }
);

module.exports = worker;

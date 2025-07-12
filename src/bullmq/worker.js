const { Worker } = require('bullmq');
const axios = require('axios');
require('dotenv').config();

const worker = new Worker(process.env.QUEUE_NAME, async (job) => {
  const { url, payload } = job.data;
  try {
    const response = await axios.post(url, payload);
    console.log('HTTP task completed:', response.data);
    return response.data; // Optional: store response as job result
  } catch (err) {
    console.error('HTTP task failed:', err.message);
    throw err; // Will trigger retry if attempts > 1
  }
}, {
  connection: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
  },
  // Optional: concurrency, limiter, etc.
});

module.exports = worker;

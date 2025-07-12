const { Queue } = require('bullmq');
require('dotenv').config();

const queue = new Queue(process.env.QUEUE_NAME, {
  connection: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
  },
});

module.exports = queue;

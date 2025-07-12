const express = require('express');
const queue = require('./bullmq/queue');
require('./bullmq/worker'); // Start the worker
const Arena = require('bull-arena');
const app = express();
const { Queue, FlowProducer } = require('bullmq');


const arenaConfig = Arena(
  {
    BullMQ: Queue,
    FlowBullMQ: FlowProducer,
    queues: [
      {
        type: 'bullmq',
        name: process.env.QUEUE_NAME,      // Must match your BullMQ queue name
        hostId: 'My BullMQ Queues',        // Any label you like
        redis: {
          host: process.env.REDIS_HOST,
          port: Number(process.env.REDIS_PORT),
          password: process.env.REDIS_PASSWORD,
        },
      },
    ],
  },
  {
    basePath: '/arena',      // Dashboard will be at http://localhost:3000/arena
    disableListen: true,     // Let your app handle the server
  }
);

app.use('/', arenaConfig);

// Enqueue a job
app.post('/enqueue', async (req, res) => {
  // Example: enqueue a job with a URL and payload
  const { url, payload } = req.body;
  const job = await queue.add('httpTask', { url, payload });
  res.json({ jobId: job.id, status: 'enqueued' });
});

// Pause queue
app.post('/pause', async (req, res) => {
  await queue.pause();
  res.json({ status: 'paused' });
});

// Resume queue
app.post('/resume', async (req, res) => {
  await queue.resume();
  res.json({ status: 'resumed' });
});

app.listen(4500, () => console.log('HTTP queue server running on port 4500'));

const express = require('express');
const queue = require('./bullmq/queue');
require('./bullmq/worker'); // Start the worker
const Arena = require('bull-arena');
const app = express();
const { Queue, FlowProducer } = require('bullmq');

app.use(express.json()); // Middleware to parse JSON request bodies


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

// Enqueue multiple jobs
app.post('/enqueue-bulk', async (req, res) => {
  const jobs = req.body; // Expecting an array of job objects: [{ name: 'taskName', data: { ... } }]
  if (!Array.isArray(jobs) || jobs.length === 0) {
    return res.status(400).json({ error: 'Request body must be a non-empty array of jobs.' });
  }
  try {
    const addedJobs = await queue.addBulk(jobs);
    res.json({ status: 'enqueued', jobIds: addedJobs.map(job => job.id) });
  } catch (error) {
    console.error('Error adding bulk jobs:', error);
    res.status(500).json({ error: 'Failed to enqueue bulk jobs.' });
  }
});

app.listen(3000, () => console.log('HTTP queue server running on port 4500'));

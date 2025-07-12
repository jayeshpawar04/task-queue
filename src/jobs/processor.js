module.exports = async function(job) {
  // Example: Make an HTTP request, send an email, etc.
  console.log('Processing job:', job.data);
  // Simulate work
  await new Promise(r => setTimeout(r, 1000));
};

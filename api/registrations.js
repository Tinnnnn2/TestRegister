const express = require('express');
const app = express();

app.get('/api/registrations', (req, res) => {
  res.json({ message: 'Hello from serverless!' });
});

module.exports = app;
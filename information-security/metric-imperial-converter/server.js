'use strict';

const express = require('express');
const app = express();
const apiRoutes = require('./routes/api');

app.use('/api', apiRoutes);

app.use((req, res) => {
  res.status(404).send('Not Found');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log('Server running on port ' + port);
});

module.exports = app;

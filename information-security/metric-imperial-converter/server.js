'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const apiRoutes = require('./routes/api');

const app = express();

app.use(cors({ origin: '*' }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api', apiRoutes);

// Not found middleware
app.use((req, res) => {
  res.status(404)
    .type('text')
    .send('Not Found');
});

// Start server (FCC uses this)
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});

module.exports = app;

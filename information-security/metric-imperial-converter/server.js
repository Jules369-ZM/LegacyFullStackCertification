"use strict";

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require('dotenv').config();

const apiRoutes = require("./routes/api");
const fccTestingRoutes = require('./routes/fcctesting');

const app = express();

app.use('/public', express.static(process.cwd() + '/public'));

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// API routes
app.use("/api", apiRoutes);

// FCC testing routes
fccTestingRoutes(app);

// Root route (instructions page)
app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Metric-Imperial Converter API</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
            .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            h1 { text-align: center; }
            code { background: #f1f1f1; padding: 2px 6px; border-radius: 3px; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🚀 Metric-Imperial Converter API</h1>
            <p>Use the endpoint: <code>/api/convert?input=[number][unit]</code></p>
            <p>Examples:</p>
            <ul>
                <li><code>/api/convert?input=10L</code></li>
                <li><code>/api/convert?input=5kg</code></li>
                <li><code>/api/convert?input=1/2gal</code></li>
            </ul>
        </div>
    </body>
    </html>
  `);
});

// 404 handler
app.use((req, res) => res.status(404).type("text").send("Not Found"));

// Start server
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Server running on port " + listener.address().port);
});

module.exports = app;

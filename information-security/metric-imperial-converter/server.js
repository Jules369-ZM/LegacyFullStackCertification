'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const apiRoutes = require('./routes/api');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api', apiRoutes);

// Root route
app.get('/', (req, res) => {
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
            h1 { color: #333; text-align: center; }
            .api-info { background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0; }
            .endpoint { background: #e9ecef; padding: 10px; margin: 10px 0; border-radius: 3px; }
            .method { font-weight: bold; color: #28a745; }
            code { background: #f1f1f1; padding: 2px 6px; border-radius: 3px; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🚀 Metric-Imperial Converter API</h1>
            <p><strong>Status:</strong> ✅ Server is running successfully!</p>

            <div class="api-info">
                <h2>📋 API Endpoints</h2>
                <div class="endpoint">
                    <span class="method">GET</span> <code>/api/convert?input=[number][unit]</code>
                </div>
                <p><strong>Examples:</strong></p>
                <ul>
                    <li><code>/api/convert?input=10L</code> - Convert 10 liters to gallons</li>
                    <li><code>/api/convert?input=5kg</code> - Convert 5 kilograms to pounds</li>
                    <li><code>/api/convert?input=1/2gal</code> - Convert 0.5 gallons to liters</li>
                </ul>
            </div>

            <div class="api-info">
                <h2>🧪 Browser Console Testing</h2>
                <p>Open your browser's Developer Tools (F12) and go to the Console tab to test the API:</p>
                <pre><code>// Test valid conversion
fetch('/api/convert?input=10L')
  .then(res => res.json())
  .then(data => console.log(data));

// Test invalid input
fetch('/api/convert?input=32g')
  .then(res => res.json())
  .then(data => console.log(data));</code></pre>
            </div>

            <p><strong>✅ Ready for testing!</strong> Open the browser console and start testing the API endpoints.</p>
        </div>
    </body>
    </html>
  `);
});

// Not found middleware
app.use((req, res) => {
  res.status(404).type('text').send('Not Found');
});

// Start server
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});

module.exports = app;

const express = require('express');
const fetch = require('node-fetch');
const app = express();

app.use('/swiggy', async (req, res) => {
  // Remove '/swiggy' from the start of the path and append to Swiggy base URL
  const swiggyPath = req.originalUrl.replace(/^\/swiggy/, '');
  const url = 'https://www.swiggy.com' + swiggyPath;
  try {
    const response = await fetch(url, { headers: { 'x-forwarded-for': '1.1.1.1' } });
    const data = await response.text();
    res.set('Access-Control-Allow-Origin', '*');
    res.type('application/json').send(data);
  } catch (e) {
    res.status(500).send('Proxy error');
  }
});

app.listen(4000, () => console.log('Proxy running on http://localhost:4000'));
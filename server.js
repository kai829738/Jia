const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;
const publicDirectory = path.join(__dirname, 'public', 'current');

app.use(cors());
app.use(express.json());
app.use(express.static(publicDirectory));

app.post('/get-transcript', async (req, res) => {
  const { videoUrl, format, includeTimestamp, apiKey } = req.body || {};

  if (!videoUrl || !format || includeTimestamp === undefined || !apiKey) {
    return res.status(400).json({
      error: 'videoUrl, format, includeTimestamp, and apiKey are required.'
    });
  }

  const query = new URLSearchParams({
    video_url: videoUrl,
    format,
    include_timestamp: String(includeTimestamp)
  });

  try {
    const response = await fetch(
      `https://transcriptapi.com/api/v2/youtube/transcript?${query.toString()}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: 'application/json'
        }
      }
    );

    const contentType = response.headers.get('content-type') || '';
    const data = contentType.includes('application/json')
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      return res.status(response.status).json({
        error: 'Transcript API request failed.',
        details: data
      });
    }

    return res.json(data);
  } catch (error) {
    console.error('Transcript request failed:', error);
    return res.status(502).json({
      error: 'Unable to reach the transcript API.',
      details: error.message
    });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(publicDirectory, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

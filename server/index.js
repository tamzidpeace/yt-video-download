const express = require('express');
const cors = require('cors');
const ytdl = require('@distube/ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const app = express();
const port = 3001;

app.use(cors());

app.get('/info', async (req, res) => {
  const { url } = req.query;
  if (!ytdl.validateURL(url)) {
    return res.status(400).send({ error: 'Invalid YouTube URL' });
  }
  try {
    const info = await ytdl.getInfo(url);
    res.send({
      title: info.videoDetails.title,
      thumbnail: info.videoDetails.thumbnails[0].url,
    });
  } catch (error) {
    res.status(500).send({ error: 'Failed to get video info' });
  }
});

app.get('/download', async (req, res) => {
  const { url } = req.query;
  if (!ytdl.validateURL(url)) {
    return res.status(400).send({ error: 'Invalid YouTube URL' });
  }

  try {
    const info = await ytdl.getInfo(url);
    const title = info.videoDetails.title.replace(/[^a-zA-Z0-9-]/g, '_');
    
    res.header('Content-Disposition', `attachment; filename="${title}.mp3"`);
    const stream = ytdl(url, { quality: 'highestaudio' });
    
    ffmpeg(stream)
      .audioBitrate(128)
      .format('mp3')
      .on('error', (err) => {
        console.error(err);
        res.status(500).send({ error: 'Failed to convert video' });
      })
      .pipe(res, { end: true });

  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Failed to download video' });
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
import { NextResponse } from 'next/server';
import ytdl from '@distube/ytdl-core';
import ffmpeg from 'fluent-ffmpeg';
import { PassThrough } from 'stream';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  if (!ytdl.validateURL(url)) {
    return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 });
  }

  try {
    const info = await ytdl.getInfo(url);
    const title = info.videoDetails.title.replace(/[^a-zA-Z0-9-]/g, '_');

    const audioStream = ytdl(url, { quality: 'highestaudio' });
    const passthrough = new PassThrough();

    ffmpeg(audioStream)
      .audioBitrate(128)
      .format('mp3')
      .on('error', (err) => {
        console.error('FFmpeg error:', err);
        passthrough.emit('error', err); // Propagate error to the passthrough stream
      })
      .pipe(passthrough); // Pipe ffmpeg output to the passthrough stream

    const headers = new Headers({
      'Content-Type': 'audio/mpeg',
      'Content-Disposition': `attachment; filename="${title}.mp3"`,
    });

    return new Response(passthrough, { headers });

  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json({ error: 'Failed to download video' }, { status: 500 });
  }
}
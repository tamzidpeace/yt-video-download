import { NextResponse } from 'next/server';
import ytdl from '@distube/ytdl-core';
import ffmpeg from 'fluent-ffmpeg';
import { PassThrough } from 'stream';

export async function GET(request) {
  const headers = new Headers();
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'GET');

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

    // Update success response headers
    const downloadHeaders = new Headers(headers);
    downloadHeaders.set('Content-Type', 'audio/mpeg');
    downloadHeaders.set('Content-Disposition', `attachment; filename="${title}.mp3"`);

    return new Response(passthrough, { headers: downloadHeaders });

  } catch (error) {
    console.error('Download error:', error);
    const errorHeaders = new Headers(headers);
    errorHeaders.set('Content-Type', 'application/json');
    return new Response(
      JSON.stringify({ error: 'Failed to download video' }), 
      { status: 500, headers: errorHeaders }
    );
  }
}
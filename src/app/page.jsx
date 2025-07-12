"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import '../app/globals.css';

export default function Home() {
  const [url, setUrl] = useState('');
  const [videoInfo, setVideoInfo] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [theme, setTheme] = useState('dark'); // Default theme is dark

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  const handleUrlChange = (e) => {
    setUrl(e.target.value);
    setVideoInfo(null);
    setError(null);
  };

  const handleGetInfo = async () => {
    if (!url) {
      setError('Please enter a YouTube URL');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/api/info?url=${encodeURIComponent(url)}`);
      setVideoInfo(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to get video info');
      setVideoInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!videoInfo) {
      setError('Please get video info before downloading.');
      return;
    }
    setDownloading(true);
    setError(null);
    try {
      const response = await axios.get(`/api/download?url=${encodeURIComponent(url)}`, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'audio/mpeg' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `${videoInfo.title}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to download video');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="App">
      <button onClick={toggleTheme} className="theme-toggle">
        {theme === 'dark' ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-sun">
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-moon">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
        )}
      </button>
      <header className="App-header">
        <h1>YouTube to MP3 Converter</h1>
        <div className="input-container">
          <input
            type="text"
            placeholder="Enter YouTube URL"
            value={url}
            onChange={handleUrlChange}
          />
          <button onClick={handleGetInfo} disabled={loading}>
            {loading ? 'Loading...' : 'Get Info'}
          </button>
        </div>
        {error && <p className="error">{error}</p>}
        {videoInfo && (
          <div className="video-info">
            <h2>{videoInfo.title}</h2>
            <img src={videoInfo.thumbnail} alt={videoInfo.title} />
            <button onClick={handleDownload} disabled={downloading}>
              {downloading ? 'Downloading...' : 'Download MP3'}
            </button>
          </div>
        )}
      </header>
    </div>
  );
}
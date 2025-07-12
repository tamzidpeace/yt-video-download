import { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [url, setUrl] = useState('');
  const [videoInfo, setVideoInfo] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

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

  const handleDownload = () => {
    if (!videoInfo) {
      setError('Please get video info before downloading.');
      return;
    }
    setError(null);
    const downloadUrl = `/api/download?url=${encodeURIComponent(url)}`;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `${videoInfo.title}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="App">
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
          {loading && <progress></progress>}
        </div>
        {error && <p className="error">{error}</p>}
        {videoInfo && (
          <div className="video-info">
            <h2>{videoInfo.title}</h2>
            <img src={videoInfo.thumbnail} alt={videoInfo.title} />
            <button onClick={handleDownload}>
              Download MP3
            </button>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;

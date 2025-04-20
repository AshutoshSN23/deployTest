import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchFromAPI } from '../utils/fetchFromApi';
import YouTubePlayerAll from '../components/YouTubePlayerAll';
import axios from 'axios';
import { analytics } from '../firebase';
import { logEvent } from 'firebase/analytics';

const SearchFeed = () => {
  const [videos, setVideos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('Rural woman Empowerment');
  const [tempSearch, setTempSearch] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (searchTerm) {
      setLoading(true);
      setSearched(true);
      fetchFromAPI(`${searchTerm}`)
        .then((data) => {
          setVideos(data || []);
        })
        .catch((error) => {
          console.error('Error fetching data:', error);
          setVideos([]);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [searchTerm]);

  const fetchSuggestions = async (query) => {
    if (!query) return setSuggestions([]);

    const options = {
      method: 'GET',
      url: 'https://youtube138.p.rapidapi.com/auto-complete/',
      params: { q: query, hl: 'en', gl: 'US' },
      headers: {
        'x-rapidapi-key': import.meta.env.VITE_XRAPID_API_KEY,
        'x-rapidapi-host': 'youtube138.p.rapidapi.com'
      }
    };

    try {
      const response = await axios.request(options);
      
      const keywords = response.data?.results|| [];
      setSuggestions(keywords);
      console.log("kEY WORDS: ", keywords);
      
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setTempSearch(value);
    fetchSuggestions(value);
  };

  const handleSuggestionClick = (suggestion) => {
    setTempSearch(suggestion);
    setSearchTerm(suggestion);
    setSuggestions([]);
    logEvent(analytics, 'suggestion_clicked', { suggestion });
  };

  return (
    <div style={styles.container}>
      <div style={styles.searchContainer}>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            placeholder="Search videos..."
            value={tempSearch}
            onChange={handleInputChange}
            style={styles.input}
          />
          {suggestions.length > 0 && (
            <ul style={styles.suggestionBox}>
              {suggestions.map((sugg, idx) => (
                <li key={idx} onClick={() => handleSuggestionClick(sugg)} style={styles.suggestionItem}>
                  {sugg}
                </li>
              ))}
            </ul>
          )}
        </div>
        <button
          onClick={() => {
            setSearchTerm(tempSearch);
            logEvent(analytics, 'search_performed', { query: tempSearch });
          }}
          style={styles.button}
        >
          🔍 Search
        </button>
      </div>

      {loading && <p style={styles.message}>Loading videos...</p>}
      {!loading && searched && videos.length === 0 && (
        <p style={styles.message}>No videos found. Try a different keyword.</p>
      )}
      <div style={styles.videosGrid}>
        {videos.map((item) => (
          <div key={item?.video?.videoId} style={styles.videoCard}>
            <YouTubePlayerAll videoId={item?.video?.videoId} />
            <Link to={`/video/${item?.video?.videoId}`} style={styles.link}>
              ▶ Open
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '2rem',
    minHeight: '100vh',
    backgroundColor: '#1a365d',
    backgroundImage: 'url("https://www.transparenttextures.com/patterns/ag-square.png")',
    backgroundSize: 'auto',
    color: 'white',
  },
  searchContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '1rem',
    marginBottom: '2rem',
    flexWrap: 'wrap',
  },
  input: {
    padding: '0.6rem 1rem',
    width: '300px',
    borderRadius: '8px',
    border: '1px solid #ccc',
  },
  button: {
    padding: '0.6rem 1.2rem',
    backgroundColor: '#1976d2',
    color: 'white',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  suggestionBox: {
    position: 'absolute',
    top: '100%',
    left: 0,
    width: '100%',
    backgroundColor: 'white', // ✅ Keep white background
    color: 'black',           // ✅ Default text color
    maxHeight: '200px',
    overflowY: 'auto',
    zIndex: 10,
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
    marginTop: '0.25rem',
  },
  suggestionItem: {
    padding: '0.5rem 1rem',
    cursor: 'pointer',
    borderBottom: '1px solid #eee',
    transition: 'background 0.2s ease',
    color: '#000 !important',
    backgroundColor: 'white',
    fontSize: '0.95rem',
  },
  message: {
    textAlign: 'center',
    color: 'white',
    fontSize: '1.1rem',
    marginTop: '2rem',
  },
  videosGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '2rem',
  },
  videoCard: {
    background: 'rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(10px)',
    padding: '1rem',
    borderRadius: '16px',
    boxShadow: '0 6px 24px rgba(0, 0, 0, 0.2)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  },
  link: {
    display: 'inline-block',
    marginTop: '0.5rem',
    color: '#90cdf4',
    fontWeight: 'bold',
    textDecoration: 'none',
  },
};

export default SearchFeed;

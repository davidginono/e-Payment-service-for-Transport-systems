import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './StopsPage.css';

function StopsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { stops: initialStops, busId, scanLocation: initialScanLocation } = location.state || { stops: [], busId: '', scanLocation: null };
  const [stops, setStops] = useState(initialStops);
  const [selectedStop, setSelectedStop] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [scanLocation] = useState(initialScanLocation);

  useEffect(() => {
    if (!busId) {
      navigate('/');
      return;
    }

    const fetchStops = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BACKEND_URL}/bus/${busId}/stops`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch stops');
        }
        
        const data = await response.json();
        setStops(data);
        setError('');
      } catch (err) {
        console.error('Error fetching stops:', err);
        setError('Could not load stops. Please retry or rescan the bus QR code.');
      } finally {
        setLoading(false);
      }
    };

    fetchStops();
  }, [busId, navigate]);

  const handleStopSelect = (stop) => {
    setSelectedStop(stop);
    navigate('/journey-preview', { state: { stop, busId, scanLocation, stops } });
  };

  return (
    <div className="container">
      <h1>Select Your Stop</h1>
      <p className="bus-info">Bus ID: {busId}</p>

      {!scanLocation && (
        <div className="info-message">
          Location access was not granted. Distance preview will be unavailable until you rescan and allow location.
        </div>
      )}

      {loading ? (
        <div className="loading-message">Loading stops...</div>
      ) : (
        <div className="stop-list">
          {stops.map((stop) => (
            <button
              key={stop.stop_id}
              className={`stop-button ${selectedStop?.stop_id === stop.stop_id ? 'selected' : ''}`}
              onClick={() => handleStopSelect(stop)}
            >
              <h3>{stop.stop_name}</h3>
              <p>Price: tzs{stop.price}</p>
            </button>
          ))}
        </div>
      )}

      {!loading && stops.length === 0 && !error && (
        <div className="loading-message">No stops found for this bus.</div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <button 
        className="back-button"
        onClick={() => navigate('/')}
      >
        Back to Home
      </button>
    </div>
  );
}

export default StopsPage; 

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './StopsPage.css';

function StopsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { stops: initialStops, busId } = location.state || { stops: [], busId: '' };
  const [stops, setStops] = useState(initialStops);
  const [selectedStop, setSelectedStop] = useState(null);
  const [loading, setLoading] = useState(false);

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
      } catch (err) {
        console.error('Error fetching stops:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStops();
  }, [busId, navigate]);

  const handleStopSelect = (stop) => {
    setSelectedStop(stop);
    // Automatically navigate to payment page when a stop is selected
    navigate('/payment', { state: { stop, busId } });
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading-message">Loading stops...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Select Your Stop</h1>
      <p className="bus-info">Bus ID: {busId}</p>

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
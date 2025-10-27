import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './ManualEntryPage.css';

function ManualEntryPage() {
  const [busId, setBusId] = useState('');
  const [error, setError] = useState('');
  const [locationError, setLocationError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const captureCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      return Promise.reject(new Error('Geolocation is not supported by this browser.'));
    }
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          capturedAt: position.timestamp || Date.now(),
        }),
        (geoError) => reject(geoError),
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  }, []);

  const handleBusIdSubmit = async (e) => {
    e.preventDefault();
    if (!busId.trim()) {
      setError('Please enter a valid bus ID');
      return;
    }

    setLoading(true);
    setError('');
    setLocationError('');

    let scanLocation;
    try {
      scanLocation = await captureCurrentLocation();
    } catch (locationFailure) {
      console.error('Location capture failed during manual entry', locationFailure);
      setLocationError('Location access is required to continue. Please enable location services and try again.');
      setLoading(false);
      return;
    }
    
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
      navigate('/stops', { state: { stops: data, busId, scanLocation } });
    } catch (error) {
      console.error('Error fetching stops for manual bus entry', error);
      setError('Error fetching stops. Please check the bus ID and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Enter Bus ID Manually</h1>
      
      <div className="form-container" >
        <form onSubmit={handleBusIdSubmit}>
          <div className="form-group">
            <label htmlFor="busId">Bus ID:</label>
            <input
              type="text"
              id="busId"
              value={busId}
              onChange={(e) => setBusId(e.target.value)}
              placeholder="Enter bus ID"
              required
              disabled={loading}
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Loading...' : 'Get Stops'}
          </button>
        </form>
      </div>

      {error && <div className="error-message">{error}</div>}
      {locationError && <div className="error-message">{locationError}</div>}

      <button 
        className="back-button"
        onClick={() => navigate('/')}
      >
        Back to Scanner
      </button>
    </div>
  );
}

export default ManualEntryPage; 

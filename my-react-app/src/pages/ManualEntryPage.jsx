import React, { useState } from 'react';
import { redirect, useNavigate } from 'react-router-dom';
import './ManualEntryPage.css';

function ManualEntryPage() {
  const [busId, setBusId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleBusIdSubmit = async (e) => {
    e.preventDefault();
    if (!busId.trim()) {
      setError('Please enter a valid bus ID');
      return;
    }

    setLoading(true);
    setError('');
    
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
      navigate('/stops', { state: { stops: data, busId } });
    } catch (err) {
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
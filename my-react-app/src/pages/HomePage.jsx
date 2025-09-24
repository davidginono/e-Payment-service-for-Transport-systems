import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import './HomePage.css';

function HomePage() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [permissionError, setPermissionError] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const scannerRef = useRef(null);


  useEffect(() => {
    // Check if device is mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);
  useEffect(() => {
      // Check if passenger is registered
      const passengerId = localStorage.getItem('passengerId');
      if (!passengerId) {
        navigate('/register');
      }else{navigate('/');}
    }, [navigate]);

  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: isMobile ? 'environment' : 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      stream.getTracks().forEach(track => track.stop());
      setHasPermission(true);
      setPermissionError('');
    } catch (err) {
      setPermissionError('Camera access denied. Please enable camera permissions to scan QR codes.');
      setHasPermission(false);
    }
  };

  useEffect(() => {
    if (hasPermission && !scannerRef.current) {
      const config = {
        fps: 10,
        qrbox: isMobile ? { width: 200, height: 200 } : { width: 250, height: 250 },
        rememberLastUsedCamera: true,
        aspectRatio: isMobile ? 1.0 : 1.777778
      };

      scannerRef.current = new Html5QrcodeScanner('reader', config);

      const success = (result) => {
        scannerRef.current.clear();
        handleBusIdSubmit(result);
      };

      const error = (err) => {
        console.warn(err);
      };

      scannerRef.current.render(success, error);
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
        scannerRef.current = null;
      }
    };
  }, [hasPermission, isMobile]);

  const handleBusIdSubmit = async (busId) => {
    if (!busId.trim()) {
      setError('Please scan a valid bus ID');
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
      <h1>Scan Bus QR Code</h1>
      
      {!hasPermission ? (
        <div className="permission-container">
          <p>Camera access is required to scan QR codes</p>
          <button 
            className="permission-button"
            onClick={requestCameraPermission}
          >
            Grant Camera Access
          </button>
          {permissionError && <div className="error-message">{permissionError}</div>}
        </div>
      ) : (
        <div className="scanner-container">
          <div id="reader"></div>
        </div>
      )}

      {loading && (
        <div className="loading-message">
          Loading stops...
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      <div className="button-container">
        <button 
          className="manual-entry-button"
          onClick={() => navigate('/manual-entry')}
        >
          Enter Bus ID Manually
        </button>
        
       
        
      </div>
    </div>
  );
}

export default HomePage; 
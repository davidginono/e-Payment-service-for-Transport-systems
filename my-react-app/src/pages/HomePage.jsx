import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import './HomePage.css';

function HomePage() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [permissionError, setPermissionError] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);
  const [locationPermissionError, setLocationPermissionError] = useState('');
  const [requestingLocation, setRequestingLocation] = useState(false);
  const [shouldRedirectToRegister, setShouldRedirectToRegister] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }
    const passengerId = localStorage.getItem('passengerId');
    return !passengerId;
  });
  const navigate = useNavigate();
  const scannerRef = useRef(null);
  const isProcessingRef = useRef(false);


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
    const passengerId = localStorage.getItem('passengerId');
    setShouldRedirectToRegister(!passengerId);
  }, []);

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
    } catch (error) {
      console.error('Camera permission request failed', error);
      setPermissionError('Camera access denied. Please enable camera permissions to scan QR codes.');
      setHasPermission(false);
    }
  };

  const captureScanLocation = useCallback(() => {
    if (!navigator.geolocation) {
      return Promise.reject(new Error('Geolocation not supported by this browser.'));
    }
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          capturedAt: position.timestamp || Date.now()
        }),
        (geoError) => reject(geoError),
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  }, []);

  const requestLocationAccess = async () => {
    if (!navigator.geolocation) {
      setLocationPermissionError('Location services are not supported on this device.');
      setLocationPermissionGranted(false);
      return;
    }

    setRequestingLocation(true);
    setLocationPermissionError('');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationPermissionGranted(true);
        setRequestingLocation(false);
        console.info('Location access granted', position.coords);
      },
      (geoError) => {
        console.error('Location permission request failed', geoError);
        setLocationPermissionGranted(false);
        setRequestingLocation(false);
        setLocationPermissionError('Location access denied. Please enable location services in your browser settings.');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleBusIdSubmit = useCallback(async (busId) => {
    if (!busId.trim()) {
      setError('Please scan a valid bus ID');
      isProcessingRef.current = false;
      return;
    }

    setLoading(true);
    setError('');

    let scanLocation;
    try {
      scanLocation = await captureScanLocation();
    } catch (geoError) {
      console.error('Location capture failed', geoError);
      setError('Location permission is required to continue. Please enable location services and try again.');
      setLoading(false);
      isProcessingRef.current = false;
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
      console.error('Error fetching stops for scanned bus', error);
      setError('Error fetching stops. Please check the bus ID and try again.');
    } finally {
      setLoading(false);
      isProcessingRef.current = false;
    }
  }, [captureScanLocation, navigate]);

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
        if (isProcessingRef.current) {
          return;
        }
        isProcessingRef.current = true;
        handleBusIdSubmit(result);
      };

      const error = () => {
        // Library logs its own errors; avoid noisy console
      };

      scannerRef.current.render(success, error);
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
        scannerRef.current = null;
      }
    };
  }, [hasPermission, isMobile, handleBusIdSubmit]);

  if (shouldRedirectToRegister) {
    return <Navigate to="/register" replace />;
  }

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

      {!locationPermissionGranted && (
        <div className="info-message">
          Location access is required to show distance information after scanning.
        </div>
      )}

      {locationPermissionError && (
        <div className="error-message">{locationPermissionError}</div>
      )}

      <div className="button-container">
        {!locationPermissionGranted && (
          <button
            className="permission-button"
            onClick={requestLocationAccess}
            disabled={requestingLocation}
          >
            {requestingLocation ? 'Requesting Location...' : 'Grant Location Access'}
          </button>
        )}

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

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import L from 'leaflet';
import './JourneyPreviewPage.css';

const defaultIcon = L.icon({
  iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href,
  iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
  shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = defaultIcon;

function JourneyPreviewPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { stop, busId, scanLocation, stops } = location.state || {};
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const layersRef = useRef({});
  const [destinationCoords, setDestinationCoords] = useState(() => {
    if (stop && stop.latitude != null && stop.longitude != null) {
      return {
        lat: Number(stop.latitude),
        lng: Number(stop.longitude),
      };
    }
    return null;
  });
  const [destinationLoading, setDestinationLoading] = useState(false);
  const [destinationError, setDestinationError] = useState('');
  const [routeDistanceKm, setRouteDistanceKm] = useState(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState('');
  const [routeGeometry, setRouteGeometry] = useState(null);

  useEffect(() => {
    if (!stop || !busId) {
      navigate('/', { replace: true });
    }
  }, [stop, busId, navigate]);

  const origin = useMemo(() => {
    if (!scanLocation || scanLocation.latitude == null || scanLocation.longitude == null) {
      return null;
    }
    return {
      lat: Number(scanLocation.latitude),
      lng: Number(scanLocation.longitude),
    };
  }, [scanLocation]);

  useEffect(() => {
    if (!stop) {
      return;
    }

    if (stop.latitude != null && stop.longitude != null) {
      setDestinationCoords({
        lat: Number(stop.latitude),
        lng: Number(stop.longitude),
      });
      setDestinationError('');
      setRouteDistanceKm(null);
      setRouteGeometry(null);
      return;
    }

    if (!stop.stop_name) {
      setDestinationError('Destination details are incomplete.');
      setDestinationCoords(null);
      setRouteDistanceKm(null);
      setRouteGeometry(null);
      return;
    }

    setDestinationLoading(true);
    setDestinationError('');
    setRouteDistanceKm(null);
    setRouteGeometry(null);
    const controller = new AbortController();

    const fetchCoordinates = async () => {
      try {
        const query = encodeURIComponent(`${stop.stop_name} bus stop`);
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${query}`,
          {
            headers: {
              'User-Agent': 'e-payment-transport-app/1.0 (contact@example.com)',
            },
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error('Failed to resolve destination coordinates');
        }

        const results = await response.json();
        if (Array.isArray(results) && results.length > 0) {
          const { lat, lon } = results[0];
          setDestinationCoords({ lat: Number(lat), lng: Number(lon) });
          setDestinationError('');
        } else {
          setDestinationCoords(null);
          setDestinationError('Could not find map coordinates for the selected stop.');
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Geocoding error', error);
          setDestinationCoords(null);
          setDestinationError('Unable to resolve stop location. Please try again later.');
          setRouteDistanceKm(null);
          setRouteGeometry(null);
        }
      } finally {
        setDestinationLoading(false);
      }
    };

    fetchCoordinates();

    return () => {
      controller.abort();
    };
  }, [stop]);

  const distanceKm = useMemo(() => {
    if (!origin || !destinationCoords) {
      return null;
    }
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(destinationCoords.lat - origin.lat);
    const dLng = toRad(destinationCoords.lng - origin.lng);
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(origin.lat)) *
        Math.cos(toRad(destinationCoords.lat)) *
        Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Number((R * c).toFixed(2));
  }, [origin, destinationCoords]);

  useEffect(() => {
    if (!origin || !destinationCoords) {
      setRouteDistanceKm(null);
      setRouteGeometry(null);
      setRouteError('');
      return;
    }

    setRouteLoading(true);
    setRouteError('');
    const controller = new AbortController();

    const fetchRoute = async () => {
      try {
        const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destinationCoords.lng},${destinationCoords.lat}?overview=full&geometries=geojson`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error('Failed to calculate route distance.');
        }

        const data = await response.json();
        if (Array.isArray(data.routes) && data.routes.length > 0) {
          const bestRoute = data.routes[0];
          setRouteDistanceKm(Number((bestRoute.distance / 1000).toFixed(2)));
          setRouteGeometry(bestRoute.geometry);
          setRouteError('');
        } else {
          setRouteDistanceKm(null);
          setRouteGeometry(null);
          setRouteError('No route found between these locations.');
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Route calculation error', error);
          setRouteDistanceKm(null);
          setRouteGeometry(null);
          setRouteError('Unable to calculate route distance. Showing straight-line distance instead.');
        }
      } finally {
        setRouteLoading(false);
      }
    };

    fetchRoute();

    return () => {
      controller.abort();
    };
  }, [origin, destinationCoords]);

  useEffect(() => {
    if (!origin || !mapContainerRef.current || mapRef.current) {
      return;
    }

    mapRef.current = L.map(mapContainerRef.current, {
      center: [origin.lat, origin.lng],
      zoom: 15,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(mapRef.current);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [origin]);

  useEffect(() => {
    if (!mapRef.current || !origin) {
      return;
    }

    Object.values(layersRef.current).forEach((layer) => {
      mapRef.current.removeLayer(layer);
    });
    layersRef.current = {};

    layersRef.current.originMarker = L.marker([origin.lat, origin.lng])
      .addTo(mapRef.current)
      .bindPopup('Scan location');

    if (destinationCoords) {
      layersRef.current.destinationMarker = L.marker([destinationCoords.lat, destinationCoords.lng])
        .addTo(mapRef.current)
        .bindPopup(stop?.stop_name ? `Stop: ${stop.stop_name}` : 'Destination');

      if (routeGeometry) {
        layersRef.current.routeLine = L.geoJSON(routeGeometry, {
          style: {
            color: '#3498db',
            weight: 4,
            opacity: 0.9,
          },
        }).addTo(mapRef.current);
        mapRef.current.fitBounds(layersRef.current.routeLine.getBounds(), { padding: [40, 40] });
      } else {
        layersRef.current.routeLine = L.polyline(
          [
            [origin.lat, origin.lng],
            [destinationCoords.lat, destinationCoords.lng],
          ],
          { color: '#3498db', weight: 4, opacity: 0.8 }
        ).addTo(mapRef.current);
        mapRef.current.fitBounds(layersRef.current.routeLine.getBounds(), { padding: [40, 40] });
      }
    } else {
      mapRef.current.setView([origin.lat, origin.lng], 15);
    }
  }, [origin, destinationCoords, routeGeometry, stop]);

  const handleBack = () => {
    navigate('/stops', { state: { stops: stops || [], busId, scanLocation } });
  };

  const handleAccept = () => {
    navigate('/payment', { state: { stop, busId, scanLocation, stops: stops || [] } });
  };

  if (!stop || !busId) {
    return null;
  }

  return (
    <div className="container journey-container">
      <h1>Review Your Journey</h1>

      <div className="map-wrapper">
        {origin ? (
          <div ref={mapContainerRef} className="map-canvas" />
        ) : (
          <div className="map-unavailable">
            Unable to determine your current location. Please enable location services and rescan the bus to view the distance map.
          </div>
        )}
      </div>

      <div className="journey-details">
        <h2>{stop.stop_name}</h2>
        <p><strong>Bus ID:</strong> {busId}</p>
        {routeLoading && <p>Calculating route distance...</p>}
        {destinationLoading && <p>Locating destination...</p>}
        {destinationError && <p className="distance-warning">{destinationError}</p>}
        {routeError && (
          <p className="distance-warning">{routeError}</p>
        )}
        {routeDistanceKm !== null && !routeError ? (
          <p><strong>Distance:</strong> {routeDistanceKm} km (by road)</p>
        ) : distanceKm !== null && !destinationError ? (
          <p><strong>Distance:</strong> {distanceKm} km (straight line)</p>
        ) : (
          !destinationLoading && !destinationError && (
            <p className="distance-warning">
              Destination coordinates unavailable; distance cannot be calculated.
            </p>
          )
        )}
        <p><strong>Price:</strong> tzs{stop.price}</p>
      </div>

      <div className="button-group">
        <button className="back-button" onClick={handleBack}>
          Back to Stops
        </button>
        <button
          className="confirm-button"
          onClick={handleAccept}
          disabled={!origin || (destinationCoords == null && !destinationError)}
        >
          Accept and Continue
        </button>
      </div>
    </div>
  );
}

export default JourneyPreviewPage;

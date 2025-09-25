import React, { useState } from 'react';

const GeolocationExample = () => {
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const getLocation = () => {
    setLoading(true);
    setError(null);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showPosition, showError, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      });
    } else {
      setError('Geolocation is not supported by this browser.');
      setLoading(false);
    }
  };

  const showPosition = (position) => {
    setLatitude(position.coords.latitude);
    setLongitude(position.coords.longitude);
    setError(null);
    setLoading(false);
  };

  const showError = (error) => {
    setLoading(false);
    switch (error.code) {
      case error.PERMISSION_DENIED:
        setError('Location access denied. Please enable location permissions to find nearby therapists.');
        break;
      case error.POSITION_UNAVAILABLE:
        setError('Location information is unavailable. Please check your GPS settings.');
        break;
      case error.TIMEOUT:
        setError('Location request timed out. Please try again.');
        break;
      default:
        setError('An unknown error occurred while getting your location.');
        break;
    }
  };

  const formatCoordinate = (coord, type) => {
    if (coord === null) return 'Not available';
    return `${Math.abs(coord).toFixed(6)}° ${type === 'lat' ? (coord >= 0 ? 'N' : 'S') : (coord >= 0 ? 'E' : 'W')}`;
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Find Nearby Therapists</h1>
      <p>Get your location to connect with therapists in your area</p>

      <button
        className="button"
        onClick={getLocation}
        disabled={loading}
        style={{
          opacity: loading ? 0.6 : 1,
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Getting Location...' : 'Get My Location'}
      </button>

      {loading && (
        <div style={{ marginTop: '20px', color: '#666' }}>
          📍 Locating you...
        </div>
      )}

      {error && (
        <div className="error" style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#ffebee',
          border: '1px solid #f44336',
          borderRadius: '4px',
          color: '#d32f2f'
        }}>
          ⚠️ {error}
        </div>
      )}

      {latitude !== null && longitude !== null && !loading && (
        <div style={{
          marginTop: '20px',
          padding: '20px',
          backgroundColor: '#e8f5e8',
          border: '1px solid #4caf50',
          borderRadius: '4px'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#2e7d32' }}>📍 Your Location</h3>
          <div style={{ marginBottom: '10px' }}>
            <strong>Latitude:</strong> {formatCoordinate(latitude, 'lat')}
          </div>
          <div style={{ marginBottom: '15px' }}>
            <strong>Longitude:</strong> {formatCoordinate(longitude, 'lng')}
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>
            Location accuracy: High precision GPS
          </div>
        </div>
      )}

      {latitude !== null && longitude !== null && (
        <div style={{ marginTop: '15px', textAlign: 'center' }}>
          <button
            className="button"
            onClick={() => {
              setLatitude(null);
              setLongitude(null);
              setError(null);
            }}
            style={{ backgroundColor: '#ff9800' }}
          >
            Clear Location
          </button>
        </div>
      )}
    </div>
  );
};

export default GeolocationExample;
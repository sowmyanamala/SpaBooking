import React, { useState, useEffect } from 'react';
import styles from '../styles/geo.module.css';

const GeoMap = () => {
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [address, setAddress] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchRadius, setSearchRadius] = useState(10);
  const [nearbyTherapists, setNearbyTherapists] = useState([]);
  const [searchingTherapists, setSearchingTherapists] = useState(false);
  const [locationAccuracy, setLocationAccuracy] = useState(null);
  const [selectedTherapist, setSelectedTherapist] = useState(null);
  const [filters, setFilters] = useState({
    name: '',
    gender: '',
    status: 'online',
    deliveredType: ''
  });

  // API Base URL
  const API_BASE = "https://tsm.spagram.com/api/filter-models.php";

  const getLocation = () => {
    setLoading(true);
    setError(null);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showPosition, showError, {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 300000
      });
    } else {
      setError('Geolocation is not supported by this browser.');
      setLoading(false);
    }
  };

  const showPosition = async (position) => {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    
    setLatitude(lat);
    setLongitude(lon);
    setLocationAccuracy(position.coords.accuracy);
    setError(null);
    
    await getAddressFromCoordinates(lat, lon);
    await searchNearbyTherapists();
    
    setLoading(false);
  };

  const getAddressFromCoordinates = async (lat, lon) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`
      );
      const data = await response.json();
      
      if (data && data.address) {
        const { city, town, village, county, state, country } = data.address;
        const locationName = city || town || village || county;
        const fullAddress = `${locationName ? locationName + ', ' : ''}${state || ''}, ${country || ''}`;
        setAddress(fullAddress);
      } else {
        setAddress('Address not found');
      }
    } catch (error) {
      console.error('Error fetching address:', error);
      setAddress('Unable to fetch address');
    }
  };

  const showError = (error) => {
    setLoading(false);
    switch (error.code) {
      case error.PERMISSION_DENIED:
        setError('Location access denied. Please enable location permissions.');
        break;
      case error.POSITION_UNAVAILABLE:
        setError('Location information is unavailable.');
        break;
      case error.TIMEOUT:
        setError('Location request timed out.');
        break;
      default:
        setError('An unknown error occurred while getting your location.');
        break;
    }
  };

  const searchNearbyTherapists = async () => {
    setSearchingTherapists(true);
    setNearbyTherapists([]);

    try {
      const response = await fetch(API_BASE);
      const therapists = await response.json();
      
      if (Array.isArray(therapists)) {
        const therapistsWithDistance = therapists.map(therapist => ({
          ...therapist,
          distance: (Math.random() * searchRadius).toFixed(1),
          status: Math.random() > 0.3 ? 'online' : 'offline',
          deliveredType: Math.random() > 0.5 ? 'Delivered' : 'Available'
        })).filter(therapist => therapist.distance <= searchRadius)
          .sort((a, b) => a.distance - b.distance)
          .slice(0, 15);

        setNearbyTherapists(therapistsWithDistance);
      }
    } catch (error) {
      console.error('Error fetching therapists:', error);
      setError('Failed to fetch therapists. Please try again.');
    } finally {
      setSearchingTherapists(false);
    }
  };

  const clearLocation = () => {
    setLatitude(null);
    setLongitude(null);
    setAddress(null);
    setLocationAccuracy(null);
    setError(null);
    setNearbyTherapists([]);
    setSelectedTherapist(null);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const filteredTherapists = nearbyTherapists.filter(therapist => {
    return (
      (!filters.name || therapist.name.toLowerCase().includes(filters.name.toLowerCase())) &&
      (!filters.gender || therapist.gender === filters.gender) &&
      (!filters.status || therapist.status === filters.status)
    );
  });

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className={styles.pageContainer}>
      {/* Left Sidebar - Therapist List */}
      <div className={styles.leftSidebar}>
        <div className={styles.sidebarHeader}>
          <h2 className={styles.headerTitle}>
            <span>👥</span>
            Therapists
          </h2>
          <p className={styles.headerSubtitle}>
            {filteredTherapists.length} available nearby
          </p>
        </div>
        
        <div className={styles.therapistList}>
          {searchingTherapists ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#6b7280' }}>
              <div className={styles.spinner} style={{ margin: '0 auto 16px' }}></div>
              <p>Searching for therapists...</p>
            </div>
          ) : filteredTherapists.length > 0 ? (
            filteredTherapists.map(therapist => (
              <div 
                key={therapist.id} 
                className={`${styles.therapistItem} ${selectedTherapist?.id === therapist.id ? styles.active : ''}`}
                onClick={() => setSelectedTherapist(therapist)}
              >
                <div className={styles.therapistProfile}>
                  <div className={styles.therapistAvatar}>
                    {getInitials(therapist.name)}
                  </div>
                  <div className={styles.therapistInfo}>
                    <h4 className={styles.therapistName}>{therapist.name}</h4>
                    <p className={styles.therapistSpecialty}>
                      {therapist.service_area || therapist.service_area_primary || 'Massage Therapy'}
                    </p>
                    <div className={styles.therapistMeta}>
                      <span className={styles.therapistRating}>
                        ⭐ {therapist.rating || '4.8'}
                      </span>
                      <span className={styles.therapistDistance}>
                        {therapist.distance} mi
                      </span>
                      <span style={{ 
                        color: therapist.status === 'online' ? '#059669' : '#6b7280',
                        fontWeight: '500'
                      }}>
                        {therapist.deliveredType || 'Available'}
                      </span>
                    </div>
                  </div>
                </div>
                <button className={styles.messageButton}>
                  💬 Message
                </button>
              </div>
            ))
          ) : (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#6b7280' }}>
              <p>No therapists found in your area</p>
              <p style={{ fontSize: '14px', marginTop: '8px' }}>
                Try increasing your search radius or getting your location first
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Center Map */}
      <div className={styles.mapContainer}>
        <div className={styles.mapPlaceholder}>
          <div className={styles.mapPlaceholderContent}>
            <div className={styles.mapPlaceholderIcon}>🗺️</div>
            <div className={styles.mapPlaceholderText}>Interactive Map Coming Soon</div>
            <div className={styles.mapPlaceholderSubtext}>
              Map integration will show therapist locations and your position
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Filters & Controls */}
      <div className={styles.rightSidebar}>
        <div className={styles.sidebarHeader}>
          <h2 className={styles.headerTitle}>
            <span>🔍</span>
            Search & Filters
          </h2>
        </div>

        <div className={styles.filterSection}>
          <h3 className={styles.filterTitle}>Location</h3>
          <button
            className={styles.locationButton}
            onClick={getLocation}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className={styles.spinner}></span>
                Getting Location...
              </>
            ) : (
              <>
                <span>📍</span>
                Get My Location
              </>
            )}
          </button>

          {latitude && longitude && (
            <>
              <div className={styles.locationInfo}>
                <p className={styles.locationText}>
                  📍 {address || 'Location detected'}
                </p>
                <p className={styles.coordinateText}>
                  {latitude.toFixed(6)}, {longitude.toFixed(6)}
                </p>
              </div>
              <button className={styles.clearButton} onClick={clearLocation}>
                🔄 Clear Location
              </button>
            </>
          )}

          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}
        </div>

        <div className={styles.filterSection}>
          <h3 className={styles.filterTitle}>Search Radius</h3>
          <input
            type="range"
            min="1"
            max="50"
            value={searchRadius}
            onChange={(e) => setSearchRadius(e.target.value)}
            className={styles.radiusSlider}
          />
          <div className={styles.radiusValue}>
            Search within {searchRadius} miles
          </div>
        </div>

        <div className={styles.filterSection}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Name</label>
            <input
              type="text"
              className={styles.filterInput}
              placeholder="Search by name..."
              value={filters.name}
              onChange={(e) => handleFilterChange('name', e.target.value)}
            />
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Gender</label>
            <select
              className={styles.filterSelect}
              value={filters.gender}
              onChange={(e) => handleFilterChange('gender', e.target.value)}
            >
              <option value="">All</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Status</label>
            <div className={styles.checkboxGroup}>
              <div className={styles.checkboxItem}>
                <input
                  type="checkbox"
                  id="online"
                  checked={filters.status === 'online'}
                  onChange={(e) => handleFilterChange('status', e.target.checked ? 'online' : '')}
                />
                <label htmlFor="online">Online</label>
              </div>
              <div className={styles.checkboxItem}>
                <input
                  type="checkbox"
                  id="offline"
                  checked={filters.status === 'offline'}
                  onChange={(e) => handleFilterChange('status', e.target.checked ? 'offline' : '')}
                />
                <label htmlFor="offline">Offline</label>
              </div>
            </div>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Type of Service</label>
            <select
              className={styles.filterSelect}
              value={filters.deliveredType}
              onChange={(e) => handleFilterChange('deliveredType', e.target.value)}
            >
              <option value="">Click to select</option>
              <option value="Delivered">Delivered</option>
              <option value="Available">Available</option>
              <option value="In-Call">In-Call</option>
              <option value="Out-Call">Out-Call</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Address</label>
            <input
              type="text"
              className={styles.filterInput}
              placeholder="Click to select"
              readOnly
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeoMap;
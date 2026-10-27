import React, { useEffect, useRef, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Crosshair, Plus, Minus, Navigation } from 'lucide-react';

// Sleek Custom SVG DivIcons
const createSvgIcon = (type, label) => {
  if (type === 'patient') {
    return L.divIcon({
      className: 'custom-map-marker patient-marker-wrap',
      html: `
        <div class="patient-radar-ring"></div>
        <div class="patient-radar-ring delay"></div>
        <div class="patient-pin-head">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="4"></circle>
            <path d="M12 2v2M12 20v2M2 12h2M20 12h2"></path>
          </svg>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      popupAnchor: [0, -22]
    });
  }

  if (type === 'ambulance') {
    return L.divIcon({
      className: 'custom-map-marker ambulance-marker-wrap',
      html: `
        <div class="ambulance-beacon-glow"></div>
        <div class="ambulance-pin-head">
          <span style="font-size:18px;line-height:1">🚑</span>
        </div>
        ${label ? `<div class="marker-caption-badge">${label}</div>` : ''}
      `,
      iconSize: [42, 42],
      iconAnchor: [21, 21],
      popupAnchor: [0, -24]
    });
  }

  if (type === 'ambulance-standby') {
    return L.divIcon({
      className: 'custom-map-marker standby-marker-wrap',
      html: `
        <div class="standby-pin-head">
          <span style="font-size:16px;line-height:1">🚑</span>
        </div>
        ${label ? `<div class="marker-caption-badge standby">${label}</div>` : ''}
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
      popupAnchor: [0, -20]
    });
  }

  if (type === 'hospital') {
    return L.divIcon({
      className: 'custom-map-marker hospital-marker-wrap',
      html: `
        <div class="hospital-pin-head">
          <span style="font-size:18px;line-height:1">🏥</span>
        </div>
        ${label ? `<div class="marker-caption-badge hospital">${label}</div>` : ''}
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      popupAnchor: [0, -22]
    });
  }

  return L.divIcon({
    className: 'custom-map-marker',
    html: `<div style="font-size:24px">📍</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  });
};

// Map Controller for Pan/Zoom without fighting the user
function MapController({ fitPoints, userHasMoved, onResetMoved }) {
  const map = useMap();
  const initialFitDone = useRef(false);

  // Initial bounds fit on first mount only
  useEffect(() => {
    if (!initialFitDone.current && fitPoints.length > 0) {
      const validPoints = fitPoints.filter((p) => p && !isNaN(p.lat) && !isNaN(p.lng));
      if (validPoints.length > 1) {
        const bounds = L.latLngBounds(validPoints.map((p) => [p.lat, p.lng]));
        map.fitBounds(bounds, { padding: [45, 45], maxZoom: 15, animate: false });
      } else if (validPoints.length === 1) {
        map.setView([validPoints[0].lat, validPoints[0].lng], 14, { animate: false });
      }
      initialFitDone.current = true;
    }
  }, [fitPoints, map]);

  // Track user drag/zoom so we DO NOT recenter automatically while user explores
  useEffect(() => {
    const onUserInteraction = () => {
      onResetMoved(true);
    };

    map.on('dragstart', onUserInteraction);
    map.on('zoomstart', onUserInteraction);

    return () => {
      map.off('dragstart', onUserInteraction);
      map.off('zoomstart', onUserInteraction);
    };
  }, [map, onResetMoved]);

  return null;
}

// Smooth animated marker for moving ambulance
function SmoothMarker({ position, icon, children }) {
  const markerRef = useRef(null);
  const prevPos = useRef(position);

  useEffect(() => {
    const marker = markerRef.current;
    if (!marker || !position) return;
    const start = prevPos.current || position;
    const end = position;
    const steps = 25;
    let step = 0;

    const animate = () => {
      if (step >= steps) {
        prevPos.current = end;
        marker.setLatLng([end.lat, end.lng]);
        return;
      }
      const t = step / steps;
      const lat = start.lat + (end.lat - start.lat) * t;
      const lng = start.lng + (end.lng - start.lng) * t;
      marker.setLatLng([lat, lng]);
      step++;
      requestAnimationFrame(animate);
    };

    if (start.lat !== end.lat || start.lng !== end.lng) {
      animate();
    } else {
      marker.setLatLng([end.lat, end.lng]);
    }
  }, [position]);

  if (!position || isNaN(position.lat) || isNaN(position.lng)) return null;

  return (
    <Marker ref={markerRef} position={[position.lat, position.lng]} icon={icon}>
      {children}
    </Marker>
  );
}

// Custom Floating Action Bar inside the map (Recenter, Zoom In/Out)
function MapOverlayControls({ fitPoints, userHasMoved, onResetMoved }) {
  const map = useMap();

  const handleRecenter = () => {
    const validPoints = fitPoints.filter((p) => p && !isNaN(p.lat) && !isNaN(p.lng));
    if (validPoints.length > 1) {
      const bounds = L.latLngBounds(validPoints.map((p) => [p.lat, p.lng]));
      map.flyToBounds(bounds, { padding: [45, 45], maxZoom: 15, duration: 0.8 });
    } else if (validPoints.length === 1) {
      map.flyTo([validPoints[0].lat, validPoints[0].lng], 15, { duration: 0.8 });
    }
    onResetMoved(false);
  };

  return (
    <div className="map-floating-controls">
      {userHasMoved && (
        <button
          className="map-ctrl-btn recenter-btn"
          onClick={handleRecenter}
          title="Re-center view"
        >
          <Crosshair size={16} />
          <span>Re-center</span>
        </button>
      )}
      <div className="map-zoom-group">
        <button
          className="map-ctrl-btn"
          onClick={() => map.zoomIn()}
          title="Zoom in"
        >
          <Plus size={16} />
        </button>
        <button
          className="map-ctrl-btn"
          onClick={() => map.zoomOut()}
          title="Zoom out"
        >
          <Minus size={16} />
        </button>
      </div>
    </div>
  );
}

export default function LeafletMap({
  driverCoords,
  patientCoords,
  hospitalCoords,
  driverName,
  hospitalName,
  nearbyServices = { hospitals: [], drivers: [] },
  height = 280,
  style,
  interactive = true,
  showStandby = true
}) {
  const [userHasMoved, setUserHasMoved] = useState(false);

  const defaultCenter = useMemo(() => {
    if (patientCoords && !isNaN(patientCoords.lat)) return [patientCoords.lat, patientCoords.lng];
    if (driverCoords && !isNaN(driverCoords.lat)) return [driverCoords.lat, driverCoords.lng];
    if (hospitalCoords && !isNaN(hospitalCoords.lat)) return [hospitalCoords.lat, hospitalCoords.lng];
    return [11.0168, 76.9558]; // Coimbatore central
  }, [patientCoords, driverCoords, hospitalCoords]);

  const fitPoints = useMemo(() => {
    const pts = [];
    if (patientCoords && !isNaN(patientCoords.lat)) pts.push(patientCoords);
    if (driverCoords && !isNaN(driverCoords.lat)) pts.push(driverCoords);
    if (hospitalCoords && !isNaN(hospitalCoords.lat)) pts.push(hospitalCoords);
    return pts;
  }, [patientCoords, driverCoords, hospitalCoords]);

  // Icons
  const patientIcon = useMemo(() => createSvgIcon('patient'), []);
  const ambulanceIcon = useMemo(() => createSvgIcon('ambulance', driverName ? driverName.split(' ')[0] : 'Unit 108'), [driverName]);
  const hospitalIcon = useMemo(() => createSvgIcon('hospital', hospitalName ? hospitalName.split(' ')[0] : 'ER'), [hospitalName]);

  return (
    <div className="leaflet-map-wrapper" style={{ height, borderRadius: 18, position: 'relative', overflow: 'hidden', ...style }}>
      <MapContainer
        center={defaultCenter}
        zoom={14}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={interactive}
        dragging={interactive}
        touchZoom={interactive}
        doubleClickZoom={interactive}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        <MapController
          fitPoints={fitPoints}
          userHasMoved={userHasMoved}
          onResetMoved={setUserHasMoved}
        />

        {interactive && (
          <MapOverlayControls
            fitPoints={fitPoints}
            userHasMoved={userHasMoved}
            onResetMoved={setUserHasMoved}
          />
        )}

        {/* Patient Location */}
        {patientCoords && !isNaN(patientCoords.lat) && (
          <Marker position={[patientCoords.lat, patientCoords.lng]} icon={patientIcon}>
            <Popup className="custom-leaflet-popup">
              <div className="popup-content-box">
                <div className="popup-badge patient">📍 Your Location</div>
                <div className="popup-title">Patient Pickup Point</div>
                <div className="popup-coords">{patientCoords.lat.toFixed(4)}, {patientCoords.lng.toFixed(4)}</div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Active Driver / Ambulance */}
        {driverCoords && !isNaN(driverCoords.lat) && (
          <SmoothMarker position={driverCoords} icon={ambulanceIcon}>
            <Popup className="custom-leaflet-popup">
              <div className="popup-content-box">
                <div className="popup-badge ambulance">🚑 Active Ambulance</div>
                <div className="popup-title">{driverName || 'Emergency Ambulance'}</div>
                <div className="popup-subtitle">Live GPS Tracked Unit</div>
              </div>
            </Popup>
          </SmoothMarker>
        )}

        {/* Target Hospital */}
        {hospitalCoords && !isNaN(hospitalCoords.lat) && (
          <Marker position={[hospitalCoords.lat, hospitalCoords.lng]} icon={hospitalIcon}>
            <Popup className="custom-leaflet-popup">
              <div className="popup-content-box">
                <div className="popup-badge hospital">🏥 Destination Hospital</div>
                <div className="popup-title">{hospitalName || 'Emergency Trauma Center'}</div>
                <div className="popup-subtitle">ER & Trauma Ward on alert</div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Standby Nearby Hospitals */}
        {showStandby && nearbyServices?.hospitals?.map((h) => {
          if (!h.coords || (hospitalCoords && h.coords.lat === hospitalCoords.lat && h.coords.lng === hospitalCoords.lng)) return null;
          return (
            <Marker
              key={h._id || h.hospitalId}
              position={[h.coords.lat, h.coords.lng]}
              icon={createSvgIcon('hospital', h.name.split(' ')[0])}
            >
              <Popup className="custom-leaflet-popup">
                <div className="popup-content-box">
                  <div className="popup-badge hospital">🏥 Emergency Center</div>
                  <div className="popup-title">{h.name}</div>
                  <div className="popup-meta">
                    <span>🛏️ {h.availableBeds || 0} Beds Available</span>
                    <span>🚨 {h.icuAvailable || 0} ICU</span>
                  </div>
                  <div className="popup-phone">📞 {h.phone || '0422-2345678'}</div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Standby Nearby Ambulances */}
        {showStandby && nearbyServices?.drivers?.map((d) => {
          if (!d.coords || (driverCoords && d.coords.lat === driverCoords.lat && d.coords.lng === driverCoords.lng)) return null;
          return (
            <Marker
              key={d._id || d.ambulanceNumber}
              position={[d.coords.lat, d.coords.lng]}
              icon={createSvgIcon('ambulance-standby', d.ambulanceNumber ? d.ambulanceNumber.slice(-4) : 'Standby')}
            >
              <Popup className="custom-leaflet-popup">
                <div className="popup-content-box">
                  <div className="popup-badge standby">🚑 Standby Unit</div>
                  <div className="popup-title">{d.name} ({d.ambulanceNumber})</div>
                  <div className="popup-meta">
                    <span>Status: {d.isAvailable ? '🟢 Available' : '🟡 Dispatched'}</span>
                    <span>Fleet: {d.fleetType || 'Hospital-owned'}</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

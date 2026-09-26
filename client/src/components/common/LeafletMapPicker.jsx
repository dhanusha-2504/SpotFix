import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Crosshair } from 'lucide-react';

// Fix Leaflet default icon issues in Webpack/Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom pin marker icon
const customMarkerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Map click event listener component
function LocationMarker({ position, onLocationChange, readOnly }) {
  useMapEvents({
    click(e) {
      if (!readOnly && onLocationChange) {
        onLocationChange(e.latlng.lat, e.latlng.lng);
      }
    },
  });

  return position ? (
    <Marker position={position} icon={customMarkerIcon}>
      <Popup>
        <div className="p-1 text-slate-900 font-sans">
          <p className="font-bold text-xs">Selected Location</p>
          <p className="text-[11px] text-slate-600 mt-0.5">
            {position[0].toFixed(5)}, {position[1].toFixed(5)}
          </p>
        </div>
      </Popup>
    </Marker>
  ) : null;
}

// Map center synchronizer
function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
}

const LeafletMapPicker = ({
  latitude,
  longitude,
  onLocationChange,
  readOnly = false,
  height = '300px',
  address = '',
}) => {
  const defaultLat = latitude || 12.9716;
  const defaultLng = longitude || 77.5946;
  const [position, setPosition] = useState([defaultLat, defaultLng]);
  const [geoLoading, setGeoLoading] = useState(false);

  useEffect(() => {
    if (latitude && longitude) {
      setPosition([latitude, longitude]);
    }
  }, [latitude, longitude]);

  const handleLocationUpdate = (lat, lng) => {
    setPosition([lat, lng]);
    if (onLocationChange) {
      onLocationChange(lat, lng);
    }
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        handleLocationUpdate(lat, lng);
        setGeoLoading(false);
      },
      () => {
        alert('Could not retrieve current location. Please click on the map to pin.');
        setGeoLoading(false);
      }
    );
  };

  return (
    <div className="w-full relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-xl">
      {/* Top Map Action Bar (if picker mode) */}
      {!readOnly && (
        <div className="p-3 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 z-20">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <span>Click map to place location pin</span>
            <span className="text-slate-500">
              ({position[0].toFixed(4)}, {position[1].toFixed(4)})
            </span>
          </div>
          <button
            type="button"
            onClick={handleGetCurrentLocation}
            disabled={geoLoading}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600 hover:text-white transition-all"
          >
            <Crosshair className={`w-3.5 h-3.5 ${geoLoading ? 'animate-spin' : ''}`} />
            {geoLoading ? 'Detecting GPS...' : 'Use My GPS Location'}
          </button>
        </div>
      )}

      {/* Map View */}
      <div style={{ height }}>
        <MapContainer
          center={position}
          zoom={14}
          scrollWheelZoom={false}
          className="w-full h-full"
        >
          <ChangeView center={position} zoom={15} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker
            position={position}
            onLocationChange={handleLocationUpdate}
            readOnly={readOnly}
          />
        </MapContainer>
      </div>

      {readOnly && address && (
        <div className="p-2.5 bg-slate-900/90 border-t border-slate-800 flex items-center gap-2 text-xs text-slate-300">
          <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="truncate">{address}</span>
        </div>
      )}
    </div>
  );
};

export default LeafletMapPicker;

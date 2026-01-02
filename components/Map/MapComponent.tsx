
'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAppStore, SatelliteId } from '@/store/useAppStore';

// Fix for default Leaflet markers in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Icons could go here, for now using colored circles/markers
const createIcon = (color: string) => new L.DivIcon({
  className: 'custom-marker',
  html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.5);"></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

function MapEvents() {
  const { satellites, placeSatellite } = useAppStore();
  
  // Find which satellite is active
  const activeSatId = (Object.keys(satellites) as SatelliteId[]).find(id => satellites[id].active);

  useMapEvents({
    click(e) {
      if (activeSatId) {
        placeSatellite(activeSatId, { lat: e.latlng.lat, lng: e.latlng.lng });
      }
    },
  });
  return null;
}

function MapUpdater() {
    const map = useMap();
    // Logic to fit bounds if needed
    return null;
}

export default function MapComponent() {
  const { satellites, target, distances, calculatedPosition, step } = useAppStore();
  const defaultCenter = { lat: 20.27, lng: 73.0 }; // Silvassa roughly, or generic
  
  return (
    <div className="h-full w-full relative z-0">
      <MapContainer 
        center={defaultCenter} 
        zoom={9} 
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapEvents />
        <MapUpdater />

        {/* Satellites */}
        {Object.values(satellites).map((sat) => (
          sat.position && (
            <Marker 
              key={sat.id} 
              position={[sat.position.lat, sat.position.lng]}
              icon={createIcon(sat.color)}
            >
              <Popup>{sat.name}</Popup>
            </Marker>
          )
        ))}

        {/* Circles (Visible when calculated) */}
        {step >= 2 && Object.values(satellites).map((sat) => {
           const dist = distances[sat.id];
           if (sat.position && dist !== null) {
               return (
                   <Circle 
                     key={`circle-${sat.id}`}
                     center={[sat.position.lat, sat.position.lng]}
                     pathOptions={{ color: sat.color, fillColor: sat.color, fillOpacity: 0.1 }}
                     radius={dist * 1000} // Radius in meters
                   />
               );
           }
           return null;
        })}

        {/* Calculated Position */}
        {step >= 3 && calculatedPosition && (
             <Marker 
                position={[calculatedPosition.point.lat, calculatedPosition.point.lng]}
                icon={new L.DivIcon({
                    className: 'calculated-marker',
                    html: '<div style="font-size: 24px;">⭐</div>',
                    iconSize: [30, 30],
                    iconAnchor: [15, 15]
                })}
             >
                 <Popup>Calculated Position <br/> Accuracy: ±{calculatedPosition.accuracy.toFixed(2)}km</Popup>
             </Marker>
        )}

        {/* Actual Target (Only shown if revealed? Or maybe just keep hidden until distinct reveal step) */}
        {/* If we add a reveal step, we show it here. For now let's assume step 3 includes reveal or we add a step 4 */}
        {step >= 3 && target && (
             <Marker 
                position={[target.lat, target.lng]}
                icon={new L.DivIcon({
                    className: 'target-marker',
                    html: '<div style="font-size: 24px;">🎯</div>',
                    iconSize: [30, 30],
                    iconAnchor: [15, 15]
                })}
                opacity={0.7}
             >
                 <Popup>Actual Target</Popup>
             </Marker>
        )}

      </MapContainer>
    </div>
  );
}


'use client';

import { useAppStore } from '@/store/useAppStore';
import { MapPin, Crosshair, Calculator, RotateCcw } from 'lucide-react';
import clsx from 'clsx';

export default function SatelliteControls() {
  const { satellites, setActiveSatellite, step, calculatePosition, calculateDistances, reset, generateTarget } = useAppStore();

  const handlePlaceClick = (id: 'sat1' | 'sat2' | 'sat3') => {
      setActiveSatellite(id);
  };
  
  const allPlaced = Object.values(satellites).every(s => s.position !== null);
  
  const handleCalculate = async () => {
      // If we already have a target (e.g. from user location), use it
      // Otherwise generate one
      if (!useAppStore.getState().target) {
          // Fallback to random if user didn't use GPS
          const sats = Object.values(satellites);
          const avgLat = sats.reduce((sum, s) => sum + (s.position?.lat || 0), 0) / 3;
          const avgLng = sats.reduce((sum, s) => sum + (s.position?.lng || 0), 0) / 3;
          const bounds = { 
              south: avgLat - 1, north: avgLat + 1, 
              west: avgLng - 1, east: avgLng + 1 
          };
          generateTarget(bounds);
      }
      
      calculateDistances(); 
      calculatePosition();  
  };
  
  const handleUseGPS = () => {
      if ('geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(async (pos) => {
              const point = { lat: pos.coords.latitude, lng: pos.coords.longitude };
              useAppStore.getState().setTarget(point);
              
              // Reverse Geocoding
              try {
                  const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${point.lat}&lon=${point.lng}`);
                  const data = await res.json();
                  if (data && data.display_name) {
                      useAppStore.getState().setAddress(data.display_name);
                  }
              } catch (e) {
                  console.error("Geocoding failed", e);
              }
              
              alert("Location Acquired! Now place satellites to triangulate.");
          }, (err) => {
              alert("Could not get location: " + err.message);
          });
      } else {
          alert("Geolocation not supported");
      }
  };

  return (
    <div className="bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-lg border border-slate-200 space-y-4">
      <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
         <MapPin className="w-5 h-5" /> Mission Control
      </h2>
      
      {!useAppStore.getState().target && (
         <button 
           onClick={handleUseGPS}
           className="w-full py-2 px-3 bg-blue-50 text-blue-700 text-sm font-semibold rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
         >
             <Crosshair className="w-4 h-4" /> Use Real GPS Location
         </button>
      )}
      
      <div className="space-y-3">
         {Object.values(satellites).map((sat) => (
             <button
               key={sat.id}
               onClick={() => handlePlaceClick(sat.id)}
               disabled={step > 1}
               className={clsx(
                   "w-full flex items-center justify-between p-3 rounded-lg border transition-all",
                   sat.active ? "ring-2 ring-offset-1" : "hover:bg-slate-50",
                   sat.position ? "border-slate-200 bg-slate-50" : "border-dashed border-slate-300",
                   step > 1 && "opacity-60 cursor-not-allowed"
               )}
               style={{ 
                   borderColor: sat.active ? sat.color : undefined,
                   backgroundColor: sat.active ? `${sat.color}10` : undefined
               }}
             >
                <div className="flex items-center gap-3">
                    <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: sat.color }}
                    />
                    <span className="font-medium text-slate-700">{sat.name}</span>
                </div>
                {sat.position ? (
                    <span className="text-xs font-mono text-slate-500">
                        {sat.position.lat.toFixed(2)}°, {sat.position.lng.toFixed(2)}°
                    </span>
                ) : (
                    <span className="text-xs text-slate-400 italic">Click map to place</span>
                )}
             </button>
         ))}
      </div>

      <div className="pt-2 border-t border-slate-100 flex gap-2">
         <button
            onClick={handleCalculate}
            disabled={!allPlaced || step > 1}
            className={clsx(
                "flex-1 py-2 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors",
                allPlaced && step === 1
                  ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed"
            )}
         >
            <Calculator className="w-4 h-4" />
            Triangulate
         </button>
         
         <button
            onClick={reset}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            title="Reset Mission"
         >
            <RotateCcw className="w-5 h-5" />
         </button>
      </div>
    </div>
  );
}


import { create } from 'zustand';
import { haversineDistance, Point, trilaterate } from '@/lib/geoutils';

export type SatelliteId = 'sat1' | 'sat2' | 'sat3';

export interface Satellite {
  id: SatelliteId;
  name: string;
  color: string;
  position: Point | null;
  active: boolean; // Currently being placed
}

interface AppState {
  step: number; // 1: Place Satellites, 2: Calculate, 3: Revealed
  satellites: Record<SatelliteId, Satellite>;
  target: Point | null;
  distances: Record<SatelliteId, number | null>;
  calculatedPosition: { point: Point; accuracy: number } | null;
  isCalculating: boolean;
  userAddress: string | null;
  
  // Actions
  setStep: (step: number) => void;
  setActiveSatellite: (id: SatelliteId | null) => void;
  placeSatellite: (id: SatelliteId, position: Point) => void;
  generateTarget: (bounds: { south: number, north: number, west: number, east: number }) => void;
  setTarget: (point: Point) => void;
  setAddress: (addr: string) => void;
  calculateDistances: () => void;
  calculatePosition: () => void;
  reset: () => void;
}

const initialSatellites: Record<SatelliteId, Satellite> = {
  sat1: { id: 'sat1', name: 'Satellite 1', color: '#ef4444', position: null, active: false }, // Red
  sat2: { id: 'sat2', name: 'Satellite 2', color: '#3b82f6', position: null, active: false }, // Blue
  sat3: { id: 'sat3', name: 'Satellite 3', color: '#22c55e', position: null, active: false }, // Green
};

export const useAppStore = create<AppState>((set, get) => ({
  step: 1,
  satellites: initialSatellites,
  target: null,
  distances: { sat1: null, sat2: null, sat3: null },
  calculatedPosition: null,
  isCalculating: false,
  userAddress: null,

  setStep: (step) => set({ step }),
  
  setActiveSatellite: (id) => set((state) => {
    const newSatellites = { ...state.satellites };
    (Object.keys(newSatellites) as SatelliteId[]).forEach(k => newSatellites[k].active = false);
    if (id) newSatellites[id].active = true;
    return { satellites: newSatellites };
  }),

  placeSatellite: (id, position) => set((state) => {
      const newSatellites = { ...state.satellites };
      newSatellites[id] = { ...newSatellites[id], position, active: false };
      return { satellites: newSatellites };
  }),

  generateTarget: (bounds) => {
      const lat = bounds.south + Math.random() * (bounds.north - bounds.south);
      const lng = bounds.west + Math.random() * (bounds.east - bounds.west);
      set({ target: { lat, lng }, userAddress: null });
  },

  setTarget: (point) => set({ target: point }),
  setAddress: (addr) => set({ userAddress: addr }),

  calculateDistances: () => {
    const { satellites, target } = get();
    if (!target) return;

    const dists: any = {};
    (Object.values(satellites) as Satellite[]).forEach(sat => {
        if (sat.position) {
            dists[sat.id] = haversineDistance(
                sat.position.lat, sat.position.lng,
                target.lat, target.lng
            );
        }
    });
    set({ distances: dists });
  },

  calculatePosition: () => {
    set({ isCalculating: true });
    
    // Simulate calculation delay for effect
    setTimeout(() => {
        const { target } = get();
        
        if (target) {
            // "Precision should be 0.5 plus minus"
            // We generate a "Calculated Position" that is close to the real target but with some error.
            // value 0.0045 deg is approx 500m. Let's vary it slightly.
            const noiseLat = (Math.random() - 0.5) * 0.005; 
            const noiseLng = (Math.random() - 0.5) * 0.005;
            
            const result = {
                lat: target.lat + noiseLat,
                lng: target.lng + noiseLng
            };

            // CRITICAL: To ensure the visual circles intersect EXACTLY at this Calculated Position,
            // we must update the 'distances' to match the distance from Satellite -> Result.
            // If we kept distances to 'Target', the circles would cross at Target, but marker would be at Result.
            // User wants marker at intersection.
            
            const newDists: any = {};
            const sats = get().satellites;
            (Object.values(sats) as Satellite[]).forEach(sat => {
                if (sat.position) {
                    newDists[sat.id] = haversineDistance(
                        sat.position.lat, sat.position.lng,
                        result.lat, result.lng
                    );
                }
            });

            // Calculate accuracy vs actual target
             const accuracy = haversineDistance(result.lat, result.lng, target.lat, target.lng);
             
             set({ 
                 distances: newDists, // Update distances to match the intersection
                 calculatedPosition: { point: result, accuracy: accuracy },
                 isCalculating: false, 
                 step: 3 
             });
        } else {
             set({ isCalculating: false, step: 3 });
             console.error("Trilateration failed - no target");
        }
    }, 1500); 
  },
  
  reset: () => set({
      step: 1,
      satellites: initialSatellites,
      target: null,
      distances: { sat1: null, sat2: null, sat3: null },
      calculatedPosition: null,
      isCalculating: false,
      userAddress: null
  })
}));

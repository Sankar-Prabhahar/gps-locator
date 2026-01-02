
'use client';

import { useAppStore } from '@/store/useAppStore';
import { Ruler, Activity, Crosshair } from 'lucide-react';
import clsx from 'clsx';

export default function ResultsPanel() {
  const { distances, calculatedPosition, step, target } = useAppStore();

  if (step < 2) return null;

  return (
    <div className="bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-lg border border-slate-200 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
         <Activity className="w-5 h-5 text-indigo-600" /> Analysis Data
      </h2>

      {/* Distances */}
      <div className="space-y-2">
         <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Signal Distances</h3>
         <div className="grid grid-cols-1 gap-2">
             {Object.entries(distances).map(([key, dist]) => (
                 <div key={key} className="flex justify-between items-center bg-slate-50 p-2 rounded border border-slate-100">
                     <span className="text-sm font-medium capitalize text-slate-700">{key.replace('sat', 'Satellite ')}</span>
                     <span className="text-sm font-mono text-slate-900">
                         {dist ? `${dist.toFixed(2)} km` : '---'}
                     </span>
                 </div>
             ))}
         </div>
      </div>

      {/* Results */}
      {step >= 3 && calculatedPosition && (
          <div className="pt-2 border-t border-slate-100 space-y-3">
             <h3 className="text-xs font-semibold text-indigo-500 uppercase tracking-wider flex items-center gap-1">
                 <Crosshair className="w-3 h-3" /> Position Triangulated
             </h3>
             
             <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-lg">
                 <div className="grid grid-cols-2 gap-2 text-sm">
                     <div className="text-slate-500">Latitude:</div>
                     <div className="font-mono font-medium text-slate-900 text-right">{calculatedPosition.point.lat.toFixed(6)}°</div>
                     <div className="text-slate-500">Longitude:</div>
                     <div className="font-mono font-medium text-slate-900 text-right">{calculatedPosition.point.lng.toFixed(6)}°</div>
                     <div className="text-slate-500">Accuracy:</div>
                     <div className="font-mono font-medium text-green-600 text-right">±{calculatedPosition.accuracy.toFixed(2)} km</div>
                 </div>
             </div>
             
             {target && (
                 <div className="bg-green-50 border border-green-100 p-3 rounded-lg text-xs space-y-1">
                     <div className="font-semibold text-green-800 flex justify-between">
                         <span>Actual Target Verified</span>
                         <span>✔</span>
                     </div>
                     <div className="text-green-700 font-mono">
                        {target.lat.toFixed(4)}, {target.lng.toFixed(4)}
                     </div>
                     {useAppStore.getState().userAddress && (
                         <div className="pt-1 mt-1 border-t border-green-200 text-green-900 italic">
                             "{useAppStore.getState().userAddress}"
                         </div>
                     )}
                 </div>
             )}
          </div>
      )}
    </div>
  );
}


'use client';

import dynamic from 'next/dynamic';
import SatelliteControls from './Controls/SatelliteControls';
import ResultsPanel from './Results/ResultsPanel';
import { Globe } from 'lucide-react';

const MapComponent = dynamic(() => import('./Map/MapComponent'), { 
  ssr: false, 
  loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
          Loading Map Data...
      </div>
  )
});

export default function TrilaterationApp() {
  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm z-20">
         <div className="flex items-center gap-3">
             <div className="bg-indigo-600 text-white p-2 rounded-lg">
                 <Globe className="w-6 h-6" />
             </div>
             <div>
                 <h1 className="text-xl font-bold text-slate-900 tracking-tight">GPS-3000x</h1>
                 <p className="text-xs text-slate-500 font-medium">Global Positioning Trilateration Simulator</p>
             </div>
         </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative flex flex-col md:flex-row">
         
         {/* Map Area */}
         <div className="flex-1 relative order-2 md:order-1 h-[60vh] md:h-full">
             <MapComponent />
             
             {/* Overlay Controls (Desktop) */}
             <div className="absolute top-4 left-4 z-[400] w-80 hidden md:block space-y-4">
                 <SatelliteControls />
                 <ResultsPanel />
             </div>
         </div>

         {/* Mobile/Tablet Sidebar Control Panel */}
         <div className="md:hidden order-1 bg-white border-b border-slate-200 p-4 max-h-[40vh] overflow-y-auto">
             <SatelliteControls />
             <div className="mt-4">
                 <ResultsPanel />
             </div>
         </div>
         
         {/* Right Sidebar Control Panel (Desktop Alternative or Info) */}
         {/* Could be used for Educational info, for now controls are overlay on map for cleaner look */}

      </main>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, 
  MapPin, 
  CheckCircle2, 
  ChevronDown, 
  X, 
  Trophy, 
  LayoutList, 
  Map as MapIcon,
  TrendingUp,
  Award,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { INITIAL_REPORTS, MLAS, WARDS, CITIES } from './data';
import { Report, Status } from './types';
import { cn } from './lib/utils';

// Helper to make marker icon
const createMarkerIcon = (status: Status) => {
  const color = status === 'resolved' ? '#22c55e' : '#e8441a';
  return L.divIcon({
    html: `<div style="
      width:14px;height:14px;
      background:${color};
      border:2px solid rgba(255,255,255,0.8);
      border-radius:50%;
      box-shadow:0 0 0 3px ${color}44, 0 2px 8px rgba(0,0,0,0.5);
      position:relative;
    "><div class="animate-pulse-ring" style="
      position:absolute;inset:-6px;
      border-radius:50%;
      background:${color};
      opacity:0.2;
    "></div></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    className: ''
  });
};

function MapFlyTo({ coords }: { coords: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      map.flyTo(coords, 15, { duration: 1.5 });
    }
  }, [coords, map]);
  return null;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'reports' | 'leaderboard' | 'wards'>('reports');
  const [reports, setReports] = useState<Report[]>(INITIAL_REPORTS);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [selectedCoords, setSelectedCoords] = useState<[number, number] | null>(null);
  const [activeCity, setActiveCity] = useState(CITIES[0]);
  
  // Submit Step State
  const [uploadState, setUploadState] = useState<'idle' | 'success'>('idle');
  const [locationState, setLocationState] = useState<'idle' | 'success'>('idle');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const stats = {
    reports: 47,
    resolved: 8,
    wards: 12
  };

  const handleReportClick = (report: Report) => {
    setSelectedCoords([report.lat, report.lng]);
  };

  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setSelectedCoords([pos.coords.latitude, pos.coords.longitude]);
      });
    }
  };

  const simulateSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsReportModalOpen(false);
      // Reset form
      setUploadState('idle');
      setLocationState('idle');
      // Add a fresh report (mock)
      const newReport: Report = {
        id: Math.random().toString(),
        lat: 22.7196 + (Math.random() - 0.5) * 0.05,
        lng: 75.8577 + (Math.random() - 0.5) * 0.05,
        status: 'open',
        ward: 'Ward 12 · Vijay Nagar',
        location: 'Newly reported garbage site',
        timestamp: 'Just now',
        mla: MLAS[0]
      };
      setReports(prev => [newReport, ...prev]);
    }, 2000);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-bg text-gray-100 selection:bg-accent selection:text-black">
      {/* TOPBAR */}
      <header className="fixed top-0 left-0 right-0 z-[1000] h-14 bg-bg/90 backdrop-blur-md border-b border-border px-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5 font-display font-extrabold text-lg tracking-tight">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center text-lg shadow-lg shadow-accent/20">🗑️</div>
          <div>MP <span className="text-accent">Kasa</span></div>
        </div>

        <button 
          onClick={() => setIsCityModalOpen(true)}
          className="flex items-center gap-2 bg-surface-2 border border-border rounded-full px-4 py-1.5 text-xs font-medium hover:border-accent transition-colors"
        >
          <div className="w-2 h-2 bg-green-500 rounded-full" />
          <span>{activeCity.name}</span>
          <ChevronDown className="w-4 h-4 text-text-muted" />
        </button>

        <div className="hidden md:flex items-center gap-4">
          <div className="text-[11px] text-text-muted uppercase tracking-wider font-bold">
            <span className="text-accent font-display">{activeCity.wardsCount}</span> wards · 
            <span className="text-accent font-display">{activeCity.mlaCount}</span> MLAs
          </div>
          <button 
            onClick={() => setIsReportModalOpen(true)}
            className="bg-accent text-black font-display font-bold text-xs px-5 py-2 rounded-lg flex items-center gap-2 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent/30 transition-all active:translate-y-0"
          >
            <Camera className="w-4 h-4" />
            Report Garbage
          </button>
        </div>
      </header>

      {/* HERO BANNER - DESKTOP ONLY */}
      <div className="hidden md:flex fixed top-14 left-0 right-0 z-[999] bg-[linear-gradient(135deg,#1a0a00,#1a1200)] border-b border-[#2a1f00] px-6 py-2.5 items-center justify-between gap-3">
        <div className="font-display text-xs text-text-muted">
          <strong className="text-accent text-sm">{activeCity.name} — MP Kasa</strong> · Har ward, har MLA, har MP — accountability public hai
        </div>
        <div className="flex gap-8">
          {[
            { label: 'Reports', val: stats.reports },
            { label: 'Resolved', val: stats.resolved },
            { label: 'Wards Active', val: stats.wards },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <motion.div 
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="font-display font-black text-xl text-accent leading-none"
              >
                {s.val}
              </motion.div>
              <div className="text-[9px] text-text-muted uppercase tracking-widest mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* MAIN LAYOUT */}
      <div className="flex flex-1 pt-14 md:pt-[104px]">
        {/* LEFT PANEL */}
        <aside className="w-full md:w-[380px] md:min-w-[380px] h-full bg-surface border-r border-border flex flex-col z-20 overflow-hidden">
          {/* TABS */}
          <div className="flex border-b border-border px-4 sticky top-0 bg-surface z-10 shrink-0">
            {[
              { id: 'reports', label: 'Reports', icon: MapPin },
              { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
              { id: 'wards', label: 'Wards Index', icon: LayoutList },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={cn(
                  "flex-1 py-3.5 text-[13px] font-semibold transition-all border-b-2 flex items-center justify-center gap-2",
                  activeTab === t.id 
                    ? "text-accent border-accent" 
                    : "text-text-muted border-transparent hover:text-gray-100"
                )}
              >
                <t.icon className="w-4 h-4" />
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto">
            {activeTab === 'reports' && (
              <div className="p-4 space-y-4">
                <div className="flex items-center gap-2 text-[10px] font-bold text-text-muted uppercase tracking-[0.15em]">
                  Latest Reports
                  <div className="flex-1 h-px bg-border" />
                </div>
                
                {reports.map((report) => (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={report.id}
                    onClick={() => handleReportClick(report)}
                    className={cn(
                      "group bg-surface-2 border border-border rounded-xl p-3.5 cursor-pointer hover:border-accent transition-all hover:translate-x-1 ring-0 hover:ring-1 hover:ring-accent/20",
                      report.status === 'resolved' ? "border-l-4 border-l-green-500" : "border-l-4 border-l-accent-2"
                    )}
                  >
                    <div className="flex justify-between items-start mb-2">
                       <span className="text-[10px] font-bold bg-surface px-2 py-1 rounded text-accent uppercase tracking-wider">
                         {report.ward}
                       </span>
                       <span className={cn(
                         "text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider",
                         report.status === 'resolved' ? "bg-green-500/10 text-green-500" : "bg-accent-2/10 text-accent-2"
                       )}>
                         {report.status === 'resolved' ? '✓ Resolved' : 'Open'}
                       </span>
                    </div>
                    <div className="text-sm font-semibold mb-1 group-hover:text-accent transition-colors">
                      🏙️ {report.location}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-text-muted mb-3">
                      <Clock className="w-3.5 h-3.5" />
                      {report.timestamp}
                    </div>

                    <div className="flex items-center gap-2.5 p-2.5 bg-accent/5 border border-accent/10 rounded-lg">
                      <div className="w-8 h-8 bg-accent flex items-center justify-center rounded-full text-black font-bold text-[10px] shrink-0">
                        {report.mla.avatar}
                      </div>
                      <div className="min-w-0">
                        <div className="text-[12px] font-bold truncate">{report.mla.name}</div>
                        <div className="text-[10px] text-text-muted">MLA · {report.mla.ward} · {report.mla.party}</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {activeTab === 'leaderboard' && (
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-2 text-[10px] font-bold text-text-muted uppercase tracking-[0.15em] mb-4">
                  Leaderboard: Open Reports
                  <div className="flex-1 h-px bg-border" />
                </div>
                
                {MLAS.map((mla, idx) => (
                  <div key={mla.id} className="flex items-center gap-4 bg-surface-2 border border-border rounded-xl p-3 hover:border-accent group transition-all cursor-pointer">
                    <div className={cn(
                      "font-display font-black text-2xl w-8 text-center",
                      idx === 0 ? "text-yellow-400" : idx === 1 ? "text-slate-400" : idx === 2 ? "text-amber-700" : "text-text-muted"
                    )}>
                      {idx + 1}
                    </div>
                    <div className="w-11 h-11 bg-surface border border-border rounded-xl flex items-center justify-center font-display font-bold text-accent text-sm">
                      {mla.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[14px] font-bold truncate group-hover:text-accent transition-colors">{mla.name}</div>
                      <div className="text-[11px] text-text-muted truncate mb-1">{mla.ward}</div>
                      <span className={cn(
                        "text-[9px] font-bold px-1.5 py-0.5 rounded tracking-widest",
                        mla.party === 'BJP' ? "bg-orange-500/10 text-orange-500" : "bg-blue-500/10 text-blue-500"
                      )}>
                        {mla.party}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="font-display font-black text-xl text-accent-2 leading-none">{mla.reportCount}</div>
                      <div className="text-[9px] text-text-muted uppercase mt-0.5">reports</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'wards' && (
               <div className="p-4">
                 <div className="flex items-center gap-2 text-[10px] font-bold text-text-muted uppercase tracking-[0.15em] mb-4">
                  Indore Ward Index
                  <div className="flex-1 h-px bg-border" />
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  {WARDS.map(ward => (
                    <div key={ward.id} className="bg-surface-2 border border-border rounded-xl p-3 hover:border-accent transition-all cursor-pointer group">
                      <div className="font-bold text-sm mb-0.5">Ward {ward.number}</div>
                      <div className="text-[11px] text-text-muted mb-2">{ward.name}</div>
                      <div className="flex flex-col gap-1">
                        <div className="text-[10px] font-bold text-accent-2">{ward.openReports} open</div>
                        <div className="text-[10px] font-bold text-green-500">{ward.resolvedReports} resolved</div>
                      </div>
                    </div>
                  ))}
                </div>
               </div>
            )}
          </div>
        </aside>

        {/* MAP CONTAINER */}
        <main className="flex-1 relative z-10 bg-[#0d1117]">
          <MapContainer 
            center={[22.7196, 75.8577]} 
            zoom={13} 
            className="w-full h-full"
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; OpenStreetMap'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {reports.map((report) => (
              <Marker 
                key={report.id} 
                position={[report.lat, report.lng]} 
                icon={createMarkerIcon(report.status)}
              >
                <Popup className="custom-popup">
                  <div className="min-w-[200px] p-1 font-sans">
                      <div className="font-bold text-xs mb-1 text-gray-100">{report.ward}</div>
                      <div className="text-[11px] text-gray-400 mb-2 truncate">{report.location}</div>
                      <span className={cn(
                        "text-[9px] font-bold px-2 py-0.5 rounded tracking-widest uppercase",
                        report.status === 'resolved' ? "bg-green-500/15 text-green-500" : "bg-accent-2/15 text-accent-2"
                      )}>
                        {report.status === 'resolved' ? '✓ Resolved' : '● Open'}
                      </span>
                  </div>
                </Popup>
              </Marker>
            ))}
            <MapFlyTo coords={selectedCoords} />
          </MapContainer>

          {/* Map Controls */}
          <div className="absolute top-4 right-4 z-[400] flex flex-col gap-2">
            <button 
              onClick={handleLocateMe}
              className="w-10 h-10 bg-surface border border-border rounded-xl flex items-center justify-center text-text-muted hover:border-accent hover:text-accent transition-all backdrop-blur-md shadow-xl"
            >
              <MapPin className="w-5 h-5" />
            </button>
            <button className="w-10 h-10 bg-surface border border-border rounded-xl flex items-center justify-center text-text-muted hover:border-accent hover:text-accent transition-all backdrop-blur-md shadow-xl">
              <TrendingUp className="w-5 h-5" />
            </button>
          </div>
        </main>
      </div>

      {/* MOBILE FAB */}
      <button 
        onClick={() => setIsReportModalOpen(true)}
        className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[500] bg-accent text-black font-display font-black px-8 py-4 rounded-full flex items-center gap-3 shadow-2xl shadow-accent/50 scale-110"
      >
        <Camera className="w-5 h-5" />
        Report Garbage
      </button>

      {/* REPORT MODAL */}
      <AnimatePresence>
        {isReportModalOpen && (
          <div className="fixed inset-0 z-[2000] flex items-end md:items-center justify-center p-0 md:p-6 text-gray-100">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsReportModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
            />
            
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-[540px] bg-surface border-t md:border border-border rounded-t-[32px] md:rounded-[32px] p-8 md:p-10 shadow-2xl overflow-hidden"
            >
               <div className="md:hidden w-12 h-1.5 bg-border rounded-full mx-auto mb-8" />
               <button 
                 onClick={() => setIsReportModalOpen(false)}
                 className="absolute top-8 right-8 w-10 h-10 bg-surface-2 border border-border rounded-xl flex items-center justify-center text-text-muted hover:text-gray-100 transition-colors"
               >
                 <X className="w-5 h-5" />
               </button>

               <div className="mb-8">
                 <h2 className="font-display font-black text-3xl mb-1.5 flex items-center gap-3">
                   <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center text-accent">📸</div>
                   Garbage Report Karo
                 </h2>
                 <p className="text-[13px] text-text-muted">Anonymous · No login required · Auto-detect location</p>
               </div>

               <div className="space-y-4">
                 {/* UPLOAD SECTION */}
                 <div 
                   onClick={() => setUploadState('success')}
                   className={cn(
                    "border-2 border-dashed rounded-[24px] p-10 text-center cursor-pointer transition-all",
                    uploadState === 'success' ? "border-green-500 bg-green-500/5" : "border-border hover:border-accent hover:bg-accent/5"
                   )}
                 >
                   <div className="flex flex-col items-center gap-3">
                      {uploadState === 'success' ? (
                        <CheckCircle2 className="w-12 h-12 text-green-500 mb-2" />
                      ) : (
                        <Camera className="w-12 h-12 text-accent mb-2" />
                      )}
                      <div className="font-bold text-lg">{uploadState === 'success' ? 'Photo Uploaded!' : 'Click or Upload Photo'}</div>
                      <div className="text-[12px] text-text-muted">JPG, PNG · Max 10MB · Your identity is secure</div>
                   </div>
                 </div>

                 {/* LOCATION SECTION */}
                 <div className="bg-surface-2 border border-border rounded-2xl p-4 flex items-center gap-4">
                    <div className="w-10 h-10 bg-surface border border-border rounded-xl flex items-center justify-center text-accent">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={cn(
                        "text-[13px] font-medium truncate",
                        locationState === 'success' ? "text-green-500" : "text-text-muted"
                      )}>
                        {locationState === 'success' ? '📍 Vijay Nagar, Indore — Ward 12' : 'Location will be auto-detected'}
                      </div>
                    </div>
                    <button 
                      onClick={() => setLocationState('success')}
                      className="bg-accent/10 border border-accent/20 text-accent font-display font-bold text-[11px] px-4 py-2 rounded-lg hover:bg-accent hover:text-black transition-all"
                    >
                      Detect
                    </button>
                 </div>

                 {locationState === 'success' && (
                   <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-4 bg-green-500/5 border border-green-500/20 rounded-2xl flex items-center gap-3"
                   >
                     <Award className="w-6 h-6 text-green-500 shrink-0" />
                     <div className="text-[12px]">
                       <strong>Ward 12 · Vijay Nagar</strong> detect hua<br />
                       <span className="text-text-muted text-[11px]">MLA: Ramesh Mendola (BJP · Indore-2)</span>
                     </div>
                   </motion.div>
                 )}

                 <button 
                  onClick={simulateSubmit}
                  disabled={uploadState === 'idle' || locationState === 'idle' || isSubmitting}
                  className="w-full bg-accent disabled:opacity-50 disabled:grayscale text-black font-display font-black text-lg py-5 rounded-[20px] flex items-center justify-center gap-3 transition-transform active:scale-[0.98]"
                 >
                   {isSubmitting ? (
                     <>
                      <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      Uploading...
                     </>
                   ) : (
                     <>
                      🚀 Submit Report
                     </>
                   )}
                 </button>

                 <div className="flex items-center justify-center gap-2 text-[11px] text-text-muted pt-2 text-center">
                   <ShieldCheck className="w-4 h-4 text-green-500" />
                   100% Anonymous · Privacy-first platform
                 </div>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CITY MODAL */}
      <AnimatePresence>
        {isCityModalOpen && (
          <div className="fixed inset-0 z-[2000] flex items-end md:items-center justify-center p-0 md:p-6 text-gray-100">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCityModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
            />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-[500px] bg-surface border-t md:border border-border rounded-t-[32px] md:rounded-[32px] p-8 md:p-10 shadow-2xl"
            >
               <button 
                 onClick={() => setIsCityModalOpen(false)}
                 className="absolute top-8 right-8 w-10 h-10 bg-surface-2 border border-border rounded-xl flex items-center justify-center text-text-muted hover:text-gray-100 transition-colors"
               >
                 <X className="w-5 h-5" />
               </button>

               <div className="mb-8">
                 <h2 className="font-display font-black text-2xl mb-1.5">🗺️ Choose City</h2>
                 <p className="text-[13px] text-text-muted">Expansion underway across Madhya Pradesh</p>
               </div>

               <div className="grid grid-cols-2 gap-3">
                 {CITIES.map(city => (
                   <button
                    key={city.id}
                    onClick={() => {
                      if (city.status === 'active') {
                        setActiveCity(city);
                        setIsCityModalOpen(false);
                      }
                    }}
                    className={cn(
                      "text-left p-4 rounded-2xl border transition-all relative overflow-hidden",
                      activeCity.id === city.id ? "bg-accent/5 border-accent ring-1 ring-accent" : "bg-surface-2 border-border hover:border-text-muted",
                      city.status === 'coming-soon' && "opacity-40 grayscale cursor-not-allowed"
                    )}
                   >
                     <div className="font-display font-bold text-sm mb-0.5">{city.name}</div>
                     <div className="text-[10px] text-text-muted">{city.wardsCount} Wards · {city.mlaCount} MLAs</div>
                     {city.reportsCount && (
                       <div className="text-[11px] text-accent font-bold mt-2">🔴 {city.reportsCount} Reports</div>
                     )}
                     {city.status === 'coming-soon' && (
                       <div className="absolute top-2 right-2 bg-border text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded">Coming Soon</div>
                     )}
                   </button>
                 ))}
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

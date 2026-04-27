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
  const [reports, setReports] = useState<Report[]>(() => {
    const saved = localStorage.getItem('mp-kasa-reports');
    return saved ? JSON.parse(saved) : INITIAL_REPORTS;
  });
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [selectedCoords, setSelectedCoords] = useState<[number, number] | null>(null);
  const [activeCity, setActiveCity] = useState(CITIES[0]);
  
  // Submit Step State
  const [uploadState, setUploadState] = useState<'idle' | 'success'>('idle');
  const [locationState, setLocationState] = useState<'idle' | 'success'>('idle');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Persistence
  useEffect(() => {
    localStorage.setItem('mp-kasa-reports', JSON.stringify(reports));
  }, [reports]);

  const stats = {
    reports: reports.length,
    resolved: reports.filter(r => r.status === 'resolved').length,
    wards: new Set(reports.map(r => r.ward)).size
  };

  const handleReportClick = (report: Report) => {
    setSelectedCoords([report.lat, report.lng]);
    if (window.innerWidth < 768) {
      // On mobile, keep list visible but maybe center map later? 
      // Actually usually Namma Kasa keeps it visible.
    }
  };

  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setSelectedCoords(coords);
      }, (err) => {
        console.error("Geolocation error:", err);
      });
    }
  };

  const simulateSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsReportModalOpen(false);
      
      // Add a fresh report (actually adds to state now)
      const newReport: Report = {
        id: Date.now().toString(),
        lat: 22.7196 + (Math.random() - 0.5) * 0.04,
        lng: 75.8577 + (Math.random() - 0.5) * 0.04,
        status: 'open',
        ward: 'Ward 12 · Vijay Nagar',
        location: 'Newly reported garbage site in Indore',
        timestamp: 'Just now',
        mla: MLAS[0]
      };
      
      setReports(prev => [newReport, ...prev]);
      // Reset form
      setUploadState('idle');
      setLocationState('idle');
    }, 1500);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white text-slate-900 selection:bg-accent/30 selection:text-slate-900 font-sans">
      {/* TOPBAR */}
      <header className="fixed top-0 left-0 right-0 z-[1000] h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3 font-display font-extrabold text-xl tracking-tight text-slate-900">
          <div className="w-9 h-9 bg-accent rounded-xl flex items-center justify-center text-xl shadow-md shadow-accent/20">🗑️</div>
          <div>MP <span className="text-accent">Kasa</span> <span className="text-xs font-medium text-slate-400 align-top ml-1">INDORE</span></div>
        </div>

        <button 
          onClick={() => setIsCityModalOpen(true)}
          className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full px-5 py-2 text-sm font-semibold hover:border-accent hover:bg-white transition-all text-slate-700"
        >
          <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
          <span>{activeCity.name}</span>
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </button>

        <div className="hidden md:flex items-center gap-6">
          <div className="text-[11px] text-slate-500 uppercase tracking-widest font-bold flex gap-4">
            <div><span className="text-accent font-display text-base tracking-normal">{activeCity.wardsCount}</span> wards</div>
            <div className="w-px h-4 bg-slate-200 self-center" />
            <div><span className="text-accent font-display text-base tracking-normal">{activeCity.mlaCount}</span> MLAs</div>
          </div>
          <button 
            onClick={() => setIsReportModalOpen(true)}
            className="bg-accent text-white font-display font-bold text-sm px-6 py-2.5 rounded-xl flex items-center gap-2 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-accent/20 transition-all active:translate-y-0"
          >
            <Camera className="w-4 h-4" />
            Report Garbage
          </button>
        </div>
      </header>

      {/* HERO BANNER - LIGHT VERSION */}
      <div className="hidden md:flex fixed top-16 left-0 right-0 z-[999] bg-slate-50 border-b border-slate-200 px-6 py-3 items-center justify-between">
        <div className="font-display text-sm text-slate-600 flex items-center gap-2">
          <Award className="w-4 h-4 text-accent" />
          <span className="font-bold text-slate-900">{activeCity.name} Portal</span> 
          <span className="text-slate-400">·</span>
          Common citizens mapping garbage for accountability.
        </div>
        <div className="flex gap-10">
          {[
            { label: 'Reports', val: stats.reports, color: 'text-accent' },
            { label: 'Resolved', val: stats.resolved, color: 'text-green-600' },
            { label: 'Wards Active', val: stats.wards, color: 'text-blue-600' },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={cn("font-display font-black text-2xl leading-none", s.color)}
              >
                {s.val}
              </motion.div>
              <div className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-1.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* MAIN LAYOUT */}
      <div className="flex flex-1 pt-16 md:pt-[118px]">
        {/* LEFT PANEL */}
        <aside className="w-full md:w-[400px] md:min-w-[400px] h-full bg-white border-r border-slate-200 flex flex-col z-20 overflow-hidden shadow-sm">
          {/* TABS */}
          <div className="flex border-b border-slate-200 px-4 sticky top-0 bg-white z-10 shrink-0">
            {[
              { id: 'reports', label: 'Reports', icon: MapPin },
              { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
              { id: 'wards', label: 'Wards', icon: LayoutList },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={cn(
                  "flex-1 py-4 text-[13px] font-bold transition-all border-b-2 flex items-center justify-center gap-2.5",
                  activeTab === t.id 
                    ? "text-accent border-accent" 
                    : "text-slate-400 border-transparent hover:text-slate-600"
                )}
              >
                <t.icon className={cn("w-4 h-4", activeTab === t.id ? "text-accent" : "text-slate-300")} />
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto bg-slate-50/50">
            {activeTab === 'reports' && (
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Recent Activity</div>
                  <div className="text-[10px] bg-white border border-slate-200 px-2 py-1 rounded-md text-slate-500 font-bold">LIVE</div>
                </div>
                
                <AnimatePresence mode="popLayout">
                  {reports.map((report) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      key={report.id}
                      onClick={() => handleReportClick(report)}
                      className={cn(
                        "group bg-white border border-slate-200 rounded-2xl p-4 cursor-pointer hover:border-accent hover:shadow-lg hover:shadow-accent/5 transition-all relative overflow-hidden",
                        report.status === 'resolved' ? "border-l-4 border-l-green-500" : "border-l-4 border-l-orange-500"
                      )}
                    >
                      <div className="flex justify-between items-start mb-3">
                         <span className="text-[10px] font-black bg-slate-100 px-2.5 py-1 rounded-md text-slate-600 uppercase tracking-wider">
                           {report.ward}
                         </span>
                         <span className={cn(
                           "text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider",
                           report.status === 'resolved' ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-600"
                         )}>
                           {report.status === 'resolved' ? 'Resolved' : 'Open'}
                         </span>
                      </div>
                      <div className="text-[15px] font-bold text-slate-900 mb-1.5 group-hover:text-accent transition-colors leading-snug">
                        {report.location}
                      </div>
                      <div className="flex items-center gap-2 text-[12px] text-slate-400 mb-4">
                        <Clock className="w-4 h-4" />
                        {report.timestamp}
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl">
                        <div className="w-9 h-9 bg-accent/10 border border-accent/20 flex items-center justify-center rounded-xl text-accent font-black text-[11px] shrink-0">
                          {report.mla.avatar}
                        </div>
                        <div className="min-w-0">
                          <div className="text-[13px] font-bold text-slate-900 truncate">{report.mla.name}</div>
                          <div className="text-[11px] text-slate-500 font-medium">MLA · {report.mla.ward}</div>
                        </div>
                        <div className="ml-auto">
                           <div className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                             <TrendingUp className="w-3 h-3 text-slate-400" />
                           </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {reports.length === 0 && (
                  <div className="text-center py-20">
                    <MapIcon className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <div className="text-slate-400 font-bold uppercase text-[11px] tracking-widest">No reports in this area</div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'leaderboard' && (
              <div className="p-5 space-y-4">
                 <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Garbage Accumulation Index</div>
                
                {MLAS.map((mla, idx) => (
                  <div key={mla.id} className="flex items-center gap-4 bg-white border border-slate-100 rounded-2xl p-4 hover:border-accent hover:shadow-md group transition-all cursor-pointer">
                    <div className={cn(
                      "font-display font-black text-2xl w-10 text-center",
                      idx === 0 ? "text-yellow-500" : idx === 1 ? "text-slate-400" : idx === 2 ? "text-amber-600" : "text-slate-200"
                    )}>
                      {idx + 1}
                    </div>
                    <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center font-display font-bold text-accent text-base shadow-sm">
                      {mla.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[15px] font-bold text-slate-900 truncate group-hover:text-accent transition-colors">{mla.name}</div>
                      <div className="text-[11px] text-slate-500 truncate mb-1.5 font-medium">{mla.ward}</div>
                      <span className={cn(
                        "text-[9px] font-black px-2 py-0.5 rounded-md tracking-widest uppercase",
                        mla.party === 'BJP' ? "bg-orange-50 text-orange-600 border border-orange-100" : "bg-blue-50 text-blue-600 border border-blue-100"
                      )}>
                        {mla.party}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="font-display font-black text-2xl text-orange-600 leading-none">{mla.reportCount}</div>
                      <div className="text-[9px] text-slate-400 uppercase font-bold tracking-tighter mt-1">reports</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'wards' && (
               <div className="p-5">
                 <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-6">Indore Ward Breakdown</div>
                <div className="grid grid-cols-2 gap-4">
                  {WARDS.map(ward => (
                    <div key={ward.id} className="bg-white border border-slate-200 rounded-2xl p-4 hover:border-accent hover:shadow-md transition-all cursor-pointer group">
                      <div className="font-black text-slate-900 text-base mb-1">W{ward.number}</div>
                      <div className="text-[12px] text-slate-500 mb-4 font-bold truncate">{ward.name}</div>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-orange-600">
                          <span>Open</span>
                          <span>{ward.openReports}</span>
                        </div>
                        <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                           <div 
                             className="h-full bg-orange-500 rounded-full" 
                             style={{ width: `${(ward.openReports / (ward.openReports + ward.resolvedReports + 1)) * 100}%` }} 
                           />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
               </div>
            )}
          </div>
        </aside>

        {/* MAP CONTAINER */}
        <main className="flex-1 relative z-10">
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
                  <div className="min-w-[220px] p-2 font-sans">
                      <div className="font-black text-slate-900 text-sm mb-1.5 leading-tight">{report.location}</div>
                      <div className="text-[11px] text-slate-500 mb-3 font-bold uppercase tracking-wider">{report.ward}</div>
                      <div className="flex items-center gap-2 mb-3">
                         <div className="w-6 h-6 bg-accent rounded-lg flex items-center justify-center text-[10px] font-black text-white">{report.mla.avatar}</div>
                         <div className="text-[11px] font-bold text-slate-700">{report.mla.name}</div>
                      </div>
                      <div className={cn(
                        "text-[10px] font-black px-3 py-1.5 rounded-lg tracking-widest uppercase text-center w-full block",
                        report.status === 'resolved' ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                      )}>
                        {report.status === 'resolved' ? '✓ RESOLVED' : '● OPEN REPORT'}
                      </div>
                  </div>
                </Popup>
              </Marker>
            ))}
            <MapFlyTo coords={selectedCoords} />
          </MapContainer>

          {/* Map Controls */}
          <div className="absolute top-6 right-6 z-[400] flex flex-col gap-3">
            <button 
              onClick={handleLocateMe}
              className="w-12 h-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-600 hover:text-accent hover:border-accent transition-all shadow-xl hover:shadow-accent/20"
            >
              <MapPin className="w-6 h-6" />
            </button>
            <button className="w-12 h-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-600 hover:text-accent hover:border-accent transition-all shadow-xl hover:shadow-accent/20">
              <TrendingUp className="w-6 h-6" />
            </button>
          </div>
        </main>
      </div>

      {/* MOBILE FAB */}
      <button 
        onClick={() => setIsReportModalOpen(true)}
        className="md:hidden fixed bottom-8 left-1/2 -translate-x-1/2 z-[500] bg-accent text-white font-display font-black px-10 py-5 rounded-full flex items-center gap-3 shadow-2xl shadow-accent/40 active:scale-95 transition-transform"
      >
        <Camera className="w-6 h-6" />
        REPORT GARBAGE
      </button>

      {/* REPORT MODAL */}
      <AnimatePresence>
        {isReportModalOpen && (
          <div className="fixed inset-0 z-[2000] flex items-end md:items-center justify-center p-0 md:p-6 text-slate-900">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsReportModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
            />
            
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 350 }}
              className="relative w-full max-w-[580px] bg-white border-t md:border border-slate-200 rounded-t-[40px] md:rounded-[40px] p-8 md:p-12 shadow-2xl overflow-hidden pointer-events-auto"
            >
               <div className="md:hidden w-16 h-1.5 bg-slate-100 rounded-full mx-auto mb-10" />
               <button 
                 onClick={() => setIsReportModalOpen(false)}
                 className="absolute top-10 right-10 w-12 h-12 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors"
               >
                 <X className="w-6 h-6" />
               </button>

               <div className="mb-10">
                 <h2 className="font-display font-black text-3xl md:text-4xl mb-2.5 flex items-center gap-4 text-slate-900">
                   <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent">📸</div>
                   Kasa Report Karo
                 </h2>
                 <p className="text-sm text-slate-500 font-bold ml-1">🔒 100% Secure & Anonymous · Community Driven</p>
               </div>

               <div className="space-y-5">
                 {/* UPLOAD SECTION */}
                 <div 
                   onClick={() => setUploadState('success')}
                   className={cn(
                    "border-3 border-dashed rounded-[32px] p-12 text-center cursor-pointer transition-all",
                    uploadState === 'success' ? "border-green-500 bg-green-50" : "border-slate-100 bg-slate-50 hover:border-accent hover:bg-accent/5"
                   )}
                 >
                   <div className="flex flex-col items-center gap-4">
                      {uploadState === 'success' ? (
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-2">
                           <CheckCircle2 className="w-10 h-10 text-green-600" />
                        </div>
                      ) : (
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-2">
                           <Camera className="w-8 h-8 text-slate-300 group-hover:text-accent" />
                        </div>
                      )}
                      <div className="font-black text-xl text-slate-800">{uploadState === 'success' ? 'Ready to Submit!' : 'Upload Garbage Photo'}</div>
                      <div className="text-[13px] text-slate-400 font-bold">Max 10MB · Indore region only</div>
                   </div>
                 </div>

                 {/* LOCATION SECTION */}
                 <div className="bg-slate-50 border border-slate-100 rounded-[28px] p-6 flex items-center gap-5">
                    <div className="w-12 h-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-accent shadow-sm">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={cn(
                        "text-[14px] font-bold truncate",
                        locationState === 'success' ? "text-green-600" : "text-slate-400"
                      )}>
                        {locationState === 'success' ? '📍 Ward 12, Vijay Nagar, Indore' : 'Smart Location Detection'}
                      </div>
                    </div>
                    <button 
                      onClick={() => setLocationState('success')}
                      className="bg-accent text-white font-display font-bold text-[12px] px-6 py-3 rounded-2xl hover:shadow-lg transition-all"
                    >
                      Detect
                    </button>
                 </div>

                 {locationState === 'success' && (
                   <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-5 bg-green-50 border border-green-100 rounded-[28px] flex items-center gap-4"
                   >
                     <Award className="w-8 h-8 text-green-600 shrink-0" />
                     <div className="text-[13px] font-bold text-slate-800">
                       <span className="text-green-700">Verified Indore Location</span><br />
                       <span className="text-slate-500 text-[11px] font-medium uppercase tracking-widest">MLA Focus: Ramesh Mendola</span>
                     </div>
                   </motion.div>
                 )}

                 <button 
                  onClick={simulateSubmit}
                  disabled={uploadState === 'idle' || locationState === 'idle' || isSubmitting}
                  className="w-full bg-accent disabled:opacity-30 disabled:grayscale text-white font-display font-black text-xl py-6 rounded-[32px] flex items-center justify-center gap-4 transition-all hover:shadow-2xl hover:shadow-accent/40 active:translate-y-1"
                 >
                   {isSubmitting ? (
                     <>
                      <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                      SUBMITTING...
                     </>
                   ) : (
                     <>
                      🚀 SUBMIT REPORT
                     </>
                   )}
                 </button>

                 <div className="flex items-center justify-center gap-2.5 text-[12px] text-slate-400 font-bold pt-4">
                    <ShieldCheck className="w-5 h-5 text-green-500" />
                    Privacy Encrypted & Identity Hidden
                 </div>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CITY MODAL */}
      <AnimatePresence>
        {isCityModalOpen && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 text-slate-900 pointer-events-none">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCityModalOpen(false)}
              className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm pointer-events-auto" 
            />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-[500px] bg-white border border-slate-200 rounded-[40px] p-10 shadow-3xl pointer-events-auto"
            >
               <button 
                 onClick={() => setIsCityModalOpen(false)}
                 className="absolute top-10 right-10 w-12 h-12 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors"
               >
                 <X className="w-6 h-6" />
               </button>

               <div className="mb-10 text-center">
                 <h2 className="font-display font-black text-3xl mb-2 text-slate-900 uppercase tracking-tighter">Choose City</h2>
                 <p className="text-sm text-slate-500 font-bold">Expanding garbage accountability across MP</p>
               </div>

               <div className="grid grid-cols-1 gap-4">
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
                      "text-left p-6 rounded-[24px] border-2 transition-all relative group h-24 flex items-center",
                      activeCity.id === city.id 
                        ? "bg-slate-50 border-accent shadow-md shadow-accent/5 ring-4 ring-accent/5" 
                        : "bg-white border-slate-100 hover:border-accent hover:bg-slate-50",
                      city.status === 'coming-soon' && "opacity-40 grayscale cursor-not-allowed border-slate-50"
                    )}
                   >
                     <div className="flex-1">
                       <div className="font-display font-black text-lg text-slate-900 group-hover:text-accent transition-colors">{city.name}</div>
                       <div className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">{city.wardsCount} Wards · {city.mlaCount} MLAs</div>
                     </div>
                     
                     {city.reportsCount && (
                       <div className="text-[12px] bg-accent/10 text-accent font-black px-4 py-2 rounded-xl border border-accent/20">
                         {city.reportsCount} REPORTS
                       </div>
                     )}

                     {city.status === 'coming-soon' && (
                       <div className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">COMING SOON</div>
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

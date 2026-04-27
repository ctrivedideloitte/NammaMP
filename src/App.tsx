import { useState, useEffect, useRef } from 'react';
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
  ShieldCheck,
  Info,
  Share2,
  ChevronUp,
  ArrowRight,
  Filter,
  Maximize2
} from 'lucide-react';
import { INITIAL_REPORTS, MLAS, WARDS, CITIES } from './data';
import { Report, Status, Severity } from './types';
import { cn } from './lib/utils';
import 'leaflet/dist/leaflet.css';

// Custom Marker for Severity (Namma Kasa Style)
const createSeverityIcon = (severity: Severity, count: number = 0) => {
  const size = severity === 'high' ? 48 : severity === 'medium' ? 36 : 24;
  const color = severity === 'high' ? '#7f1d1d' : severity === 'medium' ? '#b91c1c' : '#f87171';
  
  return L.divIcon({
    html: `
      <div style="
        width:${size}px; height:${size}px;
        background:${color};
        color:white;
        border-radius:50%;
        display:flex;
        align-items:center;
        justify-content:center;
        font-family:Inter, sans-serif;
        font-weight:800;
        font-size:${size / 3}px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        border: 2px solid white;
      ">
        ${count > 0 ? count : ''}
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size/2, size/2],
    className: 'severity-marker'
  });
};

function MapFlyTo({ coords, zoom = 15 }: { coords: [number, number] | null, zoom?: number }) {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      map.flyTo(coords, zoom, { duration: 1.5 });
    }
  }, [coords, map, zoom]);
  return null;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'reports' | 'leaderboard' | 'wards'>('reports');
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [showInstructions, setShowInstructions] = useState(() => !localStorage.getItem('kasa-onboarded'));
  const [reports, setReports] = useState<Report[]>(() => {
    const saved = localStorage.getItem('mp-kasa-reports');
    return saved ? JSON.parse(saved) : INITIAL_REPORTS;
  });
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [selectedCoords, setSelectedCoords] = useState<[number, number] | null>(null);
  const [activeCity, setActiveCity] = useState(CITIES[0]);
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  
  // Auto-hide instructions
  useEffect(() => {
    if (showInstructions) {
      const timer = setTimeout(() => {
        handleOnboard();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [showInstructions]);

  // Submit Step State
  const [uploadState, setUploadState] = useState<'idle' | 'success'>('idle');
  const [locationState, setLocationState] = useState<'idle' | 'success'>('idle');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Persistence
  useEffect(() => {
    localStorage.setItem('mp-kasa-reports', JSON.stringify(reports));
  }, [reports]);

  const handleReportClick = (report: Report) => {
    setSelectedReport(report);
    setSelectedCoords([report.lat, report.lng]);
    setIsPanelOpen(false); // Close panel to focus on map
  };

  const handleShare = async (report: Report) => {
    const text = `🚨 Garbage at ${report.location}, ${report.ward}. Accountability needed from MLA ${report.mla.name}. Check it on MP Kasa!`;
    const shareData = { title: 'MP Kasa Report', text, url: window.location.href };
    
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        console.error("Share failed", err);
      }
    }
    
    // Fallback: Twitter/X
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleViewMLA = (mlaName: string) => {
    setActiveTab('leaderboard');
    setIsPanelOpen(true);
    setSelectedReport(null);
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

  const handleOnboard = () => {
    localStorage.setItem('kasa-onboarded', 'true');
    setShowInstructions(false);
  };

  const simulateSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsReportModalOpen(false);
      
      const newReport: Report = {
        id: Date.now().toString(),
        lat: 22.7196 + (Math.random() - 0.5) * 0.04,
        lng: 75.8577 + (Math.random() - 0.5) * 0.04,
        status: 'open',
        severity: 'high',
        ward: 'Ward 12 · Vijay Nagar',
        location: 'Newly reported garbage site',
        timestamp: 'Just now',
        mla: MLAS[0]
      };
      
      setReports(prev => [newReport, ...prev]);
      setUploadState('idle');
      setLocationState('idle');
    }, 1500);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-white selection:bg-accent/10 selection:text-accent font-sans">
      
      {/* MAP BACKGROUND */}
      <div className="absolute inset-0 z-0">
        <MapContainer 
          center={[22.7196, 75.8577]} 
          zoom={13} 
          className="w-full h-full"
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />
          {reports.map((report) => (
            <Marker 
              key={report.id} 
              position={[report.lat, report.lng]} 
              icon={createSeverityIcon(report.severity, 1)}
              eventHandlers={{
                click: () => handleReportClick(report)
              }}
            />
          ))}
          <MapFlyTo coords={selectedCoords} />
        </MapContainer>
      </div>

      {/* TOP HEADER - MINI */}
      <header className="absolute top-0 left-0 right-0 z-50 p-4 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto bg-white/90 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-xl shadow-black/5 border border-slate-100">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center text-lg shadow-lg shadow-accent/20">🗑️</div>
          <div className="font-display font-black text-lg tracking-tight">MP <span className="text-accent underline decoration-4 decoration-accent/10">Kasa</span></div>
          <div className="w-px h-4 bg-slate-200 mx-1" />
          <button 
            onClick={() => setIsCityModalOpen(true)}
            className="text-xs font-bold text-slate-500 hover:text-accent transition-colors flex items-center gap-1.5"
          >
            {activeCity.name} <ChevronDown className="w-3 h-3" />
          </button>
        </div>

        <div className="flex gap-2 pointer-events-auto">
          <button 
            onClick={() => setIsPanelOpen(true)}
            className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-xl border border-slate-100 text-slate-600 hover:text-accent"
          >
            <LayoutList className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* FLOATING ACTION PILLS */}
      <div className="absolute top-20 left-4 z-50 flex flex-col gap-2 pointer-events-none">
         <div className="bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-slate-100 flex flex-col items-center gap-1 pointer-events-auto">
            <span className="text-[18px] font-black text-accent">{reports.length}</span>
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Reports</span>
         </div>
         <button 
            onClick={() => { setIsPanelOpen(true); setActiveTab('leaderboard'); }}
            className="bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-slate-100 flex flex-col items-center gap-1 pointer-events-auto hover:text-accent transition-colors"
         >
            <Trophy className="w-5 h-5" />
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Ranking</span>
         </button>
      </div>

      {/* BOTTOM FLOATING CONTROLS */}
      <div className="absolute bottom-32 right-4 z-40 flex flex-col gap-3">
        <button 
          onClick={handleLocateMe}
          className="w-12 h-12 bg-white rounded-2xl shadow-2xl border border-slate-100 flex items-center justify-center text-slate-600 hover:text-accent transition-all active:scale-95"
        >
          <MapPin className="w-5 h-5" />
        </button>
      </div>

      {/* THE PRIMARY ACTION: REPORT BUTTON */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50">
        <button 
          onClick={() => setIsReportModalOpen(true)}
          className="bg-accent text-white font-display font-black px-10 py-5 rounded-full shadow-2xl shadow-accent/40 flex items-center gap-3 hover:-translate-y-1 active:translate-y-0 transition-all border-4 border-white whitespace-nowrap"
        >
          <Camera className="w-6 h-6" />
          REPORT GARBAGE
        </button>
      </div>

      {/* DATA SIDE PANEL (SLIDING) */}
      <AnimatePresence>
        {isPanelOpen && (
          <div className="fixed inset-0 z-[1000] flex justify-end">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setIsPanelOpen(false)}
               className="absolute inset-0 bg-slate-900/10 backdrop-blur-sm"
             />
             <motion.div
               initial={{ x: "100%" }}
               animate={{ x: 0 }}
               exit={{ x: "100%" }}
               transition={{ type: "spring", damping: 30, stiffness: 300 }}
               className="relative w-full max-w-md bg-white shadow-3xl h-full flex flex-col overflow-hidden"
             >
                <div className="flex px-4 border-b border-slate-100 shrink-0">
                  {[
                    { id: 'reports', label: 'Reports', icon: Clock },
                    { id: 'leaderboard', label: 'MLA', icon: Trophy },
                    { id: 'wards', label: 'Wards', icon: LayoutList },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setActiveTab(t.id as any)}
                      className={cn(
                        "flex-1 py-6 text-[11px] font-black transition-all border-b-4 flex items-center justify-center gap-2",
                        activeTab === t.id 
                          ? "text-accent border-accent" 
                          : "text-slate-400 border-transparent hover:text-slate-600"
                      )}
                    >
                      <t.icon className="w-4 h-4" />
                      {t.label.toUpperCase()}
                    </button>
                  ))}
                  <button onClick={() => setIsPanelOpen(false)} className="px-6 border-l border-slate-100 hover:bg-slate-50 transition-colors">
                     <X className="w-6 h-6 text-slate-400" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30 hide-scrollbar">
                   {activeTab === 'reports' && (
                     <div className="space-y-4">
                        {reports.map(report => (
                          <div 
                            key={report.id}
                            onClick={() => handleReportClick(report)}
                            className="bg-white border border-slate-100 p-5 rounded-3xl hover:border-accent hover:shadow-xl transition-all cursor-pointer flex gap-4"
                          >
                             <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center shrink-0 border border-slate-100">
                                <Camera className="w-5 h-5 text-slate-200" />
                             </div>
                             <div className="min-w-0 flex-1">
                                <div className="text-[14px] font-black leading-tight mb-1 truncate">{report.location}</div>
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{report.ward}</div>
                             </div>
                          </div>
                        ))}
                     </div>
                   )}

                   {activeTab === 'leaderboard' && (
                     <div className="space-y-3">
                        {MLAS.sort((a,b) => b.reportCount - a.reportCount).map((mla, idx) => (
                           <div key={mla.id} className="bg-white border border-slate-100 p-5 rounded-3xl flex items-center gap-5 shadow-sm">
                              <div className="font-display font-black text-2xl text-slate-200 w-8 text-center">{idx + 1}</div>
                              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center font-black text-accent border border-slate-100">
                                 {mla.avatar}
                              </div>
                              <div className="flex-1 min-w-0">
                                 <div className="text-[15px] font-black text-slate-900 truncate">{mla.name}</div>
                                 <div className="text-[11px] text-slate-500 font-bold truncate">{mla.ward}</div>
                              </div>
                              <div className="text-right">
                                 <div className="text-xl font-black text-accent">{mla.reportCount}</div>
                                 <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Reports</div>
                              </div>
                           </div>
                        ))}
                     </div>
                   )}

                   {activeTab === 'wards' && (
                     <div className="grid grid-cols-2 gap-3">
                        {WARDS.map(ward => (
                           <div key={ward.id} className="bg-white border border-slate-100 p-5 rounded-3xl text-center">
                              <div className="text-xl font-black mb-1">Ward {ward.number}</div>
                              <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 truncate leading-none">{ward.name}</div>
                              <div className="text-[10px] bg-accent/5 text-accent font-black py-1 rounded-xl">
                                 {ward.openReports} ACTIVE
                              </div>
                           </div>
                        ))}
                     </div>
                   )}
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* REPORT DETAIL PANEL OVERLAY (FIXED ON TOP OF MAP) */}
      <AnimatePresence>
        {selectedReport && (
          <div className="fixed inset-0 z-[1500] pointer-events-none flex items-center justify-center md:items-start md:justify-end md:p-10 p-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setSelectedReport(null)}
               className="absolute inset-0 bg-slate-900/10 backdrop-blur-sm pointer-events-auto"
             />
             <motion.div
               initial={{ scale: 0.9, y: 20, opacity: 0 }}
               animate={{ scale: 1, y: 0, opacity: 1 }}
               exit={{ scale: 0.9, y: 20, opacity: 0 }}
               className="relative w-full max-w-[400px] bg-white rounded-[40px] shadow-3xl overflow-hidden pointer-events-auto border border-slate-100 flex flex-col"
             >
                <div className="h-48 bg-slate-50 flex items-center justify-center relative">
                   <Camera className="w-12 h-12 text-slate-200" />
                   <button 
                     onClick={() => setSelectedReport(null)}
                     className="absolute top-6 right-6 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg text-slate-400"
                   >
                     <X className="w-5 h-5" />
                   </button>
                   <div className="absolute top-6 left-6">
                      <div className={cn(
                        "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                        selectedReport.status === 'resolved' ? "bg-green-100 text-green-700" : "bg-accent text-white"
                      )}>
                        {selectedReport.status}
                      </div>
                   </div>
                </div>

                <div className="p-8">
                   <div className="mb-6">
                      <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">{selectedReport.ward}</div>
                      <h3 className="text-xl font-black text-slate-900">{selectedReport.location}</h3>
                   </div>

                   <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 mb-8 flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center font-black text-accent shadow-sm">{selectedReport.mla.avatar}</div>
                      <div className="flex-1">
                         <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Responsibility</div>
                         <div className="text-[15px] font-black">{selectedReport.mla.name}</div>
                      </div>
                   </div>

                   <div className="flex gap-3">
                      <button 
                        onClick={() => handleShare(selectedReport)}
                        className="flex-1 bg-slate-900 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-800 transition-all text-xs uppercase"
                      >
                         <Share2 className="w-4 h-4" />
                         SPREAD WORD
                      </button>
                      <button 
                        onClick={() => handleViewMLA(selectedReport.mla.name)}
                        className="flex-1 bg-white border-2 border-slate-900 text-slate-900 font-black py-4 rounded-2xl flex items-center justify-center hover:bg-slate-50 transition-all text-xs uppercase"
                      >
                         VIEW MLAS
                      </button>
                   </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* TEMPORARY INSTRUCTION OVERLAY (ON TOP OF MAP) */}
      <AnimatePresence>
        {showInstructions && (
          <div className="absolute inset-0 z-[2000] flex items-center justify-center p-6 pointer-events-none">
             <motion.div
               initial={{ y: -20, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               exit={{ y: 20, opacity: 0 }}
               className="bg-white/95 backdrop-blur-md rounded-[32px] p-8 max-w-sm w-full text-center shadow-3xl border border-slate-100 pointer-events-auto"
             >
                <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6 shadow-xl shadow-accent/20 text-white">
                  📸
                </div>
                <h3 className="font-display font-black text-2xl mb-3 uppercase tracking-tighter italic">Kasa Mapping Active</h3>
                <p className="text-sm text-slate-500 font-bold mb-6">
                   Report garbage sites, identify location, and tag your MLA for accountability. 
                </p>
                <button 
                  onClick={handleOnboard}
                  className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl text-sm"
                >
                   GOT IT
                </button>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* REPORT MODAL */}
      <AnimatePresence>
        {isReportModalOpen && (
          <div className="fixed inset-0 z-[2000] flex items-end md:items-center justify-center p-0 md:p-6 text-slate-900">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsReportModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" 
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
                   onClick={() => fileInputRef.current?.click()}
                   className={cn(
                    "border-3 border-dashed rounded-[32px] p-12 text-center cursor-pointer transition-all",
                    uploadState === 'success' ? "border-green-500 bg-green-50" : "border-slate-100 bg-slate-50 hover:border-accent hover:bg-accent/5 focus:ring-4 focus:ring-accent/10"
                   )}
                 >
                   <input 
                     type="file" 
                     accept="image/*" 
                     capture="environment" 
                     className="hidden" 
                     ref={fileInputRef}
                     onChange={() => setUploadState('success')}
                   />
                   <div className="flex flex-col items-center gap-4">
                      {uploadState === 'success' ? (
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-2">
                           <CheckCircle2 className="w-10 h-10 text-green-600" />
                        </div>
                      ) : (
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-2">
                           <Camera className="w-8 h-8 text-slate-300" />
                        </div>
                      )}
                      <div className="font-black text-xl text-slate-800">{uploadState === 'success' ? 'Ready to Submit!' : 'Click to Take Photo'}</div>
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

      {/* CITY MODAL (RESTORED) */}
      <AnimatePresence>
        {isCityModalOpen && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 text-slate-900">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCityModalOpen(false)}
              className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm shadow-inner" 
            />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-[500px] bg-white border border-slate-200 rounded-[40px] p-10 shadow-3xl"
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

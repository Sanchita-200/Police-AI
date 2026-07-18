import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Brain,
  Video,
  BarChart3,
  Car,
  Fingerprint,
  ScanFace,
  Network as NetworkIcon,
  Mic,
  FileText,
  TrendingUp,
  MapPin,
  Folder,
  Share2,
  User,
  Lock,
  Eye,
  EyeOff,
  ChevronRight,
  ShieldCheck,
  Activity,
} from "lucide-react";

export function Login() {
  const navigate = useNavigate();
  const [badgeId, setBadgeId] = useState("KSP-IO-7740");
  const [passcode, setPasscode] = useState("admin123");
  const [division, setDivision] = useState("Bengaluru City");
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!badgeId.trim() || !passcode.trim()) return;

    setIsAuthenticating(true);
    // Simulate biometric check / token negotiation
    setTimeout(() => {
      setIsAuthenticating(false);
      navigate("/dashboard");
    }, 1500);
  }, [badgeId, passcode, navigate]);

  // System Core Modules for left-pane showcase
  const capabilities = [
    { icon: Brain, title: "Investigative AI", desc: "Modus Operandi & relation mapping" },
    { icon: Video, title: "CCTV Analytics", desc: "Real-time keyframe face recognition" },
    { icon: NetworkIcon, title: "Link Explorer", desc: "Entity-relationship network mapping" },
    { icon: Fingerprint, title: "Biometric Portal", desc: "National fingerprint CCTNS registry" },
    { icon: ScanFace, title: "Face Recognition", desc: "Optical suspect identification" },
    { icon: Mic, title: "Voice Translator", desc: "Speech-to-text narrative transcription" },
    { icon: MapPin, title: "GIS Hotspot Mapping", desc: "DBSCAN spatial density clusters" },
    { icon: FileText, title: "Auto-Dossier Gen", desc: "Printable legal legal PDF compiler" },
    { icon: BarChart3, title: "Tactical Analytics", desc: "Interactive intelligence visualizations" },
    { icon: Car, title: "ANPR Vehicle Tracker", desc: "Optical plate recognition & tracking" },
    { icon: TrendingUp, title: "Crime Forecasting", desc: "Predictive temporal density algorithms" },
    { icon: Folder, title: "Case Vault", desc: "Digital evidence locker management" },
    { icon: Share2, title: "Inter-Agency Hub", desc: "Secure national CCTNS data share" }
  ];

  return (
    <div 
      className="relative w-full min-h-screen bg-black overflow-hidden flex items-center justify-center p-4 font-mono select-none"
      style={{
        backgroundImage: "radial-gradient(circle at center, rgba(15, 23, 42, 0.4) 0%, rgba(2, 6, 23, 0.95) 100%), url('/earthBg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Volumetric Neon Glow Overlays */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Grid Pattern Layer */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Panel: Capabilities Showcase (Col Span 7) */}
        <div className="lg:col-span-7 space-y-6 hidden lg:block">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400">
              <ShieldCheck className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-[10px] tracking-[0.3em] text-cyan-400/60 uppercase font-bold">State Crime Records</h2>
              <h1 className="text-2xl font-black text-white tracking-tight">KSP STRATOS INTELLIGENCE</h1>
            </div>
          </div>

          <p className="text-xs text-slate-400 max-w-lg leading-relaxed">
            Authorized police division node. Access requires verified credentials and biometric alignment. Active tracking and CCTNS audit trails are enabled on this console.
          </p>

          {/* Capabilities Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {capabilities.map((cap, idx) => {
              const Icon = cap.icon;
              return (
                <div 
                  key={idx}
                  className="p-2.5 rounded-xl border border-white/5 bg-navy-950/20 backdrop-blur-md flex items-center gap-3 hover:border-cyan-400/20 hover:bg-navy-950/40 transition-all duration-300 group cursor-pointer"
                >
                  <div className="h-7 w-7 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-cyan-400 group-hover:border-cyan-400/30 transition-all duration-300">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-[11px] font-bold text-white font-mono leading-tight">{cap.title}</h3>
                    <p className="text-[9px] text-slate-500 font-mono leading-none mt-0.5">{cap.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Logs Ticker */}
          <div className="p-3.5 rounded-xl border border-white/5 bg-black/40 backdrop-blur-md flex items-center justify-between font-mono text-[9px] text-slate-500">
            <div className="flex items-center gap-2">
              <Activity className="h-3 w-3 text-cyan-400 animate-pulse" />
              <span>Division Cluster Node Status: <span className="text-emerald-400 font-bold">SECURE_LINK</span></span>
            </div>
            <span className="text-slate-600">IP: 10.124.9.41</span>
          </div>
        </div>

        {/* Right Panel: Login Credentials Card (Col Span 5) */}
        <div className="lg:col-span-5 w-full flex justify-center">
          <div 
            className="w-full max-w-md rounded-3xl border border-white/10 bg-gradient-to-b from-slate-900/80 to-slate-950/95 p-8 backdrop-blur-2xl space-y-6 relative overflow-hidden"
            style={{
              boxShadow: "inset 0 1px 1px rgba(255, 255, 255, 0.05), 0 20px 50px rgba(0, 0, 0, 0.8)"
            }}
          >
            {/* Ambient inner glow */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-400/10 rounded-full blur-2xl pointer-events-none" />

            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-400/10 border border-cyan-400/25">
                <span className="flex h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-[8px] font-bold text-cyan-400 uppercase tracking-widest">Operator Authentication</span>
              </div>
              <h3 className="text-lg font-bold text-white uppercase tracking-wider">Initialize Access</h3>
              <p className="text-[10px] text-slate-500 font-mono">Credentials mapped to state registry database</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              {/* Badge ID Input */}
              <div className="space-y-1.5">
                <label className="block text-slate-400 uppercase font-bold text-[9px] tracking-wider ml-1">Badge Reference</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={badgeId}
                    onChange={(e) => setBadgeId(e.target.value)}
                    placeholder="KSP-IO-XXXX"
                    className="w-full bg-black/60 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-slate-200 placeholder-slate-700 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/20 transition-all font-mono"
                  />
                </div>
              </div>

              {/* Passcode Input */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center px-1">
                  <label className="block text-slate-400 uppercase font-bold text-[9px] tracking-wider">Clearance Password</label>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-black/60 border border-white/10 rounded-xl py-3 pl-10 pr-10 text-slate-200 placeholder-slate-700 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/20 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    className="absolute right-3.5 top-3 text-slate-500 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Assigned Division Dropdown */}
              <div className="space-y-1.5">
                <label className="block text-slate-400 uppercase font-bold text-[9px] tracking-wider ml-1">Assigned Division</label>
                <select
                  value={division}
                  onChange={(e) => setDivision(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 text-slate-300 rounded-xl px-3.5 py-3 outline-none focus:border-cyan-400 cursor-pointer font-mono"
                >
                  <option value="Bengaluru City">Bengaluru City Division</option>
                  <option value="Mysuru City">Mysuru City Unit</option>
                  <option value="Hubballi-Dharwad">Hubballi-Dharwad Unit</option>
                </select>
              </div>

              {/* Submit Action */}
              <button
                type="submit"
                disabled={isAuthenticating}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold uppercase tracking-[0.2em] text-xs transition-all duration-300 hover:shadow-[0_0_20px_rgba(6,182,212,0.35)] disabled:opacity-50 mt-5 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isAuthenticating ? (
                  <>
                    <Activity className="h-4 w-4 animate-spin text-white" />
                    Negotiating Token...
                  </>
                ) : (
                  <>
                    Verify & Connect
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <div className="text-center pt-2 font-mono text-[9px] text-slate-600">
              Need assistance? contact division commander
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

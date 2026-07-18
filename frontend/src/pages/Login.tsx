import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Shield, Lock, Eye, EyeOff, Palette, Maximize, Zap, 
  RefreshCw, KeyRound, Cpu, Fingerprint 
} from "lucide-react";
import { ForceFieldBackground } from "../components/ui/ForceFieldBackground";

// Check if coordinates fall inside landmass ellipses [0, 1]
function isLand(x: number, y: number) {
  if (x < 0 || x > 1 || y < 0 || y > 1) return false;
  if (Math.pow((x - 0.20) / 0.13, 2) + Math.pow((y - 0.32) / 0.15, 2) < 1) return true;
  if (Math.pow((x - 0.35) / 0.05, 2) + Math.pow((y - 0.14) / 0.08, 2) < 1) return true;
  if (Math.pow((x - 0.31) / 0.06, 2) + Math.pow((y - 0.68) / 0.18, 2) < 1) {
    const taper = (0.86 - y) / 0.18;
    return Math.abs(x - 0.31) < 0.06 * taper;
  }
  if (Math.pow((x - 0.52) / 0.08, 2) + Math.pow((y - 0.58) / 0.17, 2) < 1) {
    const taper = (0.75 - y) / 0.17;
    return y < 0.48 || Math.abs(x - 0.52) < 0.08 * taper;
  }
  if (Math.pow((x - 0.50) / 0.07, 2) + Math.pow((y - 0.28) / 0.09, 2) < 1) return true;
  if (Math.pow((x - 0.72) / 0.18, 2) + Math.pow((y - 0.28) / 0.14, 2) < 1) return true;
  if (Math.pow((x - 0.67) / 0.04, 2) + Math.pow((y - 0.51) / 0.07, 2) < 1) {
    const taper = (0.58 - y) / 0.07;
    return Math.abs(x - 0.67) < 0.04 * taper;
  }
  if (Math.pow((x - 0.83) / 0.06, 2) + Math.pow((y - 0.74) / 0.08, 2) < 1) return true;
  if (Math.pow((x - 0.86) / 0.02, 2) + Math.pow((y - 0.32) / 0.05, 2) < 1) return true;
  if (Math.pow((x - 0.78) / 0.05, 2) + Math.pow((y - 0.58) / 0.05, 2) < 1) return true;
  return false;
}

// Crimson-to-Purple-to-Blue direct RGB interpolation
function getOmbreColor(xRatio: number, alpha: number) {
  const r = Math.round(139 + (0 - 139) * xRatio);
  const g = Math.round(0 + (200 - 0) * xRatio);
  const b = Math.round(0 + (255 - 0) * xRatio);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

interface IntelLabel {
  text: string;
  xRatio: number;
  yRatio: number;
  phase: number;
}

export function Login() {
  const navigate = useNavigate();
  const [badgeId, setBadgeId] = useState("KSP-IO-7740");
  const [passcode, setPasscode] = useState("admin123");
  const [district, setDistrict] = useState("Bengaluru City");
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Cinematic fade-in delayed state for the login card tablet (3.5s delay)
  const [showTablet, setShowTablet] = useState(false);

  // Interactive location pin state (left-click places, right-click clears)
  const [activePin, setActivePin] = useState<{ x: number; y: number } | null>(null);

  const [params, setParams] = useState({
    hue: 200,
    saturation: 100,
    spacing: 15,
    forceStrength: 15,
    magnifierRadius: 180
  });

  const backgroundCanvasRef = useRef<HTMLCanvasElement>(null);
  const foregroundCanvasRef = useRef<HTMLCanvasElement>(null);
  const cardCanvasRef = useRef<HTMLCanvasElement>(null);
  const activePinRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    activePinRef.current = activePin;
  }, [activePin]);

  // Handle cinematic delay timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTablet(true);
    }, 3500);
    return () => clearTimeout(timer);
  }, []);

  // High-performance single-thread dual-canvas render loop
  useEffect(() => {
    const bgCanvas = backgroundCanvasRef.current;
    const fgCanvas = foregroundCanvasRef.current;
    if (!bgCanvas || !fgCanvas) return;

    const bgCtx = bgCanvas.getContext("2d");
    const fgCtx = fgCanvas.getContext("2d");
    if (!bgCtx || !fgCtx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    bgCanvas.width = width;
    bgCanvas.height = height;
    fgCanvas.width = width;
    fgCanvas.height = height;

    // Load detailed high-tech world map background image
    const mapImg = new Image();
    mapImg.src = "/cyber_world_map.png";
    let mapImgLoaded = false;
    mapImg.onload = () => {
      mapImgLoaded = true;
    };

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      bgCanvas.width = width;
      bgCanvas.height = height;
      fgCanvas.width = width;
      fgCanvas.height = height;
      initMapPoints();
    };
    window.addEventListener("resize", handleResize);

    let mapPoints: { x: number; y: number; ox: number; oy: number; isHub: boolean }[] = [];
    let labels: IntelLabel[] = [];

    const initMapPoints = () => {
      mapPoints = [];
      labels = [];

      const mapWidth = width * 0.88;
      const mapHeight = height * 0.72;
      const mapLeft = (width - mapWidth) / 2;
      const mapTop = (height - mapHeight) / 2;

      const mapSpacing = 11;
      for (let y = mapTop; y < mapTop + mapHeight; y += mapSpacing) {
        for (let x = mapLeft; x < mapLeft + mapWidth; x += mapSpacing) {
          const xNorm = (x - mapLeft) / mapWidth;
          const yNorm = (y - mapTop) / mapHeight;
          if (isLand(xNorm, yNorm)) {
            const isHub = Math.random() < 0.015;
            mapPoints.push({ x, y, ox: x, oy: y, isHub });
          }
        }
      }

      const textPool = [
        "NODE 04 // SYS_OK", "SAT LINK // ONLINE", "ENC // AES-256", 
        "TRACKING TARGET // LOCKED", "KSP DB // SECURE_LINK", 
        "DIV // CENTRAL_HUB", "AUTH // STRATOS_v9", "SIGNAL // SECURE"
      ];
      textPool.forEach((txt) => {
        labels.push({
          text: txt,
          xRatio: 0.1 + Math.random() * 0.8,
          yRatio: 0.1 + Math.random() * 0.8,
          phase: Math.random() * Math.PI * 2
        });
      });
    };

    initMapPoints();

    // Mouse Tracking target glide
    let targetMouseX = width / 2;
    let targetMouseY = height / 2;
    let currentMouseX = width / 2;
    let currentMouseY = height / 2;

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    const trail: { x: number; y: number }[] = [];
    const maxTrailPoints = 18;

    let time = 0;
    let animationId: number;

    const draw = () => {
      time += 0.003;

      // Smooth cursor glide tracking
      currentMouseX += (targetMouseX - currentMouseX) * 0.20;
      currentMouseY += (targetMouseY - currentMouseY) * 0.20;

      const parallaxX = (currentMouseX - width / 2) * 0.04;
      const parallaxY = (currentMouseY - height / 2) * 0.04;

      // ----------------------------------------------------
      // DRAW BACKGROUND CANVAS (z-0 behind particles & card)
      // ----------------------------------------------------
      bgCtx.clearRect(0, 0, width, height);
      bgCtx.fillStyle = "#000000";
      bgCtx.fillRect(0, 0, width, height);

      // Crimson far-left volumetric glow
      const crimsonGlow = bgCtx.createRadialGradient(0, height * 0.5, 0, 0, height * 0.5, width * 0.65);
      crimsonGlow.addColorStop(0, "rgba(139, 0, 0, 0.45)");
      crimsonGlow.addColorStop(0.5, "rgba(139, 0, 0, 0.12)");
      crimsonGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
      bgCtx.fillStyle = crimsonGlow;
      bgCtx.fillRect(0, 0, width, height);

      // Blue far-right volumetric glow
      const blueGlow = bgCtx.createRadialGradient(width, height * 0.5, 0, width, height * 0.5, width * 0.65);
      blueGlow.addColorStop(0, "rgba(0, 102, 255, 0.45)");
      blueGlow.addColorStop(0.5, "rgba(0, 200, 255, 0.12)");
      blueGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
      bgCtx.fillStyle = blueGlow;
      bgCtx.fillRect(0, 0, width, height);

      // White ambient center
      const centerGlow = bgCtx.createRadialGradient(width * 0.5, height * 0.5, 0, width * 0.5, height * 0.5, 380);
      centerGlow.addColorStop(0, "rgba(255, 255, 255, 0.055)");
      centerGlow.addColorStop(0.6, "rgba(0, 217, 255, 0.015)");
      centerGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
      bgCtx.fillStyle = centerGlow;
      bgCtx.fillRect(0, 0, width, height);

      // Tech Grid
      bgCtx.strokeStyle = "rgba(0, 217, 255, 0.02)";
      bgCtx.lineWidth = 1;
      const stepGrid = 50;
      bgCtx.beginPath();
      for (let x = 0; x < width; x += stepGrid) {
        bgCtx.moveTo(x, 0);
        bgCtx.lineTo(x, height);
      }
      for (let y = 0; y < height; y += stepGrid) {
        bgCtx.moveTo(0, y);
        bgCtx.lineTo(width, y);
      }
      bgCtx.stroke();

      // Spinning 3D Orthographic Globe Grid (Geography Coordinate Map Effect)
      bgCtx.save();
      bgCtx.translate(width * 0.5 + parallaxX, height * 0.5 + parallaxY);
      bgCtx.lineWidth = 0.8;
      const globeRadius = Math.min(width, height) * 0.42;

      // Outer boundary sphere line
      bgCtx.strokeStyle = "rgba(0, 217, 255, 0.035)";
      bgCtx.beginPath();
      bgCtx.arc(0, 0, globeRadius, 0, Math.PI * 2);
      bgCtx.stroke();

      // Latitude lines
      for (let i = -4; i <= 4; i++) {
        const lat = i * 20;
        const r = globeRadius * Math.cos(lat * Math.PI / 180);
        const y = globeRadius * Math.sin(lat * Math.PI / 180);
        bgCtx.strokeStyle = "rgba(0, 217, 255, 0.018)";
        bgCtx.beginPath();
        bgCtx.ellipse(0, y, r, r * 0.18, 0, 0, Math.PI * 2);
        bgCtx.stroke();
      }

      // Spinning longitude lines
      const rotation = time * 0.15;
      for (let i = 0; i < 12; i++) {
        const lonAngle = (i * 30 * Math.PI / 180) + rotation;
        const rx = globeRadius * Math.cos(lonAngle);
        const isFront = Math.sin(lonAngle) > 0;
        
        bgCtx.strokeStyle = isFront 
          ? "rgba(0, 217, 255, 0.035)" 
          : "rgba(0, 217, 255, 0.008)";
          
        bgCtx.beginPath();
        bgCtx.ellipse(0, 0, Math.abs(rx), globeRadius, 0, 0, Math.PI * 2);
        bgCtx.stroke();
      }
      bgCtx.restore();

      // High-resolution digital world map background image
      const mapOffsetX = Math.sin(time * 0.5) * 1.5 + parallaxX;
      const mapOffsetY = Math.cos(time * 0.6) * 1.5 + parallaxY;
      if (mapImgLoaded) {
        bgCtx.save();
        bgCtx.globalAlpha = 0.07;
        const scale = Math.min((width * 0.9) / mapImg.width, (height * 0.9) / mapImg.height);
        const drawW = mapImg.width * scale;
        const drawH = mapImg.height * scale;
        const drawX = (width - drawW) / 2 + mapOffsetX;
        const drawY = (height - drawH) / 2 + mapOffsetY;
        bgCtx.drawImage(mapImg, drawX, drawY, drawW, drawH);
        bgCtx.restore();
      }

      // Globe Parallax Dotted Map Overlay (Pulsating sine-wave scale & opacity)
      for (const pt of mapPoints) {
        const x = pt.x + mapOffsetX;
        const y = pt.y + mapOffsetY;
        const xRatio = x / width;

        if (pt.isHub) {
          const pulse = 1.0 + Math.sin(time * 8 + pt.x) * 0.25;
          bgCtx.fillStyle = getOmbreColor(xRatio, 0.70);
          bgCtx.beginPath();
          bgCtx.arc(x, y, 2.2 * pulse, 0, Math.PI * 2);
          bgCtx.fill();
        } else {
          // Dynamic sine-wave pulse scaling & opacity for strobe scan effect
          const pulseVal = 0.5 + 0.5 * Math.sin(time * 6 + pt.x * 0.012 + pt.y * 0.008);
          const dynamicOpacity = 0.04 + 0.12 * pulseVal;
          const dynamicScale = 0.8 + pulseVal * 0.6;

          bgCtx.fillStyle = getOmbreColor(xRatio, dynamicOpacity);
          bgCtx.beginPath();
          bgCtx.arc(x, y, 1.1 * dynamicScale, 0, Math.PI * 2);
          bgCtx.fill();
        }
      }

      // HUD corner indicators
      bgCtx.strokeStyle = "rgba(0, 217, 255, 0.035)";
      bgCtx.lineWidth = 1;
      const margin = 20;
      const brLen = 15;
      bgCtx.beginPath();
      bgCtx.moveTo(margin, margin + brLen); bgCtx.lineTo(margin, margin); bgCtx.lineTo(margin + brLen, margin);
      bgCtx.moveTo(width - margin - brLen, margin); bgCtx.lineTo(width - margin, margin); bgCtx.lineTo(width - margin, margin + brLen);
      bgCtx.moveTo(margin, height - margin - brLen); bgCtx.lineTo(margin, height - margin); bgCtx.lineTo(margin + brLen, height - margin);
      bgCtx.moveTo(width - margin - brLen, height - margin); bgCtx.lineTo(width - margin, height - margin); bgCtx.lineTo(width - margin, height - margin - brLen);
      bgCtx.stroke();

      bgCtx.fillStyle = "rgba(0, 217, 255, 0.05)";
      bgCtx.font = "8px monospace";
      bgCtx.fillText("LOC: 12.9716 N / 77.5946 E", margin + 5, height - margin - 5);
      bgCtx.fillText("GRID MODE: SURVEILLANCE_ACTIVE", width - margin - 160, height - margin - 5);

      // Floating labels
      for (const lbl of labels) {
        lbl.phase += 0.01;
        const lx = lbl.xRatio * width + Math.sin(lbl.phase) * 6;
        const ly = lbl.yRatio * height + Math.cos(lbl.phase * 0.8) * 6;
        bgCtx.fillStyle = getOmbreColor(lx / width, 0.08);
        bgCtx.font = "7px monospace";
        bgCtx.fillText(lbl.text, lx, ly);
      }

      // Vignette framing shading
      const vignette = bgCtx.createRadialGradient(width / 2, height / 2, width * 0.35, width / 2, height / 2, width * 0.72);
      vignette.addColorStop(0, "rgba(0, 0, 0, 0)");
      vignette.addColorStop(0.6, "rgba(0, 0, 0, 0.45)");
      vignette.addColorStop(1, "rgba(0, 0, 0, 0.95)");
      bgCtx.fillStyle = vignette;
      bgCtx.fillRect(0, 0, width, height);

      // ----------------------------------------------------
      // DRAW FOREGROUND CANVAS (z-2 on top of particles & card)
      // ----------------------------------------------------
      fgCtx.clearRect(0, 0, width, height);

      // Sweeping Laser Beams
      const redScanX = ((time * 70) % (width * 2.0)) - width * 0.5;
      const blueScanX = width - (((time * 60) % (width * 2.0)) - width * 0.5);

      if (redScanX > 0 && redScanX < width) {
        const scanGrad = fgCtx.createLinearGradient(redScanX - 40, 0, redScanX + 10, 0);
        scanGrad.addColorStop(0, "rgba(0,0,0,0)");
        scanGrad.addColorStop(0.8, "rgba(211, 47, 47, 0.028)");
        scanGrad.addColorStop(1, "rgba(255,255,255,0.015)");
        fgCtx.fillStyle = scanGrad;
        fgCtx.fillRect(redScanX - 40, 0, 50, height);
      }

      if (blueScanX > 0 && blueScanX < width) {
        const scanGrad = fgCtx.createLinearGradient(blueScanX, 0, blueScanX + 40, 0);
        scanGrad.addColorStop(0, "rgba(255,255,255,0.015)");
        scanGrad.addColorStop(0.2, "rgba(0, 200, 255, 0.028)");
        scanGrad.addColorStop(1, "rgba(0,0,0,0)");
        fgCtx.fillStyle = scanGrad;
        fgCtx.fillRect(blueScanX, 0, 40, height);
      }

      // Render interactive location tracking pin
      const pin = activePinRef.current;
      if (pin) {
        const xRatio = pin.x / width;
        const color = getOmbreColor(xRatio, 0.9);
        const faintColor = getOmbreColor(xRatio, 0.35);

        fgCtx.save();
        fgCtx.shadowColor = color;
        fgCtx.shadowBlur = 12;

        // Vertical glowing pointer stem
        fgCtx.strokeStyle = color;
        fgCtx.lineWidth = 1.8;
        fgCtx.beginPath();
        fgCtx.moveTo(pin.x, pin.y);
        fgCtx.lineTo(pin.x, pin.y - 25);
        fgCtx.stroke();

        // Pulsating neon core ring
        const ringPulse = 6 + Math.sin(time * 12) * 2.2;
        fgCtx.strokeStyle = color;
        fgCtx.lineWidth = 1.5;
        fgCtx.beginPath();
        fgCtx.arc(pin.x, pin.y, ringPulse, 0, Math.PI * 2);
        fgCtx.stroke();

        // Outer ripple ring
        fgCtx.strokeStyle = faintColor;
        fgCtx.lineWidth = 1;
        fgCtx.beginPath();
        fgCtx.arc(pin.x, pin.y, ringPulse * 2.2, 0, Math.PI * 2);
        fgCtx.stroke();

        // Pinhead core dot
        fgCtx.fillStyle = "#ffffff";
        fgCtx.beginPath();
        fgCtx.arc(pin.x, pin.y, 2, 0, Math.PI * 2);
        fgCtx.fill();

        fgCtx.restore();
      }

      // Trail
      trail.push({ x: currentMouseX, y: currentMouseY });
      if (trail.length > maxTrailPoints) {
        trail.shift();
      }

      for (let i = 0; i < trail.length; i++) {
        const pt = trail[i];
        const ratio = i / (trail.length - 1 || 1);
        const size = params.magnifierRadius * (0.35 + ratio * 0.65);
        const opacity = 0.16 * ratio;

        const trailGrad = fgCtx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, size);
        trailGrad.addColorStop(0, `rgba(0, 217, 255, ${opacity})`);
        trailGrad.addColorStop(0.4, `rgba(0, 217, 255, ${opacity * 0.3})`);
        trailGrad.addColorStop(1, "rgba(0, 217, 255, 0)");

        fgCtx.fillStyle = trailGrad;
        fgCtx.beginPath();
        fgCtx.arc(pt.x, pt.y, size, 0, Math.PI * 2);
        fgCtx.fill();
      }

      // Draw custom pointer arrow cursor
      fgCtx.save();
      fgCtx.translate(currentMouseX, currentMouseY);
      fgCtx.rotate(-Math.PI / 10);

      const bloomGrad = fgCtx.createRadialGradient(0, 0, 0, 0, 0, 16);
      bloomGrad.addColorStop(0, "rgba(0, 102, 255, 0.45)");
      bloomGrad.addColorStop(1, "rgba(0, 102, 255, 0)");
      fgCtx.fillStyle = bloomGrad;
      fgCtx.beginPath();
      fgCtx.arc(0, 0, 16, 0, Math.PI * 2);
      fgCtx.fill();

      fgCtx.shadowColor = "rgba(0, 217, 255, 0.9)";
      fgCtx.shadowBlur = 8;

      fgCtx.fillStyle = "#ffffff";
      fgCtx.beginPath();
      fgCtx.moveTo(0, 0);
      fgCtx.lineTo(4, 14);
      fgCtx.lineTo(8, 10);
      fgCtx.lineTo(13, 14);
      fgCtx.lineTo(15, 12);
      fgCtx.lineTo(10, 8);
      fgCtx.lineTo(13, 4);
      fgCtx.closePath();
      fgCtx.fill();

      fgCtx.fillStyle = "#00ffff";
      fgCtx.beginPath();
      fgCtx.arc(0, 0, 2, 0, Math.PI * 2);
      fgCtx.fill();

      fgCtx.restore();

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, [params.magnifierRadius]);

  // 3. Card Dotted Map Etching Loop
  useEffect(() => {
    const canvas = cardCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = canvas.offsetWidth || 380;
    let height = canvas.offsetHeight || 500;
    canvas.width = width;
    canvas.height = height;

    const drawCardMap = () => {
      ctx.clearRect(0, 0, width, height);

      const mapWidth = width * 1.6;
      const mapHeight = height * 1.15;
      const mapLeft = (width - mapWidth) / 2;
      const mapTop = (height - mapHeight) / 2;

      const spacing = 7;
      for (let y = 0; y < height; y += spacing) {
        for (let x = 0; x < width; x += spacing) {
          const xNorm = (x - mapLeft) / mapWidth;
          const yNorm = (y - mapTop) / mapHeight;
          if (isLand(xNorm, yNorm)) {
            const xRatio = x / width;
            ctx.fillStyle = getOmbreColor(xRatio, 0.05);
            ctx.beginPath();
            ctx.arc(x, y, 0.9, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    };

    const timer = setTimeout(drawCardMap, 150);
    return () => clearTimeout(timer);
  }, []);

  const handleRandomize = () => {
    setParams({
      ...params,
      hue: Math.floor(Math.random() * 360),
      spacing: Math.floor(Math.random() * 8 + 16),
      magnifierRadius: Math.floor(Math.random() * 80 + 100)
    });
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!badgeId.trim() || !passcode.trim()) return;

    setIsAuthenticating(true);
    setTimeout(() => {
      setIsAuthenticating(false);
      navigate("/dashboard");
    }, 1500);
  };

  // Capture mouse clicks to place location markers outside the login card
  const handlePageClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    // Ignore clicks inside the login card tablet so inputs are fully interactive
    if (target.closest("main") || target.closest("header") || target.closest("footer")) return;

    if (e.button === 0) {
      setActivePin({ x: e.clientX, y: e.clientY });
    }
  };

  // Suppress browser context menu and clear pins on right-click
  const handlePageContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setActivePin(null);
  };

  return (
    <div 
      onClick={handlePageClick}
      onContextMenu={handlePageContextMenu}
      className="relative w-full min-h-screen font-mono text-white bg-black overflow-hidden flex items-center justify-center p-4 cursor-none select-none"
    >
      
      {/* Global CSS Inject tags for hover shines & laser animations */}
      <style>{`
        @keyframes shine {
          0% { transform: translateX(-100%) rotate(45deg); }
          50%, 100% { transform: translateX(100%) rotate(45deg); }
        }
        .animate-shine {
          position: relative;
          overflow: hidden;
        }
        .animate-shine::after {
          content: '';
          position: absolute;
          top: -50%;
          left: -60%;
          width: 30%;
          height: 200%;
          background: rgba(255, 255, 255, 0.25);
          transform: rotate(45deg);
          transition: all 0.3s;
        }
        .animate-shine:hover::after {
          animation: shine 1.2s infinite ease-in-out;
        }
      `}</style>

      {/* Layer 1: Background Canvas (Volumetric lights & faded world map image) */}
      <canvas 
        ref={backgroundCanvasRef} 
        className="absolute inset-0 z-0 select-none pointer-events-none"
      />

      {/* Layer 2: Interactive p5.js Mountain Particle Grid (Transparent background) */}
      <div className="absolute inset-0 z-1 select-none pointer-events-none">
        <ForceFieldBackground
          hue={params.hue}
          saturation={params.saturation}
          spacing={params.spacing}
          forceStrength={params.forceStrength}
          magnifierRadius={params.magnifierRadius}
        />
      </div>

      {/* Layer 3: Foreground Canvas (Custom cursor bloom & laser sweeps) */}
      <canvas 
        ref={foregroundCanvasRef} 
        className="absolute inset-0 z-2 select-none pointer-events-none"
      />

      {/* Agency Command Header (Cinematic Fade-In after 3.5s) */}
      <header className={`absolute top-12 left-12 z-20 pointer-events-none flex items-center gap-4 transition-opacity duration-1000 ${showTablet ? "opacity-100" : "opacity-0"}`}>
        <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md shadow-glass">
          <Shield className="h-6 w-6 text-cyan-accent animate-pulse" />
        </div>
        <div>
          <h2 className="text-[10px] font-bold tracking-[0.3em] text-white/40 uppercase">State Crime Records</h2>
          <h1 className="text-xl font-bold text-white tracking-tight">KSP STRATOS OPS</h1>
        </div>
      </header>

      {/* Glassmorphic Login Card (Cinematic Fade-In after 3.5s) */}
      <main className={`relative z-20 w-full max-w-md px-6 transition-opacity duration-1000 ${showTablet ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}`}>
        <div 
          className="rounded-[2.5rem] border border-white/[0.08] bg-gradient-to-br from-red-950/20 via-black/85 to-blue-950/20 p-9 backdrop-blur-[32px] space-y-6 relative overflow-hidden"
          style={{
            boxShadow: "inset 0 1px 2px rgba(255, 255, 255, 0.08), inset 0 0 40px rgba(0, 0, 0, 0.6), 0 25px 50px rgba(0, 0, 0, 0.8)",
            borderImage: "linear-gradient(to bottom, rgba(255,255,255,0.12), rgba(0,217,255,0.15) 50%, rgba(255,255,255,0.02)) 1"
          }}
        >
          {/* Glass Etched Dotted Map Overlay */}
          <canvas 
            ref={cardCanvasRef} 
            className="absolute inset-0 z-0 pointer-events-none opacity-[0.06] rounded-[2.5rem]"
          />
          
          <div className="text-center space-y-3 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 shadow-[0_0_15px_rgba(0,217,255,0.1)] mb-1">
              <span className="flex h-1.5 w-1.5 rounded-full bg-cyan-500 animate-pulse"></span>
              <span className="text-[8px] font-bold text-cyan-400 uppercase tracking-widest">Secure Authentication</span>
            </div>
            <h3 className="text-2xl font-bold text-white">Welcome, Agent</h3>
            <p className="text-slate-500 text-xs">Enter credentials to access KSP central hub</p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs relative z-10">
            {/* Badge ID */}
            <div className="space-y-1.5">
              <label className="block text-slate-400 uppercase font-bold text-[9px] tracking-wider ml-1">Badge ID / Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                  <Shield className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  value={badgeId}
                  onChange={(e) => setBadgeId(e.target.value)}
                  placeholder="KSP-IO-XXXX"
                  className="w-full bg-black/90 border border-white/5 rounded-xl py-3.5 pl-11 pr-4 text-slate-200 placeholder-white/10 outline-none transition-all focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/20"
                />
              </div>
            </div>

            {/* Passcode */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-1">
                <label className="block text-slate-400 uppercase font-bold text-[9px] tracking-wider">Secret Clearance</label>
                <a href="#" className="text-[9px] font-bold text-cyan-400/50 hover:text-cyan-400 uppercase tracking-wider transition-colors">Forgot?</a>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-black/90 border border-white/5 rounded-xl py-3.5 pl-11 pr-10 text-slate-200 placeholder-white/10 outline-none transition-all focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3 top-3.5 text-slate-500 hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* District */}
            <div className="space-y-1.5">
              <label className="block text-slate-400 uppercase font-bold text-[9px] tracking-wider ml-1">Assigned Division</label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full bg-black/90 border border-white/5 text-slate-300 rounded-xl px-3 py-3.5 outline-none focus:border-cyan-400"
              >
                <option value="Bengaluru City">Bengaluru City Division</option>
                <option value="Mysuru City">Mysuru City Division</option>
                <option value="Hubballi-Dharwad">Hubballi-Dharwad Unit</option>
              </select>
            </div>

            {/* Submit Button (Ombre Red-Purple-Blue Gradient with Hover Glare Shine) */}
            <button
              type="submit"
              disabled={isAuthenticating}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-[#8B0000] via-[#5F1296] to-[#00C8FF] text-white font-bold uppercase tracking-[0.2em] text-xs transition-all hover:scale-[1.01] hover:brightness-115 hover:shadow-[0_0_25px_rgba(0,200,255,0.45)] duration-300 disabled:opacity-50 mt-4 flex items-center justify-center gap-1.5 animate-shine"
            >
              {isAuthenticating ? (
                <>
                  <KeyRound className="h-4 w-4 animate-spin" />
                  Verifying Link...
                </>
              ) : (
                <>
                  <KeyRound className="h-4 w-4" />
                  Initialize Access
                </>
              )}
            </button>
          </form>

          {/* Interactive Parameters Drawer */}
          <div className="border-t border-white/5 pt-4 space-y-3 relative z-10">
            <span className="block text-center text-[8px] text-slate-500 uppercase font-bold tracking-wider">
              Particle Calibration Console
            </span>

            <div className="grid grid-cols-3 gap-2 font-mono text-[7px] text-slate-400">
              {/* Hue */}
              <div className="space-y-1 flex flex-col items-center">
                <span className="flex items-center gap-0.5"><Palette className="w-2 h-2 text-cyan-accent" /> Hue</span>
                <input
                  type="range" min="0" max="360"
                  value={params.hue}
                  onChange={(e) => setParams({ ...params, hue: parseInt(e.target.value) })}
                  className="w-full accent-cyan-400 h-0.5 bg-white/10 rounded-full appearance-none cursor-pointer"
                />
              </div>

              {/* Radius */}
              <div className="space-y-1 flex flex-col items-center">
                <span className="flex items-center gap-0.5"><Maximize className="w-2 h-2 text-cyan-accent" /> Radius</span>
                <input
                  type="range" min="50" max="300"
                  value={params.magnifierRadius}
                  onChange={(e) => setParams({ ...params, magnifierRadius: parseInt(e.target.value) })}
                  className="w-full accent-cyan-400 h-0.5 bg-white/10 rounded-full appearance-none cursor-pointer"
                />
              </div>

              {/* Force */}
              <div className="space-y-1 flex flex-col items-center">
                <span className="flex items-center gap-0.5"><Zap className="w-2 h-2 text-cyan-accent" /> Force</span>
                <input
                  type="range" min="0" max="30"
                  value={params.forceStrength}
                  onChange={(e) => setParams({ ...params, forceStrength: parseInt(e.target.value) })}
                  className="w-full accent-cyan-400 h-0.5 bg-white/10 rounded-full appearance-none cursor-pointer"
                />
              </div>
            </div>

            <button
              onClick={handleRandomize}
              type="button"
              className="w-full py-1.5 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] text-[7.5px] uppercase tracking-wider text-slate-500 flex items-center justify-center gap-1 transition-all"
            >
              <RefreshCw className="h-3 w-3" /> Randomize Field
            </button>
          </div>

          <div className="text-center pt-2 relative z-10">
            <p className="text-slate-600 text-[10px]">Need clearance? <a href="#" className="text-white/40 font-bold hover:text-cyan-400 transition-colors">Contact Administration</a></p>
          </div>

        </div>
      </main>

      {/* Biometric Ready Footer (Cinematic Fade-In after 3.5s) */}
      <footer className={`absolute bottom-12 z-20 w-full px-12 flex justify-between items-end pointer-events-none select-none transition-opacity duration-1000 ${showTablet ? "opacity-100" : "opacity-0"}`}>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-[10px] text-white/40 font-mono tracking-tighter uppercase">
            <Fingerprint className="h-4 w-4 text-cyan-400 animate-pulse" />
            <span>Biometric Ready</span>
          </div>
          <div className="text-[9px] text-white/10 font-mono uppercase tracking-widest">Local IP: 10.154.22.18</div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Encrypted via AES-256</span>
            <div className="flex gap-1 mt-1">
              <div className="w-1 h-1 rounded-full bg-cyan-400"></div>
              <div className="w-1 h-1 rounded-full bg-cyan-400"></div>
              <div className="w-1 h-1 rounded-full bg-cyan-400/20"></div>
            </div>
          </div>
          <div className="w-px h-8 bg-white/15"></div>
          <Cpu className="h-5 w-5 text-white/20" />
        </div>
      </footer>

    </div>
  );
}

export default Login;

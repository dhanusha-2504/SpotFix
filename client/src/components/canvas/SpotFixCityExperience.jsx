import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useTheme } from '../../context/ThemeContext';
import {
  MapPin,
  AlertTriangle,
  Zap,
  CheckCircle2,
  Compass,
  Maximize2,
  Radio,
} from 'lucide-react';

/**
 * Cinematic Smart City Spatial Camera Engine (Kage-Inspired)
 *
 * Implements a virtual camera traveling through an urban smart city environment:
 * - Scroll-driven 3D camera translation (X, Y, Z), perspective pitch/yaw, and smooth zoom.
 * - Multi-layered parallax depth (Atmosphere -> Far Skyline -> Mid Avenue -> Complaint Anchors -> Sensor Grid -> Foreground Vignette).
 * - Kinetic Lerp interpolation using requestAnimationFrame (60-120fps).
 * - Interactive complaint hotspot targeting (Pothole, Streetlight, Drainage/Transit, SLA Dispatch, Verified Seal).
 * - Responsive on Mobile, Tablet, and Desktop with prefers-reduced-motion fallback.
 */

// Camera Keyframes for the 6 narrative scenes
const CAMERA_SCENE_CONFIG = [
  // Scene 0: City Overview (Wide Establishing Altitude)
  {
    id: 'overview',
    label: 'SECTOR 00 // CITYWIDE OVERVIEW',
    x: 0,
    y: 0,
    z: 0,
    scale: 1.04,
    rotateX: 2.5,
    rotateY: 0,
    altitude: '240m',
    pitch: '12° Down',
    activeHotspot: null,
  },
  // Scene 1: The Problem (Camera swoops down to road surface & pothole hazard)
  {
    id: 'problem',
    label: 'SECTOR A-12 // ROAD HAZARD FOCUS',
    x: -7,
    y: 11,
    z: 65,
    scale: 1.34,
    rotateX: 5.5,
    rotateY: -3.5,
    altitude: '18m',
    pitch: '24° Down',
    activeHotspot: 'pothole',
  },
  // Scene 2: AI Reporting (Camera pans right toward solar streetlights & sensor arrays)
  {
    id: 'report',
    label: 'SECTOR B-04 // SMART LIGHTING & AI TELEMETRY',
    x: 10,
    y: -5,
    z: 95,
    scale: 1.42,
    rotateX: -2.0,
    rotateY: 4.5,
    altitude: '28m',
    pitch: '8° Up',
    activeHotspot: 'streetlight',
  },
  // Scene 3: SLA Tracking & Dispatch (Camera ascends to mid-altitude command vantage)
  {
    id: 'track',
    label: 'SECTOR C-09 // MUNICIPAL DISPATCH GRID',
    x: 0,
    y: -8,
    z: 45,
    scale: 1.20,
    rotateX: 7.0,
    rotateY: 0,
    altitude: '110m',
    pitch: '32° Down',
    activeHotspot: 'dispatch',
  },
  // Scene 4: Verified Resolution (Camera zooms close-up to inspected repair site)
  {
    id: 'fix',
    label: 'SECTOR D-02 // VERIFIED REPAIR AUDIT',
    x: -8,
    y: 7,
    z: 80,
    scale: 1.38,
    rotateX: 4.0,
    rotateY: -2.0,
    altitude: '12m',
    pitch: '15° Down',
    activeHotspot: 'repaired',
  },
  // Scene 5: Smart City Vision (Camera pulls back into expansive connected metropolis)
  {
    id: 'vision',
    label: 'SECTOR MASTER // CONNECTED SMART ECOSYSTEM',
    x: 0,
    y: 0,
    z: 15,
    scale: 1.08,
    rotateX: 1.5,
    rotateY: 0,
    altitude: '180m',
    pitch: '10° Down',
    activeHotspot: 'all',
  },
];

// Interactive Complaint Hotspot Nodes anchored in physical spatial perspective
const COMPLAINT_HOTSPOTS = [
  {
    id: 'pothole',
    category: 'Roads & Asphalt',
    code: 'PTH-204',
    title: 'Severe Asphalt Pothole Hazard',
    status: 'ACTIVE_HAZARD',
    severity: 'HIGH PRIORITY',
    coords: '12.9716° N, 77.5946° E',
    sceneIndex: 1,
    top: '64%',
    left: '42%',
    color: 'rose',
    accent: '#f43f5e',
    details: 'Depth 85mm. Impairing lane 2 traffic. Auto-assigned to Road Works Unit.',
  },
  {
    id: 'streetlight',
    category: 'Electrical & Lighting',
    code: 'LGT-089',
    title: 'Solar LED Fixture Failure',
    status: 'AI_DETECTED',
    severity: 'MEDIUM PRIORITY',
    coords: '12.9734° N, 77.5982° E',
    sceneIndex: 2,
    top: '46%',
    left: '68%',
    color: 'amber',
    accent: '#f59e0b',
    details: '0.0 Lux illumination. Photocell controller offline. Replacement dispatched.',
  },
  {
    id: 'dispatch',
    category: 'Civic Logistics',
    code: 'DSP-512',
    title: 'Multi-Squad Active Routing',
    status: 'IN_TRANSIT',
    severity: 'SLA MONITORED',
    coords: '12.9698° N, 77.5912° E',
    sceneIndex: 3,
    top: '40%',
    left: '30%',
    color: 'sky',
    accent: '#0ea5e9',
    details: 'Squad #4 ETA 14 mins. Priority routing cleared via municipal traffic grid.',
  },
  {
    id: 'repaired',
    category: 'Quality Assurance',
    code: 'VFD-108',
    title: 'Bitumen Seal Completed',
    status: 'VERIFIED_100%',
    severity: 'AUDIT PASSED',
    coords: '12.9722° N, 77.5930° E',
    sceneIndex: 4,
    top: '58%',
    left: '36%',
    color: 'emerald',
    accent: '#10b981',
    details: 'Geotagged proof submitted. Density test passed. Ticket pending citizen signoff.',
  },
];

const SpotFixCityExperience = ({ scrollProgress = 0, activeScene = 0, onSelectHotspot }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Motion reduction check
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Mouse tilt state
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const [hudState, setHudState] = useState({
    activeSector: CAMERA_SCENE_CONFIG[0].label,
    altitude: CAMERA_SCENE_CONFIG[0].altitude,
    pitch: CAMERA_SCENE_CONFIG[0].pitch,
    zoomFactor: '1.00x',
    activeHotspotId: null,
  });

  // Animated Camera State (smooth lerp)
  const cameraStateRef = useRef({
    x: 0,
    y: 0,
    z: 0,
    scale: 1.04,
    rotateX: 2.5,
    rotateY: 0,
  });

  const cityLayerRef = useRef(null);
  const gridLayerRef = useRef(null);
  const hotspotsLayerRef = useRef(null);
  const foregroundLayerRef = useRef(null);
  const skyLayerRef = useRef(null);

  // Track mouse movement
  useEffect(() => {
    const handleMouseMove = (e) => {
      const { innerWidth, innerHeight } = window;
      mouseRef.current.targetX = (e.clientX / innerWidth - 0.5) * 2; // -1 to +1
      mouseRef.current.targetY = (e.clientY / innerHeight - 0.5) * 2; // -1 to +1
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Compute interpolated camera target based on scrollProgress
  const computeTargetCamera = useCallback((progress) => {
    const numScenes = CAMERA_SCENE_CONFIG.length;
    const clampedProgress = Math.max(0, Math.min(0.9999, progress));
    const rawIndex = clampedProgress * (numScenes - 1);
    const startIndex = Math.floor(rawIndex);
    const endIndex = Math.min(numScenes - 1, startIndex + 1);
    const t = rawIndex - startIndex;

    // Smoothstep easing for cinematic camera interpolation
    const easeT = t * t * (3 - 2 * t);

    const from = CAMERA_SCENE_CONFIG[startIndex];
    const to = CAMERA_SCENE_CONFIG[endIndex];

    return {
      x: from.x + (to.x - from.x) * easeT,
      y: from.y + (to.y - from.y) * easeT,
      z: from.z + (to.z - from.z) * easeT,
      scale: from.scale + (to.scale - from.scale) * easeT,
      rotateX: from.rotateX + (to.rotateX - from.rotateX) * easeT,
      rotateY: from.rotateY + (to.rotateY - from.rotateY) * easeT,
      activeConfig: easeT > 0.5 ? to : from,
    };
  }, []);

  // Main 60-120fps Animation Loop with kinetic damping
  useEffect(() => {
    let animId;

    const renderLoop = () => {
      // 1. Mouse Lerp
      const m = mouseRef.current;
      m.x += (m.targetX - m.x) * 0.05;
      m.y += (m.targetY - m.y) * 0.05;

      // 2. Camera Keyframe Lerp
      const targetCam = computeTargetCamera(scrollProgress);
      const cam = cameraStateRef.current;
      const lerpSpeed = prefersReducedMotion ? 1 : 0.07;

      cam.x += (targetCam.x - cam.x) * lerpSpeed;
      cam.y += (targetCam.y - cam.y) * lerpSpeed;
      cam.z += (targetCam.z - cam.z) * lerpSpeed;
      cam.scale += (targetCam.scale - cam.scale) * lerpSpeed;
      cam.rotateX += (targetCam.rotateX - cam.rotateX) * lerpSpeed;
      cam.rotateY += (targetCam.rotateY - cam.rotateY) * lerpSpeed;

      // Dynamic mouse parallax addition
      const mouseTiltX = prefersReducedMotion ? 0 : m.y * -2.2;
      const mouseTiltY = prefersReducedMotion ? 0 : m.x * 3.0;
      const mouseShiftX = prefersReducedMotion ? 0 : m.x * -12;
      const mouseShiftY = prefersReducedMotion ? 0 : m.y * -8;

      // 3. Apply 3D Transforms to Layers with Multi-Depth Separation
      // Layer 0: Sky Dome / Atmospheric Horizon (Deepest layer, slowest parallax)
      if (skyLayerRef.current) {
        skyLayerRef.current.style.transform = `
          translate3d(${cam.x * 0.15 + mouseShiftX * 0.2}px, ${cam.y * 0.15 + mouseShiftY * 0.2}px, -280px)
          scale(${1.25 + cam.z * 0.0008})
        `;
      }

      // Layer 1: Main City Environment Panorama (Primary camera movement)
      if (cityLayerRef.current) {
        const totalX = cam.x + mouseShiftX * 0.7;
        const totalY = cam.y + mouseShiftY * 0.7;
        const totalRotX = cam.rotateX + mouseTiltX;
        const totalRotY = cam.rotateY + mouseTiltY;

        cityLayerRef.current.style.transform = `
          perspective(1200px)
          translate3d(${totalX * 2.8}px, ${totalY * 2.8}px, ${cam.z}px)
          rotateX(${totalRotX}deg)
          rotateY(${totalRotY}deg)
          scale3d(${cam.scale}, ${cam.scale}, 1)
        `;
      }

      // Layer 2: Spatial LIDAR Grid & Vectors (Mid-depth)
      if (gridLayerRef.current) {
        const totalX = cam.x * 1.3 + mouseShiftX;
        const totalY = cam.y * 1.3 + mouseShiftY;
        gridLayerRef.current.style.transform = `
          perspective(1200px)
          translate3d(${totalX * 3.2}px, ${totalY * 3.2}px, ${cam.z * 1.15}px)
          rotateX(${cam.rotateX + mouseTiltX * 1.1}deg)
          rotateY(${cam.rotateY + mouseTiltY * 1.1}deg)
          scale3d(${cam.scale * 1.02}, ${cam.scale * 1.02}, 1)
        `;
      }

      // Layer 3: Hotspots Layer (Anchored closely in city space)
      if (hotspotsLayerRef.current) {
        const totalX = cam.x + mouseShiftX * 0.7;
        const totalY = cam.y + mouseShiftY * 0.7;
        hotspotsLayerRef.current.style.transform = `
          perspective(1200px)
          translate3d(${totalX * 2.8}px, ${totalY * 2.8}px, ${cam.z + 40}px)
          rotateX(${cam.rotateX + mouseTiltX}deg)
          rotateY(${cam.rotateY + mouseTiltY}deg)
          scale3d(${cam.scale}, ${cam.scale}, 1)
        `;
      }

      // Layer 4: Foreground Vignette / Glass Bokeh (Fastest parallax for deep depth)
      if (foregroundLayerRef.current) {
        foregroundLayerRef.current.style.transform = `
          translate3d(${mouseShiftX * -1.6}px, ${mouseShiftY * -1.6}px, 0)
        `;
      }

      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animId);
  }, [scrollProgress, prefersReducedMotion, computeTargetCamera]);

  // Update HUD telemetry periodically
  useEffect(() => {
    const activeCfg = CAMERA_SCENE_CONFIG[activeScene] || CAMERA_SCENE_CONFIG[0];
    setHudState({
      activeSector: activeCfg.label,
      altitude: activeCfg.altitude,
      pitch: activeCfg.pitch,
      zoomFactor: (1 + scrollProgress * 0.45).toFixed(2) + 'x',
      activeHotspotId: activeCfg.activeHotspot,
    });
  }, [activeScene, scrollProgress]);

  const handleHotspotClick = (hotspot) => {
    if (onSelectHotspot) {
      onSelectHotspot(hotspot.sceneIndex);
    } else {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const targetY = (hotspot.sceneIndex / 5) * totalHeight;
      window.scrollTo({ top: targetY, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden select-none pointer-events-none">
      {/* ========================================================================= */}
      {/* LAYER 0: ATMOSPHERIC HORIZON & SKY DOME                                   */}
      {/* ========================================================================= */}
      <div
        ref={skyLayerRef}
        className="absolute inset-[-15%] will-change-transform transition-opacity duration-1000"
        style={{
          background: isDark
            ? 'radial-gradient(ellipse at 50% 30%, #0c1830 0%, #050b17 55%, #02060d 100%)'
            : 'radial-gradient(ellipse at 50% 25%, #e0f2fe 0%, #bae6fd 45%, #f1f5f9 100%)',
        }}
      >
        {/* Subtle Ambient Night Stars / Day Light Halo */}
        {isDark && (
          <div
            className="absolute inset-0 opacity-40 mix-blend-screen"
            style={{
              backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1.5px)',
              backgroundSize: '48px 48px',
            }}
          />
        )}
      </div>

      {/* ========================================================================= */}
      {/* LAYER 1: CINEMATIC SMART CITY ENVIRONMENT PANORAMA                       */}
      {/* ========================================================================= */}
      <div
        ref={cityLayerRef}
        className="absolute inset-[-12%] flex items-center justify-center will-change-transform transform-style-3d origin-center"
      >
        {/* Day City Visual */}
        <div
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-700 ease-out ${
            isDark ? 'opacity-0' : 'opacity-100'
          }`}
          style={{
            backgroundImage: 'url(/assets/city-day.jpg)',
            filter: 'brightness(1.02) contrast(1.04) saturate(1.08)',
          }}
        />

        {/* Night Smart City Visual */}
        <div
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-700 ease-out ${
            isDark ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            backgroundImage: 'url(/assets/city-night.jpg)',
            filter: 'brightness(0.95) contrast(1.12) saturate(1.15)',
          }}
        />

        {/* Atmospheric City Depth Gradients */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: isDark
              ? 'linear-gradient(180deg, rgba(3,7,18,0.2) 0%, rgba(3,7,18,0.05) 50%, rgba(3,7,18,0.7) 100%)'
              : 'linear-gradient(180deg, rgba(248,250,252,0.15) 0%, rgba(248,250,252,0.02) 50%, rgba(248,250,252,0.6) 100%)',
          }}
        />
      </div>

      {/* ========================================================================= */}
      {/* LAYER 2: SPATIAL LIDAR GRID & SENSOR VECTORS                              */}
      {/* ========================================================================= */}
      <div
        ref={gridLayerRef}
        className="absolute inset-[-10%] pointer-events-none will-change-transform transform-style-3d opacity-30"
      >
        {/* Perspective Ground Grid Overlay */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: isDark
              ? 'linear-gradient(to right, rgba(16, 185, 129, 0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(16, 185, 129, 0.12) 1px, transparent 1px)'
              : 'linear-gradient(to right, rgba(5, 150, 105, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(5, 150, 105, 0.1) 1px, transparent 1px)',
            backgroundSize: '72px 72px',
            transform: 'perspective(600px) rotateX(72deg) translateY(240px)',
            transformOrigin: '50% 100%',
            maskImage: 'linear-gradient(to bottom, transparent, rgba(0,0,0,1) 50%, transparent)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent, rgba(0,0,0,1) 50%, transparent)',
          }}
        />

        {/* Animated LIDAR Telemetry Scanner Sweep */}
        <div
          className="absolute w-full h-1 bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent animate-pulse"
          style={{
            top: '48%',
            filter: 'blur(1px)',
          }}
        />
      </div>

      {/* ========================================================================= */}
      {/* LAYER 3: 3D ANCHORED CIVIC DEFECT & COMPLAINT HOTSPOTS                     */}
      {/* ========================================================================= */}
      <div
        ref={hotspotsLayerRef}
        className="absolute inset-0 pointer-events-auto will-change-transform transform-style-3d"
      >
        {COMPLAINT_HOTSPOTS.map((hotspot) => {
          const isFocused =
            hudState.activeHotspotId === hotspot.id || hudState.activeHotspotId === 'all';
          const isCurrentScene = activeScene === hotspot.sceneIndex;

          return (
            <div
              key={hotspot.id}
              onClick={() => handleHotspotClick(hotspot)}
              style={{
                top: hotspot.top,
                left: hotspot.left,
                transform: `translate(-50%, -50%) scale(${isFocused || isCurrentScene ? 1.08 : 0.88})`,
              }}
              className={`absolute cursor-pointer group transition-all duration-500 z-20 ${
                isFocused || isCurrentScene ? 'opacity-100 scale-100' : 'opacity-65 hover:opacity-100'
              }`}
            >
              {/* Radar Ring Pulses */}
              <div
                className={`absolute inset-0 -m-3 rounded-full animate-ping pointer-events-none opacity-40`}
                style={{ backgroundColor: hotspot.accent }}
              />
              <div
                className="absolute inset-0 -m-6 rounded-full border border-dashed pointer-events-none animate-spin"
                style={{
                  borderColor: `${hotspot.accent}55`,
                  animationDuration: '14s',
                }}
              />

              {/* Pinpoint Core Anchor */}
              <div
                className="relative flex items-center justify-center w-8 h-8 rounded-full shadow-xl border-2 transition-transform duration-300 group-hover:scale-125"
                style={{
                  backgroundColor: isDark ? 'rgba(15, 23, 42, 0.92)' : 'rgba(255, 255, 255, 0.95)',
                  borderColor: hotspot.accent,
                  boxShadow: `0 0 20px ${hotspot.accent}66`,
                }}
              >
                {hotspot.id === 'pothole' && <AlertTriangle className="w-4 h-4 text-rose-500" />}
                {hotspot.id === 'streetlight' && <Zap className="w-4 h-4 text-amber-500" />}
                {hotspot.id === 'dispatch' && <Radio className="w-4 h-4 text-sky-500" />}
                {hotspot.id === 'repaired' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
              </div>

              {/* Floating Spatial HUD Card (Expands when scene is active or on hover) */}
              <div
                className={`absolute left-10 top-1/2 -translate-y-1/2 w-64 p-3 rounded-xl glass-panel shadow-2xl border transition-all duration-400 pointer-events-none sm:pointer-events-auto ${
                  isFocused || isCurrentScene
                    ? 'opacity-100 translate-x-0 scale-100'
                    : 'opacity-0 -translate-x-3 scale-95 group-hover:opacity-100 group-hover:translate-x-0 group-hover:scale-100'
                }`}
                style={{
                  borderColor: `${hotspot.accent}66`,
                  background: isDark ? 'rgba(11, 17, 32, 0.88)' : 'rgba(255, 255, 255, 0.92)',
                  boxShadow: `0 10px 30px -5px ${hotspot.accent}22`,
                }}
              >
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-1.5 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full animate-pulse"
                      style={{ backgroundColor: hotspot.accent }}
                    />
                    <span className="text-[10px] font-mono font-bold tracking-wider text-slate-800 dark:text-slate-200">
                      {hotspot.code}
                    </span>
                  </div>
                  <span
                    className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded"
                    style={{
                      backgroundColor: `${hotspot.accent}22`,
                      color: hotspot.accent,
                    }}
                  >
                    {hotspot.status}
                  </span>
                </div>

                <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight mb-1">
                  {hotspot.title}
                </div>

                <p className="text-[10px] text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed mb-2">
                  {hotspot.details}
                </p>

                <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/60 dark:border-slate-800/60">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-2.5 h-2.5 text-slate-400" />
                    {hotspot.coords}
                  </span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                    Jump <Maximize2 className="w-2.5 h-2.5" />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* LAYER 4: FOREGROUND VIGNETTE & CINEMATIC DEPTH BLUR                       */}
      {/* ========================================================================= */}
      <div
        ref={foregroundLayerRef}
        className="absolute inset-0 pointer-events-none z-10 will-change-transform"
      >
        {/* Edge Vignette */}
        <div
          className="absolute inset-0"
          style={{
            boxShadow: isDark
              ? 'inset 0 0 140px rgba(2, 6, 13, 0.85), inset 0 0 60px rgba(2, 6, 13, 0.6)'
              : 'inset 0 0 120px rgba(241, 245, 249, 0.7), inset 0 0 50px rgba(241, 245, 249, 0.4)',
          }}
        />
      </div>

      {/* ========================================================================= */}
      {/* LAYER 5: MINIMAL KAGE SMART-CITY HUD OVERLAYS                             */}
      {/* ========================================================================= */}
      <div className="absolute inset-0 pointer-events-none z-20 p-4 sm:p-6 lg:p-8 flex flex-col justify-between">
        {/* TOP HUD BAR */}
        <div className="flex items-center justify-between">
          {/* Live Telemetry Status */}
          <div className="flex items-center gap-3 px-3.5 py-1.5 rounded-xl glass-panel text-[11px] font-mono border border-emerald-500/25">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 tracking-wider hidden sm:inline">
                CIVIC SENSOR TELEMETRY
              </span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 sm:hidden">
                ACTIVE
              </span>
            </div>
            <span className="text-slate-400 dark:text-slate-600">|</span>
            <span className="text-slate-600 dark:text-slate-300 truncate max-w-[180px] sm:max-w-none">
              {hudState.activeSector}
            </span>
          </div>

          {/* Camera Flight Elevation & Zoom Metric */}
          <div className="hidden sm:flex items-center gap-4 px-3.5 py-1.5 rounded-xl glass-panel text-[10px] font-mono text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800/80">
            <div>
              <span className="text-slate-400 uppercase mr-1">ALT:</span>
              <span className="font-bold text-slate-900 dark:text-white">{hudState.altitude}</span>
            </div>
            <div>
              <span className="text-slate-400 uppercase mr-1">PITCH:</span>
              <span className="font-bold text-slate-900 dark:text-white">{hudState.pitch}</span>
            </div>
            <div>
              <span className="text-slate-400 uppercase mr-1">ZOOM:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{hudState.zoomFactor}</span>
            </div>
          </div>
        </div>

        {/* BOTTOM HUD BAR */}
        <div className="flex items-end justify-between">
          {/* Spatial Grid Coordinates Matrix */}
          <div className="hidden md:flex flex-col gap-1 px-3 py-2 rounded-xl glass-panel text-[10px] font-mono border border-slate-200/80 dark:border-slate-800/80 max-w-xs">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <Compass className="w-3 h-3 text-emerald-500" />
                GPS GEO-ANCHOR
              </span>
              <span className="text-emerald-500 font-bold">ONLINE</span>
            </div>
            <div className="text-slate-800 dark:text-slate-200 font-bold">
              12.9716° N, 77.5946° E
            </div>
            <div className="text-[9px] text-slate-500 dark:text-slate-400">
              Scroll to travel through the 3D smart city infrastructure
            </div>
          </div>

          {/* Quick Hotspot Jump Navigator */}
          <div className="pointer-events-auto flex items-center gap-1.5 p-1.5 rounded-2xl glass-panel border border-slate-200/80 dark:border-slate-800/80 shadow-xl ml-auto">
            {COMPLAINT_HOTSPOTS.map((hs) => (
              <button
                key={hs.id}
                onClick={() => handleHotspotClick(hs)}
                title={hs.title}
                className={`px-2.5 py-1.5 rounded-xl text-[10px] font-mono font-bold transition-all flex items-center gap-1.5 ${
                  activeScene === hs.sceneIndex
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
                }`}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: activeScene === hs.sceneIndex ? '#ffffff' : hs.accent }}
                />
                <span className="hidden sm:inline">{hs.code}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpotFixCityExperience;

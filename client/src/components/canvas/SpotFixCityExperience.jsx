import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { useTheme } from '../../context/ThemeContext';

/**
 * Ultra-Realistic Architectural Smart City 3D Engine for SpotFix
 * - Procedural High-Definition PBR Canvas Textures (Asphalt with aggregate, Modern Paver Tiles, Concrete Panels, Brick Facades, Window Mullions)
 * - Articulated Architectural Towers with Setbacks, Glass Atriums, Balconies, Louvers, Rooftop Helipads & HVAC Plant Units
 * - Highly Detailed Urban Infrastructure (Beveled Curbs, Tactile Crosswalks, Traffic Gantries with Visors, Bus Shelters, LED Streetlights, Trees & Benches)
 * - Dynamic Day/Golden-Hour/Night Environmental Lighting with Window Grids, Warm Streetlight Pools, and Vehicle Headlight Cones
 * - SpotFix Domain Defect & Repair Animations (Fractured Pothole Bitumen Seal, Streetlight Lamp Power-On, Smart Waste Cleanup)
 * - 6-Scene Cinematic Camera Narrative with Smooth Spring-Damped Parallax
 */

const SCENE_KEYFRAMES = [
  // Scene 1: City Overview (Grand architectural aerial panorama)
  {
    camPos: new THREE.Vector3(26, 22, 30),
    target: new THREE.Vector3(0, 1.5, 0),
    potholeFixed: 0.0,
    brokenLightOn: 0.0,
    binFixed: 0.0,
  },
  // Scene 2: The Problem (Street-level close-up on asphalt defect & unlit streetlight)
  {
    camPos: new THREE.Vector3(4.2, 2.2, 5.8),
    target: new THREE.Vector3(-0.6, 0.35, 0.8),
    potholeFixed: 0.0,
    brokenLightOn: 0.0,
    binFixed: 0.0,
  },
  // Scene 3: The Report (Focus on 3D Holographic AI Pin with laser beacon)
  {
    camPos: new THREE.Vector3(-3.5, 2.8, 4.8),
    target: new THREE.Vector3(-0.8, 0.85, 0.8),
    potholeFixed: 0.0,
    brokenLightOn: 0.0,
    binFixed: 0.0,
  },
  // Scene 4: The Track (High-altitude isometric command view of active issue markers)
  {
    camPos: new THREE.Vector3(18, 28, 20),
    target: new THREE.Vector3(0, 0, 0),
    potholeFixed: 0.25,
    brokenLightOn: 0.25,
    binFixed: 0.25,
  },
  // Scene 5: The Fix (Street-level repair transition: seamless asphalt seal & warm streetlight ON)
  {
    camPos: new THREE.Vector3(2.5, 2.0, 4.2),
    target: new THREE.Vector3(-0.6, 0.45, 0.8),
    potholeFixed: 1.0,
    brokenLightOn: 1.0,
    binFixed: 1.0,
  },
  // Scene 6: Smart City (Grand thriving clean metropolis horizon)
  {
    camPos: new THREE.Vector3(22, 20, 26),
    target: new THREE.Vector3(0, 1.5, 0),
    potholeFixed: 1.0,
    brokenLightOn: 1.0,
    binFixed: 1.0,
  },
];

// Helper: Procedural Canvas Texture Generators for Ultra-Realistic PBR Surfaces
function generateAsphaltTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Base Dark Asphalt
  ctx.fillStyle = '#262930';
  ctx.fillRect(0, 0, 512, 512);

  // Noise & Grain specks
  const imgData = ctx.getImageData(0, 0, 512, 512);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 28;
    data[i] = Math.min(255, Math.max(0, data[i] + noise));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
  }
  ctx.putImageData(imgData, 0, 0);

  // Subtle aggregate tar streaks
  ctx.strokeStyle = 'rgba(18, 20, 24, 0.4)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 20; i++) {
    ctx.beginPath();
    const sx = Math.random() * 512;
    const sy = Math.random() * 512;
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx + (Math.random() - 0.5) * 40, sy + (Math.random() - 0.5) * 40);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(12, 12);
  return texture;
}

function generateSidewalkPaverTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(0, 0, 512, 512);

  const tileSize = 32;
  const rows = 512 / tileSize;
  const cols = 512 / tileSize;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const shade = Math.floor(Math.random() * 18 - 9);
      const baseGray = 205 + shade;
      ctx.fillStyle = `rgb(${baseGray}, ${baseGray + 2}, ${baseGray + 5})`;
      ctx.fillRect(c * tileSize + 1, r * tileSize + 1, tileSize - 2, tileSize - 2);

      // Chamfer border
      ctx.strokeStyle = 'rgba(100, 116, 139, 0.35)';
      ctx.lineWidth = 1;
      ctx.strokeRect(c * tileSize + 0.5, r * tileSize + 0.5, tileSize - 1, tileSize - 1);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(8, 8);
  return texture;
}

function generateConcreteTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(0, 0, 512, 512);

  const imgData = ctx.getImageData(0, 0, 512, 512);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 16;
    data[i] = Math.min(255, Math.max(0, data[i] + noise));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
  }
  ctx.putImageData(imgData, 0, 0);

  // Formwork seams
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 128);
  ctx.lineTo(512, 128);
  ctx.moveTo(0, 256);
  ctx.lineTo(512, 256);
  ctx.moveTo(0, 384);
  ctx.lineTo(512, 384);
  ctx.moveTo(256, 0);
  ctx.lineTo(256, 512);
  ctx.stroke();

  // Formwork tie holes
  ctx.fillStyle = 'rgba(71, 85, 105, 0.6)';
  const holes = [
    [32, 32], [224, 32], [288, 32], [480, 32],
    [32, 160], [224, 160], [288, 160], [480, 160],
    [32, 288], [224, 288], [288, 288], [480, 288],
    [32, 416], [224, 416], [288, 416], [480, 416],
  ];
  holes.forEach(([hx, hy]) => {
    ctx.beginPath();
    ctx.arc(hx, hy, 3, 0, Math.PI * 2);
    ctx.fill();
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

function generateBrickTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#94a3b8'; // Mortar
  ctx.fillRect(0, 0, 512, 512);

  const bH = 24;
  const bW = 56;
  const rows = Math.floor(512 / bH);

  for (let r = 0; r < rows; r++) {
    const offset = (r % 2) * (bW / 2);
    for (let x = -bW; x < 512 + bW; x += bW + 4) {
      const brickX = x + offset;
      const brickY = r * (bH + 3) + 2;

      const tone = Math.floor(Math.random() * 30 - 15);
      const red = 160 + tone;
      const green = 65 + Math.floor(tone * 0.4);
      const blue = 35 + Math.floor(tone * 0.2);

      ctx.fillStyle = `rgb(${red}, ${green}, ${blue})`;
      ctx.fillRect(brickX, brickY, bW, bH);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 8);
  return texture;
}

function generateWindowFacadeTexture(isLitNight = false) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Dark curtain wall frame
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, 0, 512, 512);

  const cols = 8;
  const rows = 12;
  const w = 512 / cols;
  const h = 512 / rows;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * w + 4;
      const y = r * h + 4;
      const winW = w - 8;
      const winH = h - 8;

      if (isLitNight) {
        const rand = Math.random();
        if (rand > 0.35) {
          // Warm interior light
          ctx.fillStyle = rand > 0.65 ? '#fef08a' : '#fed7aa';
          ctx.fillRect(x, y, winW, winH);
          // Blinds
          ctx.fillStyle = 'rgba(30, 41, 59, 0.4)';
          ctx.fillRect(x, y, winW, winH * (0.2 + Math.random() * 0.4));
        } else if (rand > 0.15) {
          // Cool office fluorescent
          ctx.fillStyle = '#bae6fd';
          ctx.fillRect(x, y, winW, winH);
        } else {
          // Dark window
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(x, y, winW, winH);
        }
      } else {
        // Daytime sky reflection gradient
        const grad = ctx.createLinearGradient(x, y, x, y + winH);
        grad.addColorStop(0, '#38bdf8');
        grad.addColorStop(0.6, '#0284c7');
        grad.addColorStop(1, '#0369a1');
        ctx.fillStyle = grad;
        ctx.fillRect(x, y, winW, winH);

        // Glass highlight sheen
        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + winW * 0.6, y);
        ctx.lineTo(x, y + winH * 0.8);
        ctx.fill();
      }

      // Mullion inner divider
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x + winW / 2, y);
      ctx.lineTo(x + winW / 2, y + winH);
      ctx.stroke();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

function generateSpotFixScreenTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  // Background
  const grad = ctx.createLinearGradient(0, 0, 512, 256);
  grad.addColorStop(0, '#090d16');
  grad.addColorStop(1, '#0f172a');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 256);

  // Border & Grid
  ctx.strokeStyle = 'rgba(14, 165, 233, 0.4)';
  ctx.lineWidth = 3;
  ctx.strokeRect(6, 6, 500, 244);

  // Header SpotFix Smart City
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 28px Inter, sans-serif';
  ctx.fillText('SPOTFIX SMART CIVIC HUB', 24, 45);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '16px Inter, sans-serif';
  ctx.fillText('LIVE CIVIC INFRASTRUCTURE TELEMETRY', 24, 75);

  // Live Metric Cards
  const cards = [
    { label: 'RESOLVED ISSUES', val: '98.4%', col: '#10b981' },
    { label: 'AI VERIFICATION', val: '0.8s', col: '#06b6d4' },
    { label: 'AVG FIX TIME', val: '4.2h', col: '#f59e0b' },
  ];

  cards.forEach((c, idx) => {
    const cx = 24 + idx * 156;
    const cy = 95;
    ctx.fillStyle = 'rgba(30, 41, 59, 0.8)';
    ctx.fillRect(cx, cy, 144, 90);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
    ctx.strokeRect(cx, cy, 144, 90);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px Inter, sans-serif';
    ctx.fillText(c.label, cx + 10, cy + 26);

    ctx.fillStyle = c.col;
    ctx.font = 'bold 30px Inter, sans-serif';
    ctx.fillText(c.val, cx + 10, cy + 68);
  });

  // Footer status bar
  ctx.fillStyle = '#22c55e';
  ctx.beginPath();
  ctx.arc(32, 218, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#cbd5e1';
  ctx.font = '14px Inter, sans-serif';
  ctx.fillText('ALL CIVIC SENSORS & AI DISPATCH ACTIVE', 48, 223);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

const SpotFixCityExperience = ({
  scrollProgress = 0,
  onMarkerClick = null,
}) => {
  const containerRef = useRef(null);
  const { transitionProgress, isDark } = useTheme();

  const [webglSupported] = useState(() => {
    try {
      const canvas = document.createElement('canvas');
      return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
    } catch {
      return false;
    }
  });

  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const reqIdRef = useRef(null);

  const lightsRef = useRef({});
  const materialsRef = useRef({});
  const texturesRef = useRef({});
  const movingVehiclesRef = useRef([]);
  const interactiveMarkersRef = useRef([]);
  const potholeMeshRef = useRef(null);
  const potholePatchRef = useRef(null);
  const brokenLightFixtureRef = useRef(null);
  const brokenLightPointRef = useRef(null);
  const brokenLightGlowRef = useRef(null);
  const garbagePileRef = useRef(null);
  const sunMeshRef = useRef(null);
  const moonMeshRef = useRef(null);
  const starsGroupRef = useRef(null);
  const treeFoliageListRef = useRef([]);

  const mouseTargetRef = useRef({ x: 0, y: 0 });
  const mouseSmoothRef = useRef({ x: 0, y: 0 });
  const scrollSmoothRef = useRef(0);

  const onMarkerClickRef = useRef(onMarkerClick);
  useEffect(() => {
    onMarkerClickRef.current = onMarkerClick;
  }, [onMarkerClick]);

  const handleMouseMove = useCallback((e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    mouseTargetRef.current = { x: Math.max(-1, Math.min(1, x)), y: Math.max(-1, Math.min(1, y)) };
  }, []);

  useEffect(() => {
    if (!webglSupported || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene & Realistic Atmosphere Fog
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const initialSky = isDark ? 0x060b18 : 0xebf4ff;
    scene.background = new THREE.Color(initialSky);
    scene.fog = new THREE.FogExp2(initialSky, 0.015);

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.4, 300);
    camera.position.copy(SCENE_KEYFRAMES[0].camPos);
    camera.lookAt(SCENE_KEYFRAMES[0].target);
    cameraRef.current = camera;

    // 3. WebGL Renderer with ACES Tone Mapping & Soft Shadows
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Generate High-Res Procedural PBR Textures
    const asphaltTex = generateAsphaltTexture();
    const sidewalkTex = generateSidewalkPaverTexture();
    const concreteTex = generateConcreteTexture();
    const brickTex = generateBrickTexture();
    const windowDayTex = generateWindowFacadeTexture(false);
    const windowNightTex = generateWindowFacadeTexture(true);
    const screenTex = generateSpotFixScreenTexture();

    texturesRef.current = {
      asphaltTex,
      sidewalkTex,
      concreteTex,
      brickTex,
      windowDayTex,
      windowNightTex,
      screenTex,
    };

    // 5. Realistic PBR Materials
    const mats = {
      ground: new THREE.MeshStandardMaterial({
        color: 0x181c24,
        roughness: 0.9,
        metalness: 0.1,
      }),
      asphalt: new THREE.MeshStandardMaterial({
        map: asphaltTex,
        roughness: 0.78,
        metalness: 0.15,
      }),
      roadMarking: new THREE.MeshStandardMaterial({
        color: 0xf8fafc,
        roughness: 0.3,
        metalness: 0.05,
      }),
      roadYellowDivider: new THREE.MeshStandardMaterial({
        color: 0xfbbf24,
        roughness: 0.35,
      }),
      curbStone: new THREE.MeshStandardMaterial({
        color: 0xa1a1aa,
        roughness: 0.65,
        metalness: 0.1,
      }),
      sidewalkPavers: new THREE.MeshStandardMaterial({
        map: sidewalkTex,
        roughness: 0.7,
        metalness: 0.05,
      }),
      tactilePaving: new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        roughness: 0.5,
      }),
      lawnGrass: new THREE.MeshStandardMaterial({
        color: 0x2e6f40,
        roughness: 0.85,
        metalness: 0.02,
      }),
      treeTrunk: new THREE.MeshStandardMaterial({
        color: 0x4a3b32,
        roughness: 0.92,
      }),
      treeCanopy1: new THREE.MeshStandardMaterial({
        color: 0x2e7d32,
        roughness: 0.6,
      }),
      treeCanopy2: new THREE.MeshStandardMaterial({
        color: 0x388e3c,
        roughness: 0.55,
      }),
      treeCanopyWarm: new THREE.MeshStandardMaterial({
        color: 0x4caf50,
        roughness: 0.55,
      }),
      bldgConcreteWhite: new THREE.MeshStandardMaterial({
        map: concreteTex,
        roughness: 0.5,
        metalness: 0.1,
      }),
      bldgConcreteSlate: new THREE.MeshStandardMaterial({
        color: 0x334155,
        map: concreteTex,
        roughness: 0.45,
        metalness: 0.2,
      }),
      bldgBrickWarm: new THREE.MeshStandardMaterial({
        map: brickTex,
        roughness: 0.7,
        metalness: 0.05,
      }),
      bldgBronzeAccent: new THREE.MeshStandardMaterial({
        color: 0x78350f,
        roughness: 0.3,
        metalness: 0.7,
      }),
      bldgGlassFacade: new THREE.MeshPhysicalMaterial({
        map: windowDayTex,
        roughness: 0.08,
        metalness: 0.88,
        transparent: true,
        opacity: 0.9,
        reflectivity: 0.95,
        clearcoat: 0.9,
        clearcoatRoughness: 0.1,
        emissive: new THREE.Color(0x0284c7),
        emissiveIntensity: 0.0,
      }),
      windowIlluminatedFacade: new THREE.MeshStandardMaterial({
        map: windowNightTex,
        roughness: 0.3,
        emissive: new THREE.Color(0xfef08a),
        emissiveIntensity: 0.0,
      }),
      screenDisplayMat: new THREE.MeshStandardMaterial({
        map: screenTex,
        emissive: new THREE.Color(0x38bdf8),
        emissiveIntensity: 0.6,
        roughness: 0.2,
      }),
      metalFixture: new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.35,
        metalness: 0.85,
      }),
      chromeMetal: new THREE.MeshStandardMaterial({
        color: 0xe2e8f0,
        roughness: 0.15,
        metalness: 0.95,
      }),
      streetlightLens: new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: new THREE.Color(0xfef08a),
        emissiveIntensity: 0.0,
      }),
      trafficGreen: new THREE.MeshStandardMaterial({
        color: 0x22c55e,
        emissive: new THREE.Color(0x22c55e),
        emissiveIntensity: 1.8,
      }),
      trafficRed: new THREE.MeshStandardMaterial({
        color: 0xef4444,
        emissive: new THREE.Color(0xef4444),
        emissiveIntensity: 0.5,
      }),
      carPaintBlue: new THREE.MeshStandardMaterial({
        color: 0x0284c7,
        roughness: 0.2,
        metalness: 0.8,
      }),
      carPaintRed: new THREE.MeshStandardMaterial({
        color: 0xd97706,
        roughness: 0.2,
        metalness: 0.8,
      }),
      carPaintWhite: new THREE.MeshStandardMaterial({
        color: 0xf8fafc,
        roughness: 0.15,
        metalness: 0.7,
      }),
      carPaintDark: new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        roughness: 0.15,
        metalness: 0.85,
      }),
      carHeadlight: new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: new THREE.Color(0xffffff),
        emissiveIntensity: 0.4,
      }),
      carTaillight: new THREE.MeshStandardMaterial({
        color: 0xef4444,
        emissive: new THREE.Color(0xef4444),
        emissiveIntensity: 0.5,
      }),
      potholeCrater: new THREE.MeshStandardMaterial({
        color: 0x0b0d11,
        roughness: 0.98,
      }),
      freshAsphaltPatch: new THREE.MeshStandardMaterial({
        color: 0x1a1e24,
        roughness: 0.65,
      }),
      wasteBinMetal: new THREE.MeshStandardMaterial({
        color: 0x0284c7,
        roughness: 0.35,
        metalness: 0.65,
      }),
    };
    materialsRef.current = mats;

    // 6. Realistic Celestial Bodies & Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xe0f2fe, 0x94a3b8, 0.7);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfffbeb, 2.0);
    sunLight.position.set(32, 45, 24);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 5;
    sunLight.shadow.camera.far = 140;
    sunLight.shadow.camera.left = -40;
    sunLight.shadow.camera.right = 40;
    sunLight.shadow.camera.top = 40;
    sunLight.shadow.camera.bottom = -40;
    sunLight.shadow.bias = -0.0003;
    scene.add(sunLight);

    // Sun Disk Mesh
    const sunGeo = new THREE.SphereGeometry(2.5, 16, 16);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xffedd5 });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    sunMesh.position.set(90, 110, 60);
    scene.add(sunMesh);
    sunMeshRef.current = sunMesh;

    // Moon Disk Mesh
    const moonGeo = new THREE.SphereGeometry(2.2, 16, 16);
    const moonMat = new THREE.MeshBasicMaterial({ color: 0xe0f2fe });
    const moonMesh = new THREE.Mesh(moonGeo, moonMat);
    moonMesh.position.set(-80, 100, -60);
    scene.add(moonMesh);
    moonMeshRef.current = moonMesh;

    // Starfield for Night
    const starsGroup = new THREE.Group();
    const starGeo = new THREE.BufferGeometry();
    const starCount = 350;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 260;
      starPositions[i + 1] = 40 + Math.random() * 90;
      starPositions[i + 2] = (Math.random() - 0.5) * 260;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.8, transparent: true, opacity: 0 });
    const stars = new THREE.Points(starGeo, starMat);
    starsGroup.add(stars);
    scene.add(starsGroup);
    starsGroupRef.current = starMat;

    const streetlightPoints = [];

    lightsRef.current = {
      ambient: ambientLight,
      hemi: hemiLight,
      sun: sunLight,
      streetlights: streetlightPoints,
    };

    // 7. BUILD ARCHITECTURAL URBAN ENVIRONMENT
    const cityGroup = new THREE.Group();
    scene.add(cityGroup);

    // Ground Base
    const groundGeo = new THREE.PlaneGeometry(160, 160);
    const groundMesh = new THREE.Mesh(groundGeo, mats.ground);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.receiveShadow = true;
    cityGroup.add(groundMesh);

    // Roads (4-Lane Avenue Intersection with Asphalt Base)
    const roadW = 11.2;
    const roadL = 110;

    const roadX = new THREE.Mesh(new THREE.PlaneGeometry(roadL, roadW), mats.asphalt);
    roadX.rotation.x = -Math.PI / 2;
    roadX.position.y = 0.02;
    roadX.receiveShadow = true;
    cityGroup.add(roadX);

    const roadZ = new THREE.Mesh(new THREE.PlaneGeometry(roadW, roadL), mats.asphalt);
    roadZ.rotation.x = -Math.PI / 2;
    roadZ.position.y = 0.02;
    roadZ.receiveShadow = true;
    cityGroup.add(roadZ);

    // Center Double Yellow Divider & White Lane Dashes
    const markingsGroup = new THREE.Group();
    cityGroup.add(markingsGroup);

    // Double yellow lines
    for (let x = -50; x <= 50; x += 4.2) {
      if (Math.abs(x) < 7.0) continue;
      [-0.12, 0.12].forEach((offsetZ) => {
        const d = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.08), mats.roadYellowDivider);
        d.rotation.x = -Math.PI / 2;
        d.position.set(x, 0.03, offsetZ);
        markingsGroup.add(d);
      });
    }

    for (let z = -50; z <= 50; z += 4.2) {
      if (Math.abs(z) < 7.0) continue;
      [-0.12, 0.12].forEach((offsetX) => {
        const d = new THREE.Mesh(new THREE.PlaneGeometry(0.08, 2.4), mats.roadYellowDivider);
        d.rotation.x = -Math.PI / 2;
        d.position.set(offsetX, 0.03, z);
        markingsGroup.add(d);
      });
    }

    // Lane division white dashes
    [-2.8, 2.8].forEach((laneOffset) => {
      for (let x = -50; x <= 50; x += 3.8) {
        if (Math.abs(x) < 7.0) continue;
        const d = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.12), mats.roadMarking);
        d.rotation.x = -Math.PI / 2;
        d.position.set(x, 0.03, laneOffset);
        markingsGroup.add(d);
      }
      for (let z = -50; z <= 50; z += 3.8) {
        if (Math.abs(z) < 7.0) continue;
        const d = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 1.6), mats.roadMarking);
        d.rotation.x = -Math.PI / 2;
        d.position.set(laneOffset, 0.03, z);
        markingsGroup.add(d);
      }
    });

    // Pedestrian Zebra Crossings with Tactile Warning Strips
    const createCrosswalk = (isXAxis, offset) => {
      const g = new THREE.Group();
      const count = 9;
      for (let i = 0; i < count; i++) {
        const stripe = new THREE.Mesh(
          isXAxis ? new THREE.PlaneGeometry(0.55, 1.25) : new THREE.PlaneGeometry(1.25, 0.55),
          mats.roadMarking
        );
        stripe.rotation.x = -Math.PI / 2;
        if (isXAxis) {
          stripe.position.set((i - (count - 1) / 2) * 1.15, 0.035, offset);
        } else {
          stripe.position.set(offset, 0.035, (i - (count - 1) / 2) * 1.15);
        }
        g.add(stripe);
      }

      // Stop Bar
      const stopLine = new THREE.Mesh(
        isXAxis ? new THREE.PlaneGeometry(10.2, 0.35) : new THREE.PlaneGeometry(0.35, 10.2),
        mats.roadMarking
      );
      stopLine.rotation.x = -Math.PI / 2;
      const stopOffset = offset + (offset > 0 ? 1.35 : -1.35);
      if (isXAxis) {
        stopLine.position.set(0, 0.035, stopOffset);
      } else {
        stopLine.position.set(stopOffset, 0.035, 0);
      }
      g.add(stopLine);

      // Tactile Paving Warning Slab on Curb edge
      const tactile = new THREE.Mesh(
        isXAxis ? new THREE.PlaneGeometry(9.6, 0.4) : new THREE.PlaneGeometry(0.4, 9.6),
        mats.tactilePaving
      );
      tactile.rotation.x = -Math.PI / 2;
      const tactOffset = offset + (offset > 0 ? -1.0 : 1.0);
      if (isXAxis) {
        tactile.position.set(0, 0.23, tactOffset);
      } else {
        tactile.position.set(tactOffset, 0.23, 0);
      }
      g.add(tactile);

      return g;
    };

    cityGroup.add(createCrosswalk(true, 6.6));
    cityGroup.add(createCrosswalk(true, -6.6));
    cityGroup.add(createCrosswalk(false, 6.6));
    cityGroup.add(createCrosswalk(false, -6.6));

    // Sidewalks with Curbs & Planters (4 Quadrants)
    const createQuadrantPlaza = (minX, maxX, minZ, maxZ) => {
      const w = maxX - minX;
      const d = maxZ - minZ;
      const cx = (minX + maxX) / 2;
      const cz = (minZ + maxZ) / 2;

      // Sidewalk Paver Slab
      const sw = new THREE.Mesh(new THREE.BoxGeometry(w, 0.22, d), mats.sidewalkPavers);
      sw.position.set(cx, 0.11, cz);
      sw.receiveShadow = true;
      sw.castShadow = true;
      cityGroup.add(sw);

      // Curb Stone Bevel Edge
      const curb = new THREE.Mesh(new THREE.BoxGeometry(w + 0.12, 0.26, d + 0.12), mats.curbStone);
      curb.position.set(cx, 0.09, cz);
      cityGroup.add(curb);

      // Green Lawn / Tree Planter Bed
      const lawnW = Math.max(3, w - 6);
      const lawnD = Math.max(3, d - 6);
      const lawn = new THREE.Mesh(new THREE.BoxGeometry(lawnW, 0.08, lawnD), mats.lawnGrass);
      lawn.position.set(cx + (minX > 0 ? 2.0 : -2.0), 0.24, cz + (minZ > 0 ? 2.0 : -2.0));
      lawn.receiveShadow = true;
      cityGroup.add(lawn);
    };

    createQuadrantPlaza(5.9, 52, 5.9, 52);
    createQuadrantPlaza(-52, -5.9, 5.9, 52);
    createQuadrantPlaza(5.9, 52, -52, -5.9);
    createQuadrantPlaza(-52, -5.9, -52, -5.9);

    // Realistic Multi-Layer Organic Foliage Trees
    const foliageList = [];
    const createRealisticTree = (x, z, scale = 1.0, canopyType = 1) => {
      const tree = new THREE.Group();
      tree.position.set(x, 0.22, z);

      // Bark Trunk with Flaring Base
      const trunkGeo = new THREE.CylinderGeometry(0.14 * scale, 0.22 * scale, 1.6 * scale, 10);
      const trunk = new THREE.Mesh(trunkGeo, mats.treeTrunk);
      trunk.position.y = (1.6 * scale) / 2;
      trunk.castShadow = true;
      tree.add(trunk);

      // Metal Tree Grate at base
      const grate = new THREE.Mesh(new THREE.RingGeometry(0.24 * scale, 0.55 * scale, 16), mats.metalFixture);
      grate.rotation.x = -Math.PI / 2;
      grate.position.y = 0.01;
      tree.add(grate);

      // Multi-layer foliage canopies with natural volume
      const cMat = canopyType === 1 ? mats.treeCanopy1 : canopyType === 2 ? mats.treeCanopy2 : mats.treeCanopyWarm;

      const layer1 = new THREE.Mesh(new THREE.IcosahedronGeometry(0.95 * scale, 1), cMat);
      layer1.position.y = 1.8 * scale;
      layer1.castShadow = true;
      tree.add(layer1);

      const layer2 = new THREE.Mesh(new THREE.IcosahedronGeometry(0.75 * scale, 1), cMat);
      layer2.position.set(0.15 * scale, 2.5 * scale, -0.1 * scale);
      layer2.castShadow = true;
      tree.add(layer2);

      const layer3 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.55 * scale, 0), cMat);
      layer3.position.set(-0.2 * scale, 2.1 * scale, 0.25 * scale);
      layer3.castShadow = true;
      tree.add(layer3);

      foliageList.push({ layer1, layer2, layer3, baseScale: scale });
      cityGroup.add(tree);
    };

    // Plant Avenue Tree Lines
    const treePositions = [
      [9.0, 9.0, 1.15, 1],
      [16.5, 9.0, 0.98, 2],
      [9.0, 16.5, 1.05, 3],
      [-9.0, 9.0, 1.1, 2],
      [-16.5, 9.0, 1.25, 1],
      [-9.0, 16.5, 0.95, 3],
      [9.0, -9.0, 1.05, 2],
      [16.5, -9.0, 1.0, 1],
      [9.0, -16.5, 1.15, 3],
      [-9.0, -9.0, 1.0, 1],
      [-16.5, -9.0, 1.2, 2],
      [-9.0, -16.5, 0.95, 3],
    ];
    treePositions.forEach(([tx, tz, ts, tc]) => createRealisticTree(tx, tz, ts, tc));
    treeFoliageListRef.current = foliageList;

    // High-Detail Architectural Towers
    const createRealisticSkyscraper = ({
      x,
      z,
      w,
      d,
      h,
      style = 'glass',
      hasHelipad = false,
      hasBeacon = true,
      hasDisplay = false,
    }) => {
      const bldg = new THREE.Group();
      bldg.position.set(x, 0.22, z);

      // 1. Podium / Street Level Colonnade
      const podiumMat = style === 'brick' ? mats.bldgBrickWarm : mats.bldgConcreteWhite;
      const podium = new THREE.Mesh(new THREE.BoxGeometry(w, 3.6, d), podiumMat);
      podium.position.y = 1.8;
      podium.castShadow = true;
      podium.receiveShadow = true;
      bldg.add(podium);

      // Glass entrance lobby & canopy
      const lobbyGlass = new THREE.Mesh(new THREE.BoxGeometry(w * 0.75, 2.4, 0.15), mats.bldgGlassFacade);
      lobbyGlass.position.set(0, 1.3, d / 2 + 0.08);
      bldg.add(lobbyGlass);

      const entranceCanopy = new THREE.Mesh(new THREE.BoxGeometry(w * 0.5, 0.12, 1.4), mats.metalFixture);
      entranceCanopy.position.set(0, 2.6, d / 2 + 0.7);
      entranceCanopy.castShadow = true;
      bldg.add(entranceCanopy);

      // 2. Tower Body
      const towerH = h - 3.6;
      const towerMat = style === 'glass' ? mats.bldgConcreteWhite : style === 'slate' ? mats.bldgConcreteSlate : mats.bldgBrickWarm;
      const tower = new THREE.Mesh(new THREE.BoxGeometry(w - 0.8, towerH, d - 0.8), towerMat);
      tower.position.y = 3.6 + towerH / 2;
      tower.castShadow = true;
      tower.receiveShadow = true;
      bldg.add(tower);

      // Glass Curtain Facade
      const glassCurtain = new THREE.Mesh(
        new THREE.BoxGeometry(w - 0.5, towerH * 0.94, 0.15),
        mats.bldgGlassFacade
      );
      glassCurtain.position.set(0, 3.6 + towerH / 2, d / 2 - 0.32);
      bldg.add(glassCurtain);

      // Rear Glass Curtain
      const glassCurtainRear = glassCurtain.clone();
      glassCurtainRear.position.set(0, 3.6 + towerH / 2, -d / 2 + 0.32);
      glassCurtainRear.rotation.y = Math.PI;
      bldg.add(glassCurtainRear);

      // SpotFix Smart City Display Screen on Facade
      if (hasDisplay) {
        const screenMesh = new THREE.Mesh(new THREE.PlaneGeometry(6.5, 3.4), mats.screenDisplayMat);
        screenMesh.position.set(0, 8.5, d / 2 + 0.1);
        bldg.add(screenMesh);
      }

      // Exterior Architectural Fins
      const finCount = 5;
      for (let i = 0; i < finCount; i++) {
        const fx = -(w - 1.2) / 2 + (i / (finCount - 1)) * (w - 1.2);
        const fin = new THREE.Mesh(new THREE.BoxGeometry(0.12, towerH, 0.35), mats.bldgBronzeAccent);
        fin.position.set(fx, 3.6 + towerH / 2, d / 2 - 0.18);
        fin.castShadow = true;
        bldg.add(fin);
      }

      // Rooftop Terrace with Parapet, Helipad & HVAC Units
      const parapet = new THREE.Mesh(new THREE.BoxGeometry(w - 0.6, 0.6, d - 0.6), mats.curbStone);
      parapet.position.y = h + 0.3;
      bldg.add(parapet);

      // Helipad
      if (hasHelipad) {
        const helipad = new THREE.Mesh(new THREE.CylinderGeometry(2.8, 2.8, 0.08, 24), mats.asphalt);
        helipad.position.set(0, h + 0.06, 0);
        bldg.add(helipad);

        const heliRing = new THREE.Mesh(new THREE.RingGeometry(2.1, 2.35, 24), mats.roadYellowDivider);
        heliRing.rotation.x = -Math.PI / 2;
        heliRing.position.set(0, h + 0.11, 0);
        bldg.add(heliRing);
      }

      // Rooftop HVAC Units
      const hvac1 = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.0, 1.8), mats.metalFixture);
      hvac1.position.set(1.5, h + 0.5, 1.2);
      hvac1.castShadow = true;
      bldg.add(hvac1);

      const hvac2 = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.9, 1.4), mats.metalFixture);
      hvac2.position.set(-1.8, h + 0.45, -1.2);
      hvac2.castShadow = true;
      bldg.add(hvac2);

      // Rooftop Telecommunication Mast / Aviation Red Beacon
      if (hasBeacon) {
        const mastGeo = new THREE.CylinderGeometry(0.04, 0.12, 4.5, 8);
        const mast = new THREE.Mesh(mastGeo, mats.chromeMetal);
        mast.position.set(0, h + 2.25, 0);
        mast.castShadow = true;
        bldg.add(mast);

        const beaconLight = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), mats.trafficRed);
        beaconLight.position.set(0, h + 4.55, 0);
        bldg.add(beaconLight);
      }

      cityGroup.add(bldg);
      return bldg;
    };

    // 4 Corner Architectural City Complexes
    createRealisticSkyscraper({ x: 24, z: 24, w: 16, d: 16, h: 22, style: 'glass', hasHelipad: true, hasBeacon: true, hasDisplay: true }); // Civic Tech Innovation Hub
    createRealisticSkyscraper({ x: -24, z: 24, w: 16, d: 16, h: 18, style: 'slate', hasHelipad: false, hasBeacon: true, hasDisplay: false }); // Municipal Center
    createRealisticSkyscraper({ x: 24, z: -24, w: 16, d: 16, h: 19, style: 'brick', hasHelipad: false, hasBeacon: true, hasDisplay: false }); // Commercial Plaza
    createRealisticSkyscraper({ x: -24, z: -24, w: 16, d: 16, h: 26, style: 'glass', hasHelipad: true, hasBeacon: true, hasDisplay: false }); // Residential Heights

    // Distant Background Skyline Silhouette for Depth
    const createDistantSkyline = () => {
      const distGroup = new THREE.Group();
      const distPositions = [
        [48, 48, 14, 14, 30],
        [-48, 48, 15, 13, 24],
        [48, -48, 13, 15, 27],
        [-48, -48, 15, 15, 34],
        [0, 52, 12, 10, 20],
        [0, -52, 12, 10, 22],
        [52, 0, 10, 12, 25],
        [-52, 0, 10, 12, 21],
      ];
      distPositions.forEach(([dx, dz, dw, dd, dh]) => {
        const b = new THREE.Mesh(new THREE.BoxGeometry(dw, dh, dd), mats.bldgConcreteSlate);
        b.position.set(dx, dh / 2, dz);
        distGroup.add(b);
      });
      cityGroup.add(distGroup);
    };
    createDistantSkyline();

    // Modern Curved LED Streetlights with Illumination Cones
    const createCurvedStreetlight = (x, z, rotY = 0, isProblemLight = false) => {
      const g = new THREE.Group();
      g.position.set(x, 0.22, z);
      g.rotation.y = rotY;

      // Vertical Pole with Taper
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.1, 4.0, 12), mats.metalFixture);
      pole.position.y = 2.0;
      pole.castShadow = true;
      g.add(pole);

      // Curved Arc Arm
      const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 1.2, 8), mats.metalFixture);
      arm.rotation.z = Math.PI / 3.2;
      arm.position.set(0.48, 3.9, 0);
      g.add(arm);

      // Modern LED Luminaire Lamp Head
      const headMat = isProblemLight ? mats.streetlightLens.clone() : mats.streetlightLens;
      const head = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.08, 0.2), headMat);
      head.position.set(0.95, 4.1, 0);
      g.add(head);

      // Warm Soft Spot PointLight
      const pLight = new THREE.PointLight(0xfef08a, 0.0, 14, 1.8);
      pLight.position.set(0.95, 4.0, 0);
      g.add(pLight);

      // Light Cone Glow Volume
      const coneGeo = new THREE.ConeGeometry(2.2, 4.0, 16, 1, true);
      const coneMat = new THREE.MeshBasicMaterial({
        color: 0xfef08a,
        transparent: true,
        opacity: 0.0,
        side: THREE.DoubleSide,
      });
      const cone = new THREE.Mesh(coneGeo, coneMat);
      cone.position.set(0.95, 2.0, 0);
      g.add(cone);

      if (isProblemLight) {
        brokenLightFixtureRef.current = head;
        brokenLightPointRef.current = pLight;
        brokenLightGlowRef.current = coneMat;
      } else {
        streetlightPoints.push(pLight);
      }

      cityGroup.add(g);
    };

    createCurvedStreetlight(6.8, 6.8, -Math.PI / 4, false);
    createCurvedStreetlight(-6.8, 6.8, Math.PI / 4, true); // Defect Streetlight (Scene 2 Focus)
    createCurvedStreetlight(6.8, -6.8, -3 * Math.PI / 4, false);
    createCurvedStreetlight(-6.8, -6.8, 3 * Math.PI / 4, false);
    createCurvedStreetlight(20, 6.8, 0, false);
    createCurvedStreetlight(-20, 6.8, Math.PI, false);

    // Modern Traffic Signal Gantries with Visors
    const createTrafficGantry = (x, z, rotY = 0) => {
      const g = new THREE.Group();
      g.position.set(x, 0.22, z);
      g.rotation.y = rotY;

      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 3.4, 8), mats.metalFixture);
      pole.position.y = 1.7;
      g.add(pole);

      const box = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.85, 0.22), mats.metalFixture);
      box.position.set(0, 3.0, 0);
      g.add(box);

      const red = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 12), mats.trafficRed);
      red.position.set(0, 3.25, 0.12);
      g.add(red);

      const green = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 12), mats.trafficGreen);
      green.position.set(0, 2.75, 0.12);
      g.add(green);

      cityGroup.add(g);
    };

    createTrafficGantry(6.2, 6.2, -Math.PI / 4);
    createTrafficGantry(-6.2, 6.2, Math.PI / 4);
    createTrafficGantry(6.2, -6.2, -3 * Math.PI / 4);
    createTrafficGantry(-6.2, -6.2, 3 * Math.PI / 4);

    // Modern Bus Transit Shelter with Glass Canopy & Digital Ad Board
    const createBusShelter = (x, z, rotY = 0) => {
      const shelter = new THREE.Group();
      shelter.position.set(x, 0.22, z);
      shelter.rotation.y = rotY;

      // Steel pillars
      [-1.8, 1.8].forEach((px) => {
        const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.4, 8), mats.metalFixture);
        pillar.position.set(px, 1.2, -0.6);
        shelter.add(pillar);
      });

      // Glass back and side walls
      const glassBack = new THREE.Mesh(new THREE.BoxGeometry(3.6, 2.0, 0.06), mats.bldgGlassFacade);
      glassBack.position.set(0, 1.2, -0.6);
      shelter.add(glassBack);

      // Glass Roof Canopy
      const roof = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.08, 1.8), mats.bldgGlassFacade);
      roof.position.set(0, 2.4, 0.1);
      roof.rotation.x = 0.05;
      shelter.add(roof);

      // Wooden Park Bench
      const benchSeat = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.08, 0.45), mats.bldgBronzeAccent);
      benchSeat.position.set(0, 0.45, -0.3);
      shelter.add(benchSeat);

      // Digital Ad Panel
      const adPanel = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.8, 0.12), mats.screenDisplayMat);
      adPanel.position.set(1.9, 1.1, -0.1);
      shelter.add(adPanel);

      cityGroup.add(shelter);
    };

    createBusShelter(14.0, 7.8, 0);

    // Realistic Modern Vehicles with Wheel Hubs & Glowing Lights
    const createDetailedVehicle = (paintMat, laneZ, dir, speed, startX, isBus = false) => {
      const car = new THREE.Group();
      car.position.set(startX, 0.28, laneZ);

      if (isBus) {
        // City Transit Bus
        const busBody = new THREE.Mesh(new THREE.BoxGeometry(4.8, 1.3, 1.5), paintMat);
        busBody.position.y = 0.72;
        busBody.castShadow = true;
        car.add(busBody);

        const busGlass = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.55, 1.52), mats.bldgGlassFacade);
        busGlass.position.y = 0.82;
        car.add(busGlass);

        const wheelsBus = [-1.6, 1.6];
        const wheelGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.18, 12);
        wheelGeo.rotateZ(Math.PI / 2);
        wheelsBus.forEach((wx) => {
          [-0.72, 0.72].forEach((wz) => {
            const wheel = new THREE.Mesh(wheelGeo, mats.metalFixture);
            wheel.position.set(wx, 0.24, wz);
            car.add(wheel);
          });
        });
      } else {
        // Modern Sedan / SUV
        const body = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.55, 1.2), paintMat);
        body.position.y = 0.3;
        body.castShadow = true;
        car.add(body);

        const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.45, 1.05), mats.bldgGlassFacade);
        cabin.position.set(-0.2 * dir, 0.72, 0);
        cabin.castShadow = true;
        car.add(cabin);

        // Wheels
        const wheelGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.14, 12);
        wheelGeo.rotateZ(Math.PI / 2);
        [-0.75, 0.75].forEach((wx) => {
          [-0.58, 0.58].forEach((wz) => {
            const wheel = new THREE.Mesh(wheelGeo, mats.metalFixture);
            wheel.position.set(wx, 0.2, wz);
            car.add(wheel);
          });
        });
      }

      // Headlights & Taillights
      const length = isBus ? 2.4 : 1.25;
      const headL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.12, 0.2), mats.carHeadlight);
      headL.position.set(length * dir, 0.3, 0.42);
      car.add(headL);

      const headR = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.12, 0.2), mats.carHeadlight);
      headR.position.set(length * dir, 0.3, -0.42);
      car.add(headR);

      const tailL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.12, 0.2), mats.carTaillight);
      tailL.position.set(-length * dir, 0.3, 0.42);
      car.add(tailL);

      const tailR = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.12, 0.2), mats.carTaillight);
      tailR.position.set(-length * dir, 0.3, -0.42);
      car.add(tailR);

      cityGroup.add(car);

      return {
        mesh: car,
        laneZ,
        dir,
        speed,
        minX: -54,
        maxX: 54,
      };
    };

    movingVehiclesRef.current = [
      createDetailedVehicle(mats.carPaintBlue, 2.0, 1, 0.15, -30),
      createDetailedVehicle(mats.carPaintRed, 2.0, 1, 0.20, 10),
      createDetailedVehicle(mats.carPaintWhite, -2.0, -1, 0.17, 24),
      createDetailedVehicle(mats.carPaintDark, -2.0, -1, 0.19, -15),
      createDetailedVehicle(mats.carPaintBlue, 4.0, 1, 0.12, -42, true), // Transit bus
      createDetailedVehicle(mats.carPaintWhite, -4.0, -1, 0.16, 38),
    ];

    // 8. REALISTIC SPOTFIX DEFECTS & REPAIRABLE MESHES
    // Defect 1: Pothole Crater on Asphalt (-0.8, 0.03, 1.2)
    const potholeGroup = new THREE.Group();
    potholeGroup.position.set(-0.8, 0.03, 1.2);

    const craterGeo = new THREE.CylinderGeometry(0.58, 0.82, 0.09, 16);
    const crater = new THREE.Mesh(craterGeo, mats.potholeCrater);
    crater.position.y = -0.02;
    potholeGroup.add(crater);
    potholeMeshRef.current = crater;

    const patchGeo = new THREE.CylinderGeometry(0.75, 0.85, 0.04, 20);
    const patch = new THREE.Mesh(patchGeo, mats.freshAsphaltPatch);
    patch.position.y = 0.01;
    patch.scale.set(0.001, 0.001, 0.001);
    potholeGroup.add(patch);
    potholePatchRef.current = patch;

    cityGroup.add(potholeGroup);

    // Defect 2: Overflowing Municipal Dustbin (Sidewalk)
    const wasteBinGroup = new THREE.Group();
    wasteBinGroup.position.set(7.2, 0.22, 7.6);

    const binBody = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.32, 0.9, 16), mats.wasteBinMetal);
    binBody.position.y = 0.45;
    binBody.castShadow = true;
    wasteBinGroup.add(binBody);

    const garbagePile = new THREE.Mesh(new THREE.DodecahedronGeometry(0.26, 1), mats.potholeCrater);
    garbagePile.position.set(0, 1.02, 0);
    wasteBinGroup.add(garbagePile);
    garbagePileRef.current = garbagePile;

    cityGroup.add(wasteBinGroup);

    // 9. 3D HOLOGRAPHIC SPOTFIX ISSUE PINS
    const createSpotFixMarker = ({ id, label, category, colorHex, x, z, y = 0.22, status = 'REPORTED' }) => {
      const g = new THREE.Group();
      g.position.set(x, y, z);
      g.userData = { id, label, category, status, colorHex };

      // Laser Beam
      const beamGeo = new THREE.CylinderGeometry(0.03, 0.09, 2.8, 12);
      const beamMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(colorHex),
        transparent: true,
        opacity: 0.65,
      });
      const beam = new THREE.Mesh(beamGeo, beamMat);
      beam.position.y = 1.4;
      g.add(beam);

      // Holographic Octahedron Head
      const headGeo = new THREE.OctahedronGeometry(0.5, 0);
      const headMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(colorHex),
        emissive: new THREE.Color(colorHex),
        emissiveIntensity: 0.9,
        roughness: 0.15,
        metalness: 0.85,
      });
      const head = new THREE.Mesh(headGeo, headMat);
      head.position.y = 3.0;
      head.castShadow = true;
      g.add(head);

      // Radar Ring
      const ringGeo = new THREE.RingGeometry(0.25, 0.8, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(colorHex),
        transparent: true,
        opacity: 0.75,
        side: THREE.DoubleSide,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.04;
      g.add(ring);

      cityGroup.add(g);
      return { group: g, head, ring, beam, baseY: 3.0 };
    };

    const markers = [
      createSpotFixMarker({ id: 'pth-01', label: 'Road Pothole Hazard', category: 'Pothole', colorHex: '#f59e0b', x: -0.8, z: 1.2, status: 'REPORTED' }),
      createSpotFixMarker({ id: 'stl-02', label: 'Broken Corner Streetlight', category: 'Streetlight', colorHex: '#ef4444', x: -6.8, z: 6.8, status: 'IN_PROGRESS' }),
      createSpotFixMarker({ id: 'grb-03', label: 'Overflowing Public Bin', category: 'Garbage', colorHex: '#f97316', x: 7.2, z: 7.6, status: 'ASSIGNED' }),
      createSpotFixMarker({ id: 'wtr-04', label: 'Water Main Leakage', category: 'Water Leakage', colorHex: '#06b6d4', x: 13.0, z: -6.8, status: 'RESOLVED' }),
    ];
    interactiveMarkersRef.current = markers;

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    // 10. ANIMATION LOOP
    const clock = new THREE.Clock();

    const animate = () => {
      reqIdRef.current = requestAnimationFrame(animate);
      if (document.hidden) return;

      const elapsed = clock.getElapsedTime();

      // Smooth mouse lerp
      mouseSmoothRef.current.x += (mouseTargetRef.current.x - mouseSmoothRef.current.x) * 0.05;
      mouseSmoothRef.current.y += (mouseTargetRef.current.y - mouseSmoothRef.current.y) * 0.05;

      // Smooth scroll lerp
      scrollSmoothRef.current += (scrollProgress - scrollSmoothRef.current) * 0.08;
      const tScroll = Math.max(0, Math.min(0.999, scrollSmoothRef.current));

      const numScenes = SCENE_KEYFRAMES.length;
      const scaled = tScroll * (numScenes - 1);
      const idxA = Math.floor(scaled);
      const idxB = Math.min(numScenes - 1, idxA + 1);
      const alpha = scaled - idxA;

      const kfA = SCENE_KEYFRAMES[idxA];
      const kfB = SCENE_KEYFRAMES[idxB];

      const targetPos = new THREE.Vector3().lerpVectors(kfA.camPos, kfB.camPos, alpha);
      const targetLook = new THREE.Vector3().lerpVectors(kfA.target, kfB.target, alpha);

      // Subtle mouse parallax
      targetPos.x += mouseSmoothRef.current.x * 0.75;
      targetPos.y += mouseSmoothRef.current.y * 0.45;

      camera.position.copy(targetPos);
      camera.lookAt(targetLook);

      // Repair State Transitions
      const repairFactor = THREE.MathUtils.lerp(kfA.potholeFixed, kfB.potholeFixed, alpha);

      if (potholeMeshRef.current && potholePatchRef.current) {
        potholeMeshRef.current.scale.set(
          1 - repairFactor * 0.85,
          1 - repairFactor * 0.85,
          1 - repairFactor * 0.85
        );
        const patchScale = Math.max(0.001, repairFactor);
        potholePatchRef.current.scale.set(patchScale, 1, patchScale);
      }

      if (garbagePileRef.current) {
        garbagePileRef.current.scale.set(
          1 - repairFactor * 0.9,
          1 - repairFactor * 0.9,
          1 - repairFactor * 0.9
        );
      }

      if (brokenLightFixtureRef.current && brokenLightPointRef.current && brokenLightGlowRef.current) {
        const isNight = transitionProgress > 0.4;
        const brokenEmissive = (isNight && repairFactor > 0.5) ? (repairFactor - 0.5) * 2.2 : 0.0;
        brokenLightFixtureRef.current.material.emissiveIntensity = brokenEmissive;
        brokenLightPointRef.current.intensity = brokenEmissive * 2.8;
        brokenLightGlowRef.current.opacity = brokenEmissive * 0.25;
      }

      // Animate Foliage Wind Sway
      treeFoliageListRef.current.forEach((t, i) => {
        const wind = Math.sin(elapsed * 1.8 + i * 0.8) * 0.04;
        t.layer1.rotation.z = wind;
        t.layer2.rotation.x = -wind;
      });

      // Animate Vehicles
      movingVehiclesRef.current.forEach((car) => {
        car.mesh.position.x += car.speed * car.dir;
        if (car.dir > 0 && car.mesh.position.x > car.maxX) car.mesh.position.x = car.minX;
        else if (car.dir < 0 && car.mesh.position.x < car.minX) car.mesh.position.x = car.maxX;
      });

      // Animate Holographic Markers
      interactiveMarkersRef.current.forEach((m, idx) => {
        const floatY = Math.sin(elapsed * 2.5 + idx * 1.2) * 0.15;
        m.head.position.y = m.baseY + floatY;
        m.head.rotation.y = elapsed * 1.5 + idx;

        const ringScale = 1 + (Math.sin(elapsed * 3.0 + idx) * 0.5 + 0.5) * 0.6;
        m.ring.scale.set(ringScale, ringScale, 1);
        m.ring.material.opacity = 0.75 - (ringScale - 1) * 0.75;
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      if (reqIdRef.current) cancelAnimationFrame(reqIdRef.current);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [webglSupported, handleMouseMove, scrollProgress]);

  // Realistic Day / Night Environmental Illumination Transition
  useEffect(() => {
    if (!sceneRef.current || !lightsRef.current.sun || !materialsRef.current.asphalt) return;

    const t = transitionProgress; // 0.0 Day -> 1.0 Night
    const scene = sceneRef.current;
    const lights = lightsRef.current;
    const mats = materialsRef.current;

    const daySky = new THREE.Color(0xebf4ff);
    const nightSky = new THREE.Color(0x060b18);
    const curSky = new THREE.Color().lerpColors(daySky, nightSky, t);

    scene.background = curSky;
    if (scene.fog) scene.fog.color = curSky;

    const sunDay = new THREE.Color(0xfffbeb);
    const moonNight = new THREE.Color(0x60a5fa);
    lights.sun.color.lerpColors(sunDay, moonNight, t);
    lights.sun.intensity = THREE.MathUtils.lerp(2.0, 0.45, t);

    lights.ambient.intensity = THREE.MathUtils.lerp(0.85, 0.28, t);
    lights.hemi.intensity = THREE.MathUtils.lerp(0.7, 0.18, t);

    if (sunMeshRef.current) {
      sunMeshRef.current.material.opacity = 1 - t;
      sunMeshRef.current.scale.setScalar(1 - t * 0.5);
    }
    if (moonMeshRef.current) {
      moonMeshRef.current.material.opacity = t;
      moonMeshRef.current.scale.setScalar(0.5 + t * 0.5);
    }
    if (starsGroupRef.current) {
      starsGroupRef.current.opacity = Math.max(0, (t - 0.3) * 1.4);
    }

    const winIntensity = THREE.MathUtils.lerp(0.0, 1.6, t);
    if (mats.bldgGlassFacade) mats.bldgGlassFacade.emissiveIntensity = THREE.MathUtils.lerp(0.0, 0.4, t);
    if (mats.windowIlluminatedFacade) mats.windowIlluminatedFacade.emissiveIntensity = winIntensity;

    const streetLightIntensity = THREE.MathUtils.lerp(0.0, 2.6, t);
    if (mats.streetlightLens) mats.streetlightLens.emissiveIntensity = THREE.MathUtils.lerp(0.0, 1.8, t);
    if (lights.streetlights) {
      lights.streetlights.forEach((pl) => {
        pl.intensity = streetLightIntensity;
      });
    }

    const carHeadlightIntensity = THREE.MathUtils.lerp(0.4, 3.2, t);
    const carTaillightIntensity = THREE.MathUtils.lerp(0.5, 2.4, t);
    if (mats.carHeadlight) mats.carHeadlight.emissiveIntensity = carHeadlightIntensity;
    if (mats.carTaillight) mats.carTaillight.emissiveIntensity = carTaillightIntensity;

    if (mats.asphalt) {
      mats.asphalt.roughness = THREE.MathUtils.lerp(0.78, 0.38, t);
    }
  }, [transitionProgress]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative overflow-hidden pointer-events-none sm:pointer-events-auto"
      style={{ touchAction: 'pan-y' }}
    />
  );
};

export default SpotFixCityExperience;

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import {
  Sun,
  Moon,
  Compass,
  ArrowRight,
  X,
} from 'lucide-react';

const CATEGORY_META = {
  Pothole: { icon: '🛣️', label: 'Road Pothole', color: '#f59e0b', code: 'PTH' },
  Streetlight: { icon: '💡', label: 'Streetlight Outage', color: '#ef4444', code: 'STL' },
  Garbage: { icon: '🗑️', label: 'Waste Overflow', color: '#f97316', code: 'GRB' },
  'Water Leakage': { icon: '🚰', label: 'Water Pipe Leakage', color: '#06b6d4', code: 'WTR' },
  Drainage: { icon: '🚧', label: 'Drainage Blockage', color: '#8b5cf6', code: 'DRN' },
  Footpath: { icon: '🚶', label: 'Damaged Sidewalk', color: '#eab308', code: 'FP' },
  'Road Damage': { icon: '⚠️', label: 'Road Subsidence', color: '#ef4444', code: 'RD' },
  'Public Facility': { icon: '🏛️', label: 'Public Facility Defect', color: '#3b82f6', code: 'FAC' },
  Other: { icon: '📍', label: 'Civic Hazard', color: '#10b981', code: 'GEN' },
};

const STATUS_COLOR_MAP = {
  REPORTED: '#ef4444',
  UNDER_REVIEW: '#f59e0b',
  APPROVED: '#14b8a6',
  ASSIGNED: '#06b6d4',
  ACCEPTED: '#3b82f6',
  IN_PROGRESS: '#3b82f6',
  COMPLETED: '#10b981',
  VERIFICATION_PENDING: '#a855f7',
  RESOLVED: '#10b981',
  REOPENED: '#f43f5e',
  REJECTED: '#64748b',
  CANCELLED: '#475569',
};

const DEFAULT_CITY_ISSUES = [
  {
    _id: 'ct-stl-01',
    issueId: 'SL-102',
    title: 'Broken Streetlight Pole #4',
    category: 'Streetlight',
    status: 'REPORTED',
    priority: 'HIGH',
    locationName: 'North Tech Avenue & 4th Cross',
    x: -8.5,
    z: 8.5,
  },
  {
    _id: 'ct-pth-02',
    issueId: 'PTH-204',
    title: 'Deep Asphalt Pothole near Crosswalk',
    category: 'Pothole',
    status: 'IN_PROGRESS',
    priority: 'CRITICAL',
    locationName: 'Central Boulevard & Civic Hub',
    x: 4.5,
    z: 4.5,
  },
  {
    _id: 'ct-grb-03',
    issueId: 'GRB-309',
    title: 'Public Dustbin Overflow & Litter',
    category: 'Garbage',
    status: 'UNDER_REVIEW',
    priority: 'MEDIUM',
    locationName: 'East Campus Park Walkway',
    x: 10.5,
    z: -10.5,
  },
  {
    _id: 'ct-wtr-04',
    issueId: 'WTR-412',
    title: 'Subsurface Water Main Leakage',
    category: 'Water Leakage',
    status: 'ASSIGNED',
    priority: 'HIGH',
    locationName: 'South Library Plaza Entrance',
    x: -12.5,
    z: -10.5,
  },
];

// Procedural Canvas Texture Generators for Realistic PBR Surfaces
function generateAsphaltTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#262930';
  ctx.fillRect(0, 0, 512, 512);

  const imgData = ctx.getImageData(0, 0, 512, 512);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 28;
    data[i] = Math.min(255, Math.max(0, data[i] + noise));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
  }
  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(10, 10);
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

      ctx.strokeStyle = 'rgba(100, 116, 139, 0.35)';
      ctx.lineWidth = 1;
      ctx.strokeRect(c * tileSize + 0.5, r * tileSize + 0.5, tileSize - 1, tileSize - 1);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(6, 6);
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

  ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, 512, 512);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

const MinimalThemedCity = ({
  mode = 'interactive',
  issues = [],
  onMarkerClick = null,
  height = '500px',
  showControls = true,
  className = '',
}) => {
  const containerRef = useRef(null);
  const { transitionProgress, toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();

  const [hoveredIssue, setHoveredIssue] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [activeCameraView, setActiveCameraView] = useState('cinematic');
  const [selectedIssueState, setSelectedIssueState] = useState(null);

  const [webglSupported] = useState(() => {
    try {
      const canvas = document.createElement('canvas');
      return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
    } catch {
      return false;
    }
  });

  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const reqIdRef = useRef(null);
  const dynamicLightsRef = useRef({});
  const dynamicMaterialsRef = useRef({});
  const mouseTargetRef = useRef({ x: 0, y: 0 });
  const mouseSmoothRef = useRef({ x: 0, y: 0 });
  const movingVehiclesRef = useRef([]);
  const markersRef = useRef([]);
  const onMarkerClickRef = useRef(onMarkerClick);

  useEffect(() => {
    onMarkerClickRef.current = onMarkerClick;
  }, [onMarkerClick]);

  const activeIssues = issues && issues.length > 0 ? issues : DEFAULT_CITY_ISSUES;

  useEffect(() => {
    if (!webglSupported || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth || window.innerWidth;
    const heightPx = container.clientHeight || 500;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const initialSky = isDark ? 0x060c18 : 0xebf4ff;
    scene.background = new THREE.Color(initialSky);
    scene.fog = new THREE.FogExp2(initialSky, 0.015);

    const camera = new THREE.PerspectiveCamera(40, width / heightPx, 0.4, 300);
    camera.position.set(24, 20, 28);
    camera.lookAt(0, 1.4, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, heightPx);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const asphaltTex = generateAsphaltTexture();
    const sidewalkTex = generateSidewalkPaverTexture();
    const concreteTex = generateConcreteTexture();

    const mats = {
      ground: new THREE.MeshStandardMaterial({ color: 0x181c24, roughness: 0.9, metalness: 0.1 }),
      asphalt: new THREE.MeshStandardMaterial({ map: asphaltTex, roughness: 0.78, metalness: 0.15 }),
      roadMarking: new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3, metalness: 0.05 }),
      roadYellowDivider: new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.35 }),
      curbStone: new THREE.MeshStandardMaterial({ color: 0xa1a1aa, roughness: 0.65, metalness: 0.1 }),
      sidewalkPavers: new THREE.MeshStandardMaterial({ map: sidewalkTex, roughness: 0.7, metalness: 0.05 }),
      tactilePaving: new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.5 }),
      lawnGrass: new THREE.MeshStandardMaterial({ color: 0x2e6f40, roughness: 0.85 }),
      treeTrunk: new THREE.MeshStandardMaterial({ color: 0x4a3b32, roughness: 0.92 }),
      treeCanopy1: new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.6 }),
      treeCanopy2: new THREE.MeshStandardMaterial({ color: 0x388e3c, roughness: 0.55 }),
      bldgConcreteWhite: new THREE.MeshStandardMaterial({ map: concreteTex, roughness: 0.5, metalness: 0.1 }),
      bldgConcreteSlate: new THREE.MeshStandardMaterial({ color: 0x334155, map: concreteTex, roughness: 0.45, metalness: 0.2 }),
      bldgBrickWarm: new THREE.MeshStandardMaterial({ color: 0x9a3412, roughness: 0.7 }),
      bldgBronzeAccent: new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.3, metalness: 0.7 }),
      bldgGlassFacade: new THREE.MeshPhysicalMaterial({
        color: 0x38bdf8,
        roughness: 0.08,
        metalness: 0.88,
        transparent: true,
        opacity: 0.9,
        reflectivity: 0.95,
        clearcoat: 0.9,
        emissive: new THREE.Color(0x0284c7),
        emissiveIntensity: 0.0,
      }),
      windowWarm: new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: new THREE.Color(0xf59e0b), emissiveIntensity: 0.0 }),
      windowCool: new THREE.MeshStandardMaterial({ color: 0xbae6fd, emissive: new THREE.Color(0x0284c7), emissiveIntensity: 0.0 }),
      metalFixture: new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.35, metalness: 0.85 }),
      streetlightLens: new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: new THREE.Color(0xfef08a), emissiveIntensity: 0.0 }),
      trafficGreen: new THREE.MeshStandardMaterial({ color: 0x22c55e, emissive: new THREE.Color(0x22c55e), emissiveIntensity: 1.8 }),
      trafficRed: new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: new THREE.Color(0xef4444), emissiveIntensity: 0.5 }),
      carBlue: new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.2, metalness: 0.8 }),
      carRed: new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.2, metalness: 0.8 }),
      carWhite: new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.15, metalness: 0.7 }),
      carHeadlight: new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: new THREE.Color(0xffffff), emissiveIntensity: 0.4 }),
      carTaillight: new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: new THREE.Color(0xef4444), emissiveIntensity: 0.5 }),
    };
    dynamicMaterialsRef.current = mats;

    const ambient = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambient);

    const hemi = new THREE.HemisphereLight(0xe0f2fe, 0x94a3b8, 0.7);
    scene.add(hemi);

    const sun = new THREE.DirectionalLight(0xfffbeb, 2.0);
    sun.position.set(30, 42, 22);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    scene.add(sun);

    const streetlightPoints = [];
    dynamicLightsRef.current = { ambient, hemi, sun, streetlights: streetlightPoints };

    const cityGroup = new THREE.Group();
    scene.add(cityGroup);

    // Ground Base
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(140, 140), mats.ground);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    cityGroup.add(ground);

    // Roads
    const roadX = new THREE.Mesh(new THREE.PlaneGeometry(100, 11.2), mats.asphalt);
    roadX.rotation.x = -Math.PI / 2;
    roadX.position.y = 0.02;
    roadX.receiveShadow = true;
    cityGroup.add(roadX);

    const roadZ = new THREE.Mesh(new THREE.PlaneGeometry(11.2, 100), mats.asphalt);
    roadZ.rotation.x = -Math.PI / 2;
    roadZ.position.y = 0.02;
    roadZ.receiveShadow = true;
    cityGroup.add(roadZ);

    // Markings
    for (let x = -44; x <= 44; x += 4.0) {
      if (Math.abs(x) < 7.0) continue;
      const dash = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.14), mats.roadMarking);
      dash.rotation.x = -Math.PI / 2;
      dash.position.set(x, 0.03, 0);
      cityGroup.add(dash);
    }

    for (let z = -44; z <= 44; z += 4.0) {
      if (Math.abs(z) < 7.0) continue;
      const dash = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 2.2), mats.roadMarking);
      dash.rotation.x = -Math.PI / 2;
      dash.position.set(0, 0.03, z);
      cityGroup.add(dash);
    }

    // Sidewalks
    const createPlaza = (cx, cz, w, d) => {
      const sw = new THREE.Mesh(new THREE.BoxGeometry(w, 0.22, d), mats.sidewalkPavers);
      sw.position.set(cx, 0.11, cz);
      sw.receiveShadow = true;
      sw.castShadow = true;
      cityGroup.add(sw);

      const curb = new THREE.Mesh(new THREE.BoxGeometry(w + 0.12, 0.26, d + 0.12), mats.curbStone);
      curb.position.set(cx, 0.09, cz);
      cityGroup.add(curb);

      const lawn = new THREE.Mesh(new THREE.BoxGeometry(Math.max(2, w - 5), 0.08, Math.max(2, d - 5)), mats.lawnGrass);
      lawn.position.set(cx + (cx > 0 ? 1.8 : -1.8), 0.24, cz + (cz > 0 ? 1.8 : -1.8));
      lawn.receiveShadow = true;
      cityGroup.add(lawn);
    };

    createPlaza(24, 24, 36, 36);
    createPlaza(-24, 24, 36, 36);
    createPlaza(24, -24, 36, 36);
    createPlaza(-24, -24, 36, 36);

    // Realistic Trees
    const createTree = (x, z, s = 1) => {
      const t = new THREE.Group();
      t.position.set(x, 0.22, z);

      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.14 * s, 0.2 * s, 1.5 * s, 8), mats.treeTrunk);
      trunk.position.y = (1.5 * s) / 2;
      trunk.castShadow = true;
      t.add(trunk);

      const l1 = new THREE.Mesh(new THREE.IcosahedronGeometry(0.95 * s, 1), mats.treeCanopy1);
      l1.position.y = 1.8 * s;
      l1.castShadow = true;
      t.add(l1);

      const l2 = new THREE.Mesh(new THREE.IcosahedronGeometry(0.75 * s, 1), mats.treeCanopy2);
      l2.position.set(0.12 * s, 2.5 * s, 0);
      l2.castShadow = true;
      t.add(l2);

      cityGroup.add(t);
    };

    createTree(8.8, 8.8, 1.15);
    createTree(16.0, 8.8, 0.98);
    createTree(-8.8, 8.8, 1.1);
    createTree(-16.0, 8.8, 1.25);
    createTree(8.8, -8.8, 1.05);
    createTree(-8.8, -8.8, 1.0);

    // Realistic Architectural Towers
    const createTower = (x, z, w, d, h, style = 'glass') => {
      const bldg = new THREE.Group();
      bldg.position.set(x, 0.22, z);

      const podium = new THREE.Mesh(new THREE.BoxGeometry(w, 3.6, d), style === 'brick' ? mats.bldgBrickWarm : mats.bldgConcreteWhite);
      podium.position.y = 1.8;
      podium.castShadow = true;
      podium.receiveShadow = true;
      bldg.add(podium);

      const towerH = h - 3.6;
      const tower = new THREE.Mesh(new THREE.BoxGeometry(w - 0.8, towerH, d - 0.8), style === 'slate' ? mats.bldgConcreteSlate : mats.bldgConcreteWhite);
      tower.position.y = 3.6 + towerH / 2;
      tower.castShadow = true;
      tower.receiveShadow = true;
      bldg.add(tower);

      if (style === 'glass') {
        const glass = new THREE.Mesh(new THREE.BoxGeometry(w - 0.5, towerH * 0.94, 0.15), mats.bldgGlassFacade);
        glass.position.set(0, 3.6 + towerH / 2, d / 2 - 0.3);
        bldg.add(glass);
      }

      const floors = Math.floor(towerH / 2.0);
      const cols = Math.floor((w - 1.2) / 1.8);
      for (let f = 0; f < floors; f++) {
        for (let c = 0; c < cols; c++) {
          if (Math.random() < 0.15) continue;
          const winMat = (f + c) % 2 === 0 ? mats.windowWarm : mats.windowCool;
          const win = new THREE.Mesh(new THREE.PlaneGeometry(0.75, 1.0), winMat);
          win.position.set(-(w - 1.2) / 2 + 0.9 + c * 1.8, 4.4 + f * 2.0, d / 2 - 0.24);
          bldg.add(win);
        }
      }

      // Parapet & HVAC
      const parapet = new THREE.Mesh(new THREE.BoxGeometry(w - 0.6, 0.6, d - 0.6), mats.curbStone);
      parapet.position.y = h + 0.3;
      bldg.add(parapet);

      const hvac = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.9, 1.6), mats.metalFixture);
      hvac.position.set(1.2, h + 0.45, 1.0);
      hvac.castShadow = true;
      bldg.add(hvac);

      cityGroup.add(bldg);
    };

    createTower(24, 24, 16, 16, 20, 'glass');
    createTower(-24, 24, 16, 16, 16, 'slate');
    createTower(24, -24, 16, 16, 18, 'brick');
    createTower(-24, -24, 16, 16, 24, 'glass');

    // Streetlights
    const createLight = (x, z, rotY = 0) => {
      const g = new THREE.Group();
      g.position.set(x, 0.22, z);
      g.rotation.y = rotY;

      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.1, 4.0, 8), mats.metalFixture);
      pole.position.y = 2.0;
      pole.castShadow = true;
      g.add(pole);

      const head = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.08, 0.2), mats.streetlightLens);
      head.position.set(0.95, 4.1, 0);
      g.add(head);

      const pLight = new THREE.PointLight(0xfef08a, 0.0, 14, 1.8);
      pLight.position.set(0.95, 4.0, 0);
      g.add(pLight);
      streetlightPoints.push(pLight);

      cityGroup.add(g);
    };

    createLight(6.8, 6.8, -Math.PI / 4);
    createLight(-6.8, 6.8, Math.PI / 4);
    createLight(6.8, -6.8, -3 * Math.PI / 4);
    createLight(-6.8, -6.8, 3 * Math.PI / 4);

    // Realistic Vehicles
    const createVehicle = (paintMat, laneZ, dir, speed, startX) => {
      const car = new THREE.Group();
      car.position.set(startX, 0.28, laneZ);

      const body = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.55, 1.2), paintMat);
      body.position.y = 0.3;
      body.castShadow = true;
      car.add(body);

      const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.45, 1.05), mats.bldgGlassFacade);
      cabin.position.set(-0.2 * dir, 0.72, 0);
      car.add(cabin);

      const headL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.12, 0.2), mats.carHeadlight);
      headL.position.set(1.25 * dir, 0.3, 0.42);
      car.add(headL);

      const headR = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.12, 0.2), mats.carHeadlight);
      headR.position.set(1.25 * dir, 0.3, -0.42);
      car.add(headR);

      cityGroup.add(car);
      return { mesh: car, dir, speed, minX: -50, maxX: 50 };
    };

    movingVehiclesRef.current = [
      createVehicle(mats.carBlue, 2.0, 1, 0.15, -24),
      createVehicle(mats.carRed, 2.0, 1, 0.20, 12),
      createVehicle(mats.carWhite, -2.0, -1, 0.17, 28),
      createVehicle(mats.carBlue, -2.0, -1, 0.19, -14),
    ];

    // 3D Issue Markers
    const markerObjects = [];

    activeIssues.forEach((issue, idx) => {
      let mx = issue.x !== undefined ? issue.x : ((idx % 2) * 14 - 7);
      let mz = issue.z !== undefined ? issue.z : (((idx % 4) - 1.5) * 9);

      if (issue.latitude && issue.longitude) {
        const dLat = (issue.latitude - 12.9716) * 1000;
        const dLng = (issue.longitude - 77.5946) * 1000;
        if (!isNaN(dLat) && !isNaN(dLng)) {
          mx = Math.max(-32, Math.min(32, dLng));
          mz = Math.max(-32, Math.min(32, -dLat));
        }
      }

      const statusColor = STATUS_COLOR_MAP[issue.status] || '#10b981';
      const categoryColor = CATEGORY_META[issue.category]?.color || statusColor;

      const group = new THREE.Group();
      group.position.set(mx, 0.3, mz);
      group.userData = { issue };

      const beam = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.09, 2.8, 12),
        new THREE.MeshBasicMaterial({ color: new THREE.Color(categoryColor), transparent: true, opacity: 0.65 })
      );
      beam.position.y = 1.4;
      group.add(beam);

      const head = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.5, 0),
        new THREE.MeshStandardMaterial({
          color: new THREE.Color(categoryColor),
          emissive: new THREE.Color(categoryColor),
          emissiveIntensity: 0.9,
          roughness: 0.15,
          metalness: 0.85,
        })
      );
      head.position.y = 3.0;
      head.castShadow = true;
      group.add(head);

      const ring = new THREE.Mesh(
        new THREE.RingGeometry(0.25, 0.8, 24),
        new THREE.MeshBasicMaterial({ color: new THREE.Color(statusColor), transparent: true, opacity: 0.75, side: THREE.DoubleSide })
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.04;
      group.add(ring);

      cityGroup.add(group);
      markerObjects.push({ group, head, ring, issue });
    });

    markersRef.current = markerObjects;

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const mx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const my = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseTargetRef.current = { x: mx, y: my };

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(mx, my), camera);
      const heads = markerObjects.map((m) => m.head);
      const intersects = raycaster.intersectObjects(heads);

      if (intersects.length > 0) {
        const hit = intersects[0].object.parent.userData.issue;
        setHoveredIssue(hit);
        setTooltipPos({ x: e.clientX, y: e.clientY });
        container.style.cursor = 'pointer';
      } else {
        setHoveredIssue(null);
        container.style.cursor = 'default';
      }
    };

    const handleClick = (e) => {
      const rect = container.getBoundingClientRect();
      const mx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const my = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(mx, my), camera);
      const heads = markerObjects.map((m) => m.head);
      const intersects = raycaster.intersectObjects(heads);

      if (intersects.length > 0) {
        const hit = intersects[0].object.parent.userData.issue;
        setSelectedIssueState(hit);
        if (onMarkerClickRef.current) {
          onMarkerClickRef.current(hit);
        } else if (hit._id && !hit._id.startsWith('ct-')) {
          navigate(`/issues/${hit._id}`);
        }
      }
    };

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || 500;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('click', handleClick);

    const clock = new THREE.Clock();

    const animate = () => {
      reqIdRef.current = requestAnimationFrame(animate);
      if (document.hidden) return;

      const elapsed = clock.getElapsedTime();

      mouseSmoothRef.current.x += (mouseTargetRef.current.x - mouseSmoothRef.current.x) * 0.05;
      mouseSmoothRef.current.y += (mouseTargetRef.current.y - mouseSmoothRef.current.y) * 0.05;

      if (activeCameraView === 'cinematic') {
        camera.position.set(24 + mouseSmoothRef.current.x * 2.5, 20 + mouseSmoothRef.current.y * 1.5, 28 - mouseSmoothRef.current.x * 2);
        camera.lookAt(0, 1.4, 0);
      } else if (activeCameraView === 'birdsEye') {
        camera.position.set(0, 42, 10 + mouseSmoothRef.current.y * 2);
        camera.lookAt(0, 0, 0);
      } else if (activeCameraView === 'street') {
        camera.position.set(9 + mouseSmoothRef.current.x * 1.5, 3.8 + mouseSmoothRef.current.y * 0.8, 13);
        camera.lookAt(0, 1.6, 0);
      }

      movingVehiclesRef.current.forEach((car) => {
        car.mesh.position.x += car.speed * car.dir;
        if (car.dir > 0 && car.mesh.position.x > car.maxX) car.mesh.position.x = car.minX;
        else if (car.dir < 0 && car.mesh.position.x < car.minX) car.mesh.position.x = car.maxX;
      });

      markerObjects.forEach((m, idx) => {
        const floatY = Math.sin(elapsed * 2.5 + idx) * 0.15;
        m.head.position.y = 3.0 + floatY;
        m.head.rotation.y = elapsed * 1.5 + idx;

        const ringScale = 1 + (Math.sin(elapsed * 3.0 + idx) * 0.5 + 0.5) * 0.5;
        m.ring.scale.set(ringScale, ringScale, 1);
        m.ring.material.opacity = 0.75 - (ringScale - 1) * 0.75;
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      if (reqIdRef.current) cancelAnimationFrame(reqIdRef.current);
      window.removeEventListener('resize', handleResize);
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('click', handleClick);
        if (renderer.domElement && container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
      }
      renderer.dispose();
    };
  }, [webglSupported, activeIssues, activeCameraView, isDark, navigate]);

  useEffect(() => {
    if (!sceneRef.current || !dynamicLightsRef.current.sun || !dynamicMaterialsRef.current.asphalt) return;

    const t = transitionProgress;
    const scene = sceneRef.current;
    const lights = dynamicLightsRef.current;
    const mats = dynamicMaterialsRef.current;

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

    const winIntensity = THREE.MathUtils.lerp(0.0, 1.6, t);
    if (mats.windowWarm) mats.windowWarm.emissiveIntensity = winIntensity;
    if (mats.windowCool) mats.windowCool.emissiveIntensity = winIntensity * 0.8;
    if (mats.bldgGlassFacade) mats.bldgGlassFacade.emissiveIntensity = THREE.MathUtils.lerp(0.0, 0.4, t);

    const streetLightIntensity = THREE.MathUtils.lerp(0.0, 2.6, t);
    if (mats.streetlightLens) mats.streetlightLens.emissiveIntensity = THREE.MathUtils.lerp(0.0, 1.8, t);
    if (lights.streetlights) {
      lights.streetlights.forEach((pl) => {
        pl.intensity = streetLightIntensity;
      });
    }

    if (mats.asphalt) {
      mats.asphalt.roughness = THREE.MathUtils.lerp(0.78, 0.38, t);
    }
  }, [transitionProgress]);

  return (
    <div
      className={`relative w-full overflow-hidden select-none ${className}`}
      style={{ height }}
    >
      <div ref={containerRef} className="w-full h-full" />

      {showControls && (
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-panel text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-md"
            title="Toggle Day / Night Mode"
          >
            {isDark ? (
              <>
                <Moon className="w-3.5 h-3.5 text-cyan-400" />
                <span>Night City</span>
              </>
            ) : (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>Day City</span>
              </>
            )}
          </button>

          <div className="flex items-center glass-panel rounded-xl p-0.5 text-xs font-semibold">
            {[
              { id: 'cinematic', label: 'Perspective' },
              { id: 'birdsEye', label: 'Aerial' },
              { id: 'street', label: 'Street' },
            ].map((view) => (
              <button
                key={view.id}
                onClick={() => setActiveCameraView(view.id)}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  activeCameraView === view.id
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {view.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {hoveredIssue && (
        <div
          className="fixed pointer-events-none z-50 transform -translate-x-1/2 -translate-y-full mb-3"
          style={{ left: `${tooltipPos.x}px`, top: `${tooltipPos.y}px` }}
        >
          <div className="glass-panel px-3.5 py-2.5 rounded-xl shadow-2xl border border-sky-500/40 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-base">{CATEGORY_META[hoveredIssue.category]?.icon || '📍'}</span>
              <div>
                <p className="font-bold text-slate-900 dark:text-white leading-tight">{hoveredIssue.title}</p>
                <p className="text-[10px] text-sky-600 dark:text-sky-400 font-semibold uppercase">{hoveredIssue.status}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedIssueState && (
        <div className="absolute bottom-4 right-4 z-30 max-w-sm w-full glass-panel p-4 rounded-2xl shadow-2xl border border-sky-500/40 animate-in fade-in duration-150">
          <div className="flex items-start justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">{CATEGORY_META[selectedIssueState.category]?.icon || '📍'}</span>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">{selectedIssueState.title}</h4>
                <p className="text-[10px] text-slate-500">{selectedIssueState.locationName || 'Smart City Zone'}</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedIssueState(null)}
              className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="py-2.5 space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Status:</span>
              <span className="font-bold uppercase text-sky-600 dark:text-sky-400">{selectedIssueState.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Priority:</span>
              <span className="font-bold text-amber-600 dark:text-amber-400">{selectedIssueState.priority || 'MEDIUM'}</span>
            </div>
          </div>

          {selectedIssueState._id && !selectedIssueState._id.startsWith('ct-') && (
            <button
              onClick={() => navigate(`/issues/${selectedIssueState._id}`)}
              className="w-full mt-1 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md"
            >
              <span>View Full Issue Details</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default MinimalThemedCity;

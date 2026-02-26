"use client";

/**
 * VisitorGlobe.tsx
 *
 * 3-D WebGL globe using Three.js.
 * Country borders are fetched from /api/geo/countries (served from MongoDB).
 *
 * Dynamic-import this in AnalyticsDashboard.tsx:
 *   const VisitorGlobe = dynamic(() => import("./VisitorGlobe"), { ssr: false })
 */

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

interface GroupedLocation {
  country: string;
  region: string | null;
  lat: number;
  lon: number;
  count: number;
}

interface Props {
  locations: GroupedLocation[];
}

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  country: string;
  region: string | null;
  count: number;
}

const R      = 2;
const ACCENT = "#d63031";
const DOT_PALETTE = [
  "#d63031", "#74b9ff", "#55efc4", "#fdcb6e",
  "#a29bfe", "#fd79a8", "#00cec9", "#e17055",
];

function latLonToVec3(lat: number, lon: number, r: number): THREE.Vector3 {
  const phi   = (90 - lat)  * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
     r * Math.cos(phi),
     r * Math.sin(phi) * Math.sin(theta),
  );
}

function buildCountryLines(geojson: any, r: number): THREE.LineSegments {
  const verts: number[] = [];
  const ring = (coords: [number, number][]) => {
    for (let i = 0; i < coords.length - 1; i++) {
      const a = latLonToVec3(coords[i]![1],     coords[i]![0],     r);
      const b = latLonToVec3(coords[i + 1]![1], coords[i + 1]![0], r);
      verts.push(a.x, a.y, a.z, b.x, b.y, b.z);
    }
  };
  const geom = (g: any) => {
    if (!g) return;
    if (g.type === "Polygon")      g.coordinates.forEach(ring);
    if (g.type === "MultiPolygon") g.coordinates.forEach((p: any) => p.forEach(ring));
  };
  if (geojson.type === "FeatureCollection") geojson.features.forEach((f: any) => geom(f.geometry));
  else if (geojson.type === "Feature")      geom(geojson.geometry);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
  return new THREE.LineSegments(
    geo,
    new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.55 }),
  );
}

export default function VisitorGlobe({ locations }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const pivotRef = useRef<THREE.Group | null>(null);
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false, x: 0, y: 0, country: "", region: null, count: 0,
  });
  const [geoStatus, setGeoStatus] = useState<"loading" | "ok" | "error">("loading");

  const countryColor: Record<string, string> = {};
  locations.forEach((loc) => {
    if (!countryColor[loc.country]) {
      countryColor[loc.country] = DOT_PALETTE[Object.keys(countryColor).length % DOT_PALETTE.length]!;
    }
  });
  const maxCount = Math.max(...locations.map((l) => l.count), 1);

  // ── Bootstrap Three.js scene ─────────────────────────────────────────────────
  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    let animId = 0;
    let isDragging = false;
    let prevMouse  = { x: 0, y: 0 };
    let rotVelX = 0, rotVelY = 0;
    let autoRotate = true;
    let resumeTimer: ReturnType<typeof setTimeout> | null = null;
    const clampX = (v: number) => Math.max(-1.1, Math.min(1.1, v));

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(el.clientWidth, el.clientHeight);
    el.appendChild(renderer.domElement);

    // Scene / Camera
    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, el.clientWidth / el.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 6);

    // Pivot
    const pivot = new THREE.Group();
    pivotRef.current = pivot;
    scene.add(pivot);

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.45));
    const sun = new THREE.DirectionalLight(0xd0eaff, 1.2);
    sun.position.set(6, 4, 6);
    scene.add(sun);
    const fill = new THREE.DirectionalLight(0x2255aa, 0.3);
    fill.position.set(-5, -3, -4);
    scene.add(fill);

    // Ocean sphere
    pivot.add(new THREE.Mesh(
      new THREE.SphereGeometry(R, 72, 72),
      new THREE.MeshPhongMaterial({ color: 0x061020, emissive: 0x020810, specular: 0x1a4a8a, shininess: 28 }),
    ));

    // Atmosphere glow (fixed, not in pivot)
    scene.add(new THREE.Mesh(
      new THREE.SphereGeometry(R * 1.065, 64, 64),
      new THREE.MeshPhongMaterial({ color: 0x1a5599, transparent: true, opacity: 0.1, side: THREE.BackSide }),
    ));

    // Stars
    const starPos: number[] = [];
    for (let i = 0; i < 1800; i++) {
      const v = new THREE.Vector3((Math.random() - 0.5) * 120, (Math.random() - 0.5) * 120, (Math.random() - 0.5) * 120);
      if (v.length() > 12) starPos.push(v.x, v.y, v.z);
    }
    const sg = new THREE.BufferGeometry();
    sg.setAttribute("position", new THREE.Float32BufferAttribute(starPos, 3));
    scene.add(new THREE.Points(sg, new THREE.PointsMaterial({ color: 0x7799cc, size: 0.065, transparent: true, opacity: 0.55 })));

    // Visitor dots
    const dotObjects: { mesh: THREE.Mesh; loc: GroupedLocation }[] = [];
    locations.forEach((loc) => {
      const color = new THREE.Color(countryColor[loc.country] ?? ACCENT);
      const scale = 0.6 + (loc.count / maxCount) * 1.3;
      const dotR  = 0.032 * scale;
      const halo  = new THREE.Mesh(
        new THREE.CircleGeometry(dotR * 2.8, 24),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.2, side: THREE.DoubleSide }),
      );
      const core  = new THREE.Mesh(
        new THREE.CircleGeometry(dotR, 24),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.95, side: THREE.DoubleSide }),
      );
      core.add(halo);
      const pos = latLonToVec3(loc.lat, loc.lon, R + 0.022);
      core.position.copy(pos);
      core.lookAt(new THREE.Vector3(0, 0, 0));
      core.rotateX(Math.PI);
      pivot.add(core);
      dotObjects.push({ mesh: core, loc });
    });

    // Raycaster
    const raycaster = new THREE.Raycaster();
    const mouse2d   = new THREE.Vector2();

    // Mouse/touch events
    const onMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      mouse2d.set(
        ((e.clientX - rect.left) / rect.width)  * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1,
      );
      if (isDragging) {
        rotVelY = (e.clientX - prevMouse.x) * 0.005;
        rotVelX = (e.clientY - prevMouse.y) * 0.005;
        pivot.rotation.y += rotVelY;
        pivot.rotation.x = clampX(pivot.rotation.x + rotVelX);
        prevMouse = { x: e.clientX, y: e.clientY };
      }
      raycaster.setFromCamera(mouse2d, camera);
      const hits = raycaster.intersectObjects(dotObjects.map((d) => d.mesh), false);
      if (hits.length) {
        const found = dotObjects.find((d) => d.mesh === hits[0]!.object);
        if (found) {
          el.style.cursor = "pointer";
          setTooltip({ visible: true, x: e.clientX - rect.left, y: e.clientY - rect.top, ...found.loc });
          return;
        }
      }
      el.style.cursor = isDragging ? "grabbing" : "grab";
      setTooltip((t) => ({ ...t, visible: false }));
    };
    const onMouseDown = (e: MouseEvent) => {
      isDragging = true; autoRotate = false;
      if (resumeTimer) clearTimeout(resumeTimer);
      prevMouse = { x: e.clientX, y: e.clientY };
      el.style.cursor = "grabbing";
    };
    const onMouseUp = () => {
      isDragging = false; el.style.cursor = "grab";
      resumeTimer = setTimeout(() => { autoRotate = true; }, 2500);
    };
    const onMouseLeave = () => {
      isDragging = false;
      setTooltip((t) => ({ ...t, visible: false }));
    };
    const onTouchStart = (e: TouchEvent) => {
      isDragging = true; autoRotate = false;
      if (resumeTimer) clearTimeout(resumeTimer);
      prevMouse = { x: e.touches[0]!.clientX, y: e.touches[0]!.clientY };
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      rotVelY = (e.touches[0]!.clientX - prevMouse.x) * 0.005;
      rotVelX = (e.touches[0]!.clientY - prevMouse.y) * 0.005;
      pivot.rotation.y += rotVelY;
      pivot.rotation.x = clampX(pivot.rotation.x + rotVelX);
      prevMouse = { x: e.touches[0]!.clientX, y: e.touches[0]!.clientY };
    };
    const onTouchEnd = () => {
      isDragging = false;
      resumeTimer = setTimeout(() => { autoRotate = true; }, 2500);
    };

    el.addEventListener("mousemove",  onMouseMove);
    el.addEventListener("mousedown",  onMouseDown);
    el.addEventListener("mouseup",    onMouseUp);
    el.addEventListener("mouseleave", onMouseLeave);
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove",  onTouchMove,  { passive: true });
    el.addEventListener("touchend",   onTouchEnd);
    el.style.cursor = "grab";

    const ro = new ResizeObserver(() => {
      renderer.setSize(el.clientWidth, el.clientHeight);
      camera.aspect = el.clientWidth / el.clientHeight;
      camera.updateProjectionMatrix();
    });
    ro.observe(el);

    const clock = new THREE.Clock();
    const tick = () => {
      animId = requestAnimationFrame(tick);
      const t = clock.getElapsedTime();
      if (autoRotate && !isDragging) pivot.rotation.y += 0.0015;
      if (!isDragging) {
        rotVelX *= 0.88; rotVelY *= 0.88;
        pivot.rotation.x = clampX(pivot.rotation.x + rotVelX);
        pivot.rotation.y += rotVelY;
      }
      dotObjects.forEach(({ mesh }, i) => {
        mesh.scale.setScalar(1 + 0.07 * Math.sin(t * 2.2 + i * 1.1));
      });
      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(animId);
      if (resumeTimer) clearTimeout(resumeTimer);
      ro.disconnect();
      el.removeEventListener("mousemove",  onMouseMove);
      el.removeEventListener("mousedown",  onMouseDown);
      el.removeEventListener("mouseup",    onMouseUp);
      el.removeEventListener("mouseleave", onMouseLeave);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove",  onTouchMove);
      el.removeEventListener("touchend",   onTouchEnd);
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
      pivotRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locations]);

  // ── Fetch country borders from internal API → inject into pivot ──────────────
  useEffect(() => {
    let cancelled = false;
    fetch("/api/geo/countries")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((geojson) => {
        if (cancelled) return;
        // Pivot may not exist yet if Three.js hasn't mounted — retry until it does
        const inject = () => {
          if (!pivotRef.current) { setTimeout(inject, 100); return; }
          pivotRef.current.add(buildCountryLines(geojson, R + 0.01));
          setGeoStatus("ok");
        };
        inject();
      })
      .catch(() => { if (!cancelled) setGeoStatus("error"); });
    return () => { cancelled = true; };
  }, []);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <div
        ref={mountRef}
        style={{ width: "100%", height: "100%", borderRadius: "0.75rem", overflow: "hidden" }}
      />

      {/* Country borders loading badge */}
      {geoStatus === "loading" && (
        <div style={{
          position: "absolute", top: 12, left: 14,
          fontSize: 10, fontFamily: "'JetBrains Mono', monospace",
          color: "#38bdf8", pointerEvents: "none",
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <span style={{
            display: "inline-block", width: 6, height: 6, borderRadius: "50%",
            background: "#38bdf8", animation: "livepulse 1.2s infinite",
          }} />
          Loading country borders…
        </div>
      )}

      {geoStatus === "error" && (
        <div style={{
          position: "absolute", top: 12, left: 14,
          fontSize: 10, fontFamily: "'JetBrains Mono', monospace",
          color: "#d63031", pointerEvents: "none",
        }}>
          ⚠ Country data unavailable — run: npx tsx scripts/seed-geojson.ts
        </div>
      )}

      {/* Tooltip */}
      {tooltip.visible && (
        <div style={{
          position: "absolute", left: tooltip.x + 14, top: tooltip.y - 10,
          pointerEvents: "none", background: "#18181b",
          border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10,
          padding: "8px 12px", fontSize: 11,
          fontFamily: "'JetBrains Mono', monospace",
          lineHeight: 1.65, boxShadow: "0 8px 32px rgba(0,0,0,0.7)",
          zIndex: 50, minWidth: 130,
        }}>
          <p style={{ margin: 0, fontWeight: 700, color: "#f4f4f5", fontSize: 12 }}>{tooltip.country}</p>
          {tooltip.region && <p style={{ margin: "1px 0 0", color: "#71717a" }}>{tooltip.region}</p>}
          <p style={{ margin: "4px 0 0", color: ACCENT, fontWeight: 600 }}>
            {tooltip.count} visitor{tooltip.count !== 1 ? "s" : ""}
          </p>
        </div>
      )}

      <div style={{
        position: "absolute", bottom: 12, right: 14,
        fontSize: 10, fontFamily: "'JetBrains Mono', monospace",
        color: "#3f3f46", pointerEvents: "none", letterSpacing: "0.05em",
      }}>
        drag to rotate
      </div>
    </div>
  );
}
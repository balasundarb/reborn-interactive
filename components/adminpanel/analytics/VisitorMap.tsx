"use client";

/**
 * VisitorGlobe.tsx — Enhanced Edition
 *
 * Features:
 *  - Filled landmass polygons (dark teal) + bright border lines
 *  - Glowing dot markers that softly breathe in opacity
 *  - Animated connection arcs between top visitor locations
 *  - Dot-matrix atmosphere (particle ring)
 *  - Specular ocean with fresnel-like rim glow
 *  - Scroll to zoom in/out
 *  - Click a dot to focus & zoom into it
 *  - Rotation stops on any hover
 *  - Smooth drag + inertia + auto-rotate
 *  - Hover tooltip
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

const R = 2;
const ACCENT = "#d63031";
const MIN_Z = 3.5;
const MAX_Z = 9.0;

const DOT_PALETTE = [
  "#ff6b6b", "#74b9ff", "#55efc4", "#fdcb6e",
  "#a29bfe", "#fd79a8", "#00cec9", "#e17055",
  "#81ecec", "#fab1a0",
];

// ── Math helpers ──────────────────────────────────────────────────────────────

function latLonToVec3(lat: number, lon: number, r: number): THREE.Vector3 {
  const phi   = (90 - lat)  * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
     r * Math.cos(phi),
     r * Math.sin(phi) * Math.sin(theta),
  );
}

function slerpVec3(a: THREE.Vector3, b: THREE.Vector3, t: number): THREE.Vector3 {
  const angle = a.angleTo(b);
  if (angle < 0.001) return a.clone().lerp(b, t);
  const sinAngle = Math.sin(angle);
  return a.clone()
    .multiplyScalar(Math.sin((1 - t) * angle) / sinAngle)
    .add(b.clone().multiplyScalar(Math.sin(t * angle) / sinAngle));
}

// ── GeoJSON → filled landmasses ───────────────────────────────────────────────

function buildLandMeshes(geojson: any, r: number): THREE.Group {
  const group = new THREE.Group();
  const landMat = new THREE.MeshPhongMaterial({
    color:    0x0d3b2e,
    emissive: 0x051a14,
    specular: 0x1a6b50,
    shininess: 8,
    side: THREE.FrontSide,
  });

  const processPolygon = (rings: [number, number][][]) => {
    const outer = rings[0]!;
    if (outer.length < 3) return;
    const verts: number[] = [];
    let cx = 0, cy = 0;
    outer.forEach(([lon, lat]) => { cx += lon; cy += lat; });
    cx /= outer.length; cy /= outer.length;
    const center = latLonToVec3(cy, cx, r + 0.004);
    for (let i = 0; i < outer.length - 1; i++) {
      const a = latLonToVec3(outer[i]![1],     outer[i]![0],     r + 0.004);
      const b = latLonToVec3(outer[i + 1]![1], outer[i + 1]![0], r + 0.004);
      verts.push(center.x, center.y, center.z, a.x, a.y, a.z, b.x, b.y, b.z);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
    geo.computeVertexNormals();
    group.add(new THREE.Mesh(geo, landMat));
  };

  const processGeometry = (g: any) => {
    if (!g) return;
    if (g.type === "Polygon")      processPolygon(g.coordinates);
    if (g.type === "MultiPolygon") g.coordinates.forEach(processPolygon);
  };

  if (geojson.type === "FeatureCollection")
    geojson.features.forEach((f: any) => processGeometry(f.geometry));

  return group;
}

function buildBorderLines(geojson: any, r: number): THREE.LineSegments {
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
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
  return new THREE.LineSegments(
    geo,
    new THREE.LineBasicMaterial({ color: 0x1affb2, transparent: true, opacity: 0.35 }),
  );
}

// ── Glowing dot marker ────────────────────────────────────────────────────────

function buildSpike(loc: GroupedLocation, maxCount: number, color: THREE.Color): THREE.Group {
  const group = new THREE.Group();
  const scale = 0.4 + (loc.count / maxCount) * 1.6;
  const radius = 0.022 + scale * 0.018;

  // Core dot
  const coreMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 1 });
  const core = new THREE.Mesh(new THREE.SphereGeometry(radius, 16, 16), coreMat);
  core.userData.type = "core";
  group.add(core);

  // Soft glow shell
  const glowMat = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.18,
    side: THREE.FrontSide,
  });
  const glow = new THREE.Mesh(new THREE.SphereGeometry(radius * 2.4, 16, 16), glowMat);
  glow.userData.type = "glow";
  group.add(glow);

  const pos = latLonToVec3(loc.lat, loc.lon, R + radius);
  group.position.copy(pos);

  return group;
}

// ── Animated arc ──────────────────────────────────────────────────────────────

function buildArc(from: GroupedLocation, to: GroupedLocation, color: THREE.Color): THREE.Line {
  const points: THREE.Vector3[] = [];
  const segments = 60;
  const arcHeight = 0.5;
  const vA = latLonToVec3(from.lat, from.lon, R + 0.015);
  const vB = latLonToVec3(to.lat,   to.lon,   R + 0.015);
  for (let i = 0; i <= segments; i++) {
    const t  = i / segments;
    const pt = slerpVec3(vA.clone().normalize(), vB.clone().normalize(), t);
    const h  = R + 0.015 + arcHeight * Math.sin(t * Math.PI);
    points.push(pt.multiplyScalar(h));
  }
  const geo = new THREE.BufferGeometry().setFromPoints(points);
  return new THREE.Line(
    geo,
    new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.55 }),
  );
}

// ── Particle atmosphere ───────────────────────────────────────────────────────

function buildAtmosphereParticles(): THREE.Points {
  const count = 2000;
  const pos: number[] = [];
  for (let i = 0; i < count; i++) {
    const r     = R * 1.07 + Math.random() * R * 0.11;
    const theta = Math.random() * Math.PI * 2;
    const phi   = Math.acos(2 * Math.random() - 1);
    pos.push(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.cos(phi),
      r * Math.sin(phi) * Math.sin(theta),
    );
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  return new THREE.Points(
    geo,
    new THREE.PointsMaterial({ color: 0x4af0c0, size: 0.012, transparent: true, opacity: 0.35 }),
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function VisitorGlobe({ locations }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;
    let animId  = 0;
    let cancelled = false;

    fetch("/api/geo/countries")
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((geojson) => {
        if (cancelled) return;
        setGeoStatus("ok");
        buildScene(geojson);
      })
      .catch(() => {
        if (cancelled) return;
        setGeoStatus("error");
        buildScene(null);
      });

    function buildScene(geojson: any) {
      if (!el || cancelled) return;

      let isDragging  = false;
      let isHovering  = false;
      let prevMouse   = { x: 0, y: 0 };
      let rotVelX = 0, rotVelY = 0;
      let autoRotate  = true;
      let resumeTimer: ReturnType<typeof setTimeout> | null = null;

      const clampX = (v: number) => Math.max(-0.9, Math.min(0.9, v));

      // ── Renderer ──────────────────────────────────────────────────────────
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x000000, 0);
      renderer.setSize(el.clientWidth, el.clientHeight);
      el.appendChild(renderer.domElement);

      // ── Scene / Camera ─────────────────────────────────────────────────────
      const scene  = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(40, el.clientWidth / el.clientHeight, 0.1, 200);
      camera.position.set(0, 0, 6.2);

      // ── Pivot ──────────────────────────────────────────────────────────────
      const pivot = new THREE.Group();
      scene.add(pivot);

      // ── Lights ────────────────────────────────────────────────────────────
      scene.add(new THREE.AmbientLight(0x112233, 1.2));
      const sun = new THREE.DirectionalLight(0x88ccff, 1.8);
      sun.position.set(8, 5, 6);
      scene.add(sun);
      const back = new THREE.DirectionalLight(0x001133, 0.6);
      back.position.set(-6, -3, -5);
      scene.add(back);
      const rim = new THREE.DirectionalLight(0x00ffaa, 0.4);
      rim.position.set(-4, 0, -4);
      scene.add(rim);

      // ── Ocean ──────────────────────────────────────────────────────────────
      pivot.add(new THREE.Mesh(
        new THREE.SphereGeometry(R, 80, 80),
        new THREE.MeshPhongMaterial({
          color:     0x020f1e,
          emissive:  0x010810,
          specular:  new THREE.Color(0x0a4080),
          shininess: 40,
        }),
      ));

      // ── Land + borders ─────────────────────────────────────────────────────
      if (geojson) {
        pivot.add(buildLandMeshes(geojson, R));
        pivot.add(buildBorderLines(geojson, R + 0.006));
      }

      // ── Graticule ──────────────────────────────────────────────────────────
      const gratVerts: number[] = [];
      for (let lat = -80; lat <= 80; lat += 20) {
        const phi = (90 - lat) * (Math.PI / 180);
        const rr  = (R + 0.002) * Math.sin(phi);
        const y   = (R + 0.002) * Math.cos(phi);
        for (let i = 0; i <= 128; i++) {
          const t0 = (i / 128) * Math.PI * 2;
          const t1 = ((i + 1) / 128) * Math.PI * 2;
          gratVerts.push(rr * Math.cos(t0), y, rr * Math.sin(t0), rr * Math.cos(t1), y, rr * Math.sin(t1));
        }
      }
      for (let lon = 0; lon < 360; lon += 20) {
        const th = lon * (Math.PI / 180);
        for (let i = 0; i <= 128; i++) {
          const t0 = (i / 128) * Math.PI, t1 = ((i + 1) / 128) * Math.PI;
          const r2 = R + 0.002;
          gratVerts.push(
            -r2 * Math.sin(t0) * Math.cos(th), r2 * Math.cos(t0), r2 * Math.sin(t0) * Math.sin(th),
            -r2 * Math.sin(t1) * Math.cos(th), r2 * Math.cos(t1), r2 * Math.sin(t1) * Math.sin(th),
          );
        }
      }
      const gratGeo = new THREE.BufferGeometry();
      gratGeo.setAttribute("position", new THREE.Float32BufferAttribute(gratVerts, 3));
      pivot.add(new THREE.LineSegments(
        gratGeo,
        new THREE.LineBasicMaterial({ color: 0x0a2a1a, transparent: true, opacity: 0.4 }),
      ));

      // ── Atmosphere ─────────────────────────────────────────────────────────
      scene.add(new THREE.Mesh(
        new THREE.SphereGeometry(R * 1.04, 64, 64),
        new THREE.MeshPhongMaterial({ color: 0x004422, transparent: true, opacity: 0.07, side: THREE.BackSide }),
      ));
      scene.add(new THREE.Mesh(
        new THREE.SphereGeometry(R * 1.12, 64, 64),
        new THREE.MeshPhongMaterial({ color: 0x002244, transparent: true, opacity: 0.05, side: THREE.BackSide }),
      ));
      scene.add(buildAtmosphereParticles());

      // ── Stars ──────────────────────────────────────────────────────────────
      const starPos: number[] = [];
      for (let i = 0; i < 2500; i++) {
        const v = new THREE.Vector3(
          (Math.random() - 0.5) * 160,
          (Math.random() - 0.5) * 160,
          (Math.random() - 0.5) * 160,
        );
        if (v.length() > 15) starPos.push(v.x, v.y, v.z);
      }
      const sg = new THREE.BufferGeometry();
      sg.setAttribute("position", new THREE.Float32BufferAttribute(starPos, 3));
      scene.add(new THREE.Points(
        sg,
        new THREE.PointsMaterial({ color: 0x88aacc, size: 0.05, transparent: true, opacity: 0.6 }),
      ));

      // ── Visitor dots ───────────────────────────────────────────────────────
      const spikeGroups: THREE.Group[] = [];
      const spikeHitMeshes: { mesh: THREE.Mesh; loc: GroupedLocation }[] = [];

      locations.forEach((loc) => {
        const color = new THREE.Color(countryColor[loc.country] ?? ACCENT);
        const spike = buildSpike(loc, maxCount, color);
        pivot.add(spike);
        spikeGroups.push(spike);

        // Hit sphere for raycasting
        const hitMesh = new THREE.Mesh(
          new THREE.SphereGeometry(0.1, 8, 8),
          new THREE.MeshBasicMaterial({ visible: false }),
        );
        hitMesh.position.copy(latLonToVec3(loc.lat, loc.lon, R + 0.05));
        pivot.add(hitMesh);
        spikeHitMeshes.push({ mesh: hitMesh, loc });
      });

      // ── Connection arcs ────────────────────────────────────────────────────
      const top = [...locations].sort((a, b) => b.count - a.count).slice(0, 6);
      for (let i = 0; i < top.length - 1; i++) {
        const color = new THREE.Color(countryColor[top[i]!.country] ?? ACCENT);
        color.lerp(new THREE.Color(0x00ffaa), 0.4);
        pivot.add(buildArc(top[i]!, top[(i + 1) % top.length]!, color));
      }

      // ── Raycaster ──────────────────────────────────────────────────────────
      const raycaster = new THREE.Raycaster();
      const mouse2d   = new THREE.Vector2();

      // ── Scroll to zoom ─────────────────────────────────────────────────────
      const onWheel = (e: WheelEvent) => {
        e.preventDefault();
        camera.position.z = Math.max(MIN_Z, Math.min(MAX_Z, camera.position.z + e.deltaY * 0.005));
      };

      // ── Mouse events ───────────────────────────────────────────────────────
      const onMouseMove = (e: MouseEvent) => {
        const rect = el.getBoundingClientRect();
        isHovering = true;
        mouse2d.set(
          ((e.clientX - rect.left) / rect.width)  * 2 - 1,
          -((e.clientY - rect.top) / rect.height) * 2 + 1,
        );
        if (isDragging) {
          rotVelY = (e.clientX - prevMouse.x) * 0.005;
          rotVelX = (e.clientY - prevMouse.y) * 0.005;
          pivot.rotation.y += rotVelY;
          pivot.rotation.x  = clampX(pivot.rotation.x + rotVelX);
          prevMouse = { x: e.clientX, y: e.clientY };
        }
        raycaster.setFromCamera(mouse2d, camera);
        const hits = raycaster.intersectObjects(spikeHitMeshes.map((s) => s.mesh), false);
        if (hits.length) {
          const found = spikeHitMeshes.find((s) => s.mesh === hits[0]!.object);
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
        isDragging = false; isHovering = false;
        setTooltip((t) => ({ ...t, visible: false }));
      };
      const onMouseEnter = () => { isHovering = true; };

      // ── Touch events ───────────────────────────────────────────────────────
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
      el.addEventListener("mouseenter", onMouseEnter);
      el.addEventListener("wheel",      onWheel, { passive: false });
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

      // ── Render loop ────────────────────────────────────────────────────────
      const clock = new THREE.Clock();
      const tick = () => {
        animId = requestAnimationFrame(tick);
        const t = clock.getElapsedTime();

        // Normal rotation — paused while hovering
          if (autoRotate && !isDragging && !isHovering) pivot.rotation.y += 0.0012;
          if (!isDragging) {
            rotVelX *= 0.88; rotVelY *= 0.88;
            pivot.rotation.x = clampX(pivot.rotation.x + rotVelX);
            pivot.rotation.y += rotVelY;
          }

        // Breathe dots
        spikeGroups.forEach((g, i) => {
          g.children.forEach((child) => {
            const mat = (child as THREE.Mesh).material as THREE.MeshBasicMaterial;
            if (child.userData.type === "core") {
              mat.opacity = 0.75 + 0.25 * Math.sin(t * 1.6 + i * 0.7);
            } else if (child.userData.type === "glow") {
              mat.opacity = 0.08 + 0.12 * Math.sin(t * 1.6 + i * 0.7 + 0.8);
            }
          });
        });

        // Zoom-aware dot sizing
        const zoomFactor = (camera.position.z - MIN_Z) / (MAX_Z - MIN_Z); // 0 = close, 1 = far
        const dotScale = 0.5 + zoomFactor * 0.8; // shrinks as you zoom in
        spikeGroups.forEach((g) => {
          g.scale.setScalar(dotScale);
        });

        // Animate arc opacity
        pivot.traverse((obj) => {
          if (obj instanceof THREE.Line) {
            const mat = obj.material as THREE.LineBasicMaterial;
            if (mat.opacity < 0.8) {
              mat.opacity = 0.3 + 0.25 * Math.sin(t * 1.5 + obj.id * 0.3);
            }
          }
        });

        renderer.render(scene, camera);
      };
      tick();

      cleanup = () => {
        cancelAnimationFrame(animId);
        if (resumeTimer) clearTimeout(resumeTimer);
        ro.disconnect();
        el.removeEventListener("mousemove",  onMouseMove);
        el.removeEventListener("mousedown",  onMouseDown);
        el.removeEventListener("mouseup",    onMouseUp);
        el.removeEventListener("mouseleave", onMouseLeave);
        el.removeEventListener("mouseenter", onMouseEnter);
        el.removeEventListener("wheel",      onWheel);
        el.removeEventListener("touchstart", onTouchStart);
        el.removeEventListener("touchmove",  onTouchMove);
        el.removeEventListener("touchend",   onTouchEnd);
        renderer.dispose();
        if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
      };
    }

    let cleanup: (() => void) | null = null;
    return () => { cancelled = true; cancelAnimationFrame(animId); cleanup?.(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locations]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", background: "#020d18", borderRadius: "0.75rem" }}>
      <div
        ref={mountRef}
        style={{ width: "100%", height: "100%", borderRadius: "0.75rem", overflow: "hidden" }}
      />

      {/* Vignette overlay */}
      <div style={{
        position: "absolute", inset: 0, borderRadius: "0.75rem", pointerEvents: "none",
        background: "radial-gradient(ellipse at center, transparent 55%, rgba(2,13,24,0.7) 100%)",
      }} />

      {/* Status badges */}
      {geoStatus === "loading" && (
        <div style={{
          position: "absolute", top: 14, left: 16, fontSize: 10,
          fontFamily: "'JetBrains Mono', monospace", color: "#1affb2",
          pointerEvents: "none", display: "flex", alignItems: "center", gap: 6,
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: "50%", background: "#1affb2",
            display: "inline-block", animation: "livepulse 1s infinite",
          }} />
          Loading terrain…
        </div>
      )}
      {geoStatus === "error" && (
        <div style={{
          position: "absolute", top: 14, left: 16, fontSize: 10,
          fontFamily: "'JetBrains Mono', monospace", color: "#d63031", pointerEvents: "none",
        }}>
          ⚠ Run: npx tsx scripts/seed-geojson.ts
        </div>
      )}

      {/* Legend */}
      {geoStatus === "ok" && locations.length > 0 && (
        <div style={{
          position: "absolute", top: 14, left: 16,
          display: "flex", flexDirection: "column", gap: 5, pointerEvents: "none",
        }}>
          {[...locations].sort((a, b) => b.count - a.count).slice(0, 5).map((loc, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{
                width: 8, height: 8, borderRadius: "50%",
                background: countryColor[loc.country] ?? ACCENT,
                display: "inline-block",
                boxShadow: `0 0 6px ${countryColor[loc.country] ?? ACCENT}`,
              }} />
              <span style={{
                fontSize: 9, fontFamily: "'JetBrains Mono', monospace",
                color: "#a0b4c0",
                letterSpacing: "0.04em",
              }}>
                {loc.country} <span style={{ color: countryColor[loc.country] ?? ACCENT }}>×{loc.count}</span>
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Tooltip */}
      {tooltip.visible && (
        <div style={{
          position: "absolute", left: tooltip.x + 16, top: tooltip.y - 12,
          pointerEvents: "none", background: "rgba(2,13,24,0.92)",
          border: "1px solid rgba(26,255,178,0.2)", borderRadius: 10,
          padding: "8px 14px", fontSize: 11,
          fontFamily: "'JetBrains Mono', monospace",
          lineHeight: 1.7, boxShadow: "0 8px 32px rgba(0,0,0,0.8), 0 0 20px rgba(26,255,178,0.1)",
          zIndex: 50, minWidth: 140, backdropFilter: "blur(8px)",
        }}>
          <p style={{ margin: 0, fontWeight: 700, color: "#e8f4f0", fontSize: 12 }}>{tooltip.country}</p>
          {tooltip.region && <p style={{ margin: "1px 0 0", color: "#4a7a6a", fontSize: 10 }}>{tooltip.region}</p>}
          <p style={{ margin: "5px 0 0", color: "#1affb2", fontWeight: 600 }}>
            {tooltip.count} visitor{tooltip.count !== 1 ? "s" : ""}
          </p>
        </div>
      )}

      {/* Hint */}
      <div style={{
        position: "absolute", bottom: 14, right: 16,
        fontSize: 9, fontFamily: "'JetBrains Mono', monospace",
        color: "#1a3a2a", pointerEvents: "none", letterSpacing: "0.08em", textTransform: "uppercase",
      }}>
        scroll · drag
      </div>
    </div>
  );
}
"use client";

import { useEffect, useRef, useState } from "react";
import type * as THREE_NS from "three";
import { useReducedMotion } from "motion/react";
import { cssColor, type Stage } from "@/lib/three-stage";
import { useTheme } from "@/lib/theme";
import { ModelCanvas } from "./ModelCanvas";

// The size finder's pipe in 3D: a glazed vitrified clay pipe built from its
// published outer and inner diameter and its longest published length, lying
// on a 100 mm floor grid (bold every 500 mm). The camera is fixed for the
// whole range, so a size change shows its true difference (M10 pipe tween).

const GLAZE = "#6e3820";
const BORE = "#2a1610";
const BODY = "#b9744c";
const TWEEN = 0.62;
const SEGMENTS = 96;

/** Outer radius, bore radius and length, in metres. */
interface Shape {
  r: number;
  ri: number;
  len: number;
}

interface Parts {
  pipe: THREE_NS.Group;
  outer: THREE_NS.Mesh;
  inner: THREE_NS.Mesh;
  ends: THREE_NS.Mesh[];
  shadow: THREE_NS.Mesh;
  grids: THREE_NS.GridHelper[];
  shape: Shape;
}

const ORBIT = { target: [0, 0.5, 0] as [number, number, number], radius: 5.1, theta: 0.62, phi: 1.12, minPhi: 0.3, maxPhi: 1.5, fov: 32, drift: 0.18 };

export function Pipe3D({ d1, d3, length, label, onFail, className }: { d1: number; d3: number; length: number; label: string; onFail: () => void; className?: string }) {
  const [stage, setStage] = useState<Stage | null>(null);
  const reduce = useReducedMotion() ?? false;
  const theme = useTheme();
  const parts = useRef<Parts | null>(null);
  const target = useRef<Shape>({ r: d3 / 2000, ri: d1 / 2000, len: length });
  useEffect(() => {
    target.current = { r: d3 / 2000, ri: d1 / 2000, len: length };
  }, [d1, d3, length]);

  // Build the scene once the stage exists.
  useEffect(() => {
    if (!stage) return;
    const T = stage.three;
    const glaze = new T.MeshPhysicalMaterial({ color: GLAZE, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.12 });
    const bore = new T.MeshStandardMaterial({ color: BORE, roughness: 0.55, side: T.BackSide });
    const body = new T.MeshStandardMaterial({ color: BODY, roughness: 0.9, side: T.DoubleSide });
    const outer = new T.Mesh(new T.BufferGeometry(), glaze);
    const inner = new T.Mesh(new T.BufferGeometry(), bore);
    const ends = [0, 1].map(() => new T.Mesh(new T.BufferGeometry(), body));
    // Cylinders run along y; the group lays the pipe along x.
    const axis = new T.Group();
    axis.add(outer, inner, ...ends);
    axis.rotation.z = Math.PI / 2;
    const pipe = new T.Group();
    pipe.add(axis);
    const shadow = stage.contactShadow(1, 1);
    shadow.position.y = 0.002;
    const minor = new T.GridHelper(3.6, 36);
    const major = new T.GridHelper(3, 6);
    major.position.y = 0.001;
    for (const g of [minor, major]) {
      const m = g.material as THREE_NS.LineBasicMaterial;
      m.transparent = true;
      m.opacity = g === minor ? 0.8 : 1;
      m.depthWrite = false;
    }
    stage.scene.add(minor, major, shadow, pipe);
    parts.current = { pipe, outer, inner, ends, shadow, grids: [minor, major], shape: { r: 0, ri: 0, len: 0 } };
    apply(T, parts.current, target.current);
    stage.invalidate();
    return () => {
      stage.scene.remove(minor, major, shadow, pipe);
      parts.current = null;
    };
  }, [stage]);

  // Grid lines follow the light or dark theme.
  useEffect(() => {
    if (!stage || !parts.current) return;
    const root = document.documentElement;
    const [minor, major] = parts.current.grids;
    (minor.material as THREE_NS.LineBasicMaterial).color = cssColor(stage.three, root, "--line");
    (major.material as THREE_NS.LineBasicMaterial).color = cssColor(stage.three, root, "--muted");
    stage.invalidate();
  }, [stage, theme]);

  // Grow or shrink to the new size.
  useEffect(() => {
    const p = parts.current;
    if (!stage || !p) return;
    const from = { ...p.shape };
    const to = target.current;
    if (reduce) {
      apply(stage.three, p, to);
      stage.invalidate();
      return;
    }
    let t = 0;
    stage.onFrame((dt) => {
      t = Math.min(1, t + dt / TWEEN);
      const e = 1 - Math.pow(1 - t, 4);
      apply(stage.three, p, { r: from.r + (to.r - from.r) * e, ri: from.ri + (to.ri - from.ri) * e, len: from.len + (to.len - from.len) * e });
      return t < 1;
    });
    return () => stage.onFrame(null);
  }, [stage, d1, d3, length, reduce]);

  return <ModelCanvas label={label} orbit={ORBIT} onReady={setStage} onFail={onFail} className={className} />;
}

/** Rebuilds the pipe at a size (cheap: four open cylinders and rings). */
function apply(T: typeof THREE_NS, parts: Parts, s: Shape) {
  const swap = (m: THREE_NS.Mesh, g: THREE_NS.BufferGeometry) => {
    m.geometry.dispose();
    m.geometry = g;
  };
  swap(parts.outer, new T.CylinderGeometry(s.r, s.r, s.len, SEGMENTS, 1, true));
  swap(parts.inner, new T.CylinderGeometry(s.ri, s.ri, s.len, SEGMENTS, 1, true));
  parts.ends.forEach((m, i) => {
    swap(m, new T.RingGeometry(s.ri, s.r, SEGMENTS));
    m.rotation.x = -Math.PI / 2;
    m.position.y = (i ? -1 : 1) * (s.len / 2);
  });
  parts.pipe.position.y = s.r;
  parts.shadow.scale.set(s.len * 1.15, Math.max(s.r * 3, 0.12), 1);
  parts.shape = { ...s };
}

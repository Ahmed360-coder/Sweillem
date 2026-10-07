"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type * as THREE_NS from "three";
import { useReducedMotion } from "motion/react";
import { buildFitting, disposeTree, fittingMaterials, type FittingMaterials } from "@/lib/fitting-model";
import type { FittingShape } from "@/lib/fitting-shapes";
import { cssColor, type OrbitOptions, type Stage } from "@/lib/three-stage";
import { useTheme } from "@/lib/theme";
import { ModelCanvas } from "./ModelCanvas";

// A product of the size finder in 3D, on a 100 mm floor grid (bold every
// 500 mm). The camera is set once for the whole family from its largest piece
// (`frame`), so changing the size shows the true difference, as for the pipe.

const TWEEN = 0.62;

export function Fitting3D({
  shape,
  frame,
  label,
  onFail,
  className,
}: {
  shape: FittingShape;
  /** Largest floor span and height in the family, in metres. */
  frame: { span: number; height: number };
  label: string;
  onFail: () => void;
  className?: string;
}) {
  const [stage, setStage] = useState<Stage | null>(null);
  const reduce = useReducedMotion() ?? false;
  const theme = useTheme();
  const mats = useRef<FittingMaterials | null>(null);
  const grids = useRef<THREE_NS.GridHelper[]>([]);
  const model = useRef<{ group: THREE_NS.Group; size: number } | null>(null);

  const orbit = useMemo<OrbitOptions>(() => {
    const f = Math.max(frame.span, frame.height * 1.4, 0.3);
    return { target: [0, frame.height * 0.42, 0], radius: f * 1.95 + 0.25, theta: 0.62, phi: 1.12, minPhi: 0.3, maxPhi: 1.5, fov: 32, drift: 0.18 };
  }, [frame.span, frame.height]);

  // Floor grid and materials, once the stage exists.
  useEffect(() => {
    if (!stage) return;
    const T = stage.three;
    mats.current = fittingMaterials(T);
    const size = Math.ceil((Math.max(frame.span, frame.height) * 1.7) / 0.5) * 0.5;
    const minor = new T.GridHelper(size, Math.round(size / 0.1));
    const major = new T.GridHelper(size, Math.round(size / 0.5));
    major.position.y = 0.001;
    for (const g of [minor, major]) {
      const m = g.material as THREE_NS.LineBasicMaterial;
      m.transparent = true;
      m.opacity = g === minor ? 0.8 : 1;
      m.depthWrite = false;
    }
    grids.current = [minor, major];
    stage.scene.add(minor, major);
    stage.invalidate();
    return () => {
      stage.scene.remove(minor, major);
      grids.current = [];
      Object.values(mats.current ?? {}).forEach((m) => m.dispose());
      mats.current = null;
    };
  }, [stage, frame.span, frame.height]);

  // Grid lines follow the light or dark theme.
  useEffect(() => {
    if (!stage || grids.current.length < 2) return;
    const root = document.documentElement;
    const [minor, major] = grids.current;
    (minor.material as THREE_NS.LineBasicMaterial).color = cssColor(stage.three, root, "--line");
    (major.material as THREE_NS.LineBasicMaterial).color = cssColor(stage.three, root, "--muted");
    stage.invalidate();
  }, [stage, theme, frame.span, frame.height]);

  // Build the piece; grow or shrink from the size before.
  useEffect(() => {
    if (!stage || !mats.current) return;
    const T = stage.three;
    const group = buildFitting(T, shape, mats.current);
    const box = new T.Box3().setFromObject(group);
    const size = box.getSize(new T.Vector3()).length();
    const before = model.current;
    if (before) {
      stage.scene.remove(before.group);
      disposeTree(before.group);
    }
    stage.scene.add(group);
    model.current = { group, size };
    const from = before ? Math.min(2, Math.max(0.5, before.size / size)) : 1;
    if (reduce || from === 1) {
      stage.invalidate();
      return;
    }
    let t = 0;
    group.scale.setScalar(from);
    stage.onFrame((dt) => {
      t = Math.min(1, t + dt / TWEEN);
      const e = 1 - Math.pow(1 - t, 4);
      group.scale.setScalar(from + (1 - from) * e);
      return t < 1;
    });
    return () => stage.onFrame(null);
  }, [stage, shape, reduce]);

  // Clear the piece when the stage goes.
  useEffect(
    () => () => {
      if (model.current) disposeTree(model.current.group);
      model.current = null;
    },
    [stage],
  );

  return <ModelCanvas label={label} orbit={orbit} onReady={setStage} onFail={onFail} className={className} />;
}

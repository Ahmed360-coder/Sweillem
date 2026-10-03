"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import type * as THREE_NS from "three";
import { useReducedMotion } from "motion/react";
import { S, TILE_DEPTH, TILE_H, seeded, tileGeometry, tileTextures } from "@/lib/roof-tile-model";
import type { Stage } from "@/lib/three-stage";
import { AddToQuote } from "./AddToQuote";
import { LOGO_WORD_PATH } from "./Logo";
import { ModelCanvas } from "./ModelCanvas";
import { tileColours, type TileColour } from "./RoofTileViewer";

// A piece of roof laid with SWEILLEM clay roof tiles, in their three published
// colours. Each course overlaps the one below and each tile locks over its
// neighbour, so the stamps on the headlap are hidden except on the top course;
// tapping a tile lifts it out to show its stamp. SWEILLEM publishes no tile
// dimensions or laying gauge, so the overlaps are illustrative, not to scale.

const COLS = 4;
const ROWS = 3;
/** How far apart tiles lie on the roof, in drawing units (illustrative). */
const COVER = 70.5;
const GAUGE = 118;
/** Each tile rests on the one below, its tail raised by this angle. */
const REST = 0.046;
/** Roof pitch from level (about 35°). */
const PITCH = 0.61;
/** The tile lifted by the button: the middle course, second from the left. */
const SHOW_TILE = 1 * COLS + 1;
const WOOD = "#8a5a36";
/** Glaze colours for the model where the swatch reads too pale under the studio light (blue). */
const GLAZE: Partial<Record<TileColour, string>> = { blue: "#2b80cc" };

const ORBIT = {
  target: [0, -0.12, 0] as [number, number, number],
  radius: 6.1,
  theta: 0.32,
  phi: 1.02,
  minPhi: 0.62,
  maxPhi: 1.32,
  minTheta: -0.7,
  maxTheta: 0.7,
  fov: 30,
  drift: 0.08,
  // A low sun from the upper left, so the rolls and ribs throw shade across the roof.
  key: { position: [-3.2, 4.2, 3.4] as [number, number, number], intensity: 2.6 },
  shadows: 2.4,
  maxPixelRatio: 3,
};

interface Tile {
  pivot: THREE_NS.Group;
  material: THREE_NS.MeshStandardMaterial;
  /** Small fixed shade differences, as between fired tiles. */
  shade: [number, number, number];
  base: { y: number; z: number };
  lift: number;
}

function buildRoof(T: typeof THREE_NS, colour: string) {
  const roof = new T.Group();
  const { face, sides } = tileGeometry(T);
  const { map, normalMap } = tileTextures(T, LOGO_WORD_PATH);
  const rand = seeded(11);
  const tiles: Tile[] = [];
  const width = (COVER * (COLS - 1) + 84) * S;
  const slope = (GAUGE * (ROWS - 1) + TILE_H) * S;

  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++) {
      const material = new T.MeshStandardMaterial({ color: colour, map, normalMap, roughness: 0.5, envMapIntensity: 0.8 });
      const tile = new T.Group();
      for (const g of [face, sides]) {
        const m = new T.Mesh(g, material);
        m.castShadow = m.receiveShadow = true;
        m.userData.tile = tiles.length;
        tile.add(m);
      }
      // Pivot on the head, where the tile hangs on its batten; the tail rests on the course below.
      tile.position.y = (-TILE_H / 2) * S;
      const pivot = new T.Group();
      pivot.add(tile);
      const y = (r * GAUGE + TILE_H) * S - slope / 2;
      pivot.position.set((c * COVER + 42) * S - width / 2, y, 0);
      pivot.rotation.x = -REST;
      roof.add(pivot);
      tiles.push({ pivot, material, shade: [(rand() - 0.5) * 0.014, (rand() - 0.5) * 0.08, (rand() - 0.5) * 0.06], base: { y, z: 0 }, lift: 0 });
    }

  // Battens under each course's head, a raised eaves batten, and the dark underlay beneath them.
  const wood = new T.MeshStandardMaterial({ color: WOOD, roughness: 0.85 });
  const beam = (w: number, h: number, d: number, x: number, y: number, z: number) => {
    const m = new T.Mesh(new T.BoxGeometry(w, h, d), wood);
    m.position.set(x, y, z);
    m.castShadow = m.receiveShadow = true;
    roof.add(m);
  };
  const span = width + 40 * S;
  for (let r = 0; r < ROWS; r++) beam(span, 10 * S, 5 * S, 0, (r * GAUGE + TILE_H - 12) * S - slope / 2, (-TILE_DEPTH - 2.5) * S);
  beam(span, 10 * S, 11 * S, 0, 8 * S - slope / 2, (136 * Math.sin(REST) - TILE_DEPTH - 5.6) * S);
  const underlay = new T.Mesh(new T.PlaneGeometry(width + 24 * S, slope + 20 * S), new T.MeshStandardMaterial({ color: "#3b3d42", roughness: 0.95 }));
  underlay.position.z = (-TILE_DEPTH - 8.5) * S;
  underlay.receiveShadow = true;
  roof.add(underlay);

  roof.rotation.x = -(Math.PI / 2 - PITCH);
  return { roof, tiles, textures: [map, normalMap], wood };
}

function Roof3D({ colour, lifted, onLift, onFail, label }: { colour: string; lifted: number | null; onLift: (i: number | null) => void; onFail: () => void; label: string }) {
  const [stage, setStage] = useState<Stage | null>(null);
  const reduce = useReducedMotion() ?? false;
  const roof = useRef<ReturnType<typeof buildRoof> | null>(null);
  const anim = useRef({ colour: null as THREE_NS.Color | null, from: null as THREE_NS.Color | null, to: null as THREE_NS.Color | null, t: 1, lifted: null as number | null, reduce });
  const first = useRef(colour);
  const lift = useRef(onLift);
  useEffect(() => {
    lift.current = onLift;
    anim.current.reduce = reduce;
  }, [onLift, reduce]);

  useEffect(() => {
    if (!stage) return;
    const T = stage.three;
    const built = buildRoof(T, first.current);
    roof.current = built;
    stage.scene.add(built.roof);
    const a = anim.current;
    a.colour = new T.Color(first.current);
    // Each tile a touch off the swatch, and a little deeper, as glazed clay reads under daylight.
    const paint = () => built.tiles.forEach((t) => t.material.color.copy(a.colour!).offsetHSL(t.shade[0], t.shade[1] + 0.1, t.shade[2] - 0.12));
    paint();

    // One frame loop for the colour blend and the tiles lifting out or settling back.
    stage.onFrame((dt) => {
      let more = false;
      if (a.t < 1 && a.from && a.to) {
        a.t = a.reduce ? 1 : Math.min(1, a.t + dt / 0.45);
        a.colour!.lerpColors(a.from, a.to, 1 - Math.pow(1 - a.t, 3));
        paint();
        more = a.t < 1;
      }
      const k = a.reduce ? 1 : 1 - Math.exp(-dt * 6);
      built.tiles.forEach((t, i) => {
        const goal = a.lifted === i ? 1 : 0;
        if (Math.abs(goal - t.lift) < 0.001) return;
        t.lift += (goal - t.lift) * k;
        if (Math.abs(goal - t.lift) < 0.001) t.lift = goal;
        else more = true;
        // Out of the roof toward the viewer, down the slope, and tipped so the stamp faces you.
        const e = t.lift;
        t.pivot.position.z = t.base.z + e * 1.45;
        t.pivot.position.y = t.base.y - e * 0.2;
        t.pivot.rotation.x = -REST + e * 0.42;
        t.pivot.rotation.z = e * 0.06;
      });
      return more;
    });

    const meshes = built.tiles.flatMap((t) => t.pivot.children[0].children);
    stage.onTap(meshes, (hit) => {
      const i = hit?.object.userData.tile as number | undefined;
      lift.current(i === undefined || i === a.lifted ? null : i);
    });

    return () => {
      stage.onFrame(null);
      stage.onTap([], null);
      stage.scene.remove(built.roof);
      built.textures.forEach((t) => t.dispose());
      roof.current = null;
    };
  }, [stage]);

  // Colour change: the glaze blends to the new colour (instant with reduced motion).
  useEffect(() => {
    const a = anim.current;
    if (!stage || !a.colour) return;
    a.from = a.colour.clone();
    a.to = new stage.three.Color(colour);
    a.t = 0;
    stage.invalidate();
  }, [stage, colour]);

  useEffect(() => {
    anim.current.lifted = lifted;
    stage?.invalidate();
  }, [stage, lifted]);

  return <ModelCanvas label={label} orbit={ORBIT} onReady={setStage} onFail={onFail} className="h-full" />;
}

export function TileRotator() {
  const uid = useId();
  const [colour, setColour] = useState<TileColour>("terracotta");
  const [lifted, setLifted] = useState<number | null>(null);
  const [no3d, setNo3d] = useState(false);
  const current = tileColours.find((c) => c.id === colour)!;
  const name = current.name.toLowerCase();

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-center">
      <figure className="overflow-hidden rounded-card border border-line bg-[radial-gradient(ellipse_at_50%_30%,var(--surface),var(--sunk))]">
        <div className="relative aspect-[6/5]">
          {no3d ? (
            <Image src={current.src} alt={`SWEILLEM clay roof tile in ${name}`} width={current.w} height={720} className="mx-auto h-[86%] w-auto translate-y-[7%]" />
          ) : (
            <Roof3D
              colour={GLAZE[colour] ?? current.swatch}
              lifted={lifted}
              onLift={setLifted}
              onFail={() => setNo3d(true)}
              label={`3D model of a piece of roof laid with SWEILLEM clay roof tiles, colour ${name}.${lifted === null ? "" : " One tile is lifted out, showing the “Made in Egypt” and SWEILLEM stamp on its top band."}`}
            />
          )}
        </div>
        <figcaption className="border-t border-line px-4 py-2.5 text-[13px] text-muted sm:px-6">
          {no3d ? "SWEILLEM clay roof tile." : "Tap a tile to lift it out. "}
          The shape follows the real tile, but SWEILLEM doesn’t publish tile sizes yet, so this roof is not to scale.
        </figcaption>
      </figure>

      <div className="grid gap-7">
        <fieldset>
          <legend className="mb-3 font-mono text-xs font-medium tracking-[.12em] text-muted uppercase">Colour</legend>
          <div className="flex flex-wrap gap-3">
            {tileColours.map((c) => (
              <label
                key={c.id}
                className="inline-flex min-h-11 cursor-pointer items-center gap-2.5 rounded-full border border-line bg-surface py-1.5 ps-1.5 pe-4 font-semibold transition-colors select-none hover:border-ink has-checked:border-ink has-checked:ring-2 has-checked:ring-maroon has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-maroon"
              >
                <input type="radio" name={`${uid}-colour`} value={c.id} checked={colour === c.id} onChange={() => setColour(c.id)} className="sr-only" />
                <span className="hex block size-8" style={{ background: c.swatch }} aria-hidden="true" />
                {c.name}
              </label>
            ))}
          </div>
        </fieldset>
        <p className="text-muted">
          Each tile locks over its neighbour and the course above covers its top band, so on a finished roof you only see the two rolls. Lift one out to see the “Made in Egypt” and SWEILLEM stamp pressed into the clay.
        </p>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          {!no3d && (
            <button
              type="button"
              aria-pressed={lifted !== null}
              onClick={() => setLifted(lifted === null ? SHOW_TILE : null)}
              className="inline-flex min-h-11 items-center rounded-full border border-ink px-5 font-semibold transition-colors hover:bg-ink hover:text-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-maroon"
            >
              {lifted === null ? "Lift a tile out" : "Put the tile back"}
            </button>
          )}
          <AddToQuote item={{ product: "Clay roof tiles", size: current.name }} label={`Add to quote: ${name} roof tiles`} />
          <Link className="link relative text-sm" href="/roof-tiles">
            <span className="tap" />
            More on roof tiles
          </Link>
        </div>
      </div>
    </div>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import type * as THREE_NS from "three";
import { useReducedMotion } from "motion/react";
import type { Stage } from "@/lib/three-stage";
import { AddToQuote } from "./AddToQuote";
import { TR } from "./ClayTile";
import { LOGO_WORD_PATH } from "./Logo";
import { ModelCanvas } from "./ModelCanvas";
import { tileColours, type TileColour } from "./RoofTileViewer";

// A SWEILLEM clay roof tile in 3D, in its three published colours. The shape
// follows the tile photo: an interlocking flat tile with two rolls, a headlap
// band and side locks. SWEILLEM publishes no tile dimensions, so the model
// shows shape and colour only and is not to scale.

/** Drawing units: the tile is 144 high and 84 wide, y down, as in ClayTile. */
const H = 144;
const W = H * TR;
const S = 1 / H;
const DEPTH = 5;
const ORBIT = { target: [0, 0, 0] as [number, number, number], radius: 2.5, theta: 0.55, phi: 1.32, minPhi: 0.15, maxPhi: Math.PI - 0.15, fov: 30, drift: 0.22 };

/** Where the stamp sits on the headlap band, in drawing units (from the tile photo). */
const STAMP = { x: 18, y: 7, w: 38, h: 8.4 };

/**
 * The stamp pressed into the tile's headlap, as on the photo: "Made in Egypt"
 * in a framed box and the SWEILLEM wordmark in a rounded frame. Drawn on a
 * canvas: raised letters catch the light, with a darker edge below them.
 */
function stampTextures(T: typeof THREE_NS) {
  const w = 1024;
  const h = Math.round((w * STAMP.h) / STAMP.w);
  const draw = (fill: string, shadow: string | null) => {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const g = c.getContext("2d")!;
    const paint = (dx: number, dy: number, colour: string) => {
      g.save();
      g.translate(dx, dy);
      g.strokeStyle = g.fillStyle = colour;
      g.lineWidth = 9;
      // "Made in / Egypt" box
      g.beginPath();
      g.roundRect(14, 22, 250, h - 44, 26);
      g.stroke();
      g.font = `600 ${Math.round(h * 0.27)}px Arial, sans-serif`;
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.fillText("Made in", 139, h * 0.36);
      g.fillText("Egypt", 139, h * 0.66);
      // SWEILLEM wordmark in a rounded frame
      g.beginPath();
      g.roundRect(292, 22, w - 306, h - 44, (h - 44) / 2);
      g.stroke();
      const k = (h - 96) / (137 - 49);
      g.translate(292 + (w - 306 - (640 - 172) * k) / 2 - 172 * k, 48 - 49 * k);
      g.scale(k, k);
      g.fill(new Path2D(LOGO_WORD_PATH));
      g.restore();
    };
    if (shadow) paint(5, 6, shadow);
    paint(0, 0, fill);
    const t = new T.CanvasTexture(c);
    t.colorSpace = fill === "#fff" ? T.NoColorSpace : T.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  };
  return { map: draw("#e6e6e6", "#5a5a5a"), alpha: draw("#fff", "#fff") };
}

function buildTile(T: typeof THREE_NS, material: THREE_NS.Material, stampMaterial: THREE_NS.Material) {
  const tile = new T.Group();
  const px = (x: number) => (x - W / 2) * S;
  const py = (y: number) => (H / 2 - y) * S;

  // Body: the outline of the tile, with its stepped top and bottom corners.
  const outline: [number, number][] = [[4, 0], [68, 0], [68, 5], [84, 5], [84, 144], [14, 144], [14, 139], [0, 139], [0, 5], [4, 5]];
  const shape = new T.Shape(outline.map(([x, y]) => new T.Vector2(px(x), py(y))));
  const body = new T.ExtrudeGeometry(shape, { depth: DEPTH * S, bevelEnabled: true, bevelThickness: 0.8 * S, bevelSize: 0.8 * S, bevelSegments: 3 });
  const slab = new T.Mesh(body, material);
  slab.position.z = -DEPTH * S;
  tile.add(slab);

  // Raised parts on the face, as boxes and rounded rolls: [x, y, width, height, raise].
  const box = (x: number, y: number, w: number, h: number, raise: number) => {
    const m = new T.Mesh(new T.BoxGeometry(w * S, h * S, raise * 2 * S), material);
    m.position.set(px(x + w / 2), py(y + h / 2), 0);
    tile.add(m);
  };
  box(8, 6, 74, 20, 1.6); // headlap band
  for (const x of [2.6, 7.6]) box(x, 10, 1.8, 124, 1.1); // side lock, left
  for (const x of [70.2, 77.2]) box(x, 32, 1.8, 106, 1.1); // side lock, right
  for (const y of [60, 84, 108]) box(71, y - 0.8, 13, 1.6, 1.1);
  for (const cx of [28, 56]) {
    const roll = new T.Mesh(new T.CapsuleGeometry(10 * S, 88 * S, 8, 32), material);
    roll.scale.z = 0.55;
    roll.position.set(px(cx), py(84), 0);
    tile.add(roll);
  }
  // The stamp lies just in front of the headlap band.
  const stamp = new T.Mesh(new T.PlaneGeometry(STAMP.w * S, STAMP.h * S), stampMaterial);
  stamp.position.set(px(STAMP.x + STAMP.w / 2), py(STAMP.y + STAMP.h / 2), 1.6 * S + 0.0015);
  tile.add(stamp);
  tile.rotation.x = -0.08;
  return tile;
}

function Tile3D({ colour, onFail, label }: { colour: string; onFail: () => void; label: string }) {
  const [stage, setStage] = useState<Stage | null>(null);
  const reduce = useReducedMotion() ?? false;
  const material = useRef<THREE_NS.MeshPhysicalMaterial | null>(null);
  const stampMaterial = useRef<THREE_NS.MeshPhysicalMaterial | null>(null);
  const first = useRef(colour);

  useEffect(() => {
    if (!stage) return;
    const T = stage.three;
    const m = new T.MeshPhysicalMaterial({ color: first.current, roughness: 0.48, clearcoat: 0.6, clearcoatRoughness: 0.25 });
    const { map, alpha } = stampTextures(T);
    const sm = new T.MeshPhysicalMaterial({ color: first.current, map, alphaMap: alpha, bumpMap: alpha, bumpScale: 2, transparent: true, roughness: 0.42, clearcoat: 0.6, clearcoatRoughness: 0.25 });
    material.current = m;
    stampMaterial.current = sm;
    const tile = buildTile(T, m, sm);
    stage.scene.add(tile);
    stage.invalidate();
    return () => {
      stage.scene.remove(tile);
      map.dispose();
      alpha.dispose();
      material.current = stampMaterial.current = null;
    };
  }, [stage]);

  // Colour change: the glaze blends to the new colour (instant with reduced motion).
  useEffect(() => {
    const m = material.current;
    if (!stage || !m) return;
    const to = new stage.three.Color(colour);
    const sync = () => stampMaterial.current?.color.copy(m.color);
    if (reduce) {
      m.color.copy(to);
      sync();
      stage.invalidate();
      return;
    }
    const from = m.color.clone();
    let t = 0;
    stage.onFrame((dt) => {
      t = Math.min(1, t + dt / 0.45);
      m.color.lerpColors(from, to, 1 - Math.pow(1 - t, 3));
      sync();
      return t < 1;
    });
    return () => stage.onFrame(null);
  }, [stage, colour, reduce]);

  return <ModelCanvas label={label} orbit={ORBIT} onReady={setStage} onFail={onFail} className="h-full" />;
}

export function TileRotator() {
  const uid = useId();
  const [colour, setColour] = useState<TileColour>("terracotta");
  const [no3d, setNo3d] = useState(false);
  const current = tileColours.find((c) => c.id === colour)!;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-center">
      <figure className="overflow-hidden rounded-card border border-line bg-[radial-gradient(ellipse_at_50%_35%,var(--surface),var(--sunk))]">
        <div className="relative aspect-[6/5]">
          {no3d ? (
            <Image src={current.src} alt={`SWEILLEM clay roof tile in ${current.name.toLowerCase()}`} width={current.w} height={720} className="mx-auto h-[86%] w-auto translate-y-[7%]" />
          ) : (
            <Tile3D
              colour={current.swatch}
              onFail={() => setNo3d(true)}
              label={`3D model of a SWEILLEM clay roof tile in ${current.name.toLowerCase()}, with its two rolls, ribbed edges and the “Made in Egypt” and SWEILLEM stamp.`}
            />
          )}
        </div>
        <figcaption className="border-t border-line px-4 py-2.5 text-[13px] text-muted sm:px-6">
          Shape and colour only. SWEILLEM doesn’t publish tile sizes yet, so this model is not to scale.
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
          Turn the tile to see it from every side: the two rolls, the ribbed edges and the “Made in Egypt” and SWEILLEM stamp on the band along the top.
        </p>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <AddToQuote item={{ product: "Clay roof tiles", size: current.name }} label={`Add to quote: ${current.name.toLowerCase()} roof tiles`} />
          <Link className="link relative text-sm" href="/roof-tiles">
            <span className="tap" />
            More on roof tiles
          </Link>
        </div>
      </div>
    </div>
  );
}

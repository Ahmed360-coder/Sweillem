import type * as THREE_NS from "three";

// A small three.js stage for product models a visitor can turn (motion M28):
// an orbit camera dragged by pointer or arrow keys, with inertia, an idle drift
// after 2.5 s, glossy studio lighting for glaze, and a soft contact shadow.
// It renders only while something moves and only while on screen. three.js is
// loaded on demand by the caller, so pages without a model never download it.

export type Three = typeof THREE_NS;

export interface OrbitOptions {
  /** Point the camera looks at and turns around. */
  target: [number, number, number];
  radius: number;
  /** Start angles in radians: theta around the vertical axis, phi from straight above. */
  theta: number;
  phi: number;
  /** Limits for phi, so the camera stays above a floor or can look underneath. */
  minPhi: number;
  maxPhi: number;
  fov?: number;
  /** Idle drift in radians per second (0 for none). */
  drift?: number;
  /** Limits for theta, so a flat model is never seen edge-on. The idle drift then sways between them. */
  minTheta?: number;
  maxTheta?: number;
  /** Soft shadows from the key light (for models with relief), cast within this half-size around the target. */
  shadows?: number;
  /** Sharpest drawing resolution, in device pixels per CSS pixel (default 2). */
  maxPixelRatio?: number;
  /** Key light position and strength, if not the default studio key. */
  key?: { position: [number, number, number]; intensity: number };
}

export interface Stage {
  three: Three;
  scene: THREE_NS.Scene;
  camera: THREE_NS.PerspectiveCamera;
  /** The key light, for placing its shadow. */
  key: THREE_NS.DirectionalLight;
  /** Ask for a frame after changing the scene. */
  invalidate: () => void;
  /** Called every frame while the stage animates; return true to keep animating. */
  onFrame: (fn: ((dt: number) => boolean) | null) => void;
  /** Turn the view by a step (keyboard). */
  nudge: (dTheta: number, dPhi: number) => void;
  setReducedMotion: (reduce: boolean) => void;
  /** A soft round shadow on the floor, sized in scene units. */
  contactShadow: (width: number, depth: number) => THREE_NS.Mesh;
  /** Called with the first hit when the visitor taps or clicks without dragging (null for empty space). */
  onTap: (objects: THREE_NS.Object3D[], fn: ((hit: THREE_NS.Intersection | null) => void) | null) => void;
  dispose: () => void;
}

const IDLE_MS = 2500;

export function createStage(THREE: Three, canvas: HTMLCanvasElement, orbit: OrbitOptions, reduceMotion: boolean): Stage {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, orbit.maxPixelRatio ?? 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  if (orbit.shadows) {
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(orbit.fov ?? 32, 1, 0.01, 100);
  const target = new THREE.Vector3(...orbit.target);

  // Studio light: a soft room for reflections on the glaze, a key light and a rim.
  scene.add(new THREE.HemisphereLight(0xfff4ea, 0x3a2a24, 1.1));
  const key = new THREE.DirectionalLight(0xffffff, orbit.key?.intensity ?? 2.2);
  key.position.set(...(orbit.key?.position ?? [3, 5, 4]));
  key.target.position.copy(target);
  if (orbit.shadows) {
    key.castShadow = true;
    const cam = key.shadow.camera;
    cam.left = cam.bottom = -orbit.shadows;
    cam.right = cam.top = orbit.shadows;
    cam.near = 0.1;
    cam.far = key.position.distanceTo(target) + orbit.shadows * 2;
    cam.updateProjectionMatrix();
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.bias = -0.001;
    key.shadow.radius = 3;
    key.shadow.normalBias = 0.035;
  }
  scene.add(key, key.target);
  const rim = new THREE.DirectionalLight(0xffe2cc, 1.1);
  rim.position.set(-4, 2.5, -3);
  scene.add(rim);

  let theta = orbit.theta;
  let phi = orbit.phi;
  let vTheta = 0;
  let vPhi = 0;
  let reduce = reduceMotion;
  let lastInput = performance.now();
  let frame = 0;
  let last = 0;
  let visible = true;
  let disposed = false;
  let frameFn: ((dt: number) => boolean) | null = null;
  let tapFn: ((hit: THREE_NS.Intersection | null) => void) | null = null;
  let tapObjects: THREE_NS.Object3D[] = [];
  let driftDir = 1;

  const minTheta = orbit.minTheta ?? -Infinity;
  const maxTheta = orbit.maxTheta ?? Infinity;
  const clampPhi = (p: number) => Math.min(orbit.maxPhi, Math.max(orbit.minPhi, p));
  const clampTheta = (t: number) => Math.min(maxTheta, Math.max(minTheta, t));
  /** Idle drift: a steady turn, or a slow sway that eases in and out at the theta limits. */
  const driftStep = (dt: number) => {
    const step = orbit.drift! * dt;
    if (!Number.isFinite(minTheta) || !Number.isFinite(maxTheta)) return theta + step;
    const room = driftDir > 0 ? maxTheta - theta : theta - minTheta;
    const ease = Math.max(0.12, Math.min(1, room / 0.25));
    if (room < 0.004) driftDir = -driftDir;
    return clampTheta(theta + driftDir * step * ease);
  };
  const place = () => {
    const s = Math.sin(phi);
    camera.position.set(target.x + orbit.radius * s * Math.sin(theta), target.y + orbit.radius * Math.cos(phi), target.z + orbit.radius * s * Math.cos(theta));
    camera.lookAt(target);
  };

  const resize = () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    invalidate();
  };

  const tick = (now: number) => {
    frame = 0;

    const dt = Math.min(0.1, last ? (now - last) / 1000 : 0);
    last = now;
    let more = false;
    if (Math.abs(vTheta) > 1e-4 || Math.abs(vPhi) > 1e-4) {
      theta = clampTheta(theta + vTheta);
      phi = clampPhi(phi + vPhi);
      vTheta *= 0.9;
      vPhi *= 0.9;
      more = true;
    } else if (!reduce && orbit.drift && now - lastInput > IDLE_MS) {
      theta = driftStep(dt);
      more = true;
    }
    if (frameFn?.(dt)) more = true;
    visible = onScreen();
    place();
    renderer.render(scene, camera);
    if (more && visible) frame = requestAnimationFrame(tick);
    else last = 0;
  };

  function invalidate() {
    if (!frame && !disposed) frame = requestAnimationFrame(tick);
  }

  // Idle drift starts by itself after a pause, so wake the loop when it is due.
  const idleTimer = window.setInterval(() => {
    if (!reduce && orbit.drift && performance.now() - lastInput > IDLE_MS) wake();
  }, 500);

  // Dragging: horizontal turns, vertical tilts. Touch leaves vertical moves to
  // page scrolling (touch-action: pan-y), so on phones a sideways drag turns.
  let dragging: { id: number; x: number; y: number; moved: number } | null = null;
  const raycaster = new THREE.Raycaster();
  const tap = (e: PointerEvent) => {
    if (!tapFn) return;
    const r = canvas.getBoundingClientRect();
    raycaster.setFromCamera(new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), camera);
    tapFn(raycaster.intersectObjects(tapObjects, true)[0] ?? null);
  };
  const down = (e: PointerEvent) => {
    if (e.button !== 0) return;
    dragging = { id: e.pointerId, x: e.clientX, y: e.clientY, moved: 0 };
    canvas.setPointerCapture(e.pointerId);
    lastInput = performance.now();
    vTheta = vPhi = 0;
  };
  const move = (e: PointerEvent) => {
    if (!dragging || e.pointerId !== dragging.id) return;
    const dx = e.clientX - dragging.x;
    const dy = e.clientY - dragging.y;
    dragging.x = e.clientX;
    dragging.y = e.clientY;
    dragging.moved += Math.abs(dx) + Math.abs(dy);
    const k = 5 / Math.max(canvas.clientWidth, 1);
    theta = clampTheta(theta - dx * k);
    phi = clampPhi(phi - dy * k * 0.7);
    vTheta = -dx * k * 0.6;
    vPhi = -dy * k * 0.4;
    lastInput = performance.now();
    invalidate();
  };
  const up = (e: PointerEvent) => {
    if (!dragging || e.pointerId !== dragging.id) return;
    if (e.type === "pointerup" && dragging.moved < 8) {
      tap(e);
      vTheta = vPhi = 0;
    }
    dragging = null;
    lastInput = performance.now();
    if (reduce) vTheta = vPhi = 0;
    invalidate();
  };
  canvas.addEventListener("pointerdown", down);
  canvas.addEventListener("pointermove", move);
  canvas.addEventListener("pointerup", up);
  canvas.addEventListener("pointercancel", up);

  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  // On screen? Checked directly (cheap), so a sticky or freshly laid out canvas is never missed.
  const onScreen = () => {
    const r = canvas.getBoundingClientRect();
    return r.bottom > 0 && r.top < window.innerHeight && r.width > 0 && document.visibilityState === "visible";
  };
  const wake = () => {
    if (!frame && onScreen()) invalidate();
  };
  window.addEventListener("scroll", wake, { passive: true });
  document.addEventListener("visibilitychange", wake);

  // Reflections for the glaze come from a generated studio room.
  let envMap: THREE_NS.Texture | null = null;
  import("three/examples/jsm/environments/RoomEnvironment.js").then(({ RoomEnvironment }) => {
    if (disposed) return;
    const pmrem = new THREE.PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    envMap = pmrem.fromScene(room, 0.04).texture;
    scene.environment = envMap;
    scene.environmentIntensity = 0.55;
    pmrem.dispose();
    invalidate();
  });

  const shadowTexture = (() => {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const g = c.getContext("2d")!;
    const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, "rgba(0,0,0,0.38)");
    grad.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  })();

  resize();
  place();

  return {
    three: THREE,
    scene,
    camera,
    key,
    invalidate,
    onFrame(fn) {
      frameFn = fn;
      invalidate();
    },
    nudge(dTheta, dPhi) {
      lastInput = performance.now();
      if (reduce) {
        theta = clampTheta(theta + dTheta);
        phi = clampPhi(phi + dPhi);
      } else {
        vTheta = dTheta * 0.1;
        vPhi = dPhi * 0.1;
      }
      invalidate();
    },
    onTap(objects, fn) {
      tapObjects = objects;
      tapFn = fn;
    },
    setReducedMotion(r) {
      reduce = r;
      invalidate();
    },
    contactShadow(width, depth) {
      const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(1, 1),
        new THREE.MeshBasicMaterial({ map: shadowTexture, transparent: true, depthWrite: false }),
      );
      mesh.rotation.x = -Math.PI / 2;
      mesh.scale.set(width, depth, 1);
      mesh.renderOrder = -1;
      return mesh;
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(frame);
      window.clearInterval(idleTimer);
      ro.disconnect();
      window.removeEventListener("scroll", wake);
      document.removeEventListener("visibilitychange", wake);
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerup", up);
      canvas.removeEventListener("pointercancel", up);
      scene.traverse((o) => {
        const m = o as THREE_NS.Mesh;
        m.geometry?.dispose();
        const mats = Array.isArray(m.material) ? m.material : m.material ? [m.material] : [];
        mats.forEach((mat) => mat.dispose());
      });
      key.shadow.map?.dispose();
      shadowTexture.dispose();
      envMap?.dispose();
      renderer.dispose();
    },
  };
}

/** Reads a CSS colour token (e.g. "--line") as a three.js colour. */
export function cssColor(THREE: Three, el: Element, token: string) {
  const c = new THREE.Color();
  const v = getComputedStyle(el).getPropertyValue(token).trim();
  if (v) c.setStyle(v, THREE.SRGBColorSpace);
  return c;
}

"use client";

import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { drawFabric, fabricFinish } from "@/lib/fabric-texture";
import type { Construction } from "@/lib/types";

const W = 2.2;
const H = 2.8;
const SEG_X = 90;
const SEG_Y = 110;

/** Height of the drape at (u, v): v=0 is the pinned top edge, v=1 the hem. */
function drape(u: number, v: number, t: number) {
  const fall = 0.2 + 0.8 * v * v; // folds deepen towards the hem
  const folds = Math.sin(u * Math.PI * 5 + Math.sin(t * 0.6) * 0.4) * 0.22 + Math.sin(u * Math.PI * 11 + 1.3) * 0.05;
  const sway = Math.sin(t * 0.8 + v * 2.2) * 0.05;
  return (folds + sway) * fall;
}

function Cloth({ color, construction, reducedMotion }: { color: string; construction: Construction; reducedMotion: boolean }) {
  const finish = fabricFinish[construction];
  const mesh = useRef<THREE.Mesh>(null);

  const geometry = useMemo(() => {
    const g = new THREE.PlaneGeometry(W, H, SEG_X, SEG_Y);
    g.translate(0, -H / 2 + 1.1, 0);
    return g;
  }, []);

  // relief for the bump map, and a lifted copy for colour so the yarn
  // structure shows without darkening the colourway
  const [bump, tint] = useMemo(() => {
    const size = 512;
    const make = (lift: number) => {
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = size;
      const ctx = canvas.getContext("2d")!;
      drawFabric(ctx, construction, size);
      if (lift) {
        ctx.fillStyle = `rgba(255,255,255,${lift})`;
        ctx.fillRect(0, 0, size, size);
      }
      const tex = new THREE.CanvasTexture(canvas);
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(finish.repeat, finish.repeat * (H / W));
      tex.anisotropy = 8;
      if (lift) tex.colorSpace = THREE.SRGBColorSpace;
      return tex;
    };
    return [make(0), make(0.6)];
  }, [construction, finish.repeat]);

  // dispose GPU resources when the fabric or geometry changes
  useEffect(
    () => () => {
      bump.dispose();
      tint.dispose();
    },
    [bump, tint],
  );
  useEffect(() => () => geometry.dispose(), [geometry]);

  const base = useMemo(() => geometry.attributes.position.array.slice() as Float32Array, [geometry]);

  // animate through the mesh ref: three.js objects are mutated in place every frame
  useFrame(({ clock }) => {
    const g = mesh.current?.geometry;
    if (!g) return;
    const pos = g.attributes.position;
    const t = reducedMotion ? 0 : clock.elapsedTime;
    for (let i = 0; i < pos.count; i++) {
      const x = base[i * 3];
      const y = base[i * 3 + 1];
      const u = (x + W / 2) / W;
      const v = (1.1 - y) / H;
      pos.setZ(i, drape(u, v, t));
    }
    pos.needsUpdate = true;
    g.computeVertexNormals();
  });

  return (
    <mesh ref={mesh} geometry={geometry}>
      <meshPhysicalMaterial
        color={color}
        map={tint}
        bumpMap={bump}
        bumpScale={finish.bump}
        roughness={finish.roughness}
        sheen={finish.sheen}
        sheenRoughness={0.6}
        sheenColor={new THREE.Color(color).lerp(new THREE.Color("#ffffff"), 0.5)}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

type Props = { color: string; construction: Construction; label: string };

export default function FabricViewer({ color, construction, label }: Props) {
  const reducedMotion = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (
    <div className="fabric-viewer" role="img" aria-label={`3D view of ${label}. Drag to rotate.`}>
      <Canvas camera={{ position: [1.2, -0.1, 4.9], fov: 40 }} dpr={[1, 2]} gl={{ antialias: true }}>
        <color attach="background" args={["#f3f3f1"]} />
        <hemisphereLight args={["#ffffff", "#d9d6cf", 1.1]} />
        {/* raking side light makes the folds and yarn relief readable */}
        <directionalLight position={[3.5, 2, 1.5]} intensity={2.2} />
        <directionalLight position={[-3, 1, 2]} intensity={0.6} />
        {/* the rail the swatch hangs from */}
        <mesh position={[0, 1.13, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.025, 0.025, W + 0.3, 16]} />
          <meshStandardMaterial color="#222" metalness={0.6} roughness={0.35} />
        </mesh>
        <Cloth color={color} construction={construction} reducedMotion={reducedMotion} />
        {/* zoom off so the wheel keeps scrolling the page */}
        <OrbitControls target={[0, -0.3, 0]} enablePan={false} enableZoom={false} minPolarAngle={Math.PI / 4} maxPolarAngle={(Math.PI * 3) / 4} />
      </Canvas>
      <span className="fabric-hint">Drag to rotate</span>
    </div>
  );
}

"use client";

/**
 * Scena 3D (React Three Fiber).
 * Cały ruch flakonu wynika z pozycji scrolla (scrollStore + interpolacja),
 * więc nic nie obraca się „samo bez związku ze scrollem".
 */

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { sampleBottleState, scrollStore } from "./scrollStore";
import { PlaceholderBottle } from "./PlaceholderBottle";

interface BottleSceneProps {
  lowPower: boolean;
  modelUrl: string | null;
}

/** Model GLB podmieniony przez NEXT_PUBLIC_BOTTLE_MODEL_URL. */
function GlbBottle({ url }: { url: string }) {
  const { scene } = useGLTF(url);

  // Jeśli model zawiera węzeł o nazwie „Cap", animujemy jego pozycję jak zakrętkę.
  const cap = useMemo(() => scene.getObjectByName("Cap") ?? null, [scene]);
  const capBaseY = useMemo(() => cap?.position.y ?? 0, [cap]);

  useFrame(() => {
    if (!cap) return;
    const state = sampleBottleState(scrollStore.progress);
    cap.position.y = capBaseY + state.capLift * 1.05;
    cap.rotation.y = state.capLift * 0.8;
  });

  return <primitive object={scene} />;
}

function BottleRig({ lowPower, modelUrl }: BottleSceneProps) {
  const group = useRef<THREE.Group>(null);
  const { size } = useThree();

  useFrame((_, delta) => {
    const g = group.current;
    if (!g) return;

    const state = sampleBottleState(scrollStore.progress);
    const mobile = size.width < 768;
    // Mniejsze przesunięcia na wąskich ekranach, żeby flakon nie wychodził poza kadr.
    const xFactor = Math.min(1, Math.max(size.width / 1200, 0.3));
    const dt = Math.min(delta, 0.1);

    const targetX = state.x * (mobile ? xFactor * 0.75 : xFactor);
    const targetY = state.y + (mobile ? 0.55 : 0);
    const targetScale = state.scale * (mobile ? 0.82 : 1);

    g.position.x = THREE.MathUtils.damp(g.position.x, targetX, 5, dt);
    g.position.y = THREE.MathUtils.damp(g.position.y, targetY, 5, dt);
    g.position.z = THREE.MathUtils.damp(g.position.z, state.z, 5, dt);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, state.rotX, 5, dt);
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, state.rotY, 5, dt);
    g.rotation.z = THREE.MathUtils.damp(g.rotation.z, state.rotZ, 5, dt);
    const scale = THREE.MathUtils.damp(g.scale.x, targetScale, 5, dt);
    g.scale.setScalar(scale);
  });

  return (
    <group ref={group}>
      {modelUrl ? <GlbBottle url={modelUrl} /> : <PlaceholderBottle lowPower={lowPower} />}
    </group>
  );
}

export default function BottleScene({ lowPower, modelUrl }: BottleSceneProps) {
  return (
    <Canvas
      dpr={lowPower ? [1, 1.4] : [1, 2]}
      gl={{
        antialias: !lowPower,
        alpha: true,
        powerPreference: "high-performance",
        stencil: false,
      }}
      camera={{ position: [0, 0, 7], fov: 32 }}
    >
      <ambientLight intensity={0.25} />
      {/* Kluczowe — ciepłe, z góry po prawej */}
      <directionalLight position={[4, 6, 5]} intensity={2.2} color="#FFF6E8" />
      {/* Wypełniające — złote, z lewej */}
      <directionalLight position={[-5, 2, -3]} intensity={0.9} color="#C9A96A" />
      {/* Konturowe — różowe, zza flakonu; spina go z różowym tłem strony */}
      <pointLight position={[0, 1.6, -3.6]} intensity={14} distance={14} color="#F0B7D6" />

      <Suspense fallback={null}>
        <BottleRig lowPower={lowPower} modelUrl={modelUrl} />
        {/* Otoczenie renderowane lokalnie (bez pobierania HDRI z sieci). */}
        <Environment resolution={lowPower ? 128 : 256}>
          <Lightformer intensity={2.6} position={[0, 3, -6]} scale={[8, 3, 1]} color="#ffffff" />
          {/* Wąski, ostry pasek światła — poświata na krawędzi szkła */}
          <Lightformer
            intensity={3.4}
            position={[2.4, 1.2, 3]}
            rotation-y={-Math.PI / 5}
            scale={[0.3, 5, 1]}
            color="#ffffff"
          />
          <Lightformer
            intensity={1.4}
            position={[-4, 1, 2]}
            rotation-y={Math.PI / 2}
            scale={[4, 4, 1]}
            color="#C9A96A"
          />
          <Lightformer
            intensity={1.1}
            position={[4, 2, 2]}
            rotation-y={-Math.PI / 2}
            scale={[4, 4, 1]}
            color="#F4F1EA"
          />
        </Environment>
      </Suspense>
    </Canvas>
  );
}

/**
 * FLAKON 3D — LAVIÉRA (model proceduralny marki).
 *
 * Odwzorowuje realny kształt flakonu ze zdjęcia produktowego:
 * - prostokątny korpus z zaokrąglonymi krawędziami i fazowaniem,
 * - grube, W PEŁNI przezroczyste szkło (transmission) z dobrze widocznym dnem,
 * - naturalny, jasny płyn champagne — bez poświaty, przezroczysty na tyle,
 *   by przepuszczał światło; tafla u góry delikatna, nie „plastikowa",
 * - złote napisy jak na realnym flakonie: logo nad płynem oraz
 *   „EAU DE PARFUM" i „50 ml" w dolnej, czystej części szkła,
 * - krótka szyjka, złoty kołnierz i wysoka, polerowana złota zakrętka,
 *   która scrollem unosi się i odsłania atomizer,
 * - mgiełka „sprayu" pojawia się przy przechyle.
 *
 * Podmiana na model GLB: NEXT_PUBLIC_BOTTLE_MODEL_URL=/models/bottle.glb
 * (model może zawierać węzeł „Cap" — animacja zakrętki przełączy się na niego).
 */

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { sampleBottleState, scrollStore } from "./scrollStore";

const CAP_BASE_Y = 1.2;
const CAP_LIFT = 1.05;
const SPRAY_TILT = 0.55; // wartość rotZ odpowiadająca aplikacji
const MIST_COUNT = 80;

/** Wymiary korpusu (szerokość × wysokość × głębokość). */
const BODY_W = 1.55;
const BODY_H = 1.9;
const BODY_D = 0.86;
const BODY_R = 0.1;

/**
 * Płyn: dolna krawędź TUŻ NAD strefą napisów (jak na zdjęciu —
 * pod płynem jest czyste, grube szkło z „EAU DE PARFUM" / „50 ml").
 */
const LIQUID_W = 1.36;
const LIQUID_H = 1.32;
const LIQUID_D = 0.68;
const LIQUID_BOTTOM = -0.6;
const LIQUID_Y = LIQUID_BOTTOM + LIQUID_H / 2;

/** Napisy na przedniej szybie (tuż przy powierzchni szkła). */
const FRONT_Z = BODY_D / 2 + 0.006;
const GOLD_INK = "#C4A165";

/**
 * Normals z załomami: wierzchołki leżące w tym samym miejscu są uśredniane
 * tylko wtedy, gdy tworzące je fazy są do siebie wystarczająco zbliżone.
 * Dzięki temu duże płaszczyzny pozostają ostre, a zaokrąglenia gładkie.
 */
function creaseNormals(geo: THREE.BufferGeometry, angle = 0.6) {
  const cos = Math.cos(angle);
  const pos = geo.attributes.position;
  const src = geo.attributes.normal;

  const groups = new Map<string, number[]>();
  for (let i = 0; i < pos.count; i++) {
    const key = `${pos.getX(i).toFixed(4)},${pos.getY(i).toFixed(4)},${pos.getZ(i).toFixed(4)}`;
    const bucket = groups.get(key);
    if (bucket) bucket.push(i);
    else groups.set(key, [i]);
  }

  const out = new Float32Array(src.count * 3);
  for (const bucket of groups.values()) {
    for (const i of bucket) {
      const nx = src.getX(i);
      const ny = src.getY(i);
      const nz = src.getZ(i);
      let ax = 0;
      let ay = 0;
      let az = 0;
      for (const j of bucket) {
        const jx = src.getX(j);
        const jy = src.getY(j);
        const jz = src.getZ(j);
        if (nx * jx + ny * jy + nz * jz >= cos) {
          ax += jx;
          ay += jy;
          az += jz;
        }
      }
      const len = Math.hypot(ax, ay, az) || 1;
      out[i * 3] = ax / len;
      out[i * 3 + 1] = ay / len;
      out[i * 3 + 2] = az / len;
    }
  }
  geo.setAttribute("normal", new THREE.BufferAttribute(out, 3));
  return geo;
}

/** Zaokrąglony prostokąt — kształt pod ekstruzję (korpus i płyn). */
function roundedRect(w: number, h: number, r: number) {
  const shape = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  shape.moveTo(x + r, y);
  shape.lineTo(x + w - r, y);
  shape.quadraticCurveTo(x + w, y, x + w, y + r);
  shape.lineTo(x + w, y + h - r);
  shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  shape.lineTo(x + r, y + h);
  shape.quadraticCurveTo(x, y + h, x, y + h - r);
  shape.lineTo(x, y + r);
  shape.quadraticCurveTo(x, y, x + r, y);
  return shape;
}

/** Korpus/płyn: prostokąt wyciągnięty w głąb z fazowanymi krawędziami. */
function extrudedBox(w: number, h: number, d: number, r: number, bevel: number, crease?: number) {
  const depth = Math.max(d - bevel * 2, 0.001);
  const geo = new THREE.ExtrudeGeometry(roundedRect(w - bevel * 2, h - bevel * 2, r), {
    depth,
    bevelEnabled: bevel > 0,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelOffset: 0,
    bevelSegments: 4,
    curveSegments: 16,
  });
  geo.center();
  geo.computeVertexNormals();
  if (crease !== undefined) creaseNormals(geo, crease);
  return geo;
}

function mistGeometry() {
  const positions = new Float32Array(MIST_COUNT * 3);
  for (let i = 0; i < MIST_COUNT; i++) {
    const h = 0.2 + Math.random() * 1.7;
    const spread = 0.04 + h * 0.14 * Math.random();
    const angle = Math.random() * Math.PI * 2;
    positions[i * 3] = Math.cos(angle) * spread;
    positions[i * 3 + 1] = h;
    positions[i * 3 + 2] = Math.sin(angle) * spread;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  return geo;
}

/** Ręczne rysowanie z rozstrzeloną spacją (letter-spacing nie jest wszędzie wspierany). */
function trackedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  cy: number,
  tracking: number,
) {
  const chars = Array.from(text);
  const widths = chars.map((ch) => ctx.measureText(ch).width);
  const total = widths.reduce((a, b) => a + b, 0) + tracking * Math.max(chars.length - 1, 0);
  let x = cx - total / 2;
  chars.forEach((ch, i) => {
    ctx.fillText(ch, x + widths[i] / 2, cy);
    x += widths[i] + tracking;
  });
}

/** Tekstura napisu na przezroczystym tle (złoty tusz jak na realnym flakonie). */
function makeLabelTexture(
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void,
  w = 1024,
  h = 512,
) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.clearRect(0, 0, w, h);
    draw(ctx, w, h);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
}

const SERIF = "Georgia, 'Times New Roman', 'Liberation Serif', 'DejaVu Serif', serif";

export function PlaceholderBottle({ lowPower }: { lowPower: boolean }) {
  const capRef = useRef<THREE.Group>(null);
  const mistRef = useRef<THREE.Points>(null);
  const mistMatRef = useRef<THREE.PointsMaterial>(null);

  const bodyGeo = useMemo(
    () => extrudedBox(BODY_W, BODY_H, BODY_D, BODY_R, 0.07, 0.6),
    [],
  );
  const liquidGeo = useMemo(
    () => extrudedBox(LIQUID_W, LIQUID_H, LIQUID_D, 0.09, 0.045),
    [],
  );
  // Tafla płynu — cienka, w kolorze płynu (subtelny menisk, nie „plastikowa nakrywka")
  const surfaceGeo = useMemo(() => {
    const geo = extrudedBox(LIQUID_W - 0.02, LIQUID_D - 0.02, 0.02, 0.085, 0);
    geo.rotateX(-Math.PI / 2);
    return geo;
  }, []);
  const mistGeo = useMemo(() => mistGeometry(), []);

  // Napisy: logo nad płynem + „EAU DE PARFUM" / „50 ml" w dolnej części szkła.
  const logoTex = useMemo(
    () =>
      makeLabelTexture((ctx, w, h) => {
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = GOLD_INK;
        ctx.font = `500 148px ${SERIF}`;
        trackedText(ctx, "LAVIÉRA", w / 2, h * 0.42, 18);
        ctx.fillStyle = "#B8965B";
        ctx.font = `italic 58px ${SERIF}`;
        trackedText(ctx, "by Zodara Parfums", w / 2, h * 0.62, 1);
      }),
    [],
  );
  const bottomTex = useMemo(
    () =>
      makeLabelTexture((ctx, w, h) => {
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = GOLD_INK;
        ctx.font = `500 82px ${SERIF}`;
        trackedText(ctx, "EAU DE PARFUM", w / 2, h * 0.36, 30);
        ctx.font = `500 74px ${SERIF}`;
        trackedText(ctx, "50 ml", w / 2, h * 0.66, 4);
      }),
    [],
  );

  // Geometrie/tworzone ręcznie trzeba oddać — inaczej przy odmontowaniu zostają w pamięci.
  useEffect(
    () => () => {
      bodyGeo.dispose();
      liquidGeo.dispose();
      surfaceGeo.dispose();
      mistGeo.dispose();
      logoTex.dispose();
      bottomTex.dispose();
    },
    [bodyGeo, liquidGeo, surfaceGeo, mistGeo, logoTex, bottomTex],
  );

  useFrame(() => {
    const state = sampleBottleState(scrollStore.progress);

    // Zakrętka: unosi się i obraca w trakcie „otwierania"
    if (capRef.current) {
      capRef.current.position.y = CAP_BASE_Y + state.capLift * CAP_LIFT;
      capRef.current.rotation.y = state.capLift * 0.8;
    }

    // „Spray" — im większy przechył, tym widoczniejsza mgiełka
    const spray = Math.max(0, -state.rotZ / SPRAY_TILT);
    if (mistMatRef.current) mistMatRef.current.opacity = spray * 0.5;
    if (mistRef.current) {
      mistRef.current.visible = spray > 0.02;
      mistRef.current.scale.setScalar(1 + spray * 0.9);
    }
  });

  // Szkło: pełne przepuszczenie światła z załamaniem — przy osłabionym
  // sprzęcie tańszy, ale wciąż wyraźnie przezroczysty wariant (bez transmission).
  const glass = lowPower ? (
    <meshPhysicalMaterial
      color="#FFFFFF"
      roughness={0.05}
      metalness={0}
      clearcoat={1}
      clearcoatRoughness={0.03}
      envMapIntensity={1.6}
      transparent
      opacity={0.18}
      depthWrite={false}
    />
  ) : (
    <meshPhysicalMaterial
      color="#ffffff"
      transmission={1}
      thickness={0.8}
      ior={1.5}
      roughness={0.015}
      metalness={0}
      reflectivity={0.6}
      clearcoat={1}
      clearcoatRoughness={0.02}
      envMapIntensity={1.8}
      attenuationColor="#F7F4EC"
      attenuationDistance={8}
      dispersion={0.1}
    />
  );

  // Płyn: naturalny jasny champagne — bez emissive (to dawało „sztuczny" glow),
  // przezroczysty na tyle, by światło przechodziło przez całą objętość.
  const liquid = (
    <meshPhysicalMaterial
      color="#F6EAC8"
      roughness={0.08}
      metalness={0}
      clearcoat={0.9}
      clearcoatRoughness={0.08}
      envMapIntensity={1.7}
      transparent
      opacity={0.82}
    />
  );

  const gold = (roughness: number, color = "#D8B26A") => (
    <meshStandardMaterial
      color={color}
      metalness={1}
      roughness={roughness}
      envMapIntensity={1.6}
    />
  );

  // Złoty tusz odbijający światło (metaliczny, ale tylko na samych literach).
  const ink = (map: THREE.Texture) => (
    <meshStandardMaterial
      map={map}
      transparent
      metalness={0.55}
      roughness={0.34}
      envMapIntensity={1.3}
      side={THREE.FrontSide}
    />
  );

  return (
    <group>
      {/* Korpus — prostokątne, w pełni przezroczyste szkło z fazowanymi krawędziami */}
      <mesh geometry={bodyGeo}>{glass}</mesh>

      {/* Płyn wewnątrz — jasny, naturalnie przepuszczający światło */}
      <mesh geometry={liquidGeo} position={[0, LIQUID_Y, 0]}>
        {liquid}
      </mesh>

      {/* Tafla płynu — subtelny menisk w kolorze cieczy */}
      <mesh geometry={surfaceGeo} position={[0, LIQUID_Y + LIQUID_H / 2, 0]}>
        <meshPhysicalMaterial
          color="#FBF3DC"
          roughness={0.06}
          metalness={0}
          clearcoat={1}
          clearcoatRoughness={0.05}
          envMapIntensity={1.3}
          transparent
          opacity={0.62}
        />
      </mesh>

      {/* Napisy na przedniej szybie — jak na realnym flakonie */}
      <mesh position={[0, -0.04, FRONT_Z]}>
        <planeGeometry args={[1.32, 0.66]} />
        {ink(logoTex)}
      </mesh>
      <mesh position={[0, -0.77, FRONT_Z]}>
        <planeGeometry args={[0.92, 0.4]} />
        {ink(bottomTex)}
      </mesh>

      {/* Szyjka (szkło) */}
      <mesh position={[0, BODY_H / 2 + 0.08, 0]}>
        <cylinderGeometry args={[0.27, 0.29, 0.26, 48]} />
        {glass}
      </mesh>

      {/* Złoty kołnierz na szyjce */}
      <mesh position={[0, BODY_H / 2 + 0.24, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.12, 64]} />
        {gold(0.24)}
      </mesh>

      {/* Atomizer odsłaniany po zdjęciu zakrętki */}
      <mesh position={[0, BODY_H / 2 + 0.38, 0]}>
        <cylinderGeometry args={[0.17, 0.19, 0.16, 48]} />
        {gold(0.3)}
      </mesh>
      <mesh position={[0, BODY_H / 2 + 0.5, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.12, 32]} />
        <meshStandardMaterial color="#EDE7DA" metalness={0.9} roughness={0.28} envMapIntensity={1.3} />
      </mesh>

      {/* Zakrętka (animowana scrollem) — wysoki, polerowany cylinder */}
      <group ref={capRef} position={[0, CAP_BASE_Y, 0]}>
        <mesh position={[0, 0.34, 0]}>
          <cylinderGeometry args={[0.33, 0.335, 0.74, 64]} />
          {gold(0.12)}
        </mesh>
        {/* Cienki jaśniejszy rant u dołu — miejsce, w którym kapelusz łapie światło */}
        <mesh position={[0, 0.012, 0]}>
          <cylinderGeometry args={[0.34, 0.34, 0.03, 64]} />
          {gold(0.2, "#E6C689")}
        </mesh>
        {/* Wieńczący dysk */}
        <mesh position={[0, 0.748, 0]}>
          <cylinderGeometry args={[0.325, 0.33, 0.04, 64]} />
          {gold(0.16, "#E9CD97")}
        </mesh>
      </group>

      {/* Mgiełka „sprayu\" — pojawia się przy przechyle */}
      <points ref={mistRef} geometry={mistGeo} position={[0, 1.6, 0]} visible={false}>
        <pointsMaterial
          ref={mistMatRef}
          size={0.055}
          color="#F4F1EA"
          transparent
          opacity={0}
          depthWrite={false}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

import {
  Component,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ErrorInfo,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { ContactShadows, useTexture } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useLanguage } from "@/i18n/LanguageContext";

import {
  BOOK_GEOMETRY,
  HARDCOVER_EDITIONS,
  type HardcoverEdition,
  rotationFromHorizontalDrag,
  shouldAutoRotate,
} from "./bookTextureConfig";

const VIEW_ANGLES = {
  front: THREE.MathUtils.degToRad(14),
  spine: Math.PI / 2,
  back: Math.PI,
} as const;

const EDITION_SESSION_KEY = "rgg-hardcover-edition";

type BookSceneProps = {
  targetRotation: React.MutableRefObject<number>;
  lastInteraction: React.MutableRefObject<number>;
  reducedMotion: boolean;
  visualTestMode: boolean;
  edition: HardcoverEdition;
  onAnimationStateChange?: (rotation: number, autoRotating: boolean) => void;
  onReady: () => void;
};

function prepareTexture(source: THREE.Texture) {
  const texture = source.clone();
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.anisotropy = 8;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

function createPageEdgeTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext("2d");
  if (!context) return null;

  context.fillStyle = "#ded5bd";
  context.fillRect(0, 0, canvas.width, canvas.height);
  for (let y = 2; y < canvas.height; y += 4) {
    context.fillStyle = y % 12 === 2 ? "rgba(91,72,42,0.16)" : "rgba(91,72,42,0.08)";
    context.fillRect(0, y, canvas.width, 1);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  return texture;
}

function HardcoverBook({
  targetRotation,
  lastInteraction,
  reducedMotion,
  visualTestMode,
  edition,
  onAnimationStateChange,
  onReady,
}: BookSceneProps) {
  const group = useRef<THREE.Group>(null);
  const editionArtwork = HARDCOVER_EDITIONS[edition];
  const sourceTextures = useTexture([
    editionArtwork.front,
    editionArtwork.spine,
    editionArtwork.back,
  ]);
  const textures = useMemo(
    () => ({
      front: prepareTexture(sourceTextures[0]),
      spine: prepareTexture(sourceTextures[1]),
      back: prepareTexture(sourceTextures[2]),
      pages: createPageEdgeTexture(),
    }),
    [sourceTextures],
  );

  useEffect(
    () => () => {
      textures.front.dispose();
      textures.spine.dispose();
      textures.back.dispose();
      textures.pages?.dispose();
    },
    [textures],
  );

  useEffect(() => {
    onReady();
  }, [edition, onReady]);

  useFrame((_, delta) => {
    if (!group.current) return;
    if (visualTestMode) {
      group.current.rotation.y = targetRotation.current;
      onAnimationStateChange?.(targetRotation.current, false);
      return;
    }
    const autoRotating = shouldAutoRotate(
      reducedMotion,
      performance.now() - lastInteraction.current,
    );
    if (autoRotating) {
      targetRotation.current += delta * THREE.MathUtils.degToRad(7);
    }
    group.current.rotation.y = THREE.MathUtils.damp(
      group.current.rotation.y,
      targetRotation.current,
      7,
      delta,
    );
    onAnimationStateChange?.(targetRotation.current, autoRotating);
  });

  const { width, height, pageDepth, boardThickness, boardOverhang } =
    BOOK_GEOMETRY;
  const coverMaterial = {
    color: "#f4ecd8",
    roughness: 0.72,
    metalness: 0.02,
  };

  return (
    <group
      ref={group}
      rotation={[
        THREE.MathUtils.degToRad(-3),
        targetRotation.current,
        0,
      ]}
    >
      <mesh position={[0, 0, -(pageDepth + boardThickness) / 2]} castShadow>
        <boxGeometry args={[width, height, boardThickness]} />
        <meshStandardMaterial {...coverMaterial} />
      </mesh>
      <mesh position={[0, 0, (pageDepth + boardThickness) / 2]} castShadow>
        <boxGeometry args={[width, height, boardThickness]} />
        <meshStandardMaterial {...coverMaterial} />
      </mesh>

      <mesh position={[0, 0, pageDepth / 2 + boardThickness + 0.0008]}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial
          map={textures.front}
          roughness={0.7}
          metalness={0.01}
        />
      </mesh>
      <mesh
        position={[0, 0, -(pageDepth / 2 + boardThickness + 0.0008)]}
        rotation={[0, Math.PI, 0]}
      >
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial
          map={textures.back}
          roughness={0.74}
          metalness={0.01}
        />
      </mesh>
      <mesh
        position={[-width / 2 - 0.0008, 0, 0]}
        rotation={[0, -Math.PI / 2, 0]}
      >
        <planeGeometry args={[pageDepth + boardThickness * 2, height]} />
        <meshStandardMaterial
          map={textures.spine}
          roughness={0.74}
          metalness={0.01}
        />
      </mesh>

      <mesh position={[boardOverhang / 2, 0, 0]} castShadow receiveShadow>
        <boxGeometry
          args={[
            width - boardOverhang * 2,
            height - boardOverhang * 2,
            pageDepth,
          ]}
        />
        <meshStandardMaterial
          color="#ded5bd"
          map={textures.pages}
          roughness={0.94}
          metalness={0}
        />
      </mesh>
    </group>
  );
}

function Scene(props: BookSceneProps) {
  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight
        castShadow
        color="#fff3d1"
        intensity={2.4}
        position={[2.4, 3.2, 4]}
      />
      <directionalLight color="#4f8465" intensity={1.1} position={[-3, 1, 2]} />
      <spotLight
        color="#c8a96b"
        intensity={3}
        angle={0.55}
        penumbra={1}
        position={[2.5, 2, -3]}
      />
      <Suspense fallback={null}>
        <HardcoverBook {...props} />
        <ContactShadows
          position={[0, -0.57, 0]}
          opacity={0.38}
          scale={2.1}
          blur={2.8}
          far={1.8}
        />
      </Suspense>
    </>
  );
}

function BookFallback({
  edition,
  unavailable = false,
}: {
  edition: HardcoverEdition;
  unavailable?: boolean;
}) {
  const { text } = useLanguage();
  return (
    <div className="flex h-full min-h-[430px] flex-col items-center justify-center bg-transparent px-8 text-center">
      <img
        src={HARDCOVER_EDITIONS[edition].front}
        alt={
          edition === "fr"
            ? "Couverture de Reconquérir l'Or Vert"
            : "Cover of Reclaiming the Green Gold"
        }
        className="max-h-[330px] w-auto shadow-[0_28px_60px_rgba(0,0,0,0.5)]"
      />
      <p className="mt-6 text-[10px] uppercase tracking-[0.2em] text-[#A98C50]">
        {unavailable
          ? text("3D preview unavailable on this device.", "Aperçu 3D indisponible sur cet appareil.")
          : text("Loading 3D edition…", "Chargement de l'édition 3D…")}
      </p>
    </div>
  );
}

class WebGLErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {}

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      canvas.getContext("webgl2") || canvas.getContext("webgl"),
    );
  } catch {
    return false;
  }
}

export default function RGGBook3D({
  visualTestView,
  interactionTestMode = false,
  cameraDistance = 1.85,
  showEditionSelector = true,
}: {
  visualTestView?: keyof typeof VIEW_ANGLES;
  interactionTestMode?: boolean;
  cameraDistance?: number;
  showEditionSelector?: boolean;
}) {
  const { language, text } = useLanguage();
  const [edition, setEdition] = useState<HardcoverEdition>(() => {
    const savedEdition = window.sessionStorage.getItem(EDITION_SESSION_KEY);
    return savedEdition === "en" || savedEdition === "fr"
      ? savedEdition
      : language;
  });
  const targetRotation = useRef(
    visualTestView ? VIEW_ANGLES[visualTestView] : VIEW_ANGLES.front,
  );
  const lastInteraction = useRef(performance.now());
  const pointerStart = useRef<{
    x: number;
    y: number;
    rotation: number;
    axis: "horizontal" | "vertical" | null;
  } | null>(null);
  const viewer = useRef<HTMLDivElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [webGLAvailable, setWebGLAvailable] = useState<boolean | null>(null);
  const [viewerReady, setViewerReady] = useState(false);
  const markViewerReady = useCallback(() => setViewerReady(true), []);
  const reportAnimationState = useCallback(
    (rotation: number, autoRotating: boolean) => {
      if (!viewer.current) return;
      viewer.current.dataset.targetRotation = rotation.toString();
      viewer.current.dataset.autoRotating = autoRotating ? "true" : "false";
    },
    [],
  );

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(query.matches);
    updatePreference();
    query.addEventListener("change", updatePreference);
    setWebGLAvailable(supportsWebGL());
    return () => query.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    if (!viewerReady) return;
    const alternateEdition = edition === "en" ? "fr" : "en";
    const timer = window.setTimeout(() => {
      const alternateArtwork = HARDCOVER_EDITIONS[alternateEdition];
      [alternateArtwork.front, alternateArtwork.spine, alternateArtwork.back].forEach(
        (source) => {
          const image = new Image();
          image.src = source;
        },
      );
    }, 600);
    return () => window.clearTimeout(timer);
  }, [edition, viewerReady]);

  const markInteraction = () => {
    lastInteraction.current = performance.now();
  };

  const selectEdition = (nextEdition: HardcoverEdition) => {
    if (nextEdition === edition) return;
    markInteraction();
    setViewerReady(false);
    setEdition(nextEdition);
    window.sessionStorage.setItem(EDITION_SESSION_KEY, nextEdition);
  };

  const rotateBy = (degrees: number) => {
    markInteraction();
    targetRotation.current += THREE.MathUtils.degToRad(degrees);
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    pointerStart.current = {
      x: event.clientX,
      y: event.clientY,
      rotation: targetRotation.current,
      axis: null,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    markInteraction();
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!pointerStart.current) return;
    const deltaX = event.clientX - pointerStart.current.x;
    const deltaY = event.clientY - pointerStart.current.y;
    if (!pointerStart.current.axis) {
      if (Math.hypot(deltaX, deltaY) < 6) return;
      pointerStart.current.axis =
        Math.abs(deltaX) > Math.abs(deltaY) ? "horizontal" : "vertical";
    }
    if (pointerStart.current.axis === "vertical") return;
    targetRotation.current = rotationFromHorizontalDrag(
      pointerStart.current.rotation,
      deltaX,
    );
    markInteraction();
  };

  const handlePointerEnd = (event: ReactPointerEvent<HTMLDivElement>) => {
    pointerStart.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    markInteraction();
  };

  return (
    <div>
      {showEditionSelector && !visualTestView && (
        <div
          aria-label={text("Hardcover edition", "Édition reliée")}
          className="mb-5 flex flex-col items-center gap-3"
          role="group"
        >
          <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-[#8A7A55]">
            {text("Hardcover edition", "Édition reliée")}
          </p>
          <div className="flex items-center justify-center gap-2">
            {(Object.keys(HARDCOVER_EDITIONS) as HardcoverEdition[]).map(
              (editionCode) => {
                const selected = editionCode === edition;
                return (
                  <button
                    key={editionCode}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => selectEdition(editionCode)}
                    className={`min-h-11 border px-5 text-[9px] font-bold uppercase tracking-[0.18em] transition-colors ${
                      selected
                        ? "border-[#C8A96B] bg-[#C8A96B]/15 text-[#EDD99A]"
                        : "border-[#314739] bg-[#07100A] text-[#F4F1EA] hover:border-[#8A7A55]"
                    }`}
                  >
                    {HARDCOVER_EDITIONS[editionCode].label}
                  </button>
                );
              },
            )}
          </div>
        </div>
      )}

      {webGLAvailable === null ? (
        <BookFallback edition={edition} />
      ) : !webGLAvailable ? (
        <BookFallback edition={edition} unavailable />
      ) : (
      <div
        ref={viewer}
        role="img"
        data-testid="book-3d-viewer"
        data-book-view={visualTestView}
        data-book-edition={edition}
        data-viewer-ready={viewerReady ? "true" : "false"}
        tabIndex={0}
        aria-label={text("Interactive 3D model of the Reclaiming the Green Gold hardcover book. Use drag or the controls below to rotate the book.", "Modèle 3D interactif du livre relié Reconquérir l'Or Vert. Utilisez le glissement ou les commandes ci-dessous pour faire pivoter le livre.")}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            rotateBy(-20);
          }
          if (event.key === "ArrowRight") {
            event.preventDefault();
            rotateBy(20);
          }
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        className="relative h-[430px] cursor-grab touch-pan-y overflow-hidden border border-[#203528] bg-transparent outline-none focus-visible:border-[#C8A96B] active:cursor-grabbing sm:h-[520px] lg:h-[610px]"
      >
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 flex items-center justify-center bg-transparent p-7 transition-opacity duration-500 ${
            viewerReady ? "opacity-0" : "opacity-100"
          }`}
        >
          <img
            src={HARDCOVER_EDITIONS[edition].front}
            alt=""
            width={900}
            height={1350}
            loading="eager"
            fetchPriority="high"
            className="max-h-full w-auto shadow-[0_28px_60px_rgba(0,0,0,0.5)]"
          />
        </div>
        <WebGLErrorBoundary
          fallback={<BookFallback edition={edition} unavailable />}
        >
          <Canvas
            shadows
            dpr={[1, 1.75]}
            className={`transition-opacity duration-500 ${
              viewerReady ? "opacity-100" : "opacity-0"
            }`}
            camera={{
              position: [0, 0.02, cameraDistance],
              fov: 38,
              near: 0.1,
              far: 20,
            }}
            gl={{
              antialias: true,
              alpha: true,
              powerPreference: "high-performance",
            }}
          >
            <Scene
              targetRotation={targetRotation}
              lastInteraction={lastInteraction}
              reducedMotion={reducedMotion || visualTestView !== undefined}
              visualTestMode={visualTestView !== undefined}
              edition={edition}
              onAnimationStateChange={
                interactionTestMode ? reportAnimationState : undefined
              }
              onReady={markViewerReady}
            />
          </Canvas>
        </WebGLErrorBoundary>
      </div>
      )}

      {!visualTestView && (
        <p className="mt-5 text-center text-sm font-semibold uppercase tracking-[0.12em] text-[#C8A96B]">
          <span className="hidden sm:inline">
            {text(
              "Use your mouse to click and drag the book",
              "Utilisez votre souris pour cliquer et faire glisser le livre",
            )}
          </span>
          <span className="sm:hidden">
            {text(
              "Swipe to rotate the book",
              "Balayez pour faire pivoter le livre",
            )}
          </span>
        </p>
      )}
    </div>
  );
}
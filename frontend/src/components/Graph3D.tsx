import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Line, Text, Sparkles, Html } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { useQuery } from '@tanstack/react-query';
import { getGraphData } from '../services/api';

// --- Types ---
interface Node {
    id: number;
    name: string;
    symbol: string;
    val: number;
    prediction: number;
    sector: string;
    x: number;
    y: number;
    z: number;
    momentum: number;
    volatility: number;
    liquidity: number;
    market_cap?: number;
    confidence?: number;
}

interface Link {
    source: number;
    target: number;
    correlation: number;
}

// --- Constants ---
const SECTOR_COLORS: Record<string, string> = {
    Technology: '#00ffff',
    Finance: '#00ff88',
    Energy: '#ffaa00',
    Healthcare: '#ff2266',
    Consumer: '#cc44ff',
    Industrial: '#ff6600',
    Materials: '#00aaff',
    Utilities: '#9955ff',
    RealEstate: '#ff00aa',
    Neutral: '#888888'
};

// ========================================================================
// FEATURE 4 — Market Hours Link Color Palette
// ========================================================================
const getMarketPhase = (): 'pre' | 'open' | 'post' | 'closed' => {
    const now = new Date();
    const ist = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    const h = ist.getHours();
    const m = ist.getMinutes();
    const mins = h * 60 + m;

    if (mins >= 9 * 60 + 0 && mins < 9 * 60 + 15) return 'pre';
    if (mins >= 9 * 60 + 15 && mins < 15 * 60 + 30) return 'open';
    if (mins >= 15 * 60 + 30 && mins < 16 * 60) return 'post';
    return 'closed';
};

const MARKET_PHASE_LINK_PALETTE = {
    pre: { low: '#334488', mid: '#4488bb', high: '#44aaff' },
    open: { low: '#1144aa', mid: '#44ffcc', high: '#ff44cc' },
    post: { low: '#553300', mid: '#aa6622', high: '#ffaa44' },
    closed: { low: '#222233', mid: '#334455', high: '#446677' },
};

// ========================================================================
// FEATURE 3 — Cinematic Camera Controller with Particle Trail
// ========================================================================
const CameraController = ({ focusedNode }: { focusedNode: Node | null }) => {
    const { camera, scene } = useThree();
    const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));
    const prevCamPos = useRef(new THREE.Vector3());
    const trailParticles = useRef<THREE.Points | null>(null);
    const trailPositions = useRef<Float32Array>(new Float32Array(60 * 3));
    const trailIndex = useRef(0);
    const isFlying = useRef(false);

    useEffect(() => {
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(trailPositions.current, 3));
        const mat = new THREE.PointsMaterial({
            color: '#88ddff',
            size: 1.5,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });
        const points = new THREE.Points(geo, mat);
        scene.add(points);
        trailParticles.current = points;

        return () => { scene.remove(points); };
    }, [scene]);

    useFrame((_state, delta) => {
        if (focusedNode) {
            const nodePos = new THREE.Vector3(focusedNode.x, focusedNode.y, focusedNode.z);
            const directionFromCenter = nodePos.clone().normalize();
            const desiredCameraPos = nodePos.clone().add(directionFromCenter.multiplyScalar(80));
            desiredCameraPos.y += 30;

            const distanceMoved = camera.position.distanceTo(desiredCameraPos);
            isFlying.current = distanceMoved > 5;

            camera.position.lerp(desiredCameraPos, delta * 3.0);
            targetLookAt.current.lerp(nodePos, delta * 4.0);
            camera.lookAt(targetLookAt.current);

            // Deposit trail particles while flying
            if (isFlying.current && trailParticles.current) {
                const idx = trailIndex.current % 60;
                trailPositions.current[idx * 3 + 0] = camera.position.x + (Math.random() - 0.5) * 4;
                trailPositions.current[idx * 3 + 1] = camera.position.y + (Math.random() - 0.5) * 4;
                trailPositions.current[idx * 3 + 2] = camera.position.z + (Math.random() - 0.5) * 4;
                trailIndex.current++;
                (trailParticles.current.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
            }
        } else {
            isFlying.current = false;
            targetLookAt.current.lerp(new THREE.Vector3(0, 0, 0), delta * 2.0);
            camera.lookAt(targetLookAt.current);

            // Fade out trail by zeroing positions gradually
            if (trailParticles.current) {
                for (let i = 0; i < 60 * 3; i++) {
                    trailPositions.current[i] *= 0.92;
                }
                (trailParticles.current.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
            }
        }

        prevCamPos.current.copy(camera.position);
    });

    return null;
};

// ========================================================================
// FEATURE 2 — Pulse Wave Particles Along Links
// ========================================================================
const PulseParticle = ({ sourceNode, targetNode, color, speed }: {
    sourceNode: any, targetNode: any, color: string, speed: number
}) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const progress = useRef(Math.random());

    useFrame((_state, delta) => {
        if (!meshRef.current) return;
        progress.current = (progress.current + delta * speed) % 1.0;
        const t = progress.current;

        meshRef.current.position.set(
            sourceNode.x + (targetNode.x - sourceNode.x) * t,
            sourceNode.y + (targetNode.y - sourceNode.y) * t,
            sourceNode.z + (targetNode.z - sourceNode.z) * t,
        );
    });

    return (
        <mesh ref={meshRef}>
            <sphereGeometry args={[0.6, 8, 8]} />
            <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={6}
                transparent
                opacity={0.9}
            />
        </mesh>
    );
};

// ========================================================================
// FEATURE 6 — Sector Cluster Glow Halos
// ========================================================================
const SectorHalo = ({ nodes }: { nodes: any[] }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const pulseRef = useRef(Math.random() * Math.PI * 2);

    const centroid = useMemo(() => {
        const c = new THREE.Vector3();
        nodes.forEach((n: any) => c.add(new THREE.Vector3(n.x, n.y, n.z)));
        c.divideScalar(nodes.length);
        return c;
    }, [nodes]);

    const color = SECTOR_COLORS[nodes[0]?.sector] || '#888888';

    const radius = useMemo(() => {
        let max = 0;
        nodes.forEach((n: any) => {
            const d = new THREE.Vector3(n.x, n.y, n.z).distanceTo(centroid);
            if (d > max) max = d;
        });
        return max + 20;
    }, [nodes, centroid]);

    useFrame((_state, delta) => {
        if (!meshRef.current) return;
        pulseRef.current += delta * 0.5;
        const mat = meshRef.current.material as THREE.MeshStandardMaterial;
        mat.opacity = 0.03 + Math.sin(pulseRef.current) * 0.015;
        mat.emissiveIntensity = 0.5 + Math.sin(pulseRef.current) * 0.3;
    });

    return (
        <mesh ref={meshRef} position={centroid}>
            <sphereGeometry args={[radius, 32, 32]} />
            <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={0.5}
                transparent
                opacity={0.04}
                side={THREE.BackSide}
                depthWrite={false}
            />
        </mesh>
    );
};

// ========================================================================
// FEATURES 1 & 5 — Node with Heartbeat + Momentum Pulse
// ========================================================================
const NodeMesh = React.memo(({
    node,
    onClick,
    hoveredNodeId,
    setHoveredNodeId,
    neighbors
}: {
    node: Node;
    onClick: (node: Node) => void;
    hoveredNodeId: number | null;
    setHoveredNodeId: (id: number | null) => void;
    neighbors: number[];
}) => {
    const groupRef = useRef<THREE.Group>(null);
    const ringRef1 = useRef<THREE.Mesh>(null);
    const ringRef2 = useRef<THREE.Mesh>(null);
    const breathRef = useRef(0);                              // Feature 1
    const momentumPulse = useRef(Math.random() * Math.PI * 2); // Feature 5

    const color = SECTOR_COLORS[node.sector] || SECTOR_COLORS.Neutral;

    const isHovered = hoveredNodeId === node.id;
    const isNeighbor = neighbors.includes(node.id);
    const isDimmed = hoveredNodeId !== null && !isHovered && !isNeighbor;
    const isBearish = node.prediction < 0;

    const confidence = node.confidence !== undefined ? node.confidence : (node.momentum || 0.5);
    const glowIntensity = 1.0 + (confidence * 5.0);
    const momentum = node.momentum || 0.5;
    const isHighMomentum = Math.abs(momentum) > 0.7;

    useFrame((_state, delta) => {
        if (!groupRef.current) return;

        // --- Feature 1: Heartbeat / Breathing based on volatility ---
        const volatility = node.volatility || 0.3;
        breathRef.current += delta * (2.0 + volatility * 8.0);
        const breathScale = 1.0 + Math.sin(breathRef.current) * (0.04 + volatility * 0.12);

        // --- Feature 5: Momentum-driven size pulse ---
        momentumPulse.current += delta * (1.5 + Math.abs(momentum) * 4.0);
        const momentumBeat = 1.0 + Math.sin(momentumPulse.current) * (Math.abs(momentum) * 0.2);
        const baseScale = (2.0 + (node.liquidity || 0.1) * 3.0) * momentumBeat;

        const targetScale = isHovered
            ? baseScale * 1.5
            : isNeighbor
                ? baseScale * 1.2
                : baseScale * breathScale;

        groupRef.current.scale.lerp(
            new THREE.Vector3(targetScale, targetScale, targetScale),
            delta * (isHovered ? 10 : 4)
        );

        // Ring orbit animations
        if (ringRef1.current && ringRef2.current) {
            ringRef1.current.rotation.x += delta * 0.5;
            ringRef1.current.rotation.y += delta * 0.7;
            ringRef2.current.rotation.x -= delta * 0.6;
            ringRef2.current.rotation.z += delta * 0.8;
        }
    });

    return (
        <group position={[node.x, node.y, node.z]} ref={groupRef}>
            {/* 3D Label - Only visible on hover or neighbor */}
            {(isHovered || (hoveredNodeId !== null && isNeighbor)) && (
                <Text
                    position={[0, 4.5, 0]}
                    fontSize={2.5}
                    color="#ffffff"
                    anchorX="center"
                    anchorY="middle"
                    outlineWidth={0.2}
                    outlineColor="#000000"
                    depthTest={false}
                >
                    {node.symbol}
                </Text>
            )}

            {/* Core Sphere */}
            <mesh
                onClick={(e: any) => { e.stopPropagation(); onClick(node); }}
                onPointerOver={(e: any) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; setHoveredNodeId(node.id); }}
                onPointerOut={(e: any) => { e.stopPropagation(); document.body.style.cursor = 'default'; setHoveredNodeId(null); }}
            >
                <sphereGeometry args={[1, 32, 32]} />
                <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={isHovered ? 4.0 : (isNeighbor ? 2.5 : glowIntensity)}
                    transparent
                    opacity={isDimmed ? 0.05 : (isBearish ? 0.35 : 0.95)}
                    roughness={0.1}
                    metalness={0.8}
                    wireframe={isBearish && !isHovered}
                />
            </mesh>

            {/* Cyberpunk Orbital Rings */}
            {!isDimmed && (
                <group>
                    <mesh ref={ringRef1}>
                        <torusGeometry args={[1.6, 0.08, 16, 64]} />
                        <meshStandardMaterial
                            color={color}
                            emissive={color}
                            emissiveIntensity={3}
                            transparent
                            opacity={0.6}
                        />
                    </mesh>
                    <mesh ref={ringRef2} rotation={[Math.PI / 2, 0, 0]}>
                        <torusGeometry args={[2.0, 0.04, 16, 64]} />
                        <meshStandardMaterial
                            color="#ffffff"
                            emissive="#ffffff"
                            emissiveIntensity={2}
                            transparent
                            opacity={0.4}
                        />
                    </mesh>

                    {/* Feature 5: Momentum flash ring — only for high-momentum stocks */}
                    {isHighMomentum && (
                        <mesh rotation={[Math.PI / 3, 0, 0]}>
                            <torusGeometry args={[2.5, 0.03, 8, 64]} />
                            <meshStandardMaterial
                                color={momentum > 0 ? "#00ff88" : "#ff4444"}
                                emissive={momentum > 0 ? "#00ff88" : "#ff4444"}
                                emissiveIntensity={4 + Math.sin(momentumPulse.current * 2) * 3}
                                transparent
                                opacity={0.5 + Math.sin(momentumPulse.current) * 0.3}
                            />
                        </mesh>
                    )}
                </group>
            )}

            {/* Sparkles for high confidence */}
            {!isDimmed && confidence > 0.8 && (
                <Sparkles
                    count={20}
                    scale={5}
                    size={4}
                    speed={1.5}
                    opacity={0.8}
                    color={color}
                />
            )}

            {/* Compact hover info card */}
            {isHovered && (
                <Html position={[0, 0, 0]} center style={{ pointerEvents: 'none', zIndex: 1000 }}>
                    <div
                        style={{
                            minWidth: '160px',
                            maxWidth: '180px',
                            padding: '8px 12px',
                            borderRadius: '10px',
                            background: 'rgba(10, 15, 30, 0.85)',
                            border: '1px solid rgba(255,255,255,0.25)',
                            boxShadow: '0 0 20px rgba(0,0,0,0.8)',
                            transform: 'translateY(-60px)',
                            backdropFilter: 'blur(8px)',
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <div style={{
                                    width: '8px', height: '8px', borderRadius: '50%',
                                    backgroundColor: color,
                                    boxShadow: `0 0 8px ${color}`
                                }} />
                                <span style={{ color: '#fff', fontWeight: 800, fontSize: '13px', letterSpacing: '0.5px' }}>
                                    {node.symbol}
                                </span>
                            </div>
                            <span style={{
                                fontSize: '8px', color: '#aaa', fontWeight: 700,
                                letterSpacing: '1px', textTransform: 'uppercase' as const,
                                background: 'rgba(255,255,255,0.08)',
                                padding: '2px 5px', borderRadius: '4px'
                            }}>
                                {node.sector}
                            </span>
                        </div>
                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginBottom: '6px' }} />
                        <div>
                            <div style={{ fontSize: '8px', color: '#888', textTransform: 'uppercase' as const, letterSpacing: '1px', marginBottom: '2px' }}>
                                Forecast
                            </div>
                            <span style={{
                                color: node.prediction > 0 ? '#4ade80' : '#f87171',
                                fontWeight: 700, fontSize: '14px', fontFamily: 'monospace'
                            }}>
                                {node.prediction > 0 ? '▲' : '▼'} {(Math.abs(node.prediction) * 100).toFixed(2)}%
                            </span>
                        </div>
                    </div>
                </Html>
            )}
        </group>
    );
});

// ========================================================================
// Scene Container — integrates all features
// ========================================================================
const GraphScene = ({
    data,
    onNodeClick,
    isAutoRotating,
    focusedNode
}: {
    data: { nodes: Node[], links: Link[] };
    onNodeClick: (node: Node) => void;
    isAutoRotating: boolean;
    focusedNode: Node | null;
}) => {
    const [hoveredNodeId, setHoveredNodeId] = useState<number | null>(null);

    const neighbors = useMemo(() => {
        if (hoveredNodeId === null) return [];
        return data.links
            .filter(l => l.source === hoveredNodeId || l.target === hoveredNodeId)
            .map(l => l.source === hoveredNodeId ? l.target : l.source);
    }, [hoveredNodeId, data.links]);

    // Fibonacci sphere distribution
    const processedNodes = useMemo(() => {
        return data.nodes.map((n, i) => {
            const phi = Math.acos(-1 + (2 * i) / data.nodes.length);
            const theta = Math.sqrt(data.nodes.length * Math.PI) * phi;
            const radius = 150 + (Math.random() * 30);
            return {
                ...n,
                x: n.x || radius * Math.cos(theta) * Math.sin(phi),
                y: n.y || radius * Math.sin(theta) * Math.sin(phi),
                z: n.z || radius * Math.cos(phi)
            };
        });
    }, [data.nodes]);

    // Feature 4: get current market phase for link coloring
    const phase = getMarketPhase();
    const palette = MARKET_PHASE_LINK_PALETTE[phase];

    return (
        <>
            <OrbitControls
                makeDefault
                enabled={!focusedNode}
                autoRotate={isAutoRotating && !hoveredNodeId && !focusedNode}
                autoRotateSpeed={1.0}
                enableDamping={true}
                dampingFactor={0.05}
                maxDistance={2500}
                minDistance={50}
            />

            <CameraController focusedNode={focusedNode} />

            <ambientLight intensity={0.2} />
            <pointLight position={[200, 200, 200]} intensity={2.5} color="#ffffff" />
            <pointLight position={[-200, -200, -200]} intensity={1.5} color="#4444ff" />

            <EffectComposer disableNormalPass>
                <Bloom luminanceThreshold={0.4} luminanceSmoothing={0.9} height={300} intensity={2.5} />
            </EffectComposer>

            <Stars radius={500} depth={200} count={10000} factor={6} saturation={0.5} fade speed={1.5} />

            <group>
                {/* Feature 6: Sector Cluster Halos */}
                {useMemo(() => {
                    const bySector: Record<string, any[]> = {};
                    processedNodes.forEach((n: any) => {
                        if (!bySector[n.sector]) bySector[n.sector] = [];
                        bySector[n.sector].push(n);
                    });
                    return Object.entries(bySector)
                        .filter(([_, nodes]) => nodes.length >= 2)
                        .map(([sector, nodes]) => (
                            <SectorHalo key={sector} nodes={nodes} />
                        ));
                }, [processedNodes])}

                {/* Links with Feature 2 (Pulse) + Feature 4 (Market Hours Colors) */}
                {data.links.map((link, i) => {
                    const sourceNode = processedNodes[link.source];
                    const targetNode = processedNodes[link.target];
                    if (!sourceNode || !targetNode) return null;

                    const isConnectedToHover = hoveredNodeId !== null &&
                        (link.source === hoveredNodeId || link.target === hoveredNodeId);

                    const corr = link.correlation;

                    // Feature 4: Market-phase-aware colors
                    const linkColor = isConnectedToHover
                        ? "#ffffff"
                        : corr > 0.75 ? palette.high
                            : corr > 0.5 ? palette.mid
                                : palette.low;

                    const lineWidth = isConnectedToHover
                        ? 5.0
                        : 0.5 + corr * 4.0;

                    const opacity = isConnectedToHover
                        ? 1.0
                        : hoveredNodeId !== null
                            ? 0.03
                            : 0.3 + corr * 0.6;

                    // Feature 2: Pulse particles on strong / hovered links
                    const showPulse = corr > 0.6 || isConnectedToHover;
                    const pulseSpeed = 0.3 + corr * 0.5;

                    return (
                        <group key={i}>
                            <Line
                                points={[[sourceNode.x, sourceNode.y, sourceNode.z], [targetNode.x, targetNode.y, targetNode.z]]}
                                color={linkColor}
                                transparent
                                opacity={opacity}
                                lineWidth={lineWidth}
                                depthWrite={false}
                            />
                            {showPulse && (
                                <PulseParticle
                                    sourceNode={sourceNode}
                                    targetNode={targetNode}
                                    color={isConnectedToHover ? "#ffffff" : linkColor}
                                    speed={pulseSpeed}
                                />
                            )}
                        </group>
                    );
                })}

                {processedNodes.map((node: any) => (
                    <NodeMesh
                        key={node.id}
                        node={node}
                        onClick={onNodeClick}
                        hoveredNodeId={hoveredNodeId}
                        setHoveredNodeId={setHoveredNodeId}
                        neighbors={neighbors}
                    />
                ))}
            </group>
        </>
    );
};

// ========================================================================
// Main Component
// ========================================================================
const Graph3D: React.FC<{ onNodeClick?: (node: any) => void }> = ({ onNodeClick }) => {
    const [isAutoRotating, setIsAutoRotating] = useState(true);
    const [focusedNode, setFocusedNode] = useState<Node | null>(null);

    const phase = getMarketPhase();

    const { data: graphData, isLoading, error } = useQuery({
        queryKey: ['graphData'],
        queryFn: getGraphData,
    });

    const handleNodeClick = (node: Node) => {
        setFocusedNode(node);
        if (onNodeClick) onNodeClick(node);
    };

    const handleCanvasPointerMissed = () => {
        if (focusedNode) {
            setFocusedNode(null);
        }
    };

    if (isLoading) return (
        <div className="w-full h-full flex items-center justify-center bg-[#020205] border border-white/5 rounded-2xl">
            <div className="flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6" />
                <span className="text-primary font-mono text-sm uppercase tracking-widest font-bold shadow-primary">Compiling Neural Graph...</span>
            </div>
        </div>
    );

    if (error) return (
        <div className="w-full h-full flex items-center justify-center bg-red-950/20 rounded-2xl">
            <div className="text-red-400 p-6 text-center backdrop-blur-md bg-black/60 rounded-xl border border-red-500/50">
                <p className="font-bold text-xl mb-2 flex items-center justify-center gap-3">
                    <span>⚠️</span> Link to AI Servers Lost
                </p>
            </div>
        </div>
    );

    if (!graphData || !graphData.nodes || graphData.nodes.length === 0) return null;

    return (
        <div className="w-full h-full relative group bg-black overflow-hidden rounded-[inherit]">
            <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(10,15,30,1)_0%,rgba(0,0,0,1)_100%)]">
                <Canvas
                    camera={{ position: [0, 0, 450], fov: 45, near: 1, far: 5000 }}
                    dpr={[1, 2]}
                    gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.3 }}
                    onPointerMissed={handleCanvasPointerMissed}
                >
                    <GraphScene
                        data={graphData}
                        isAutoRotating={isAutoRotating}
                        onNodeClick={handleNodeClick}
                        focusedNode={focusedNode}
                    />
                </Canvas>
            </div>

            {/* Cinematic Overlay UI */}
            <div className="absolute top-6 right-6 z-10 flex flex-col gap-4 transition-all duration-300 pointer-events-none">
                <div className="flex gap-3">
                    <button
                        onClick={() => setIsAutoRotating(!isAutoRotating)}
                        className="px-5 py-2.5 bg-black/60 backdrop-blur-xl rounded-xl border border-white/10 hover:border-white/30 hover:bg-white/10 text-white transition-all pointer-events-auto shadow-2xl font-mono text-xs tracking-widest uppercase flex items-center gap-3 font-bold"
                    >
                        {isAutoRotating ? (
                            <><span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_10px_#ff0000]"></span> Pause Engine</>
                        ) : (
                            <><span className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_10px_#00ff00]"></span> Rotate Engine</>
                        )}
                    </button>

                    {focusedNode && (
                        <button
                            onClick={handleCanvasPointerMissed}
                            className="px-5 py-2.5 bg-primary/20 backdrop-blur-xl rounded-xl border-2 border-primary/50 hover:bg-primary/40 text-primary transition-all pointer-events-auto shadow-[0_0_20px_rgba(var(--color-primary),0.3)] font-mono text-xs tracking-widest uppercase flex items-center gap-2 font-bold animate-pulse"
                        >
                            ⤫ Release Target
                        </button>
                    )}
                </div>
            </div>

            {/* Legend */}
            <div className="absolute bottom-6 left-6 bg-black/60 backdrop-blur-2xl p-6 rounded-2xl border border-white/10 shadow-2xl origin-bottom-left transition-all duration-500 pointer-events-none">
                <div className="text-[11px] uppercase text-white font-extrabold tracking-widest mb-5 flex items-center gap-3 border-b border-white/10 pb-3">
                    <div className="w-2 h-2 rounded-full bg-primary animate-ping"></div>
                    Neural Net Sectors
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-4 max-w-sm">
                    {Object.entries(SECTOR_COLORS).slice(0, 8).map(([sector, sColor]) => (
                        <div key={sector} className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: sColor, boxShadow: `0 0 10px ${sColor}` }} />
                            <span className="text-xs text-gray-200 font-bold tracking-wider">{sector}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Context/Instruction Help */}
            <div className="absolute bottom-24 right-6 text-xs text-gray-400 font-mono tracking-widest uppercase font-bold pointer-events-none text-right">
                <div className="text-white mb-1"><span className="text-primary">Click Node</span> to Focus Target</div>
                <div>{focusedNode ? 'Click Empty Space to Release' : 'Drag to Orbit Array'}</div>
            </div>

            {/* Feature 4: Market Phase Indicator */}
            <div style={{
                position: 'absolute', bottom: 16, right: 16,
                fontSize: '10px', fontWeight: 700, letterSpacing: '2px',
                textTransform: 'uppercase', padding: '4px 10px',
                borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)',
                color: phase === 'open' ? '#44ffcc' : phase === 'pre' ? '#44aaff' : phase === 'post' ? '#ffaa44' : '#446677',
                background: 'rgba(0,0,0,0.5)',
                pointerEvents: 'none',
                zIndex: 10,
            }}>
                ● NSE {phase === 'open' ? 'LIVE' : phase === 'pre' ? 'PRE-OPEN' : phase === 'post' ? 'POST-CLOSE' : 'CLOSED'}
            </div>
        </div>
    );
};

export default Graph3D;

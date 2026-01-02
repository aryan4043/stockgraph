import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html, Stars, PerspectiveCamera, Environment, Text } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import * as THREE from 'three';
import { useQuery } from '@tanstack/react-query';
import { getGraphData } from '../services/api';
import { Info, Maximize2, ZoomIn, Play, Pause, Focus, ArrowUpRight, ArrowDownRight } from 'lucide-react';

// Types
interface Node {
    id: number;
    name: string;
    symbol: string;
    val: number; // Market Cap / Size relative
    prediction: number;
    sector: string;
    x: number;
    y: number;
    z: number;
}

interface Link {
    source: number;
    target: number;
    correlation: number;
}

// Sector colors (Neon/Cyberpunk Palette)
const SECTOR_COLORS: Record<string, string> = {
    Technology: '#00f3ff', // Cyan
    Finance: '#00ff9d',    // Neon Green
    Energy: '#ffae00',     // Golden Yellow
    Healthcare: '#ff0055', // Neon Pink
    Consumer: '#b300ff',   // Electric Purple
    Industrial: '#ff5500', // Neon Orange
    Materials: '#00b8ff',  // Sky Blue
    Utilities: '#7a00ff',  // Violet
    RealEstate: '#ff00aa', // Magenta
    Neutral: '#555555'     // Grey
};

// --- Camera Controller (Director Mode) ---
const CameraRig = ({ focusTarget }: { focusTarget: THREE.Vector3 | null }) => {
    const { camera, controls } = useThree();
    const vec = new THREE.Vector3();

    useFrame((state, delta) => {
        if (focusTarget) {
            // Smoothly move camera target to the node
            const currentTarget = (controls as any).target;
            currentTarget.lerp(focusTarget, 2 * delta);

            // Move camera to an offset position (zoomed in but visible)
            // We want to be roughly 40 units away on Z and 20 on Y relative to the target
            vec.set(focusTarget.x, focusTarget.y + 10, focusTarget.z + 50);
            state.camera.position.lerp(vec, 2 * delta);

            (controls as any).update();
        }
    });

    return null;
}

// --- 3D Scene Components ---

const NodeMesh = ({
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
    const meshRef = useRef<THREE.Mesh>(null);
    const color = SECTOR_COLORS[node.sector] || SECTOR_COLORS.Neutral;

    // Determine visibility state
    const isHovered = hoveredNodeId === node.id;
    const isNeighbor = neighbors.includes(node.id);
    const isDimmed = hoveredNodeId !== null && !isHovered && !isNeighbor;

    // Simulate a price for the tooltip (since we don't have it in the node data yet)
    const mockPrice = useMemo(() => (Math.random() * 2000 + 100).toFixed(2), []);

    useFrame((state) => {
        if (!meshRef.current) return;

        // Dynamic Animation
        const time = state.clock.elapsedTime;

        // 1. Rotation
        meshRef.current.rotation.y += 0.005;
        meshRef.current.rotation.z += 0.002;

        // 2. Pulse for high prediction or selected state
        let scaleTarget = isHovered ? 1.5 : 1.0;
        if (node.prediction > 0.5) {
            scaleTarget += Math.sin(time * 3) * 0.1; // Pulse "Hot" stocks
        }

        // Smooth scale transition
        meshRef.current.scale.lerp(new THREE.Vector3(scaleTarget, scaleTarget, scaleTarget), 0.1);
    });

    return (
        <group position={[node.x, node.y, node.z]}>
            {/* The Main Node Sphere */}
            <mesh
                ref={meshRef}
                onClick={(e) => { e.stopPropagation(); onClick(node); }}
                onPointerOver={(e) => { e.stopPropagation(); setHoveredNodeId(node.id); document.body.style.cursor = 'pointer'; }}
                onPointerOut={() => { setHoveredNodeId(null); document.body.style.cursor = 'default'; }}
            >
                {/* Geodesic sphere for tech look */}
                <icosahedronGeometry args={[isHovered ? 4 : 2, 1]} />
                <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={isHovered ? 2.5 : (isDimmed ? 0.1 : 0.6)} // Glow Effect
                    roughness={0.2}
                    metalness={0.8}
                    transparent
                    opacity={isDimmed ? 0.1 : 1}
                    wireframe={node.prediction < -0.2} // Wireframe for bearish stocks? Fun style choice.
                />
            </mesh>

            {/* Rich HTML Tooltip */}
            {(isHovered || isNeighbor) && (
                <Html center distanceFactor={150} style={{ pointerEvents: 'none', zIndex: isHovered ? 100 : 10 }}>
                    <div className={`
                        transition-all duration-300 ease-out
                        ${isHovered ? 'scale-100 opacity-100 translate-y-[-20px]' : 'scale-90 opacity-60'}
                    `}>
                        <div className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-lg p-3 shadow-2xl min-w-[180px]">
                            {/* Header */}
                            <div className="flex justify-between items-start mb-2 border-b border-white/10 pb-2">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-lg font-bold text-white leading-none">{node.symbol}</h3>
                                        {node.prediction > 0 ? (
                                            <ArrowUpRight className="w-4 h-4 text-green-400" />
                                        ) : (
                                            <ArrowDownRight className="w-4 h-4 text-red-400" />
                                        )}
                                    </div>
                                    <div className="text-[10px] text-gray-400 truncate max-w-[120px]">{node.name}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-mono text-white">₹{mockPrice}</div>
                                    <div className={`text-[10px] font-bold ${node.prediction > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {(node.prediction * 100).toFixed(1)}%
                                    </div>
                                </div>
                            </div>

                            {/* Badge & Signal */}
                            <div className="flex items-center justify-between gap-2">
                                <span
                                    className="text-[9px] uppercase px-1.5 py-0.5 rounded font-bold text-black"
                                    style={{ backgroundColor: color }}
                                >
                                    {node.sector.substring(0, 3)}
                                </span>

                                <div className="flex items-center gap-1.5">
                                    <span className="text-[9px] text-gray-400">AI CONF</span>
                                    <div className="flex gap-0.5">
                                        {[1, 2, 3, 4, 5].map(i => (
                                            <div
                                                key={i}
                                                className={`w-1 h-3 rounded-full ${i <= 4 ? 'bg-primary' : 'bg-gray-700'}`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Html>
            )}
        </group>
    );
};

const LinkLine = ({
    start,
    end,
    correlation,
    isDimmed
}: {
    start: [number, number, number];
    end: [number, number, number];
    correlation: number;
    isDimmed: boolean;
}) => {
    // Dynamic opacity based on correlation strength and global focus
    const opacity = isDimmed ? 0.02 : correlation * 0.4;
    const width = isDimmed ? 0.1 : correlation * 1.5;

    return (
        <line>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={2}
                    array={new Float32Array([...start, ...end])}
                    itemSize={3}
                />
            </bufferGeometry>
            <lineBasicMaterial
                color={correlation > 0.7 ? "#ffffff" : "#444444"} // Highlight strong links
                transparent
                opacity={opacity}
                linewidth={width} // Note: WebGL linewidth is limited in many browsers
            />
        </line>
    );
};

const GraphScene = ({
    data,
    onNodeClick,
    isAutoRotating,
    setNeighbors,
    focusTarget
}: {
    data: { nodes: Node[], links: Link[] };
    onNodeClick: (node: Node) => void;
    isAutoRotating: boolean;
    setNeighbors: (ids: number[]) => void;
    focusTarget: THREE.Vector3 | null;
}) => {
    const [hoveredNodeId, setHoveredNodeId] = useState<number | null>(null);

    // Calculate neighbors on hover
    useEffect(() => {
        if (hoveredNodeId === null) {
            setNeighbors([]);
            return;
        }

        const neighborIds = data.links
            .filter(l => l.source === hoveredNodeId || l.target === hoveredNodeId)
            .map(l => l.source === hoveredNodeId ? l.target : l.source);

        setNeighbors(neighborIds);
    }, [hoveredNodeId, data.links, setNeighbors]);

    // Helpers to find node positions
    const processedNodes = useMemo(() => {
        return data.nodes.map((n, i) => {
            const phi = Math.acos(-1 + (2 * i) / data.nodes.length);
            const theta = Math.sqrt(data.nodes.length * Math.PI) * phi;
            const radius = 100 + (Math.random() * 20); // Slight variety in radius
            return {
                ...n,
                x: n.x || radius * Math.cos(theta) * Math.sin(phi),
                y: n.y || radius * Math.sin(theta) * Math.sin(phi),
                z: n.z || radius * Math.cos(phi)
            };
        });
    }, [data.nodes]);

    // Get current value of neighbors for passing to children
    const currentNeighbors = useMemo(() => {
        if (hoveredNodeId === null) return [];
        return data.links
            .filter(l => l.source === hoveredNodeId || l.target === hoveredNodeId)
            .map(l => l.source === hoveredNodeId ? l.target : l.source);
    }, [hoveredNodeId, data.links]);

    return (
        <>
            <CameraRig focusTarget={focusTarget} />
            <OrbitControls
                enablePan={true}
                enableZoom={true}
                enableRotate={true}
                autoRotate={isAutoRotating && hoveredNodeId === null}
                autoRotateSpeed={0.5}
                makeDefault
            />

            {/* --- Lighting & Environment (Cinematic) --- */}
            <ambientLight intensity={0.2} />
            <pointLight position={[50, 50, 50]} intensity={2} color="#44aaff" />
            <pointLight position={[-50, -50, -50]} intensity={2} color="#ffaa44" />
            <Stars radius={300} depth={60} count={6000} factor={6} saturation={0} fade speed={0.5} />

            {/* --- Post Processing (Bloom) --- */}
            <EffectComposer multisampling={0} disableNormalPass={true}>
                <Bloom
                    luminanceThreshold={1.2} // Only very bright things glow
                    mipmapBlur
                    intensity={2.0}
                    radius={0.6}
                />
                <Noise opacity={0.025} />
                <Vignette eskil={false} offset={0.1} darkness={1.1} />
            </EffectComposer>

            <group>
                {processedNodes.map((node) => (
                    <NodeMesh
                        key={node.id}
                        node={node}
                        onClick={onNodeClick}
                        hoveredNodeId={hoveredNodeId}
                        setHoveredNodeId={setHoveredNodeId}
                        neighbors={currentNeighbors}
                    />
                ))}

                {data.links.map((link, i) => {
                    const sourceNode = processedNodes.find(n => n.id === link.source);
                    const targetNode = processedNodes.find(n => n.id === link.target);
                    if (!sourceNode || !targetNode) return null;

                    const isRelevant = hoveredNodeId === null ||
                        link.source === hoveredNodeId ||
                        link.target === hoveredNodeId;

                    return (
                        <LinkLine
                            key={i}
                            start={[sourceNode.x, sourceNode.y, sourceNode.z]}
                            end={[targetNode.x, targetNode.y, targetNode.z]}
                            correlation={link.correlation}
                            isDimmed={!isRelevant && hoveredNodeId !== null}
                        />
                    );
                })}
            </group>
        </>
    );
};

// --- Main Component ---

const Graph3D: React.FC<{ onNodeClick?: (node: any) => void }> = ({ onNodeClick }) => {
    const [isAutoRotating, setIsAutoRotating] = useState(true);
    const [neighbors, setNeighbors] = useState<number[]>([]);
    const [focusTarget, setFocusTarget] = useState<THREE.Vector3 | null>(null);

    // In a real app, this would be fetched
    const { data: graphData, isLoading } = useQuery({
        queryKey: ['graphData'],
        queryFn: getGraphData,
    });

    if (isLoading) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-gray-900 border border-white/10 rounded-xl">
                <div className="flex flex-col items-center">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                    <span className="text-gray-400 text-sm">Initializing Neural Interface...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full relative group bg-gradient-to-br from-gray-900 to-black">
            <Canvas
                camera={{ position: [0, 0, 250], fov: 50, near: 1, far: 2000 }}
                dpr={[1, 2]} // Handle high DPI screens
                gl={{ antialias: false }} // Post-processing handles this usually, saves perf
            >
                <GraphScene
                    data={graphData || { nodes: [], links: [] }}
                    onNodeClick={(node) => {
                        setIsAutoRotating(false);
                        const targetVec = new THREE.Vector3(node.x, node.y, node.z);
                        setFocusTarget(targetVec);

                        if (onNodeClick) onNodeClick(node);
                    }}
                    isAutoRotating={isAutoRotating}
                    setNeighbors={setNeighbors}
                    focusTarget={focusTarget}
                />
            </Canvas>

            {/* Controls Overlay */}
            <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button
                    onClick={() => {
                        setIsAutoRotating(!isAutoRotating);
                        setFocusTarget(null); // Release focus when manually toggling rotation
                    }}
                    className="p-2 bg-black/60 backdrop-blur-md rounded-lg border border-white/10 hover:bg-white/10 text-white transition-colors"
                    title={isAutoRotating ? "Pause Rotation" : "Start Rotation"}
                >
                    {isAutoRotating ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>
                <button
                    onClick={() => setFocusTarget(null)}
                    className="p-2 bg-black/60 backdrop-blur-md rounded-lg border border-white/10 hover:bg-white/10 text-white transition-colors"
                    title="Reset View"
                >
                    <Maximize2 className="w-5 h-5" />
                </button>
            </div>

            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md p-3 rounded-xl border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="text-[10px] uppercase text-gray-500 font-bold mb-2">Market Sectors</div>
                <div className="flex flex-wrap gap-2 max-w-sm">
                    {Object.entries(SECTOR_COLORS).slice(0, 6).map(([sector, color]) => (
                        <div key={sector} className="flex items-center gap-1.5 bg-white/5 pr-2 py-0.5 rounded-full border border-white/5">
                            <div className="w-2 h-2 rounded-full m-1" style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }} />
                            <span className="text-[10px] text-gray-300 font-medium">{sector}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Graph3D;

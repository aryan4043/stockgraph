import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

const TestBox = ({ onClick }: { onClick: () => void }) => {
    const [color, setColor] = useState('hotpink');

    return (
        <mesh
            onClick={(e) => {
                e.stopPropagation();
                console.log("TestBox Clicked");
                setColor(c => c === 'hotpink' ? 'orange' : 'hotpink');
                onClick();
            }}
            onPointerOver={() => document.body.style.cursor = 'pointer'}
            onPointerOut={() => document.body.style.cursor = 'default'}
        >
            <boxGeometry args={[2, 2, 2]} />
            <meshStandardMaterial color={color} />
        </mesh>
    );
};

const Test3D: React.FC<{ onNodeClick?: (data: any) => void }> = ({ onNodeClick }) => {
    return (
        <div className="w-full h-full bg-gray-800">
            <Canvas camera={{ position: [0, 0, 10] }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} />
                <TestBox onClick={() => onNodeClick?.({ symbol: 'TEST', name: 'Test Box' })} />
                <OrbitControls makeDefault />
            </Canvas>
            <div className="absolute top-4 left-4 text-white bg-black/50 p-2 rounded">
                Test Mode: Click the Box
            </div>
        </div>
    );
};

export default Test3D;

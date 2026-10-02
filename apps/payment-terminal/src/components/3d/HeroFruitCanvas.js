import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sparkles, MeshDistortMaterial } from '@react-three/drei';
function LiquidSanitizerOrb({ position, color, scale = 1 }) {
    const meshRef = useRef(null);
    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.4;
            meshRef.current.rotation.z = Math.sin(state.clock.getElapsedTime() * 0.3) * 0.15;
        }
    });
    return (_jsx(Float, { speed: 2, rotationIntensity: 0.8, floatIntensity: 1.5, position: position, children: _jsxs("mesh", { ref: meshRef, scale: scale, children: [_jsx("sphereGeometry", { args: [1, 32, 32] }), _jsx(MeshDistortMaterial, { color: color, emissive: color, emissiveIntensity: 0.2, roughness: 0.1, metalness: 0.1, distort: 0.3, speed: 2 })] }) }));
}
function FloatingLiquidDroplet({ position, scale = 0.25 }) {
    return (_jsx(Float, { speed: 4, rotationIntensity: 2, floatIntensity: 3, position: position, children: _jsxs("mesh", { scale: scale, children: [_jsx("sphereGeometry", { args: [1, 24, 24] }), _jsx("meshPhysicalMaterial", { color: "#06b6d4", transmission: 0.9, opacity: 0.9, transparent: true, roughness: 0.05, ior: 1.33 })] }) }));
}
function Scene() {
    return (_jsxs(_Fragment, { children: [_jsx("ambientLight", { intensity: 1.2 }), _jsx("directionalLight", { position: [10, 15, 10], intensity: 1.8, color: "#e0f2fe" }), _jsx("directionalLight", { position: [-10, -5, -5], intensity: 0.6, color: "#0891b2" }), _jsx("pointLight", { position: [0, 2, 4], intensity: 1.2, color: "#ffffff" }), _jsx(LiquidSanitizerOrb, { position: [-2.4, 0.4, 0], color: "#06b6d4", scale: 1.1 }), _jsx(LiquidSanitizerOrb, { position: [2.5, 0.8, -0.5], color: "#38bdf8", scale: 1.0 }), _jsx(LiquidSanitizerOrb, { position: [-1.2, -1.3, 0.5], color: "#10b981", scale: 0.9 }), _jsx(LiquidSanitizerOrb, { position: [1.4, -1.1, -0.8], color: "#6366f1", scale: 0.85 }), _jsx(LiquidSanitizerOrb, { position: [0.2, 1.8, -0.3], color: "#0284c7", scale: 0.7 }), _jsx(FloatingLiquidDroplet, { position: [-0.8, 0.6, 1.2], scale: 0.3 }), _jsx(FloatingLiquidDroplet, { position: [1.8, 1.5, 0.5], scale: 0.25 }), _jsx(FloatingLiquidDroplet, { position: [-1.9, -0.8, 0.8], scale: 0.2 }), _jsx(Sparkles, { count: 55, scale: 8, size: 2.5, speed: 0.4, opacity: 0.6, color: "#38bdf8" })] }));
}
export const HeroFruitCanvas = () => {
    return (_jsx("div", { className: "w-full h-full min-h-[380px] lg:min-h-[520px] relative pointer-events-none select-none", children: _jsx(Canvas, { camera: { position: [0, 0, 6.2], fov: 45 }, gl: { antialias: true, alpha: true }, children: _jsx(Scene, {}) }) }));
};

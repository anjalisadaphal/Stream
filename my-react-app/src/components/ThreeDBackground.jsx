import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

function ParticleField() {
    const ref = useRef();
    const count = 3000;

    // Generate random positions
    const [positions, originalPositions, speeds] = useMemo(() => {
        const positions = new Float32Array(count * 3);
        const originalPositions = new Float32Array(count * 3);
        const speeds = new Float32Array(count); // Different speed for each particle

        for (let i = 0; i < count; i++) {
            const x = (Math.random() - 0.5) * 20;
            const y = (Math.random() - 0.5) * 20;
            const z = (Math.random() - 0.5) * 10;

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;

            originalPositions[i * 3] = x;
            originalPositions[i * 3 + 1] = y;
            originalPositions[i * 3 + 2] = z;

            speeds[i] = 0.01 + Math.random() * 0.05; // Random speed between 0.01 and 0.06
        }

        return [positions, originalPositions, speeds];
    }, []);

    const mouse = useRef(new THREE.Vector3(0, 0, 0));
    const targetMouse = useRef(new THREE.Vector3(0, 0, 0));
    const mouseTrail = useRef([]);
    const maxTrailLength = 20;

    useFrame((state) => {
        // Smooth mouse tracking
        const x = (state.pointer.x * state.viewport.width) / 2;
        const y = (state.pointer.y * state.viewport.height) / 2;

        targetMouse.current.set(x, y, 0);
        mouse.current.lerp(targetMouse.current, 0.1);

        // Store mouse trail
        mouseTrail.current.push({ x: mouse.current.x, y: mouse.current.y, z: mouse.current.z });
        if (mouseTrail.current.length > maxTrailLength) {
            mouseTrail.current.shift();
        }

        const positionsArray = ref.current.geometry.attributes.position.array;

        for (let i = 0; i < count; i++) {
            const ix = i * 3;
            const iy = i * 3 + 1;
            const iz = i * 3 + 2;

            const px = positionsArray[ix];
            const py = positionsArray[iy];
            const pz = positionsArray[iz];

            const ox = originalPositions[ix];
            const oy = originalPositions[iy];
            const oz = originalPositions[iz];

            // Calculate distance to current mouse position
            const dx = px - mouse.current.x;
            const dy = py - mouse.current.y;
            const dz = pz - mouse.current.z;
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

            // Attraction to cursor with varying strength
            const influenceRadius = 6;
            const force = Math.max(0, 1 - dist / influenceRadius);

            let tx = ox;
            let ty = oy;
            let tz = oz;

            if (force > 0) {
                // Pull particles toward cursor position with varying delays
                const pullStrength = force * speeds[i] * 8;
                const angle = Math.atan2(-dy, -dx);

                tx = px + Math.cos(angle) * pullStrength;
                ty = py + Math.sin(angle) * pullStrength;
                tz = pz + (-dz / dist) * pullStrength * 0.5;
            } else {
                // Gradually return to original position when far from cursor
                tx = ox;
                ty = oy;
                tz = oz;
            }

            // Apply movement with individual particle speed
            const returnSpeed = speeds[i] * 0.5;
            positionsArray[ix] += (tx - px) * returnSpeed;
            positionsArray[iy] += (ty - py) * returnSpeed;
            positionsArray[iz] += (tz - pz) * returnSpeed;
        }

        ref.current.geometry.attributes.position.needsUpdate = true;

        // Very subtle rotation
        ref.current.rotation.y += 0.0003;
    });

    return (
        <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
            <PointMaterial
                transparent
                color="#6366f1"
                size={0.04}
                sizeAttenuation={true}
                depthWrite={false}
                opacity={0.7}
                blending={THREE.AdditiveBlending}
            />
        </Points>
    );
}

// Secondary particle layer with different trailing behavior
function SecondaryParticleField() {
    const ref = useRef();
    const count = 1500;

    const [positions, originalPositions, speeds] = useMemo(() => {
        const positions = new Float32Array(count * 3);
        const originalPositions = new Float32Array(count * 3);
        const speeds = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            const x = (Math.random() - 0.5) * 18;
            const y = (Math.random() - 0.5) * 18;
            const z = (Math.random() - 0.5) * 9;

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;

            originalPositions[i * 3] = x;
            originalPositions[i * 3 + 1] = y;
            originalPositions[i * 3 + 2] = z;

            speeds[i] = 0.005 + Math.random() * 0.03; // Slower speeds for secondary layer
        }

        return [positions, originalPositions, speeds];
    }, []);

    const mouse = useRef(new THREE.Vector3(0, 0, 0));
    const targetMouse = useRef(new THREE.Vector3(0, 0, 0));

    useFrame((state) => {
        const x = (state.pointer.x * state.viewport.width) / 2;
        const y = (state.pointer.y * state.viewport.height) / 2;

        targetMouse.current.set(x, y, 0);
        mouse.current.lerp(targetMouse.current, 0.08); // Slower tracking for secondary layer

        const positionsArray = ref.current.geometry.attributes.position.array;

        for (let i = 0; i < count; i++) {
            const ix = i * 3;
            const iy = i * 3 + 1;
            const iz = i * 3 + 2;

            const px = positionsArray[ix];
            const py = positionsArray[iy];
            const pz = positionsArray[iz];

            const ox = originalPositions[ix];
            const oy = originalPositions[iy];
            const oz = originalPositions[iz];

            const dx = px - mouse.current.x;
            const dy = py - mouse.current.y;
            const dz = pz - mouse.current.z;
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

            const influenceRadius = 7;
            const force = Math.max(0, 1 - dist / influenceRadius);

            let tx = ox;
            let ty = oy;
            let tz = oz;

            if (force > 0) {
                // Create trailing effect - slower attraction
                const pullStrength = force * speeds[i] * 6;
                const angle = Math.atan2(-dy, -dx);

                tx = px + Math.cos(angle) * pullStrength;
                ty = py + Math.sin(angle) * pullStrength;
                tz = pz + (-dz / dist) * pullStrength * 0.4;
            } else {
                tx = ox;
                ty = oy;
                tz = oz;
            }

            const returnSpeed = speeds[i] * 0.4;
            positionsArray[ix] += (tx - px) * returnSpeed;
            positionsArray[iy] += (ty - py) * returnSpeed;
            positionsArray[iz] += (tz - pz) * returnSpeed;
        }

        ref.current.geometry.attributes.position.needsUpdate = true;
        ref.current.rotation.y -= 0.0002;
    });

    return (
        <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
            <PointMaterial
                transparent
                color="#10b981"
                size={0.035}
                sizeAttenuation={true}
                depthWrite={false}
                opacity={0.5}
                blending={THREE.AdditiveBlending}
            />
        </Points>
    );
}

export default function ThreeDBackground() {
    return (
        <div className="fixed inset-0 pointer-events-none" style={{ zIndex: -1 }}>
            <Canvas
                camera={{ position: [0, 0, 6], fov: 75 }}
                style={{ background: 'transparent' }}
            >
                <ambientLight intensity={0.3} />
                <ParticleField />
                <SecondaryParticleField />
            </Canvas>
        </div>
    );
}

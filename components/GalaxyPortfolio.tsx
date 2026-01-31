"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export default function GalaxyPortfolio() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000010);

    // Camera
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 15, 45);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    // Controls (mouse drag)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;

    // Galaxy
    const galaxyGeometry = new THREE.BufferGeometry();
    const count = 150000;

    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const colorInside = new THREE.Color(0xffcc88);
    const colorOutside = new THREE.Color(0x4466ff);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      const radius = Math.random() * 30;
      const spinAngle = radius * 0.6;
      const branchAngle = ((i % 4) / 4) * Math.PI * 2;

      const randomX = (Math.random() - 0.5) * 1.5;
      const randomY = (Math.random() - 0.5) * 1.5;
      const randomZ = (Math.random() - 0.5) * 1.5;

      positions[i3] =
        Math.cos(branchAngle + spinAngle) * radius + randomX;
      positions[i3 + 1] = randomY * 0.3;
      positions[i3 + 2] =
        Math.sin(branchAngle + spinAngle) * radius + randomZ;

      const mixedColor = colorInside.clone();
      mixedColor.lerp(colorOutside, radius / 30);

      colors[i3] = mixedColor.r;
      colors[i3 + 1] = mixedColor.g;
      colors[i3 + 2] = mixedColor.b;
    }

    galaxyGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );
    galaxyGeometry.setAttribute(
      "color",
      new THREE.BufferAttribute(colors, 3)
    );

    const galaxyMaterial = new THREE.PointsMaterial({
      size: 0.06,
      vertexColors: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const galaxy = new THREE.Points(galaxyGeometry, galaxyMaterial);
    scene.add(galaxy);

    // Animate
    const animate = () => {
      galaxy.rotation.y += 0.0006;
      controls.update();
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();

    // Resize
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      mountRef.current?.removeChild(renderer.domElement);
      galaxyGeometry.dispose();
      galaxyMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="fixed inset-0" />;
}

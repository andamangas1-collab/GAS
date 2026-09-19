"use client"

import React, { useEffect, useRef, useState } from "react"
import * as THREE from "three"

// 6 Core V2V™ Ecosystem Nodes
const V2V_NODES = [
  { name: "USER", color: 0x3b82f6, position: [2.6, 1.2, 0.4] },
  { name: "VALUE", color: 0x10b981, position: [-2.4, 1.4, -0.2] },
  { name: "OFFER", color: 0xf59e0b, position: [2.2, -1.5, 0.6] },
  { name: "REFERRAL", color: 0x8b5cf6, position: [-2.2, -1.4, 0.5] },
  { name: "EARNING", color: 0x06b6d4, position: [0.0, 2.7, -0.6] },
  { name: "RECOGNITION", color: 0xec4899, position: [0.0, -2.6, -0.4] },
]

export default function GASHero3D() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [webglSupported, setWebglSupported] = useState(true)
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)

  useEffect(() => {
    // 1. WebGL & Reduced Motion Check
    const checkWebGL = () => {
      try {
        const canvas = document.createElement("canvas")
        return !!(
          window.WebGLRenderingContext &&
          (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
        )
      } catch {
        return false
      }
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (!checkWebGL() || prefersReducedMotion) {
      setWebglSupported(false)
      return
    }

    const container = containerRef.current
    if (!container) return

    // 2. Scene, Camera, Renderer Setup
    const width = container.clientWidth || 500
    const height = container.clientHeight || 500

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
    camera.position.z = 8.5

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
    scene.add(ambientLight)

    const pointLight = new THREE.PointLight(0x3b82f6, 2, 20)
    pointLight.position.set(0, 0, 4)
    scene.add(pointLight)

    const coreLight = new THREE.PointLight(0x10b981, 1.5, 15)
    coreLight.position.set(0, 0, 0)
    scene.add(coreLight)

    // 4. Central GAS™ Value-Core
    const coreGroup = new THREE.Group()
    scene.add(coreGroup)

    // Glowing Central Icosahedron
    const coreGeo = new THREE.IcosahedronGeometry(1.25, 2)
    const coreMat = new THREE.MeshPhongMaterial({
      color: 0x1d4ed8,
      emissive: 0x1e3a8a,
      specular: 0x60a5fa,
      shininess: 90,
      wireframe: true,
      transparent: true,
      opacity: 0.85,
    })
    const coreMesh = new THREE.Mesh(coreGeo, coreMat)
    coreGroup.add(coreMesh)

    // Inner Solid Core
    const innerGeo = new THREE.SphereGeometry(0.7, 24, 24)
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: false,
    })
    const innerMesh = new THREE.Mesh(innerGeo, innerMat)
    coreGroup.add(innerMesh)

    // Orbital Energy Rings
    const ringGeo1 = new THREE.TorusGeometry(1.9, 0.02, 16, 100)
    const ringMat1 = new THREE.MeshBasicMaterial({ color: 0x60a5fa, transparent: true, opacity: 0.6 })
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1)
    ring1.rotation.x = Math.PI / 3
    coreGroup.add(ring1)

    const ringGeo2 = new THREE.TorusGeometry(2.2, 0.02, 16, 100)
    const ringMat2 = new THREE.MeshBasicMaterial({ color: 0x34d399, transparent: true, opacity: 0.5 })
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2)
    ring2.rotation.y = Math.PI / 4
    ring2.rotation.x = -Math.PI / 6
    coreGroup.add(ring2)

    // 5. Orbiting V2V Nodes & Connecting Splines
    const nodesGroup = new THREE.Group()
    scene.add(nodesGroup)

    const nodeMeshes: THREE.Mesh[] = []

    V2V_NODES.forEach((node) => {
      // Node Mesh
      const nGeo = new THREE.SphereGeometry(0.32, 20, 20)
      const nMat = new THREE.MeshStandardMaterial({
        color: node.color,
        emissive: node.color,
        emissiveIntensity: 0.6,
        roughness: 0.2,
        metalness: 0.8,
      })
      const nMesh = new THREE.Mesh(nGeo, nMat)
      nMesh.position.set(node.position[0], node.position[1], node.position[2])
      nodesGroup.add(nMesh)
      nodeMeshes.push(nMesh)

      // Connection Line to Core
      const points = [
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(node.position[0] * 0.5, node.position[1] * 0.5 + 0.3, node.position[2] * 0.5),
        new THREE.Vector3(node.position[0], node.position[1], node.position[2]),
      ]
      const curve = new THREE.QuadraticBezierCurve3(points[0], points[1], points[2])
      const lineGeo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(24))
      const lineMat = new THREE.LineBasicMaterial({
        color: node.color,
        transparent: true,
        opacity: 0.35,
      })
      const line = new THREE.Line(lineGeo, lineMat)
      nodesGroup.add(line)
    })

    // 6. Value Flow Particle Field
    const particleCount = 140
    const particleGeo = new THREE.BufferGeometry()
    const particlePositions = new Float32Array(particleCount * 3)

    for (let i = 0; i < particleCount; i++) {
      const radius = 2.0 + Math.random() * 2.2
      const theta = Math.random() * Math.PI * 2
      const phi = (Math.random() - 0.5) * Math.PI

      particlePositions[i * 3] = radius * Math.cos(theta) * Math.cos(phi)
      particlePositions[i * 3 + 1] = radius * Math.sin(phi)
      particlePositions[i * 3 + 2] = radius * Math.sin(theta) * Math.cos(phi)
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3))
    const particleMat = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: 0.05,
      transparent: true,
      opacity: 0.7,
    })
    const particles = new THREE.Points(particleGeo, particleMat)
    scene.add(particles)

    // 7. Mouse Parallax & Gentle Interaction
    let mouseX = 0
    let mouseY = 0
    let targetX = 0
    let targetY = 0

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect()
      mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1
      mouseY = -(((e.clientY - rect.top) / rect.height) * 2 - 1)
    }

    const handleMouseLeave = () => {
      mouseX = 0
      mouseY = 0
    }

    container.addEventListener("mousemove", handleMouseMove)
    container.addEventListener("mouseleave", handleMouseLeave)

    // 8. Animation Loop
    let animationFrameId: number
    let clock = new THREE.Clock()

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)
      const elapsedTime = clock.getElapsedTime()

      // Smooth parallax damping
      targetX += (mouseX * 0.6 - targetX) * 0.05
      targetY += (mouseY * 0.6 - targetY) * 0.05

      scene.rotation.y = targetX * 0.5 + elapsedTime * 0.08
      scene.rotation.x = targetY * 0.3

      // Core rotation
      coreMesh.rotation.y = elapsedTime * 0.25
      coreMesh.rotation.x = elapsedTime * 0.15
      ring1.rotation.z = elapsedTime * 0.2
      ring2.rotation.z = -elapsedTime * 0.18

      // Pulsing node oscillation
      nodeMeshes.forEach((mesh, idx) => {
        mesh.position.y += Math.sin(elapsedTime * 2 + idx) * 0.003
      })

      // Particle rotation
      particles.rotation.y = -elapsedTime * 0.05

      renderer.render(scene, camera)
    }

    animate()

    // 9. Resize Handling
    const handleResize = () => {
      if (!container) return
      const newWidth = container.clientWidth
      const newHeight = container.clientHeight
      camera.aspect = newWidth / newHeight
      camera.updateProjectionMatrix()
      renderer.setSize(newWidth, newHeight)
    }

    window.addEventListener("resize", handleResize)

    // 10. Clean Cleanup on Unmount (Zero Leaks)
    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener("resize", handleResize)
      container.removeEventListener("mousemove", handleMouseMove)
      container.removeEventListener("mouseleave", handleMouseLeave)

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }

      // Dispose resources
      coreGeo.dispose()
      coreMat.dispose()
      innerGeo.dispose()
      innerMat.dispose()
      ringGeo1.dispose()
      ringMat1.dispose()
      ringGeo2.dispose()
      ringMat2.dispose()
      particleGeo.dispose()
      particleMat.dispose()
      renderer.dispose()
    }
  }, [])

  // Graceful CSS 3D Fallback for unsupported devices / reduced motion
  if (!webglSupported) {
    return (
      <div className="relative w-full h-[400px] md:h-[480px] flex items-center justify-center p-6 select-none">
        <div className="relative w-72 h-72 rounded-full border border-gas-400/30 flex items-center justify-center animate-spin-slow">
          <div className="w-56 h-56 rounded-full border border-dashed border-emerald-400/40 animate-reverse-spin" />
          <div className="absolute w-36 h-36 rounded-full bg-gradient-to-tr from-gas-600 to-emerald-500 opacity-90 blur-sm animate-pulse" />
          <div className="absolute font-black text-white text-3xl font-sans tracking-tight">GAS™</div>
        </div>

        {/* Floating Node Badges */}
        {V2V_NODES.map((node, i) => (
          <span
            key={node.name}
            className="absolute px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider font-mono text-white bg-slate-900/80 border shadow-lg backdrop-blur"
            style={{
              top: `${20 + (i % 3) * 30}%`,
              left: `${15 + (i % 2) * 60}%`,
              borderColor: `#${node.color.toString(16)}`,
            }}
          >
            {node.name}
          </span>
        ))}
      </div>
    )
  }

  return (
    <div className="relative w-full h-[400px] md:h-[520px] flex items-center justify-center">
      {/* 3D Canvas Mount */}
      <div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        title="Interactive GAS™ V2V™ Engine (Drag or move mouse to interact)"
      />

      {/* Floating Node Identity Legend Bar */}
      <div className="absolute bottom-3 inset-x-4 flex items-center justify-center gap-2 flex-wrap pointer-events-none">
        {V2V_NODES.map((node) => (
          <span
            key={node.name}
            className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-950/70 text-slate-200 border border-slate-800 backdrop-blur"
          >
            <span
              className="inline-block w-1.5 h-1.5 rounded-full mr-1.5"
              style={{ backgroundColor: `#${node.color.toString(16).padStart(6, "0")}` }}
            />
            {node.name}
          </span>
        ))}
      </div>
    </div>
  )
}

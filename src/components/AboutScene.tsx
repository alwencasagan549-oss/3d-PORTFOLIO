import { useRef, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, useFBX } from '@react-three/drei'
import * as THREE from 'three'
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js'
import { loadingStore } from '../stores/loadingStore'
import { Character } from '../model/Character'
import { Environment } from '../model/Environment'

// Global scroll state — written by App.tsx GSAP, read by useFrame
export const scrollState = {
  progress: 0,     // 0–1 as user scrolls through the about section
  prevProgress: 0,
  triggerWaving: false, // Set to true from App.tsx to play wave
  wavePlayed: false,    // Track if auto-wave already happened
  waveFinished: false,  // Release scroll-lock in App.tsx when true
}

// Preload all heavy assets up-front
useGLTF.preload('/model.glb?v=2', '/draco/')
useGLTF.preload('/Animation/Falling Idle.glb', '/draco/')

export default function AboutScene() {
  const gltf = useGLTF('/model.glb?v=2', '/draco/')
  const fbxIdle = useFBX('/Animation/Standing Idle.fbx')
  const gltfFalling = useGLTF('/Animation/Falling Idle.glb', '/draco/')
  const fbxWalkFwd = useFBX('/Animation/Walking.fbx')
  const fbxWaving = useFBX('/Animation/Waving.fbx')

  // Refs for scene elements
  const parallaxGroupRef = useRef<THREE.Group>(null!)
  const ambientLightRef = useRef<THREE.AmbientLight>(null!)
  const dirLightRef = useRef<THREE.DirectionalLight>(null!)
  const shadowRef = useRef<THREE.Mesh>(null!)

  // Clone safely (required for skinned meshes)
  const clonedScene = useMemo(() => SkeletonUtils.clone(gltf.scene) as THREE.Group, [gltf.scene])

  // Aggregate all animations
  const allClips = useMemo(() => {
    const clips: THREE.AnimationClip[] = []
    
    fbxIdle.animations.forEach((a, i) => { a.name = i === 0 ? 'idle' : `idle${i}`; clips.push(a) })
    gltfFalling.animations.forEach((a, i) => { a.name = i === 0 ? 'falling' : `falling${i}`; clips.push(a) })
    fbxWalkFwd.animations.forEach((a, i) => { a.name = i === 0 ? 'walk' : `walk${i}`; clips.push(a) })
    fbxWaving.animations.forEach((a, i) => { a.name = i === 0 ? 'waving' : `waving${i}`; clips.push(a) })
    
    return clips
  }, [fbxIdle, gltfFalling, fbxWalkFwd, fbxWaving])

  // Instantiate OOP Managers
  const character = useMemo(() => new Character(clonedScene, allClips, scrollState), [clonedScene, allClips])
  const environment = useMemo(() => {
    if (parallaxGroupRef.current && ambientLightRef.current && dirLightRef.current) {
      return new Environment(parallaxGroupRef.current, ambientLightRef.current, dirLightRef.current)
    }
    return null
  }, [parallaxGroupRef.current, ambientLightRef.current, dirLightRef.current])

  const mouseRef = useRef(new THREE.Vector2(0, 0))

  useEffect(() => {
    loadingStore.setAboutReady(true)

    const handlePointer = (e: MouseEvent | TouchEvent) => {
      let x, y
      if ('touches' in e) {
        x = e.touches[0].clientX
        y = e.touches[0].clientY
      } else {
        x = (e as MouseEvent).clientX
        y = (e as MouseEvent).clientY
      }
      
      // Normalize to -1 to 1
      mouseRef.current.x = (x / window.innerWidth) * 2 - 1
      mouseRef.current.y = -(y / window.innerHeight) * 2 + 1
    }

    window.addEventListener('mousemove', handlePointer, { passive: true })
    window.addEventListener('touchmove', handlePointer, { passive: true })
    
    return () => {
      window.removeEventListener('mousemove', handlePointer)
      window.removeEventListener('touchmove', handlePointer)
    }
  }, [])

  useFrame((_, delta) => {
    // Update Character logic (animations, movement, phases)
    // Use global mouseRef instead of state.mouse for better mobile responsiveness
    character.update(scrollState.progress, delta, mouseRef.current)
    
    // Update Environment logic (parallax, lighting)
    if (environment) {
      environment.update(scrollState.progress, delta)
    } else if (parallaxGroupRef.current && ambientLightRef.current && dirLightRef.current) {
      // Lazy init if not ready in useMemo
      const env = new Environment(parallaxGroupRef.current, ambientLightRef.current, dirLightRef.current)
      env.update(scrollState.progress, delta)
    }

    // Handle Shadow specific to falling phase
    if (shadowRef.current) {
      const p = scrollState.progress
      const modelY = character.group.position.y
      const isFalling = p < 0.15
      shadowRef.current.visible = isFalling && modelY > -0.8
      
      if (shadowRef.current.visible) {
        const shadowOpacity = Math.max(0, (modelY - (-0.9)) / (3 - (-0.9)))
        const shadowScale = 1 - (shadowOpacity * 0.5)
        shadowRef.current.scale.setScalar(shadowScale)
        ;(shadowRef.current.material as THREE.MeshBasicMaterial).opacity = shadowOpacity * 0.4
      }
    }
  })

  return (
    <group>
      {/* Background Shapes */}
      <group ref={parallaxGroupRef}>
        <mesh position={[-4, 1, -6]} userData={{ baseY: 1, baseRotX: 0.2, baseRotY: 0.3 }}>
          <boxGeometry args={[0.8, 0.8, 0.8]} />
          <meshStandardMaterial color="#6366f1" emissive="#6366f1" emissiveIntensity={0.3} transparent opacity={0.6} />
        </mesh>
        <mesh position={[4, 2, -5]} userData={{ baseY: 2, baseRotX: 0.5, baseRotY: 0.2 }}>
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={0.3} transparent opacity={0.6} />
        </mesh>
        <mesh position={[-2, 3, -7]} rotation={[0.5, 0, 0]} userData={{ baseY: 3, baseRotX: 0.3, baseRotY: 0.4 }}>
          <torusGeometry args={[0.4, 0.15, 8, 20]} />
          <meshStandardMaterial color="#00e5ff" emissive="#00e5ff" emissiveIntensity={0.25} transparent opacity={0.55} />
        </mesh>
        <mesh position={[3, -0.5, -6]} userData={{ baseY: -0.5, baseRotX: 0.1, baseRotY: 0.6 }}>
          <coneGeometry args={[0.4, 0.8, 8]} />
          <meshStandardMaterial color="#8b5cf6" emissive="#8b5cf6" emissiveIntensity={0.3} transparent opacity={0.6} />
        </mesh>
        <mesh position={[5.5, 1.5, -4]} userData={{ baseY: 1.5, baseRotX: 0.4, baseRotY: 0.5 }}>
          <icosahedronGeometry args={[0.35, 0]} />
          <meshStandardMaterial color="#6366f1" emissive="#6366f1" emissiveIntensity={0.35} transparent opacity={0.65} />
        </mesh>
        <mesh position={[-5, -0.8, -5]} userData={{ baseY: -0.8, baseRotX: 0.6, baseRotY: 0.2 }}>
          <dodecahedronGeometry args={[0.4, 0]} />
          <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={0.35} transparent opacity={0.65} />
        </mesh>
      </group>

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.5, 0]} receiveShadow>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial color="#dfd1bc" roughness={0.9} />
      </mesh>

      {/* Character Model - moved right to avoid text overlap */}
      <primitive object={character.group} scale={0.60} position={[0.40, -0.3, 0]} />

      {/* Character Shadow */}
      <mesh ref={shadowRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.48, 0]} visible={false}>
        <circleGeometry args={[1.2, 32]} />
        <meshBasicMaterial color="#1a1a2e" transparent opacity={0} />
      </mesh>

      {/* Lighting - Reduced intensity for a softer feel */}
      <ambientLight ref={ambientLightRef} intensity={0.8} />
      <directionalLight ref={dirLightRef} position={[3, 6, 4]} intensity={1.2} castShadow color="#fff8f0" />
      <directionalLight position={[-3, 4, 3]} intensity={0.4} color="#f0c8a0" />
      <pointLight position={[0, 3, 1]} intensity={0.3} color="#f5a623" />
      <pointLight position={[0, 2, -2]} intensity={0.2} color="#6366f1" />
    </group>
  )
}

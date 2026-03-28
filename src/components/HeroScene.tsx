import { useRef, useEffect, useMemo, useCallback } from 'react'
import { RoundedBox, useGLTF, useFBX, useAnimations } from '@react-three/drei'
import * as THREE from 'three'
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js'
import { loadingStore } from '../stores/loadingStore'

// In production, Vercel will act as a CDN, but your models are VERY large (over 120MB total).
// If you want to use a dedicated external CDN (like jsDelivr, AWS S3, or Cloudinary), 
// replace this URL with your CDN's base URL. 
// Example: "https://cdn.jsdelivr.net/gh/YourGitHubUsername/YourRepoName@main/public"
const CDN_URL = import.meta.env.PROD ? "" : "" // Put your CDN URL inside the quotes to enable it
const getUrl = (path: string) => `${CDN_URL}${path}`

// Warm isometric desk scene for the hero section
// Colour palette: creamy whites, warm woods, pops of colour

function DeskModel({ pos, scale, rotation, onLoad }: { pos: [number, number, number], scale: number, rotation: [number, number, number], onLoad: () => void }) {
  const { scene } = useGLTF(getUrl('desk.glb'), 'draco/')
  const clone = useMemo(() => scene.clone(), [scene])
  useEffect(() => { onLoad(); }, [onLoad]);
  return <primitive object={clone} position={pos} scale={scale} rotation={rotation} />
}

function PCModel({ pos, scale, rotation, onLoad }: { pos: [number, number, number], scale: number, rotation: [number, number, number], onLoad: () => void }) {
  const { scene } = useGLTF(getUrl('gaming_pc-draco.glb'), 'draco/')
  const clone = useMemo(() => scene.clone(), [scene])
  useEffect(() => { onLoad(); }, [onLoad]);
  return <primitive object={clone} position={pos} scale={scale} rotation={rotation} />
}

function KeyboardModel({ pos, scale, rotation, onLoad }: { pos: [number, number, number], scale: number, rotation: [number, number, number], onLoad: () => void }) {
  const { scene } = useGLTF(getUrl('basic_keyboard.glb'), 'draco/')
  const clone = useMemo(() => scene.clone(), [scene])
  useEffect(() => { onLoad(); }, [onLoad]);
  return <primitive object={clone} position={pos} scale={scale} rotation={rotation} />
}

function MonitorModel({ pos, scale, rotation, onLoad }: { pos: [number, number, number], scale: number, rotation: [number, number, number], onLoad: () => void }) {
  const { scene } = useGLTF(getUrl('desktop.glb'), 'draco/')
  const clone = useMemo(() => scene.clone(), [scene])
  useEffect(() => { onLoad(); }, [onLoad]);
  return <primitive object={clone} position={pos} scale={scale} rotation={rotation} />
}

function RoomModel({ pos, scale, rotation, onLoad }: { pos: [number, number, number], scale: number, rotation: [number, number, number], onLoad: () => void }) {
  const { scene } = useGLTF(getUrl('room-draco.glb'), 'draco/')
  // Recolour blue materials once when the scene is first loaded (useMemo avoids re-running on every render)
  useMemo(() => {
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const mat = child.material as THREE.MeshStandardMaterial
        if (mat.color && mat.color.b > mat.color.r && mat.color.b > mat.color.g * 0.8) {
          mat.color.set('#dfd1bc')
        }
        if (mat.emissive && mat.emissive.b > mat.emissive.r && mat.emissive.b > mat.emissive.g * 0.8) {
          mat.emissive.set('#dfd1bc')
        }
      }
    })
  }, [scene])
  useEffect(() => { onLoad(); }, [onLoad]);
  return <primitive object={scene} position={pos} scale={scale} rotation={rotation} />
}

function PencilCup({ pos }: { pos: [number, number, number] }) {
  return (
    <group position={pos}>
      <mesh>
        <cylinderGeometry args={[0.07, 0.065, 0.22, 12]} />
        <meshStandardMaterial color="#e8e0d4" roughness={0.4} />
      </mesh>
      {/* Pencils */}
      {[0, 1.2, 2.4].map((r, i) => (
        <mesh key={i} position={[Math.sin(r) * 0.025, 0.16, Math.cos(r) * 0.025]} rotation={[0.1 * Math.sin(r), 0, 0.08 * Math.cos(r)]}>
          <cylinderGeometry args={[0.012, 0.012, 0.28, 6]} />
          <meshStandardMaterial color={['#f5a623', '#dfd1bc', '#f06292'][i]} roughness={0.4} />
        </mesh>
      ))}
    </group>
  )
}




function Mouse({ pos }: { pos: [number, number, number] }) {
  return (
    <group position={pos}>
      <RoundedBox args={[0.12, 0.05, 0.18]} radius={0.02} position={[0, 0, 0]}>
        <meshStandardMaterial color="#222" roughness={0.3} />
      </RoundedBox>
      <mesh position={[0, 0.02, -0.04]}>
        <boxGeometry args={[0.01, 0.01, 0.06]} />
        <meshStandardMaterial color="#333" />
      </mesh>
    </group>
  )
}

function BananaPlant({ pos, scale, onLoad }: { pos: [number, number, number], scale: number, onLoad: () => void }) {
  const { scene } = useGLTF(getUrl('banana_plant_with_pot.glb'), 'draco/')
  useEffect(() => { onLoad(); }, [onLoad]);
  return <primitive object={scene} position={pos} scale={scale} />
}

function OfficeChair({ pos, scale, rotation, onLoad }: { pos: [number, number, number], scale: number, rotation: [number, number, number], onLoad: () => void }) {
  const { nodes, materials } = useGLTF(getUrl('office_chair.glb'), 'draco/') as any
  useEffect(() => { onLoad(); }, [onLoad]);
  return (
    <group position={pos} scale={scale} rotation={rotation}>
      {nodes['OfficeChair_OfficeChairMetal_0'] && (
        <mesh geometry={nodes['OfficeChair_OfficeChairMetal_0'].geometry} material={materials['OfficeChairMetal'] ?? nodes['OfficeChair_OfficeChairMetal_0'].material} />
      )}
      {nodes['OfficeChair_OfficeChairPlastic_0'] && (
        <mesh geometry={nodes['OfficeChair_OfficeChairPlastic_0'].geometry} material={materials['OfficeChairPlastic'] ?? nodes['OfficeChair_OfficeChairPlastic_0'].material} />
      )}
      {nodes['OfficeChair_OfficeChairCloth_0'] && (
        <mesh geometry={nodes['OfficeChair_OfficeChairCloth_0'].geometry} material={materials['OfficeChairCloth'] ?? nodes['OfficeChair_OfficeChairCloth_0'].material} />
      )}
      {nodes['OfficeChair_OfficeChairLeather_0'] && (
        <mesh geometry={nodes['OfficeChair_OfficeChairLeather_0'].geometry} material={materials['OfficeChairLeather'] ?? nodes['OfficeChair_OfficeChairLeather_0'].material} />
      )}
    </group>
  )
}

function AnimatedModel({ pos, onLoad }: { pos: [number, number, number], onLoad: () => void }) {
  const { scene } = useGLTF(getUrl('model.glb?v=2'), 'draco/')
  // Properly clone the skinned mesh using SkeletonUtils
  const clonedScene = useMemo(() => {
    return SkeletonUtils.clone(scene)
  }, [scene])

  const fbx = useFBX(getUrl('Typing.fbx'))
  const { actions } = useAnimations(fbx.animations, clonedScene)

  useEffect(() => {
    // Play the first animation clip found in the FBX
    const action = actions[Object.keys(actions)[0]]
    if (action) {
      action.play()
    }
    onLoad();
  }, [actions, onLoad]);

  return (
    <group position={pos} rotation={[0, Math.PI, 0]} scale={1}>
      <primitive object={clonedScene} />
    </group>
  )
}

function Rug() {
  return (
    <group rotation={[-Math.PI / 2, 0, 0]} position={[0.2, -0.49, 0.3]}>
      <mesh>
        <planeGeometry args={[2.6, 2.2]} />
        <meshStandardMaterial color="#f5a623" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0, 0.002]}>
        <planeGeometry args={[2.1, 1.7]} />
        <meshStandardMaterial color="#f8c55c" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0, 0.004]}>
        <planeGeometry args={[1.6, 1.2]} />
        <meshStandardMaterial color="#fde68a" roughness={0.9} />
      </mesh>
    </group>
  )
}




// Preload all GLTFs used in HeroScene so they are fetched in parallel before render
useGLTF.preload(getUrl('desk.glb'), 'draco/')
useGLTF.preload(getUrl('gaming_pc-draco.glb'), 'draco/')
useGLTF.preload(getUrl('basic_keyboard.glb'), 'draco/')
useGLTF.preload(getUrl('desktop.glb'), 'draco/')
useGLTF.preload(getUrl('room-draco.glb'), 'draco/')
useGLTF.preload(getUrl('model.glb?v=2'), 'draco/')
useGLTF.preload(getUrl('banana_plant_with_pot.glb'), 'draco/')
useGLTF.preload(getUrl('office_chair.glb'), 'draco/')

export default function HeroScene() {
  const loadedCountRef = useRef(0)
  const totalModels = 8; // Room, Desk, Monitor, PC, Keyboard, BananaPlant, OfficeChair, AnimatedModel

  const handleModelLoad = useCallback(() => {
    loadedCountRef.current += 1;
    if (loadedCountRef.current >= totalModels) {
      loadingStore.setHeroReady(true);
    }
  }, []);

  return (
    <group rotation={[0.22, -0.55, 0.1]} position={[0.3, -0.3, 0]}>
      {/* Room Model as a larger environment */}
      <RoomModel pos={[0, 1.15, 0]} rotation={[0, 0, 0]} scale={2} onLoad={handleModelLoad} />

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial color="#dfd1bc" roughness={0.9} />
      </mesh>

      {/* Rug */}
      <Rug />

      {/* Desk */}
      <DeskModel pos={[0.1, -0.59, 0]} rotation={[0, 0, 0]} scale={1} onLoad={handleModelLoad} />

      {/* Monitors */}
      <MonitorModel pos={[0.56, 0.52, 0.25]} rotation={[0, 0, 0]} scale={0.3} onLoad={handleModelLoad} />

      {/* Pencil cup */}
      <PencilCup pos={[1.098, 0.62, 0.46]} />

      {/* Model sitting and typing */}
      <AnimatedModel pos={[0.53, 0.01, 1.46]} onLoad={handleModelLoad} />

      {/* Chair */}
      <OfficeChair pos={[0.5, -0.20, 1.4]} rotation={[1.57, 3.14, 0]} scale={1.0} onLoad={handleModelLoad} />

      {/* Big plant beside desk */}
      <BananaPlant pos={[1.6, -0.18, 0.55]} scale={0.5} onLoad={handleModelLoad} />

      {/* Keyboard and Mouse */}
      <KeyboardModel pos={[-0.88, 0.7, -0.01]} rotation={[0, 0, 0]} scale={1.5} onLoad={handleModelLoad} />
      <Mouse pos={[0.75, 0.7, 0.65]} />

      {/* Small speaker */}
      <RoundedBox args={[0.16, 0.2, 0.14]} radius={0.04} position={[1.1, 0.15, -0.1]}>
        <meshStandardMaterial color="#2a2a2a" roughness={0.5} />
      </RoundedBox>

      {/* PC Tower */}
      <PCModel pos={[-0.66, 1.3, 0.2]} rotation={[0, Math.PI / 2.2, -3]} scale={0.06} onLoad={handleModelLoad} />
    </group>
  )
}

import { useProgress } from '@react-three/drei'
import { useEffect, useState } from 'react'

export default function LoadingScreen() {
  const { progress, active } = useProgress()
  const [visible, setVisible] = useState(true)
  const [statusIndex, setStatusIndex] = useState(0)

  const techMessages = [
    "INITIALIZING_VORTEX_ENGINE",
    "SYNCING_NEURAL_MAPS",
    "COLLECTING_BIOMETRIC_DATA",
    "DECODING_PIXEL_MATRICES",
    "CALIBRATING_QUANTUM_FIELD",
    "UPLOADING_CONSCIOUSNESS",
    "STABILIZING_GEOMETRY",
    "FINALIZING_TRANSMISSION"
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % techMessages.length)
    }, 1800)
    return () => clearInterval(interval)
  }, [])

  // The core of the speed improvement:
  // 1. Rely strictly on useProgress (no blocking on background scenes)
  // 2. Fades out as soon as essentials are ready
  // 3. Built-in timing buffer to ensure smooth transition
  useEffect(() => {
    if (!active && progress >= 100) {
      const t = setTimeout(() => setVisible(false), 800)
      return () => clearTimeout(t)
    }
  }, [active, progress])

  // Safety fallback for very large assets/slow deployments
  // If we've reached 90% and been there for 12s, allow user in
  useEffect(() => {
    if (progress >= 90) {
      const safety = setTimeout(() => setVisible(false), 12000)
      return () => clearTimeout(safety)
    }
  }, [progress])

  if (!visible) return null

  const isComplete = !active && progress >= 100

  return (
    <div className={`loading-screen${isComplete ? ' hidden' : ''}`}>
      <div className="loading-content">
        <div className="loading-cube">AC</div>
        
        <div className="loading-status-container">
          <div className="loading-bar-track">
            <div className="loading-bar-fill" style={{ width: `${Math.round(progress)}%` }}>
              <div className="loading-bar-glow" />
            </div>
          </div>
          
          <div className="loading-info">
            <p className="loading-tech-status">
              {isComplete ? 'SYSTEM_ONLINE' : techMessages[statusIndex]}
            </p>
            <p className="loading-percentage">{Math.round(progress)}%</p>
          </div>
        </div>

        <div className="loading-first-time-warning">
          Loading 3D models... This may take longer on the first visit. Please wait.
        </div>
      </div>
      
      <div className="loading-desktop-hint">
        View in Desktop For More Interactive Feature
      </div>

      <div className="loading-bg-pulse" />
    </div>
  )
}

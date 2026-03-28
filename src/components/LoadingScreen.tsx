import { useProgress } from '@react-three/drei'
import { useEffect, useState } from 'react'
import { loadingStore } from '../stores/loadingStore'

export default function LoadingScreen() {
  const { progress, active } = useProgress()
  const [visible, setVisible] = useState(true)
  const [scenesReady, setScenesReady] = useState(false)
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

  useEffect(() => {
    loadingStore.onAllReady(() => {
      setScenesReady(true)
    })
  }, [])

  useEffect(() => {
    if (!active && progress >= 100 && scenesReady) {
      const t = setTimeout(() => setVisible(false), 800)
      return () => clearTimeout(t)
    }
  }, [active, progress, scenesReady])

  if (!visible) return null

  const isComplete = !active && progress >= 100 && scenesReady

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
      </div>
      
      <div className="loading-bg-pulse" />
    </div>
  )
}

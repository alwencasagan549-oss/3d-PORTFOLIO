import { useEffect, useRef, useCallback } from 'react'
// replaced broken raf import with native requestAnimationFrame

type ScrollCallbacks = {
  onProgress?: (progress: number) => void
  onSectionChange?: (section: string) => void
}

export function useScrollProgress(callbacks: ScrollCallbacks) {
  const rafRef = useRef<number>()
  const ticking = useRef(false)
  const scrollY = useRef(0)
  const lastProgress = useRef(0)

  const updateScroll = useCallback(() => {
    if (ticking.current) return
    ticking.current = true
    rafRef.current = window.requestAnimationFrame(() => {
      scrollY.current = window.scrollY
      ticking.current = false
    })
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', updateScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', updateScroll)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [updateScroll])

  // Expose progress via RAF for smooth updates
  useEffect(() => {
    const updateProgress = () => {
      // Update DOM elements based on scrollY.current
      const p = Math.min(Math.max((scrollY.current - 2000) / 8000, 0), 1) // Adjust ranges to match original

      // Direct DOM updates (same logic as original)
      const bar = document.querySelector('.about-progress-fill') as HTMLElement
      if (bar) bar.style.width = `${p * 100}%`

      // ... (migrate all original DOM logic here)

      if (Math.abs(p - lastProgress.current) > 0.01) {
        callbacks.onProgress?.(p)
        lastProgress.current = p
      }

      rafRef.current = window.requestAnimationFrame(updateProgress)
    }
    updateProgress()
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [callbacks])

  return scrollY
}

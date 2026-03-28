// Global loading state - tracks when 3D scenes are actually ready
type ReadyCallback = () => void

class LoadingStore {
  private heroReady = false
  private aboutReady = false
  private callbacks: ReadyCallback[] = []

  setHeroReady(ready: boolean) {
    this.heroReady = ready
    this.checkAllReady()
  }

  setAboutReady(ready: boolean) {
    this.aboutReady = ready
    this.checkAllReady()
  }

  isHeroReady() {
    return this.heroReady
  }

  isAboutReady() {
    return this.aboutReady
  }

  allReady() {
    return this.heroReady && this.aboutReady
  }

  onHeroReady(callback: ReadyCallback) {
    if (this.heroReady) {
      callback()
    } else {
      this.callbacks.push(callback)
    }
  }

  onAllReady(callback: ReadyCallback) {
    this.callbacks.push(callback)
    // If already ready, call immediately
    if (this.allReady()) {
      callback()
    }
  }

  private checkAllReady() {
    if (this.allReady()) {
      this.callbacks.forEach(cb => cb())
      this.callbacks = [] // Clear after firing
    }
  }
}

export const loadingStore = new LoadingStore()


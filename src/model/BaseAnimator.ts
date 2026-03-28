import * as THREE from 'three'

/**
 * Base class for objects that handle Three.js animations.
 * Provides safe clip cloning (stripping scale tracks) and mixer management.
 */
export class BaseAnimator {
  protected mixer: THREE.AnimationMixer
  protected actions: Record<string, THREE.AnimationAction> = {}

  constructor(root: THREE.Object3D) {
    this.mixer = new THREE.AnimationMixer(root)
  }

  /**
   * Safely registers multiple animation clips.
   * Automatically clones clips and strips scale tracks to prevent "giant model" bugs.
   */
  public registerAnimations(clips: THREE.AnimationClip[]) {
    clips.forEach((clip) => {
      const safeClip = this.stripScaleTracks(clip)
      const action = this.mixer.clipAction(safeClip)
      this.actions[safeClip.name] = action
    })
  }

  /**
   * Strips scale and position tracks from an animation clip to prevent unwanted transforms.
   */
  private stripScaleTracks(clip: THREE.AnimationClip): THREE.AnimationClip {
    const cloned = clip.clone()
    cloned.tracks = cloned.tracks.filter((track) => {
      const name = track.name.toLowerCase()
      // Strip scale tracks (prevents giant model bugs)
      if (name.endsWith('.scale')) return false
      // Strip ALL position tracks from hips/root (prevents root motion zooming)
      if (name.includes('.position') && (
        name.includes('hips') || 
        name.includes('root') || 
        name.includes('spine') ||
        name === 'position'
      )) return false
      return true
    })
    return cloned
  }

  /**
   * Plays an animation with optional fading.
   */
  public play(name: string, fadeDuration = 0.5) {
    const action = this.actions[name]
    if (action) {
      action.reset().fadeIn(fadeDuration).play()
    }
  }

  /**
   * Fades out an animation.
   */
  public fadeOut(name: string, fadeDuration = 0.5) {
    const action = this.actions[name]
    if (action) {
      action.fadeOut(fadeDuration)
    }
  }

  /**
   * Scrubs an animation to a specific time.
   */
  public scrub(name: string, time: number) {
    const action = this.actions[name]
    if (action) {
      action.enabled = true
      action.paused = true
      action.time = time
    }
  }

  /**
   * Sets the timeScale for an animation (negative for reverse, 0 to pause).
   */
  public setTimeScale(name: string, scale: number) {
    const action = this.actions[name]
    if (action) {
      action.timeScale = scale
    }
  }

  /**
   * Gets the clip duration for an animation.
   */
  public getClipDuration(name: string): number {
    const action = this.actions[name]
    return action?.getClip().duration || 0
  }
  public update(delta: number) {
    this.mixer.update(delta)
  }

  public getAction(name: string): THREE.AnimationAction | undefined {
    return this.actions[name]
  }

  public getMixer(): THREE.AnimationMixer {
    return this.mixer
  }
}

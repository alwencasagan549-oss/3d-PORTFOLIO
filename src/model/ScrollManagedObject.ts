import * as THREE from 'three'

/**
 * Abstract class for scene elements that react to scroll progress (0-1).
 */
export abstract class ScrollManagedObject {
  protected smoothProgress = 0
  protected prevProgress = 0

  /**
   * Updates the object's properties based on scroll progress and time delta.
   * @param progress The 0-1 progress of the scroll section.
   * @param delta The time delta since the last frame.
   */
  public abstract update(progress: number, delta: number): void

  /**
   * Utility to interpolate a property based on scroll progress.
   */
  protected lerp(start: number, end: number, progress: number, ease?: (t: number) => number): number {
    const t = ease ? ease(progress) : progress
    return THREE.MathUtils.lerp(start, end, t)
  }

  /**
   * Utility to smoothen the incoming scroll progress.
   */
  protected smoothenProgress(rawProgress: number, factor = 0.1): number {
    this.smoothProgress = THREE.MathUtils.lerp(this.smoothProgress, rawProgress, factor)
    return this.smoothProgress
  }

  /**
   * Utility to check if scrolling is moving forward (down) or backward (up).
   */
  protected isScrollingDown(current: number): boolean {
    const isDown = current >= this.prevProgress
    this.prevProgress = current
    return isDown
  }
}

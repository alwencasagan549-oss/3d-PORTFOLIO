import * as THREE from 'three'
import { ScrollManagedObject } from './ScrollManagedObject'

export class Environment extends ScrollManagedObject {
  public parallaxGroup: THREE.Group
  public ambientLight: THREE.AmbientLight
  public dirLight: THREE.DirectionalLight
  
  private lightColors = {
    dirStart: new THREE.Color('#fff8f0'),
    dirEnd: new THREE.Color('#e0e7ff'),
    ambStart: new THREE.Color('#4a5568'),
    ambEnd: new THREE.Color('#1e1b4b'),
  }

  constructor(parallaxGroup: THREE.Group, ambientLight: THREE.AmbientLight, dirLight: THREE.DirectionalLight) {
    super()
    this.parallaxGroup = parallaxGroup
    this.ambientLight = ambientLight
    this.dirLight = dirLight
  }

  public update(progress: number, _delta: number) {
    const p = this.smoothenProgress(progress, 0.1)
    
    // Visibility toggle: hide if at the very start to avoid stray shapes
    if (this.parallaxGroup) {
      this.parallaxGroup.visible = p > 0.005 && p < 1.0
    }
    
    this.updateParallax(p)
    this.updateLighting(p)
    
    this.prevProgress = p
  }


  private updateParallax(p: number) {
    if (!this.parallaxGroup) return
    
    const shapes = this.parallaxGroup.children as THREE.Mesh[]
    shapes.forEach((shape, i) => {
      const speed = (i + 1) * 0.22 // Reduced from 0.3 for a more "medium" feel
      const offset = p * speed * 4.5 // Reduced from 8 for a more "medium" feel
      shape.position.y = (shape.userData.baseY || 0) + offset
      shape.rotation.x = (shape.userData.baseRotX || 0) + p * speed * 2
      shape.rotation.y = (shape.userData.baseRotY || 0) + p * speed * 1.5
    })
  }

  private updateLighting(p: number) {
    const PHASE_IDLE_START = 0.15
    const PHASE_WALK_START = 0.30

    let lightMix = 0
    if (p < PHASE_IDLE_START) {
      lightMix = 0
    } else if (p < PHASE_WALK_START) {
      lightMix = (p - PHASE_IDLE_START) / (PHASE_WALK_START - PHASE_IDLE_START)
    } else {
      lightMix = 1
    }

    const { dirStart, dirEnd, ambStart, ambEnd } = this.lightColors
    if (this.ambientLight) {
      this.ambientLight.color.lerpColors(ambStart, ambEnd, lightMix)
    }
    if (this.dirLight) {
      this.dirLight.color.lerpColors(dirStart, dirEnd, lightMix)
    }
  }
}

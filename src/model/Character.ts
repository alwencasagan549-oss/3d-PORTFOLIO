import * as THREE from 'three'
import { BaseAnimator } from './BaseAnimator'
import { ScrollManagedObject } from './ScrollManagedObject'

export type CharacterPhase = 'falling' | 'idle' | 'walk' | 'waving'

const PHASE_IDLE_START = 0.15
const PHASE_WALK_START = 0.30
const PHASE_CTA_START = 0.81
const PHASE_WAVE_TRIGGER = 0.79

export class Character extends ScrollManagedObject {
  public phase: CharacterPhase = 'falling'
  public group: THREE.Group
  public model: THREE.Object3D
  public animator: BaseAnimator
  
  // Ref for external scroll state control (e.g. from App.tsx)
  private scrollState: {
    triggerWaving: boolean
    wavePlayed: boolean
    waveFinished: boolean
    prevProgress: number
  }

  constructor(model: THREE.Object3D, animations: THREE.AnimationClip[], scrollStateRef: any) {
    super()
    this.model = model
    this.model.scale.setScalar(3.8)
    this.group = new THREE.Group()
    this.group.add(this.model)
    this.scrollState = scrollStateRef
    
    // Initialize animator
    this.animator = new BaseAnimator(this.model)
    this.animator.registerAnimations(animations)
    
    // Set initial state
    this.animator.play('falling')
    
    // Prepare walk & wave loops
    const walkAction = this.animator.getAction('walk')
    const walkClipDuration = this.animator.getClipDuration('walk')
    if (walkAction && walkClipDuration > 0) {
      // Calculate timeScale so walk completes exactly when summary ends (0.79)
      // Assuming scroll takes ~3 seconds to go from 0.30 to 0.79
      const estimatedWalkTime = 3.0 // seconds
      walkAction.timeScale = walkClipDuration / estimatedWalkTime
      walkAction.loop = THREE.LoopOnce
      walkAction.clampWhenFinished = true
    }
    const wavingAction = this.animator.getAction('waving')
    if (wavingAction) {
      wavingAction.loop = THREE.LoopOnce
      wavingAction.clampWhenFinished = true
    }
  }

  public update(progress: number, delta: number, mouse?: THREE.Vector2) {
    const p = this.smoothenProgress(progress, 0.1)
    const isDown = this.isScrollingDown(p)
    
    this.updatePhase(p)
    this.updatePosition(p, isDown)
    this.updateRotation(p, isDown)
    this.updateAnimations(p, isDown, delta)
    
    // Apply mouse tracking (Eye/Head tracking)
    if (mouse) {
      this.updateMouseTracking(mouse)
    }
    
    this.prevProgress = p
  }

  private headBone: THREE.Object3D | null = null
  private neckBone: THREE.Object3D | null = null

  private findBones() {
    this.model.traverse((child) => {
      // Common naming conventions for head/neck bones
      if (child.name.toLowerCase().includes('head')) this.headBone = child
      if (child.name.toLowerCase().includes('neck')) this.neckBone = child
    })
  }

  private updateMouseTracking(mouse: THREE.Vector2) {
    if (!this.headBone || !this.neckBone) {
      this.findBones()
    }

    if (this.headBone && this.neckBone) {
      // Map mouse (-1 to 1) to rotation (roughly -45 to 45 degrees)
      const targetRotationY = mouse.x * 0.8
      const targetRotationX = -mouse.y * 0.4
      
      const lerpSpeed = 0.15 // Increased responsiveness
      
      // Interpolate for smoothness
      this.headBone.rotation.y = THREE.MathUtils.lerp(this.headBone.rotation.y, targetRotationY, lerpSpeed)
      this.headBone.rotation.x = THREE.MathUtils.lerp(this.headBone.rotation.x, targetRotationX, lerpSpeed)
      
      this.neckBone.rotation.y = THREE.MathUtils.lerp(this.neckBone.rotation.y, targetRotationY * 0.4, lerpSpeed)
      this.neckBone.rotation.x = THREE.MathUtils.lerp(this.neckBone.rotation.x, targetRotationX * 0.4, lerpSpeed)
    }
  }


  private updatePhase(p: number) {
    // Wave Trigger Logic
    if (p > PHASE_WAVE_TRIGGER && this.phase !== 'waving' && !this.scrollState.wavePlayed) {
      this.scrollState.triggerWaving = true
      this.scrollState.wavePlayed = true
    }
    if (p < (PHASE_WAVE_TRIGGER - 0.05) && this.scrollState.wavePlayed) {
      this.scrollState.wavePlayed = false
    }

    // Manual or Auto Trigger
    if (this.scrollState.triggerWaving && this.phase !== 'waving') {
      this.transitionTo('waving')
      this.scrollState.triggerWaving = false
      
      const duration = this.animator.getAction('waving')?.getClip().duration || 1
      setTimeout(() => {
        if (this.phase === 'waving') {
          this.transitionTo('idle')
          this.scrollState.waveFinished = true
        }
      }, duration * 1000)
      return
    }

    if (this.phase === 'waving') return

    // Normal Transitions
    if (p < PHASE_IDLE_START) {
      if (this.phase !== 'falling') this.transitionTo('falling')
    } else if (p < PHASE_WALK_START) {
      if (this.phase !== 'idle') this.transitionTo('idle')
    } else {
      if (this.phase !== 'walk') this.transitionTo('walk')
    }
  }

  private transitionTo(newPhase: CharacterPhase) {
    const oldPhase = this.phase
    this.phase = newPhase
    
    // Fade out old
    if (oldPhase === 'falling') this.animator.fadeOut('falling', 0.8)
    if (oldPhase === 'idle') this.animator.fadeOut('idle', 0.6)
    if (oldPhase === 'walk') this.animator.fadeOut('walk', 0.6)
    if (oldPhase === 'waving') this.animator.fadeOut('waving', 0.5)

    // Fade in new
    if (newPhase === 'falling') this.animator.play('falling', 0.8)
    if (newPhase === 'idle') this.animator.play('idle', 0.6)
    if (newPhase === 'walk') {
      this.animator.play('walk', 0.6)
      // Pause the action so we can scrub it manually based on scroll
      const walkAction = this.animator.getAction('walk')
      if (walkAction) walkAction.paused = true
    }
    if (newPhase === 'waving') this.animator.play('waving', 0.3)
  }

  private updatePosition(p: number, isDown: boolean) {
    let targetY = -0.3
    if (p < PHASE_IDLE_START) {
      const entryT = p / PHASE_IDLE_START
      targetY = THREE.MathUtils.lerp(12, -0.3, entryT * entryT)
    }
    
    // Visibility toggle: hide if at the very start or end to avoid stray models
    this.group.visible = p > 0.005 && p < 1.0
    
    const lerpFactor = isDown ? 0.12 : 0.18
    this.group.position.y = THREE.MathUtils.lerp(this.group.position.y, targetY, lerpFactor)
  }


  private updateRotation(p: number, isDown: boolean) {
    let targetRotation = 0
    if (this.phase === 'waving' || p >= PHASE_CTA_START) {
      targetRotation = 0
    } else if (this.phase === 'walk') {
      // Face right when walking down, face left when walking up
      targetRotation = isDown ? Math.PI / 2 : -Math.PI / 2
    }
    
    if (Math.abs(this.group.rotation.y - targetRotation) > 0.001) {
      this.group.rotation.y = THREE.MathUtils.lerp(this.group.rotation.y, targetRotation, 0.08)
    }
  }

  private updateAnimations(p: number, isDown: boolean, delta: number) {
    const walkAction = this.animator.getAction('walk')
    const walkClipDuration = this.animator.getClipDuration('walk')
    
    if (this.phase === 'walk' && walkAction && walkClipDuration > 0) {
      // Map scroll progress (0.30 to 0.79) to animation time
      const walkProgress = (p - PHASE_WALK_START) / (PHASE_WAVE_TRIGGER - PHASE_WALK_START)
      const clampedProgress = Math.max(0, Math.min(1, walkProgress))
      
      // Set animation time based on scroll progress
      // When scrolling down: play forward (0 -> duration)
      // When scrolling up: play backward (duration -> 0)
      const targetTime = isDown 
        ? clampedProgress * walkClipDuration 
        : (1 - clampedProgress) * walkClipDuration
      
      walkAction.time = targetTime
    }
    
    // Always update the mixer to allow weight transitions (fades) to progress
    this.animator.update(delta)
  }
}

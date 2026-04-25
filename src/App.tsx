import { Suspense, useState, useRef, useEffect, useLayoutEffect, lazy } from 'react'
import { Canvas } from '@react-three/fiber'
import { AdaptiveDpr, AdaptiveEvents, Preload } from '@react-three/drei'
import { Github, Mail, Linkedin, Volume2, VolumeX, Phone, MapPin, Menu, X, ExternalLink, AlertTriangle, Download } from 'lucide-react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import HeroScene from './components/HeroScene'
const AboutScene = lazy(() => import('./components/AboutScene'))
import { scrollState } from './stores/scrollStore'
import LoadingScreen from './components/LoadingScreen'
import ContactForm from './components/ContactForm'

gsap.registerPlugin(ScrollTrigger)

type Section = 'home' | 'about' | 'projects' | 'contact'

export default function App() {
  const [activeSection, setActiveSection] = useState<Section>('home')
  const [isScrolled, setIsScrolled] = useState(false)
  const [muted, setMuted] = useState(true)
  const [projectIndex, setProjectIndex] = useState(0)
  const [isContactOpen, setIsContactOpen] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSuspendedModalOpen, setIsSuspendedModalOpen] = useState(false)

  const projects = [
    {
      icon: '🐖',
      name: 'CasaganPigery - Premium Farm Management',
      desc: 'A high-end, modern Farm Management and Marketplace system designed specifically for piggery operations. Built with Laravel 12 and React (Vite).',
      tags: ['Laravel 12', 'React', 'Vite', 'TypeScript', 'MySQL'],
      features: ['Dashboard Analytics', 'Breeding Records (114 days)', 'Health & Nutrition Tracking', 'Facebook Messenger Integration'],
      url: 'https://casaganpigery.ct.ws',
      buttonType: 'demo'
    },
    {
      icon: '🌌',
      name: 'Cinematic Black Hole',
      desc: 'A high-end, interactive 3D simulation of a supermassive black hole generated from scratch using pure mathematics and light simulation in real-time.',
      tags: ['React Three Fiber', 'GLSL', 'Three.js', 'Frontend Project'],
      features: ['Gravitational Lensing', 'Relativistic Beaming', 'Custom Shaders (FBM)', 'Cinematic Processing'],
      url: 'https://blackhole1.vercel.app',
      buttonType: 'demo'
    },
    {
      icon: '📦',
      name: 'Inventory Borrowing System',
      desc: 'A comprehensive system for tracking borrowed items, managing users, and maintaining records with reporting capabilities.',
      tags: ['PHP', 'MySQL', 'JavaScript', 'Bootstrap'],
      features: ['Inventory Management', 'Transaction Processing', 'Sales History Tracking'],
      url: 'https://inn.xo.je/admin/login.php',
      buttonType: 'demo'
    },
    {
      icon: '🎓',
      name: 'EduPortal LMS - Assignment Portal',
      desc: 'EduPortal LMS is a complete Assignment Portal system built with PHP and MySQL. It provides a seamless platform for teachers to manage assignments and for students to submit their work online.',
      tags: ['PHP', 'MySQL', 'JavaScript', 'HTML/CSS', 'Bootstrap'],
      features: ['Assignment Creation & Management', 'Student Submission Portal', 'Automated Grading & Feedback'],
      url: 'https://edu1.fwh.is/',
      buttonType: 'demo'
    },
    {
      icon: '🛒',
      name: 'Simple POS System',
      desc: 'A complete Point of Sale system with inventory management, transaction processing, and sales history tracking for retail businesses.',
      tags: ['PHP', 'MySQL', 'JavaScript', 'HTML/CSS', 'REST API'],
      features: ['Inventory Management', 'Transaction Processing', 'Sales History Tracking'],
      url: '#',
      buttonType: 'github',
      isSuspended: true
    },
    {
      icon: '🎓',
      name: 'AllWhenQuiz: Premium Quiz System',
      desc: 'A high-performance, real-time classroom assessment application built with Go and Svelte. Designed for educators who need a professional and reliable quiz platform.',
      tags: ['Go', 'Svelte', 'Wails', 'SQLite', 'WebSockets'],
      features: ['Hero-Style Podium & Medals', 'Smart Session Persistence', 'Real-time Avatar Sync', 'Teacher Control Center'],
      url: 'https://github.com/alwencasagan549-oss/AllWhenQuiz/releases/download/AllWhenQuiz/allwhenquiz.exe',
      buttonType: 'download'
    },
    {
      icon: '🏛️',
      name: 'BrgySync Management System',
      desc: 'A comprehensive web-based management system for barangay operations including resident management, document requests, blotter cases, and financial transactions.',
      tags: ['PHP', 'MySQL', 'JavaScript', 'Bootstrap'],
      features: ['Resident Management', 'Document & QR System', 'Blotter Records', 'Financial Management'],
      url: 'https://by.free.nf/index.php',
      buttonType: 'demo'
    }
  ]

  const sectionRefs = {
    home: useRef<HTMLDivElement>(null),
    aboutWrapper: useRef<HTMLDivElement>(null),
    projects: useRef<HTMLDivElement>(null),
    contact: useRef<HTMLDivElement>(null),
  }

  // Refs for Navbar Sliding Indicator
  const navLinksRef = useRef<{ [key: string]: HTMLButtonElement | null }>({})
  const navIndicatorRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Update sliding indicator position
  useLayoutEffect(() => {
    const activeBtn = navLinksRef.current[activeSection]
    const indicator = navIndicatorRef.current
    if (activeBtn && indicator) {
      indicator.style.width = `${activeBtn.offsetWidth}px`
      indicator.style.left = `${activeBtn.offsetLeft}px`
    }
  }, [activeSection])

  // Scroll to section
  const scrollTo = (section: keyof typeof sectionRefs) => {
    sectionRefs[section].current?.scrollIntoView({ behavior: 'smooth' })
    setIsMenuOpen(false) // Close menu on click
  }

  // Drive scrollState.progress from GSAP + update React progress bar
  useEffect(() => {
    const handleScroll = () => {
      // Navbar Background state
      setIsScrolled(window.scrollY > 50)

      const sections = [
        { id: 'home', el: sectionRefs.home.current },
        { id: 'about', el: sectionRefs.aboutWrapper.current },
        { id: 'projects', el: sectionRefs.projects.current },
        { id: 'contact', el: sectionRefs.contact.current },
      ]

      let current: Section = 'home'
      const threshold = window.innerHeight * 0.3 // Use 30% from top as trigger point

      sections.forEach((s) => {
        if (!s.el) return
        const rect = s.el.getBoundingClientRect()
        // If the section's top is above the threshold AND its bottom is below it
        if (rect.top <= threshold && rect.bottom >= threshold) {
          current = s.id as Section
        }
      })
      
      setActiveSection((prev) => (prev !== current ? current : prev))
    }


    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: '.about-pin-wrapper',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.5,
        anticipatePin: 1,
        onUpdate: (self) => {
          const p = Math.min(Math.max(self.progress, 0), 1)
          
          // SCROLL-LOCK: Cap visual progress at 0.99 until wave is done
          let visualP = p
          if (p >= 0.99 && !scrollState.waveFinished) {
            visualP = 0.99
          }

          // Reset flags if scrolling back up
          if (p < 0.90) {
            scrollState.waveFinished = false
          }

          scrollState.progress = visualP
          // PROGRESS BAR UPDATE: Directly update DOM to avoid re-render
          const bar = document.querySelector('.about-progress-fill') as HTMLElement
          if (bar) bar.style.width = `${visualP * 100}%`

          // CHAPTER MILESTONES UPDATE: Directly update DOM
          const markers = document.querySelectorAll('.chapter-marker')
          const thresholds = [0, 0.20, 0.35, 0.55, 0.81]
          markers.forEach((marker, i) => {
            const threshold = thresholds[i]
            const nextThreshold = thresholds[i + 1] || 1.1
            const isActive = visualP >= threshold && visualP < nextThreshold
            const isCompleted = visualP >= nextThreshold
            
            if (isActive) marker.classList.add('active')
            else marker.classList.remove('active')
            
            if (isCompleted) marker.classList.add('completed')
            else marker.classList.remove('completed')
          })

          // SCROLLY ITEMS UPDATE: Directly update DOM
          const items = document.querySelectorAll('.scrolly-item')
          const isMobile = window.innerWidth <= 768
          const itemRanges = isMobile ? [
            { id: 0, start: 0.15, end: 0.28 }, // Name (triggered earlier on mobile)
            { id: 1, start: 0.32, end: 0.50 }, // Skills
            { id: 2, start: 0.55, end: 0.78 }, // Summary
            { id: 3, start: 0.82, end: 2.00 }  // Connect
          ] : [
            { id: 0, start: 0.22, end: 0.33 }, // Name
            { id: 1, start: 0.37, end: 0.53 }, // Skills
            { id: 2, start: 0.58, end: 0.79 }, // Summary
            { id: 3, start: 0.81, end: 2.00 }  // Connect
          ]
          items.forEach((item, i) => {
            const range = itemRanges[i]
            if (range && visualP >= range.start && visualP < range.end) {
              item.classList.add('active')
            } else {
              item.classList.remove('active')
            }
          })
        }
      })
    })

    window.addEventListener('scroll', handleScroll, { passive: true })
    // Trigger once on mount
    handleScroll()
    
    // MOBILE FIX: Direct touch scroll handling for model animation
    const isMobile = window.innerWidth <= 768
    
    const handleTouchMove = () => {
      if (!isMobile) return
      
      // Force ScrollTrigger update on mobile touch
      ScrollTrigger.update()
      
      // Calculate about section progress directly
      const aboutWrapper = sectionRefs.aboutWrapper.current
      if (aboutWrapper) {
        const rect = aboutWrapper.getBoundingClientRect()
        const wrapperHeight = aboutWrapper.offsetHeight
        const viewportHeight = window.innerHeight
        
        // Calculate scroll progress through about section
        const scrolled = -rect.top
        const totalScrollable = wrapperHeight - viewportHeight
        
        if (scrolled >= 0 && scrolled <= totalScrollable) {
          const progress = Math.min(Math.max(scrolled / totalScrollable, 0), 1)
          scrollState.progress = progress
        }
      }
    }
    
    if (isMobile) {
      window.addEventListener('touchmove', handleTouchMove, { passive: true })
      window.addEventListener('scroll', handleTouchMove, { passive: true })
    }
    
    // Refresh ScrollTrigger after mount to ensure proper mobile touch detection
    const refreshTimeout = setTimeout(() => {
      ScrollTrigger.refresh()
    }, 100)
    
    // Handle resize for mobile orientation changes
    const handleResize = () => {
      ScrollTrigger.refresh()
    }
    window.addEventListener('resize', handleResize)
    
    // Background Music Initialization
    audioRef.current = new Audio('background-music.mp3')
    audioRef.current.loop = true
    audioRef.current.volume = 0.4

    return () => {
      ctx.revert()
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('touchmove', handleTouchMove)
      clearTimeout(refreshTimeout)
      
      // Cleanup Audio
      audioRef.current?.pause()
      audioRef.current = null
    }
  }, [])

  // Sync music with muted state
  useEffect(() => {
    if (audioRef.current) {
      if (muted) {
        audioRef.current.pause()
      } else {
        audioRef.current.play().catch(err => {
          console.warn("Audio play blocked - needs interaction", err)
        })
      }
    }
  }, [muted])

  // Section Entrance Animations
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Projects Section
      gsap.from('.projects-header', {
        scrollTrigger: {
          trigger: '.projects-section',
          start: 'top 80%',
        },
        y: 60,
        opacity: 0,
        duration: 1,
        ease: 'power3.out'
      })

      gsap.from('.projects-carousel', {
        scrollTrigger: {
          trigger: '.projects-carousel',
          start: 'top 85%',
        },
        scale: 0.95,
        y: 40,
        opacity: 0,
        duration: 1.2,
        ease: 'power2.out',
        delay: 0.2
      })

      gsap.from('.projects-nav', {
        scrollTrigger: {
          trigger: '.projects-nav',
          start: 'top 95%',
        },
        y: 20,
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out',
        delay: 0.4
      })

      // Contact Section
      const contactTl = gsap.timeline({
        scrollTrigger: {
          trigger: '.contact-section',
          start: 'top 75%',
        }
      })

      contactTl
        .from('.contact-heading', {
          y: 80,
          opacity: 0,
          duration: 1,
          ease: 'power4.out'
        })
        .from('.contact-sub', {
          y: 20,
          opacity: 0,
          duration: 0.8,
        }, '-=0.6')
        .from('.contact-links-row', {
          y: 20,
          opacity: 0,
          duration: 0.6,
        }, '-=0.2')
    })

    return () => ctx.revert()
  }, [])

  return (
    <div style={{ background: 'var(--bg-color)', color: 'var(--text-main)', minHeight: '100vh', position: 'relative' }}>
      <div className="bg-blobs">
        <div className="bg-blob" style={{ top: '-10%', left: '-10%', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, transparent 70%)' }}></div>
        <div className="bg-blob" style={{ bottom: '10%', right: '-10%', background: 'radial-gradient(circle, rgba(168, 85, 247, 0.3) 0%, transparent 70%)' }}></div>
        <div className="bg-blob" style={{ top: '40%', right: '10%', width: '30vw', height: '30vw', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, transparent 70%)' }}></div>
      </div>
      <LoadingScreen />

      {/* ======== NAVBAR ======== */}
      <nav className={`navbar${isScrolled ? ' scrolled' : ''}`}>
        <div className="navbar-logo">
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path 
              d="M20 85 L50 15 L80 85" 
              stroke="currentColor" 
              strokeWidth="10" 
              strokeLinecap="square" 
            />
            <path 
              d="M32 60 H48 M52 60 H68" 
              stroke="currentColor" 
              strokeWidth="10" 
              strokeLinecap="square" 
            />
            <path 
              d="M50 15 L50 30" 
              stroke="var(--accent-primary)" 
              strokeWidth="4" 
              strokeLinecap="round" 
              opacity="0.6"
            />
          </svg>
        </div>

        <div className="navbar-links">
          {(['home', 'about', 'projects', 'contact'] as const).map(s => (
            <button
              key={s}
              ref={el => navLinksRef.current[s] = el}
              className={`nav-link${activeSection === s ? ' active' : ''}`}
              onClick={() => scrollTo(s === 'about' ? 'aboutWrapper' : s)}
            >
              {s === 'home' ? 'Home' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
          <div ref={navIndicatorRef} className="nav-active-indicator" />
        </div>

        <div className="navbar-right">
          <button className="btn-contact desktop-only" onClick={() => setIsContactOpen(true)}>
            Get In Touch
          </button>
          <button className="btn-sound" onClick={() => setMuted(!muted)} aria-label="Toggle sound">
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          <button className="mobile-menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* ======== MOBILE MENU OVERLAY ======== */}
      <div className={`mobile-menu-overlay${isMenuOpen ? ' open' : ''}`}>
        <div className="mobile-menu-content">
          {(['home', 'about', 'projects', 'contact'] as const).map(s => (
            <button
              key={s}
              className={`mobile-nav-link${activeSection === s ? ' active' : ''}`}
              onClick={() => scrollTo(s === 'about' ? 'aboutWrapper' : s)}
            >
              {s === 'home' ? 'Home' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
          <button className="mobile-menu-contact-btn" onClick={() => { setIsContactOpen(true); setIsMenuOpen(false); }}>
            Get In Touch
          </button>
        </div>
      </div>

      {/* ======================================
          HERO SECTION 
      ====================================== */}
      <section ref={sectionRefs.home} className="page-section hero-section">
        <div className="hero-text-block">
          <div className="hero-badge">InfoTech Student</div>
          <h1 className="hero-name">Alwen<br /> Casagan</h1>
          <p className="hero-role">Software Engineer with strengths in <b>Code Optimization</b> and <b>Application Development</b>. Delivers high-quality software solutions that enhance functionality and security.</p>
          <div className="hero-ctas">
            <button className="btn-hero-primary" onClick={() => setIsContactOpen(true)}>
              <Mail size={18} /> Hire Me
            </button>
            <a className="btn-hero-outline" href="RESUME.pdf" download="ALWEN_CASAGAN_RESUME.pdf">
              <span>📥</span> Download CV
            </a>
          </div>
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">2</span>
              <span className="stat-label">Years Experience</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{projects.length}+</span>
              <span className="stat-label">Major Projects</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">2</span>
              <span className="stat-label">Certifications</span>
            </div>
          </div>
        </div>
        <div className="hero-canvas" style={{ pointerEvents: 'none' }}>
          <Canvas 
            shadows 
            dpr={[1, 1.5]} 
            camera={{ 
              position: window.innerWidth <= 768 ? [0, 1.5, 6] : [0, 2, 5], 
              fov: window.innerWidth <= 768 ? 55 : 45 
            }} 
            gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
          >


            <color attach="background" args={['#030712']} />
            <AdaptiveDpr pixelated />
            <AdaptiveEvents />
            <ambientLight intensity={0.5} />
            <directionalLight position={[3, 6, 4]} intensity={1.2} castShadow color="#8b5cf6" shadow-mapSize={[1024, 1024]} />
            <directionalLight position={[-3, 4, 3]} intensity={0.4} color="#6366f1" />
            <pointLight position={[0, 3, 1]} intensity={0.2} color="#ffffff" />
            <Suspense fallback={null}>
              <HeroScene />
              <Preload all />
            </Suspense>
          </Canvas>
        </div>
      </section>

      {/* ======================================
          ABOUT SECTION — Native Sticky Pinning (Desktop) / Normal Scroll (Mobile)
      ====================================== */}
      <div
        className="about-pin-wrapper"
        ref={sectionRefs.aboutWrapper}
        style={{ height: '1200vh', position: 'relative' }} // Pinned on all devices
      >
        <section 
          className="page-section about-section" 
          style={{ 
            position: 'sticky', 
            top: 0, 
            height: '100vh', 
            overflow: 'hidden' 
          }}
        >

          {/* Active Canvas - Sticky on all devices */}
          <div 
            className="about-canvas" 
            style={{ 
              position: 'absolute', 
              inset: 0, 
              zIndex: 1,
              pointerEvents: 'none' // Key for allowing scroll to pass through
            }}
          >
            <Canvas 
              dpr={[1, 1.25]} 
              camera={{ 
                position: window.innerWidth <= 768 ? [0, 0.2, 5] : [0, 0.4, 3.8], 
                fov: window.innerWidth <= 768 ? 60 : 50 
              }} 
              gl={{ antialias: false, alpha: false, powerPreference: 'high-performance' }}
            >

              <color attach="background" args={['#030712']} />
              <AdaptiveDpr pixelated />
              <AdaptiveEvents />
              <Suspense fallback={null}>
                <AboutScene />
                <Preload all />
              </Suspense>
            </Canvas>
          </div>

          {/* Scrollytelling Content Layers */}
          <div 
            className="scrolly-container"
          >


            {/* Phase 1: Name */}
            <div className="scrolly-item">
              <h2 className="scrolly-name">
                <span className="name-outline">Alwen</span>
                <span>Casagan</span>
              </h2>
            </div>

            {/* Phase 2: Skills */}
            <div className="scrolly-item">
              <div className="scrolly-skills-grid">
                {[
                  { name: 'HTML & CSS', desc: 'Semantic markup, responsive design, modern CSS', progress: 95 },
                  { name: 'JavaScript', desc: 'Interactive web apps, DOM, ES6+', progress: 90 },
                  { name: 'Laravel 12', desc: 'Premium PHP framework, MVC, Eloquent ORM', progress: 90 },
                  { name: 'System Dev', desc: 'Inventory, POS, full lifecycle', progress: 80 },
                  { name: 'UI/UX Design', desc: 'User-centered design, prototyping', progress: 75 },
                  { name: 'Python', desc: 'AI/ML, automation, data analysis', progress: 70 },
                  { name: 'Three.js', desc: '3D web graphics, shaders, animations', progress: 70 },
                  { name: 'Next.js', desc: 'React framework, SSR, static sites', progress: 70 },
                  { name: 'Node.js', desc: 'Server-side runtime, APIs, performance', progress: 70 }
                ].map(skill => (
                  <div key={skill.name} className="scrolly-skill-card">
                    <div className="scrolly-skill-header">
                      <div className="scrolly-skill-name">{skill.name}</div>
                      <div className="scrolly-skill-perc">{skill.progress}%</div>
                    </div>
                    <div className="scrolly-skill-desc">{skill.desc}</div>
                    <div className="scrolly-skill-bar-track">
                      <div className="scrolly-skill-bar-fill" style={{ width: `${skill.progress}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Phase 3: Summary */}
            <div className="scrolly-item">
              <p className="scrolly-summary">
                <span className="summary-highlight">Full Stack Web Developer</span> with expertise in 
                <span className="summary-accent"> Laravel 12</span>, 
                <span className="summary-accent"> PHP</span>, 
                <span className="summary-accent"> code optimization</span>, and 
                <span className="summary-accent"> end-to-end application development</span>.
                <br /><br />
                Passionate about building 
                <span className="summary-sub">secure</span>, 
                <span className="summary-sub">scalable web experiences</span> that solve real problems.
              </p>
            </div>

            {/* Phase 5: Connect / CTA */}
            <div className="scrolly-item">
              <div className="scrolly-cta">
                <p className="scrolly-cta-text">Ready to work together?</p>
                <button 
                  className="scrolly-cta-button" 
                  onClick={() => setIsContactOpen(true)}
                >
                  Get in Touch
                </button>
              </div>
            </div>

          </div>

          <div className="chapter-milestones">
            {['Entry', 'Landing', 'Skills', 'Story', 'Connect'].map((label) => (
                <div key={label} className="chapter-marker">
                  <div className="chapter-dot" />
                  <span className="chapter-label">{label}</span>
                </div>
            ))}
          </div>

        </section>
      </div>

      {/* ======================================
          PROJECTS SECTION
      ====================================== */}
      <section ref={sectionRefs.projects} className="page-section projects-section">
        <div className="projects-container">
          <div className="projects-header">
            <span className="section-badge">Projects</span>
            <h2 className="section-heading">Featured Work</h2>
            <p className="section-sub">A collection of my recent digital experiences</p>
          </div>

          <div className="projects-carousel">
            {projects.map((p, i) => (
              <div
                key={p.name}
                className={`project-card-wrapper ${projectIndex === i ? 'active' : ''} ${projectIndex > i ? 'exit-left' : ''} ${projectIndex < i ? 'enter-right' : ''}`}
              >
                <div
                  className="project-card"
                  onMouseMove={(e) => {
                    const el = e.currentTarget
                    const r = el.getBoundingClientRect()
                    const x = (e.clientX - r.left) / r.width - 0.5
                    const y = (e.clientY - r.top) / r.height - 0.5
                    el.style.setProperty('--rx', `${y * -10}deg`)
                    el.style.setProperty('--ry', `${x * 10}deg`)
                    el.style.setProperty('--mx', `${(x + 0.5) * 100}%`)
                    el.style.setProperty('--my', `${(y + 0.5) * 100}%`)
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget
                    el.style.setProperty('--rx', '0deg')
                    el.style.setProperty('--ry', '0deg')
                    el.style.setProperty('--mx', '50%')
                    el.style.setProperty('--my', '50%')
                  }}
                >
                  <span className="project-number">0{i + 1}</span>
                  <div className="project-icon">{p.icon}</div>
                  <div className="project-title">{p.name}</div>
                  <div className="project-desc">{p.desc}</div>
                  <ul className="project-features">
                    {p.features.map(f => (
                      <li key={f}><span>✓</span> {f}</li>
                    ))}
                  </ul>
                  <div className="project-tags">
                    {p.tags.map(t => <span key={t} className="project-tag">{t}</span>)}
                  </div>
                  <button 
                    className="project-github-btn"
                    onClick={() => {
                      if (p.isSuspended) {
                        setIsSuspendedModalOpen(true)
                      } else if (p.url) {
                        window.open(p.url, '_blank')
                      }
                    }}
                  >
                    {p.buttonType === 'demo' ? (
                      <>
                        <ExternalLink size={16} /> Live Demo
                      </>
                    ) : p.buttonType === 'download' ? (
                      <>
                        <Download size={16} /> Install the exe file
                      </>
                    ) : (
                      <>
                        <Github size={16} /> View on GitHub
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="projects-nav">
            <button 
              className="proj-nav-btn prev" 
              onClick={() => setProjectIndex((prev) => (prev - 1 + projects.length) % projects.length)}
              aria-label="Previous project"
            >
              ←
            </button>
            <div className="proj-pagination">
              {projects.map((_, i) => (
                <div 
                  key={i} 
                  className={`proj-dot ${projectIndex === i ? 'active' : ''}`}
                  onClick={() => setProjectIndex(i)}
                />
              ))}
            </div>
            <button 
              className="proj-nav-btn next" 
              onClick={() => setProjectIndex((prev) => (prev + 1) % projects.length)}
              aria-label="Next project"
            >
              Next →
            </button>
          </div>
        </div>
      </section>

      {/* ======================================
          CONTACT SECTION
      ====================================== */}
      <section ref={sectionRefs.contact} className="page-section contact-section">
        <h2 className="contact-heading">Get In Touch</h2>
        <p className="contact-sub">
          Have a project in mind or want to collaborate? Let's connect!
          Available for freelance projects, internships, and collaborations.
        </p>
        <div className="contact-info">
          <div className="contact-item">
            <div className="contact-icon-wrapper"><Mail size={24} /></div>
            <div className="contact-content">
              <span className="contact-label">Email</span>
              <a href="mailto:alwencasagann@gmail.com" className="contact-value">alwencasagann@gmail.com</a>
            </div>
          </div>
          <div className="contact-item">
            <div className="contact-icon-wrapper"><Phone size={24} /></div>
            <div className="contact-content">
              <span className="contact-label">Phone</span>
              <span className="contact-value">09051115962</span>
            </div>
          </div>
          <div className="contact-item">
            <div className="contact-icon-wrapper"><MapPin size={24} /></div>
            <div className="contact-content">
              <span className="contact-label">Location</span>
              <span className="contact-value">Bagumbayan, Dinagat, Caraga 8412</span>
            </div>
          </div>
        </div>
        <div className="contact-links-row">
          <button className="contact-btn contact-btn-primary" onClick={() => setIsContactOpen(true)}>
            <Mail size={16} /> Say Hello
          </button>
          <a className="contact-btn contact-btn-outline" href="https://github.com" target="_blank" rel="noreferrer">
            <Github size={16} /> GitHub
          </a>
          <a className="contact-btn contact-btn-outline" href="https://linkedin.com" target="_blank" rel="noreferrer">
            <Linkedin size={16} /> LinkedIn
          </a>
        </div>
      </section>
      <ContactForm isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />

      {/* Custom Suspended Alert Modal */}
      {isSuspendedModalOpen && (
        <div className="suspended-overlay" onClick={() => setIsSuspendedModalOpen(false)}>
          <div className="suspended-modal" onClick={e => e.stopPropagation()}>
            <div className="suspended-icon-wrapper">
              <AlertTriangle className="suspended-icon" size={48} />
            </div>
            <h3 className="suspended-title">Access Suspended</h3>
            <p className="suspended-message">
              Access has been suspended, sorry for inconveniences, the developer is fixing this
            </p>
            <button 
              className="suspended-close-btn"
              onClick={() => setIsSuspendedModalOpen(false)}
            >
              Understand
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

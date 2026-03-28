import { X, Send, CheckCircle } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { gsap } from 'gsap'

interface ContactFormProps {
  isOpen: boolean
  onClose: () => void
}

export default function ContactForm({ isOpen, onClose }: ContactFormProps) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'success'>('idle')
  const formRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      // Entry animation
      gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'power2.out' })
      gsap.fromTo(formRef.current, { scale: 0.9, y: 20, opacity: 0 }, { scale: 1, y: 0, opacity: 1, duration: 0.6, ease: 'back.out(1.7)', delay: 0.1 })
    } else {
      document.body.style.overflow = 'auto'
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('sending')
    
    const formData = new FormData(e.target as HTMLFormElement)
    const data = Object.fromEntries(formData.entries())

    try {
      const response = await fetch("https://formsubmit.co/ajax/alwencasagann@gmail.com", {
        method: "POST",
        headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        setStatus('success')
      } else {
        console.error("Form submission failed")
        setStatus('idle')
        alert("Failed to send message. Please try again.")
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      setStatus('idle')
      alert("An error occurred. Please check your connection and try again.")
    }
  }

  const handleReset = () => {
    setStatus('idle')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="contact-overlay" ref={overlayRef} onClick={onClose}>
      <div 
        className="contact-modal" 
        ref={formRef} 
        onClick={(e) => e.stopPropagation()}
      >
        <button className="contact-close-btn" onClick={onClose} aria-label="Close form">
          <X size={24} />
        </button>

        {status === 'success' ? (
          <div className="contact-success">
            <div className="success-icon-wrapper">
              <CheckCircle size={64} color="var(--accent-primary)" />
            </div>
            <h2 className="success-title">Message Received!</h2>
            <p className="success-text">
              Thanks for reaching out, Alwen. I'll get back to you across the digital void as soon as possible.
            </p>
            <button className="btn-success-close" onClick={handleReset}>
              Transmission Complete
            </button>
          </div>
        ) : (
          <form className="contact-form-body" onSubmit={handleSubmit}>
            <div className="form-header">
              <div className="form-badge">SYSTEM_CONTACT_v2.0</div>
              <h2 className="form-title">Send Message</h2>
              <p className="form-sub">Initiate a direct link to <span className="highlight">alwencasagann@gmail.com</span></p>
            </div>

            <div className="form-fields">
              {/* Spam Protection */}
              <input type="text" name="_honey" style={{ display: 'none' }} />
              <input type="hidden" name="_subject" value="New Portfolio Message!" />
              
              <div className="form-group">
                <label htmlFor="name">IDENTIFIER / NAME</label>
                <input type="text" id="name" name="name" required placeholder="Project Designation or Name" />
                <div className="input-glow" />
              </div>

              <div className="form-group">
                <label htmlFor="email">COMMS_LINK / EMAIL</label>
                <input type="email" id="email" name="email" required placeholder="your.name@server.com" />
                <div className="input-glow" />
              </div>

              <div className="form-group">
                <label htmlFor="message">DATA_PACKET / MESSAGE</label>
                <textarea id="message" name="message" required rows={4} placeholder="Decoded message payload..."></textarea>
                <div className="input-glow" />
              </div>
            </div>

            <button type="submit" className="btn-send" disabled={status === 'sending'}>
              {status === 'sending' ? (
                <>
                  <div className="spinner" /> TRANSMITTING...
                </>
              ) : (
                <>
                  <Send size={18} /> INITIALIZE TRANSMISSION
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FaShieldAlt, FaLock, FaUserSecret, FaNewspaper, FaKey } from 'react-icons/fa';
import '../styles/LandingPage.css';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

const LandingPage = () => {
  const headerRef = useRef(null);
  const featuresRef = useRef(null);
  const ctaRef = useRef(null);

  useEffect(() => {
    // Hero section animation
    const tl = gsap.timeline();
    tl.fromTo(
      '.hero-title',
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
    )
      .fromTo(
        '.hero-subtitle',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
        '-=0.4'
      )
      .fromTo(
        '.cta-button',
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.7)' },
        '-=0.2'
      )
      .fromTo(
        '.hero-image',
        { opacity: 0, x: 20 },
        { opacity: 1, x: 0, duration: 0.8, ease: 'power2.out' },
        '-=0.4'
      );

    // Features section animation
    gsap.fromTo(
      '.feature-card',
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.15,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: featuresRef.current,
          start: 'top 80%',
        },
      }
    );

    // CTA section animation
    gsap.fromTo(
      '.cta-section',
      { opacity: 0 },
      {
        opacity: 1,
        duration: 0.8,
        scrollTrigger: {
          trigger: ctaRef.current,
          start: 'top 80%',
        },
      }
    );

    // Clean up ScrollTrigger on component unmount
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="navbar">
        <div className="logo">
          <FaShieldAlt className="logo-icon" />
          <span>SafeTrace</span>
        </div>
        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#about">About</a>
          <Link to="/login" className="login-button">Login</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header ref={headerRef} className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Protect Your Digital Privacy</h1>
          <p className="hero-subtitle">
            SafeTrace helps you monitor, secure, and control your online presence
            with advanced privacy tools and breach monitoring.
          </p>
          <Link to="/login" className="cta-button">Get Started</Link>
        </div>
        <div className="hero-image">
          <img src="https://ik.imagekit.io/demo/privacy-shield.png" alt="Privacy Shield" />
        </div>
      </header>

      {/* Features Section */}
      <section id="features" ref={featuresRef} className="features-section">
        <h2 className="section-title">Key Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <FaUserSecret className="feature-icon" />
            <h3>Breach Monitoring</h3>
            <p>Check if your data has been exposed in known breaches and get immediate alerts.</p>
          </div>
          <div className="feature-card">
            <FaLock className="feature-icon" />
            <h3>Encrypted Vault</h3>
            <p>Store your sensitive information in a secure, encrypted vault accessible only to you.</p>
          </div>
          <div className="feature-card">
            <FaKey className="feature-icon" />
            <h3>Privacy Risk Analysis</h3>
            <p>Get insights on your privacy risk level and actionable recommendations.</p>
          </div>
          <div className="feature-card">
            <FaNewspaper className="feature-icon" />
            <h3>Privacy News</h3>
            <p>Stay updated with the latest privacy and security news and trends.</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <h2 className="section-title">How It Works</h2>
        <div className="steps-container">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Sign Up</h3>
            <p>Create your account with Google or GitHub authentication.</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Connect Services</h3>
            <p>Let SafeTrace monitor your digital footprint across services.</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Get Protected</h3>
            <p>Receive alerts and recommendations to enhance your privacy.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section ref={ctaRef} className="cta-section">
        <div className="cta-content">
          <h2>Ready to take control of your privacy?</h2>
          <p>Join thousands of users who trust SafeTrace to protect their digital life.</p>
          <Link to="/login" className="cta-button">Get Started for Free</Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-logo">
            <FaShieldAlt className="logo-icon" />
            <span>SafeTrace</span>
          </div>
          <div className="footer-links">
            <div className="footer-column">
              <h4>Product</h4>
              <a href="#features">Features</a>
              <a href="#pricing">Pricing</a>
              <a href="#faq">FAQ</a>
            </div>
            <div className="footer-column">
              <h4>Company</h4>
              <a href="#about">About Us</a>
              <a href="#careers">Careers</a>
              <a href="#contact">Contact</a>
            </div>
            <div className="footer-column">
              <h4>Legal</h4>
              <a href="#privacy">Privacy Policy</a>
              <a href="#terms">Terms of Service</a>
              <a href="#cookies">Cookie Policy</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} SafeTrace. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 
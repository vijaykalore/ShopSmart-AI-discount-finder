import React from 'react';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          {/* Brand Section */}
          <div className="footer-section">
            <div className="footer-logo">
              <span className="footer-logo-icon">🛒</span>
              <span className="footer-logo-text">ShopSmart</span>
            </div>
            <p className="footer-description">
              AI-powered discount finder helping you make smarter purchasing decisions 
              with data-driven price predictions and trend analysis.
            </p>
          </div>

          {/* Links Section */}
          <div className="footer-section">
            <h3 className="footer-title">Quick Links</h3>
            <ul className="footer-links">
              <li><a href="/" className="footer-link">Home</a></li>
              <li><a href="/about" className="footer-link">About</a></li>
              <li><a href="#features" className="footer-link">Features</a></li>
              <li><a href="#how-it-works" className="footer-link">How It Works</a></li>
            </ul>
          </div>

          {/* Support Section */}
          <div className="footer-section">
            <h3 className="footer-title">Support</h3>
            <ul className="footer-links">
              <li><a href="#help" className="footer-link">Help Center</a></li>
              <li><a href="#faq" className="footer-link">FAQ</a></li>
              <li><a href="#contact" className="footer-link">Contact Us</a></li>
              <li><a href="#privacy" className="footer-link">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Technology Section */}
          <div className="footer-section">
            <h3 className="footer-title">Built With</h3>
            <div className="tech-stack">
              <span className="tech-item">React</span>
              <span className="tech-item">Node.js</span>
              <span className="tech-item">Python</span>
              <span className="tech-item">MongoDB</span>
              <span className="tech-item">ML</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p className="copyright">
              © {currentYear} ShopSmart. All rights reserved.
            </p>
            <p className="attribution">
              Made with ❤️ for smart shoppers
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

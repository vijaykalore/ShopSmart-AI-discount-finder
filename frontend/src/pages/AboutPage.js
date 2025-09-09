import React from 'react';
import './AboutPage.css';

const AboutPage = () => {
  return (
    <div className="about-page">
      <div className="container">
        {/* Hero Section */}
        <section className="about-hero">
          <div className="about-hero-content">
            <h1 className="about-title">About ShopSmart</h1>
            <p className="about-subtitle">
              Empowering smart purchasing decisions with AI-powered price predictions
            </p>
          </div>
        </section>

        {/* Mission Section */}
        <section className="mission-section">
          <div className="section-content">
            <h2 className="section-title">Our Mission</h2>
            <p className="mission-text">
              At ShopSmart, we believe everyone deserves to make informed purchasing decisions. 
              Our advanced AI algorithms analyze millions of data points to predict the optimal 
              time to buy products, helping you save money and shop with confidence.
            </p>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="how-it-works-section">
          <h2 className="section-title">How It Works</h2>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3 className="step-title">Data Collection</h3>
                <p className="step-description">
                  We continuously gather price data from multiple sources, tracking 
                  historical trends and market patterns for thousands of products.
                </p>
              </div>
            </div>

            <div className="step-card">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3 className="step-title">AI Analysis</h3>
                <p className="step-description">
                  Our machine learning models analyze price history, seasonal trends, 
                  and market factors to predict future price movements with high accuracy.
                </p>
              </div>
            </div>

            <div className="step-card">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3 className="step-title">Smart Predictions</h3>
                <p className="step-description">
                  Get personalized recommendations on when to buy, including confidence 
                  scores and expected savings to help you make the best decision.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Technology Section */}
        <section className="technology-section">
          <div className="tech-content">
            <div className="tech-text">
              <h2 className="section-title">Technology Stack</h2>
              <p className="tech-description">
                ShopSmart is built using cutting-edge technologies to ensure fast, 
                reliable, and accurate price predictions. Our full-stack solution 
                combines modern web technologies with advanced machine learning.
              </p>
              
              <div className="tech-list">
                <div className="tech-category">
                  <h4>Frontend</h4>
                  <ul>
                    <li>React.js for interactive UI</li>
                    <li>Chart.js for data visualization</li>
                    <li>Responsive design for all devices</li>
                  </ul>
                </div>
                
                <div className="tech-category">
                  <h4>Backend</h4>
                  <ul>
                    <li>Node.js with Express.js</li>
                    <li>MongoDB for data storage</li>
                    <li>RESTful API architecture</li>
                  </ul>
                </div>
                
                <div className="tech-category">
                  <h4>Machine Learning</h4>
                  <ul>
                    <li>Python with scikit-learn</li>
                    <li>Time series analysis</li>
                    <li>Predictive modeling</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="tech-visual">
              <div className="tech-stack-diagram">
                <div className="layer frontend-layer">
                  <span>Frontend (React)</span>
                </div>
                <div className="layer backend-layer">
                  <span>Backend (Node.js)</span>
                </div>
                <div className="layer ml-layer">
                  <span>ML Service (Python)</span>
                </div>
                <div className="layer data-layer">
                  <span>Database (MongoDB)</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="features-section">
          <h2 className="section-title">Key Features</h2>
          <div className="features-grid">
            <div className="feature-item">
              <div className="feature-icon">🎯</div>
              <h3 className="feature-title">Accurate Predictions</h3>
              <p className="feature-description">
                85% accuracy rate in price predictions using advanced machine learning algorithms
              </p>
            </div>

            <div className="feature-item">
              <div className="feature-icon">📊</div>
              <h3 className="feature-title">Historical Analysis</h3>
              <p className="feature-description">
                Comprehensive price history and trend analysis for informed decision making
              </p>
            </div>

            <div className="feature-item">
              <div className="feature-icon">⚡</div>
              <h3 className="feature-title">Real-time Updates</h3>
              <p className="feature-description">
                Get instant predictions and recommendations as market conditions change
              </p>
            </div>

            <div className="feature-item">
              <div className="feature-icon">📱</div>
              <h3 className="feature-title">Mobile Friendly</h3>
              <p className="feature-description">
                Responsive design that works perfectly on all devices and screen sizes
              </p>
            </div>

            <div className="feature-item">
              <div className="feature-icon">🔒</div>
              <h3 className="feature-title">Privacy Focused</h3>
              <p className="feature-description">
                No personal data required - just search and get predictions anonymously
              </p>
            </div>

            <div className="feature-item">
              <div className="feature-icon">💰</div>
              <h3 className="feature-title">Money Saving</h3>
              <p className="feature-description">
                Users save an average of 15-25% by following our buying recommendations
              </p>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="stats-section">
          <h2 className="section-title">By the Numbers</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">10K+</div>
              <div className="stat-label">Products Tracked</div>
              <div className="stat-description">
                Continuously monitoring price trends across thousands of products
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-number">85%</div>
              <div className="stat-label">Prediction Accuracy</div>
              <div className="stat-description">
                High confidence predictions backed by machine learning algorithms
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-number">$2M+</div>
              <div className="stat-label">Money Saved</div>
              <div className="stat-description">
                Total savings achieved by users following our recommendations
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-number">50K+</div>
              <div className="stat-label">Happy Users</div>
              <div className="stat-description">
                People using ShopSmart to make smarter purchasing decisions
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Start Saving?</h2>
            <p className="cta-description">
              Join thousands of smart shoppers who use ShopSmart to make informed 
              purchasing decisions and save money on every purchase.
            </p>
            <a href="/" className="btn btn-primary btn-lg">
              Start Searching Products
            </a>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;

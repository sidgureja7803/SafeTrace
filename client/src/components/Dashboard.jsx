import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import { gsap } from 'gsap';
import { FaShieldAlt, FaLock, FaUserSecret, FaNewspaper, FaKey, FaRandom, FaSignOutAlt, FaUser } from 'react-icons/fa';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState(false);
  const [stats, setStats] = useState({
    riskScore: 0,
    breachesFound: 0,
    vaultItems: 0,
    newsItems: 0
  });

  useEffect(() => {
    // Get user from auth
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);
      
      // Animate dashboard cards
      animateDashboard();
      
      // Fetch mock stats
      fetchMockStats();
    });

    return () => unsubscribe();
  }, []);

  const animateDashboard = () => {
    gsap.fromTo(
      '.dashboard-card',
      { opacity: 0, y: 20 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 0.5, 
        stagger: 0.1,
        ease: 'power2.out'
      }
    );
  };

  const fetchMockStats = () => {
    // In a real app, this would be an API call
    setTimeout(() => {
      setStats({
        riskScore: Math.floor(Math.random() * 100),
        breachesFound: Math.floor(Math.random() * 5),
        vaultItems: Math.floor(Math.random() * 10),
        newsItems: 5
      });
    }, 1000);
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const toggleMenu = () => {
    setActiveMenu(!activeMenu);
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className={`sidebar ${activeMenu ? 'active' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <FaShieldAlt className="logo-icon" />
            <span>SafeTrace</span>
          </div>
          <button className="menu-toggle" onClick={toggleMenu}>
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
        <div className="sidebar-content">
          <div className="user-info">
            <div className="user-avatar">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="User avatar" />
              ) : (
                <FaUser />
              )}
            </div>
            <div className="user-details">
              <h3>{user?.displayName || 'User'}</h3>
              <p>{user?.email || 'No email'}</p>
            </div>
          </div>
          <nav className="sidebar-nav">
            <Link to="/dashboard" className="nav-item active">
              <FaShieldAlt className="nav-icon" />
              <span>Dashboard</span>
            </Link>
            <Link to="/breach-checker" className="nav-item">
              <FaUserSecret className="nav-icon" />
              <span>Breach Checker</span>
            </Link>
            <Link to="/vault" className="nav-item">
              <FaLock className="nav-icon" />
              <span>Secure Vault</span>
            </Link>
            <Link to="/risk-checker" className="nav-item">
              <FaKey className="nav-icon" />
              <span>Risk Analysis</span>
            </Link>
            <Link to="/news" className="nav-item">
              <FaNewspaper className="nav-icon" />
              <span>Privacy News</span>
            </Link>
            <Link to="/fake-data" className="nav-item">
              <FaRandom className="nav-icon" />
              <span>Fake Data</span>
            </Link>
          </nav>
        </div>
        <div className="sidebar-footer">
          <button className="sign-out-button" onClick={handleSignOut}>
            <FaSignOutAlt className="sign-out-icon" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        <header className="dashboard-header">
          <h1>Dashboard</h1>
          <p className="welcome-message">Welcome back, {user?.displayName || 'User'}!</p>
        </header>

        {/* Stats Overview */}
        <section className="stats-overview">
          <div className="dashboard-card risk-score">
            <h3>Privacy Risk Score</h3>
            <div className="score-display">
              <div className="score-circle">
                <span>{stats.riskScore}</span>
              </div>
              <div className="score-label">
                {stats.riskScore < 30 ? 'Low Risk' : stats.riskScore < 70 ? 'Medium Risk' : 'High Risk'}
              </div>
            </div>
            <Link to="/risk-checker" className="card-action">View Details</Link>
          </div>

          <div className="dashboard-card breaches">
            <h3>Data Breaches</h3>
            <div className="breach-info">
              <span className="breach-count">{stats.breachesFound}</span>
              <span className="breach-label">breaches found</span>
            </div>
            <Link to="/breach-checker" className="card-action">Check Now</Link>
          </div>

          <div className="dashboard-card vault-items">
            <h3>Vault Items</h3>
            <div className="vault-info">
              <span className="vault-count">{stats.vaultItems}</span>
              <span className="vault-label">items stored</span>
            </div>
            <Link to="/vault" className="card-action">Manage Vault</Link>
          </div>

          <div className="dashboard-card news-updates">
            <h3>Privacy News</h3>
            <div className="news-info">
              <span className="news-count">{stats.newsItems}</span>
              <span className="news-label">new articles</span>
            </div>
            <Link to="/news" className="card-action">Read News</Link>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <Link to="/breach-checker" className="action-card">
              <FaUserSecret className="action-icon" />
              <h3>Check for Breaches</h3>
              <p>Scan for your data in known breaches</p>
            </Link>
            <Link to="/vault" className="action-card">
              <FaLock className="action-icon" />
              <h3>Add to Vault</h3>
              <p>Store a new password or sensitive info</p>
            </Link>
            <Link to="/risk-checker" className="action-card">
              <FaKey className="action-icon" />
              <h3>Analyze Risk</h3>
              <p>Get your privacy risk assessment</p>
            </Link>
            <Link to="/fake-data" className="action-card">
              <FaRandom className="action-icon" />
              <h3>Generate Fake Data</h3>
              <p>Create test data for online forms</p>
            </Link>
          </div>
        </section>

        {/* Recent News */}
        <section className="recent-news">
          <h2>Recent Privacy News</h2>
          <div className="news-preview">
            <article className="news-item">
              <h3>Major Data Breach Affects Millions</h3>
              <p>A leading tech company has disclosed a data breach that exposed personal information...</p>
              <span className="news-date">2 days ago</span>
            </article>
            <article className="news-item">
              <h3>New Privacy Regulations Coming into Effect</h3>
              <p>Governments around the world are implementing stricter privacy regulations...</p>
              <span className="news-date">5 days ago</span>
            </article>
            <Link to="/news" className="view-all-link">View All News</Link>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard; 
 
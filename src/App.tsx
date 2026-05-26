import React, { useState, useEffect } from 'react';
import { useQEVantage } from './context/QEVantageContextCore';
import { Dashboard } from './components/Dashboard';
import { FunctionalTab } from './components/FunctionalTab';
import { AutomationTab } from './components/AutomationTab';
import { PerformanceTab } from './components/PerformanceTab';
import { SecurityTab } from './components/SecurityTab';
import { ReleaseTab } from './components/ReleaseTab';
import { LoginPage } from './components/LoginPage';
import { CreateAccountPage } from './components/CreateAccountPage';

const App: React.FC = () => {
  const { activeTab, setActiveTab } = useQEVantage();
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [page, setPage] = useState<'login' | 'register' | 'app'>('login');

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  // Sync theme to <html> so body & pseudo-elements pick it up
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Render subview component based on active tab state
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'functional':
        return <FunctionalTab />;
      case 'automation':
        return <AutomationTab />;
      case 'performance':
        return <PerformanceTab />;
      case 'security':
        return <SecurityTab />;
      case 'release':
        return <ReleaseTab />;
      default:
        return <Dashboard />;
    }
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'QE Command Center';
      case 'functional':
        return 'Pillar 1: Functional Testing';
      case 'automation':
        return 'Pillar 2: Automation Testing';
      case 'performance':
        return 'Pillar 3: Performance Testing';
      case 'security':
        return 'Pillar 4: Security Testing';
      case 'release':
        return 'Pillar 5: Release Management';
      default:
        return 'QE Command Center';
    }
  };

  const TRANSLATIONS = {
    logoIcon: 'Q',
    logoText: 'QEVantage™',
    confidentialText: 'Confidential • 2026',
    dashboard: 'Dashboard',
    functional: 'Functional',
    automation: 'Automation',
    performance: 'Performance',
    security: 'Security',
    release: 'Release',
    tagline: 'One Intelligent Command Center for Quality at Every Layer of Your Stack'
  };

  if (page === 'login') {
    return (
      <div className="app-container" id="qevantage-app">
        <LoginPage
          onLogin={() => setPage('app')}
          onCreateAccount={() => setPage('register')}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      </div>
    );
  }

  if (page === 'register') {
    return (
      <div className="app-container" id="qevantage-app">
        <CreateAccountPage
          onAccountCreated={() => setPage('app')}
          onBackToLogin={() => setPage('login')}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      </div>
    );
  }

  return (
    <div className="app-container" id="qevantage-app">
      
      {/* Top Pinned Horizontal Navigation Header */}
      <header className="header-nav" id="qevantage-header">
        <div className="logo-container">
          <div className="logo-icon">{TRANSLATIONS.logoIcon}</div>
          <div className="logo-text">{TRANSLATIONS.logoText}</div>
          <div className="confidential-badge" style={{ fontSize: '0.7rem', color: 'var(--text-muted)', borderLeft: '1px solid var(--glass-border)', paddingLeft: '12px', marginLeft: '4px' }}>
            <span>{TRANSLATIONS.confidentialText}</span>
          </div>
        </div>

        {/* Theme toggle */}
        <button
          className="theme-toggle-btn"
          onClick={toggleTheme}
          title="Toggle theme"
        >
          {theme === 'dark' ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
              Light
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
              Dark
            </>
          )}
        </button>

        <nav>
          <ul className="nav-links">
            <li>
              <button 
                id="nav-btn-dashboard"
                className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => setActiveTab('dashboard')}
                style={{ border: 'none', background: 'none', font: 'inherit', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>
                {TRANSLATIONS.dashboard}
              </button>
            </li>
            <li>
              <button 
                id="nav-btn-functional"
                className={`nav-item ${activeTab === 'functional' ? 'active' : ''}`}
                onClick={() => setActiveTab('functional')}
                style={{ border: 'none', background: 'none', font: 'inherit', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>
                {TRANSLATIONS.functional}
              </button>
            </li>
            <li>
              <button 
                id="nav-btn-automation"
                className={`nav-item ${activeTab === 'automation' ? 'active' : ''}`}
                onClick={() => setActiveTab('automation')}
                style={{ border: 'none', background: 'none', font: 'inherit', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2" /><rect x="9" y="9" width="6" height="6" /><line x1="9" y1="1" x2="9" y2="4" /><line x1="15" y1="1" x2="15" y2="4" /><line x1="9" y1="20" x2="9" y2="23" /><line x1="15" y1="20" x2="15" y2="23" /><line x1="20" y1="9" x2="23" y2="9" /><line x1="20" y1="15" x2="23" y2="15" /><line x1="1" y1="9" x2="4" y2="9" /><line x1="1" y1="15" x2="4" y2="15" /></svg>
                {TRANSLATIONS.automation}
              </button>
            </li>
            <li>
              <button 
                id="nav-btn-performance"
                className={`nav-item ${activeTab === 'performance' ? 'active' : ''}`}
                onClick={() => setActiveTab('performance')}
                style={{ border: 'none', background: 'none', font: 'inherit', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
                {TRANSLATIONS.performance}
              </button>
            </li>
            <li>
              <button 
                id="nav-btn-security"
                className={`nav-item ${activeTab === 'security' ? 'active' : ''}`}
                onClick={() => setActiveTab('security')}
                style={{ border: 'none', background: 'none', font: 'inherit', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                {TRANSLATIONS.security}
              </button>
            </li>
            <li>
              <button 
                id="nav-btn-release"
                className={`nav-item ${activeTab === 'release' ? 'active' : ''}`}
                onClick={() => setActiveTab('release')}
                style={{ border: 'none', background: 'none', font: 'inherit', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.25-2.5 3.5-2.5 3.5s2.25-1 3.5-2.5M14 2l7.5 7.5-11.5 11.5-3-3L18.5 6.5M9 15l-1.5-.5M15 9l-.5-1.5" /></svg>
                {TRANSLATIONS.release}
              </button>
            </li>
          </ul>
        </nav>
      </header>

      {/* Centered Main Panel Content Viewport */}
      <main style={{ padding: '40px 60px 80px 60px', maxWidth: '1440px', margin: '0 auto', minHeight: 'calc(100vh - 70px)' }}>
        
        {/* Main Header Tagline */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: '800', letterSpacing: '-0.03em', fontFamily: 'var(--font-display)' }}>
              {getPageTitle()}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '4px' }}>
              {TRANSLATIONS.tagline}
            </p>
          </div>
        </header>

        {/* Dynamic subview contents */}
        <div id="qevantage-content-viewport">
          {renderContent()}
        </div>

      </main>

    </div>
  );
};

export default App;

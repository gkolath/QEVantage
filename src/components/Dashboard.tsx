import React from 'react';
import { useQEVantage } from '../context/QEVantageContextCore';

const TRANSLATIONS = {
  engineTitle: 'Retail E-Commerce Engine',
  activeReleaseTarget: 'Active Release Target:',
  scenarioSimulator: 'Interactive Scenario Simulator',
  cleanSprint: 'Clean Sprint',
  highLoadSpike: 'High Load Spike',
  checkoutSqli: 'Checkout SQLi',
  readinessScoreTitle: 'Release Readiness Score™',
  of100: 'OF 100',
  blockedDesc: 'Deployment gates slammed shut due to critical performance anomalies or security warnings.',
  riskDetectedDesc: 'Minor quality issues detected. Caution recommended before proceeding.',
  confidentDeployDesc: 'All multi-discipline quality indicators passed threshold gates. Confident to deploy.',
  evidenceGatesTitle: 'Evidence Gates',
  functionalReqs: 'Functional Requirements',
  coverageThreshold: 'Coverage threshold: 75%',
  cover: 'Cover',
  regressionAutomation: 'Regression Automation',
  passRateThreshold: 'Pass rate threshold: 95%',
  pass: 'Pass',
  performanceCapacity: 'Performance Capacity',
  checkoutSlaLimit: 'Checkout SLA limit:',
  avg: 'avg',
  threatAudit: 'Threat & Compliance Audit',
  zeroCriticalVulnerabilities: 'Zero Critical vulnerabilities allowed',
  openCritical: 'Open Critical',
  commandConsoleTitle: 'Release Command Console',
  commandConsoleDesc: 'Deploy confidently utilizing integrated compliance & verification credentials.',
  downloadNotes: 'Download Notes',
  deployProduction: 'Deploy to Production',
  deploying: 'Deploying...',
  consoleIdle: 'Console idle. Awaiting action signal...',
  qualityControlTitle: 'Quality Control Modules',
  pillar1: 'Pillar 1',
  functionalTestingCard: 'Functional Testing',
  functionalTestingDesc: 'Generate test scenarios directly from stories.',
  coverage: 'Coverage',
  pillar2: 'Pillar 2',
  automationEngineCard: 'Automation Engine',
  automationEngineDesc: 'Automated healing & selector repair logs.',
  passRate: 'Pass Rate',
  pillar3: 'Pillar 3',
  performanceProfilingCard: 'Performance Profiling',
  performanceProfilingDesc: 'Continuous dynamic baselines on every commit.',
  responseTime: 'Response Time',
  pillar4: 'Pillar 4',
  securityAuditCard: 'Security & Audit',
  securityAuditDesc: 'Business-impact mapped shift-left scanners.',
  vulnerabilities: 'Vulnerabilities',
  open: 'Open'
};

export const Dashboard: React.FC = () => {
  const {
    setActiveTab,
    stories,
    testSuites,
    perfHistory,
    latencySla,
    securityFindings,
    releaseReadinessScore,
    readyToShipStatus,
    activeScenario,
    triggerScenario,
    isReleaseTriggered,
    releaseLogs,
    triggerRelease,
    generateReleaseNotes
  } = useQEVantage();

  // Metrics calculators
  const avgCoverage = Math.round(stories.reduce((acc, s) => acc + s.coverage, 0) / stories.length);
  
  const totalTests = testSuites.reduce((acc, s) => acc + s.total, 0);
  const totalPassed = testSuites.reduce((acc, s) => acc + s.passed, 0);
  const automationPassRate = totalTests ? Math.round((totalPassed / totalTests) * 100) : 100;

  const latestPerf = perfHistory.slice(-1)[0];
  const isPerfOk = latestPerf.responseTime <= latencySla;

  const criticalSecCount = securityFindings.filter(f => f.status === 'Open' && f.businessImpact === 'Critical').length;
  const totalOpenSec = securityFindings.filter(f => f.status === 'Open').length;

  // Gauge configurations
  const radius = 90;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (releaseReadinessScore / 100) * circumference;

  // Determine status color accents
  const getStatusColor = () => {
    if (readyToShipStatus === 'Blocked') return 'var(--status-danger)';
    if (readyToShipStatus === 'Risk Detected') return 'var(--status-warning)';
    return 'var(--status-success)';
  };

  const getStatusClass = () => {
    if (readyToShipStatus === 'Blocked') return 'badge-danger';
    if (readyToShipStatus === 'Risk Detected') return 'badge-warning';
    return 'badge-success';
  };

  // Download release notes helper
  const handleDownloadNotes = () => {
    const markdown = generateReleaseNotes();
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `QEVantage_ReleaseNotes_${latestPerf.build}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Top Banner & Scenario Switcher */}
      <section className="glass-card" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '20px', padding: '24px 32px' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', color: 'var(--text-primary)', marginBottom: '6px' }}>{TRANSLATIONS.engineTitle}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{TRANSLATIONS.activeReleaseTarget} <code style={{ color: 'var(--accent-blue)', background: 'rgba(59, 130, 246, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>{latestPerf.build}</code></p>
        </div>

        {/* E-Commerce Scenario Selector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--label-color)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{TRANSLATIONS.scenarioSimulator}</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              className={`btn ${activeScenario === 'clean' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '8px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              onClick={() => triggerScenario('clean')}
            >
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--status-success)', display: 'inline-block' }}></span>
              {TRANSLATIONS.cleanSprint}
            </button>
            <button 
              className={`btn ${activeScenario === 'performance' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '8px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              onClick={() => triggerScenario('performance')}
            >
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--status-warning)', display: 'inline-block' }}></span>
              {TRANSLATIONS.highLoadSpike}
            </button>
            <button 
              className={`btn ${activeScenario === 'security' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '8px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              onClick={() => triggerScenario('security')}
            >
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--status-danger)', display: 'inline-block' }}></span>
              {TRANSLATIONS.checkoutSqli}
            </button>
          </div>
        </div>
      </section>

      {/* Main Scoring Core Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '32px' }}>
        
        {/* Score Center Panel */}
        <section className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>{TRANSLATIONS.readinessScoreTitle}</h3>
          
          {/* Animated SVG circular gauge */}
          <div style={{ position: 'relative', width: '220px', height: '220px', marginBottom: '24px' }}>
            <svg width="220" height="220" viewBox="0 0 220 220" style={{ transform: 'rotate(-90deg)' }}>
              {/* Background Ring */}
              <circle
                cx="110"
                cy="110"
                r={radius}
                fill="none"
                stroke="rgba(255,255,255,0.03)"
                strokeWidth={strokeWidth}
              />
              {/* Dynamic Value Ring */}
              <circle
                cx="110"
                cy="110"
                r={radius}
                fill="none"
                stroke={getStatusColor()}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}
              />
            </svg>

            {/* Score label inside */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '3rem', fontWeight: '800', fontFamily: 'var(--font-display)', color: 'var(--text-primary)', lineHeight: '1' }}>{releaseReadinessScore}</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600', marginTop: '4px' }}>{TRANSLATIONS.of100}</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
            <span className={`badge ${getStatusClass()}`} style={{ fontSize: '0.9rem', padding: '6px 16px' }}>
              {readyToShipStatus}
            </span>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '280px', marginTop: '4px' }}>
              {readyToShipStatus === 'Blocked' 
                ? TRANSLATIONS.blockedDesc 
                : readyToShipStatus === 'Risk Detected' 
                ? TRANSLATIONS.riskDetectedDesc 
                : TRANSLATIONS.confidentDeployDesc}
            </p>
          </div>
        </section>

        {/* Quality Release Gate Checklist */}
        <section className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>{TRANSLATIONS.evidenceGatesTitle}</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            
            {/* Gate 1: Functional */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ display: 'flex', alignItems: 'center' }}>
                  {avgCoverage >= 75 ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--status-success)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--status-warning)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                  )}
                </span>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: '600' }}>{TRANSLATIONS.functionalReqs}</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{TRANSLATIONS.coverageThreshold}</p>
                </div>
              </div>
              <span style={{ fontWeight: '700', fontSize: '0.95rem', color: avgCoverage >= 75 ? 'var(--status-success)' : 'var(--status-warning)' }}>
                {avgCoverage}% {TRANSLATIONS.cover}
              </span>
            </div>

            {/* Gate 2: Automation */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ display: 'flex', alignItems: 'center' }}>
                  {automationPassRate >= 95 ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--status-success)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--status-danger)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
                  )}
                </span>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: '600' }}>{TRANSLATIONS.regressionAutomation}</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{TRANSLATIONS.passRateThreshold}</p>
                </div>
              </div>
              <span style={{ fontWeight: '700', fontSize: '0.95rem', color: automationPassRate >= 95 ? 'var(--status-success)' : 'var(--status-danger)' }}>
                {automationPassRate}% {TRANSLATIONS.pass}
              </span>
            </div>

            {/* Gate 3: Performance */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ display: 'flex', alignItems: 'center' }}>
                  {isPerfOk ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--status-success)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--status-danger)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
                  )}
                </span>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: '600' }}>{TRANSLATIONS.performanceCapacity}</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{TRANSLATIONS.checkoutSlaLimit} {latencySla}ms</p>
                </div>
              </div>
              <span style={{ fontWeight: '700', fontSize: '0.95rem', color: isPerfOk ? 'var(--status-success)' : 'var(--status-danger)' }}>
                {latestPerf.responseTime}ms {TRANSLATIONS.avg}
              </span>
            </div>

            {/* Gate 4: Security */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ display: 'flex', alignItems: 'center' }}>
                  {criticalSecCount === 0 ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--status-success)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--status-danger)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
                  )}
                </span>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: '600' }}>{TRANSLATIONS.threatAudit}</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{TRANSLATIONS.zeroCriticalVulnerabilities}</p>
                </div>
              </div>
              <span style={{ fontWeight: '700', fontSize: '0.95rem', color: criticalSecCount === 0 ? 'var(--status-success)' : 'var(--status-danger)' }}>
                {criticalSecCount} {TRANSLATIONS.openCritical}
              </span>
            </div>

          </div>
        </section>
      </div>

      {/* Action Console log terminal */}
      <section className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>{TRANSLATIONS.commandConsoleTitle}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{TRANSLATIONS.commandConsoleDesc}</p>
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              className="btn btn-secondary" 
              onClick={handleDownloadNotes}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
              {TRANSLATIONS.downloadNotes}
            </button>
            <button 
              className="btn btn-primary" 
              onClick={triggerRelease} 
              disabled={readyToShipStatus === 'Blocked' || isReleaseTriggered}
              style={{ 
                opacity: readyToShipStatus === 'Blocked' ? 0.4 : 1, 
                cursor: readyToShipStatus === 'Blocked' ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.25-2.5 3.5-2.5 3.5s2.25-1 3.5-2.5M14 2l7.5 7.5-11.5 11.5-3-3L18.5 6.5M9 15l-1.5-.5M15 9l-.5-1.5" /></svg>
              {isReleaseTriggered ? TRANSLATIONS.deploying : TRANSLATIONS.deployProduction}
            </button>
          </div>
        </div>

        {/* Simulated logs panel */}
        <div style={{ 
          background: 'rgba(10, 12, 16, 0.65)', 
          border: '1px solid var(--glass-border)', 
          borderRadius: '8px', 
          padding: '16px', 
          fontFamily: 'monospace', 
          fontSize: '0.85rem', 
          color: '#38bdf8', 
          minHeight: '120px',
          maxHeight: '180px',
          overflowY: 'auto'
        }}>
          {releaseLogs.length === 0 ? (
            <span style={{ color: 'var(--text-muted)' }}>{TRANSLATIONS.consoleIdle}</span>
          ) : (
            releaseLogs.map((log, index) => (
              <div 
                key={index} 
                style={{ 
                  marginBottom: '6px', 
                  color: log.includes('CRITICAL') ? 'var(--status-danger)' : log.includes('successfully') ? 'var(--status-success)' : '#38bdf8' 
                }}
              >
                &gt; {log}
              </div>
            ))
          )}
        </div>
      </section>

      {/* Navigation Quick Link Cards Grid */}
      <div>
        <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '16px' }}>{TRANSLATIONS.qualityControlTitle}</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
          
          {/* Card 1: Functional */}
          <div 
            className="glass-card" 
            style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '12px' }}
            onClick={() => setActiveTab('functional')}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>
              </span>
              <span className="badge badge-info">{TRANSLATIONS.pillar1}</span>
            </div>
            <div>
              <h4 style={{ fontSize: '1.05rem', marginBottom: '4px' }}>{TRANSLATIONS.functionalTestingCard}</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{TRANSLATIONS.functionalTestingDesc}</p>
            </div>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '10px', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>{TRANSLATIONS.coverage}</span>
              <span style={{ color: 'var(--accent-blue)', fontWeight: '700' }}>{avgCoverage}%</span>
            </div>
          </div>

          {/* Card 2: Automation */}
          <div 
            className="glass-card" 
            style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '12px' }}
            onClick={() => setActiveTab('automation')}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--status-success)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2" /><rect x="9" y="9" width="6" height="6" /><line x1="9" y1="1" x2="9" y2="4" /><line x1="15" y1="1" x2="15" y2="4" /><line x1="9" y1="20" x2="9" y2="23" /><line x1="15" y1="20" x2="15" y2="23" /><line x1="20" y1="9" x2="23" y2="9" /><line x1="20" y1="15" x2="23" y2="15" /><line x1="1" y1="9" x2="4" y2="9" /><line x1="1" y1="15" x2="4" y2="15" /></svg>
              </span>
              <span className="badge badge-info">{TRANSLATIONS.pillar2}</span>
            </div>
            <div>
              <h4 style={{ fontSize: '1.05rem', marginBottom: '4px' }}>{TRANSLATIONS.automationEngineCard}</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{TRANSLATIONS.automationEngineDesc}</p>
            </div>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '10px', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>{TRANSLATIONS.passRate}</span>
              <span style={{ color: 'var(--status-success)', fontWeight: '700' }}>{automationPassRate}%</span>
            </div>
          </div>

          {/* Card 3: Performance */}
          <div 
            className="glass-card" 
            style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '12px' }}
            onClick={() => setActiveTab('performance')}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--status-warning)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
              </span>
              <span className="badge badge-info">{TRANSLATIONS.pillar3}</span>
            </div>
            <div>
              <h4 style={{ fontSize: '1.05rem', marginBottom: '4px' }}>{TRANSLATIONS.performanceProfilingCard}</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{TRANSLATIONS.performanceProfilingDesc}</p>
            </div>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '10px', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>{TRANSLATIONS.responseTime}</span>
              <span style={{ color: isPerfOk ? 'var(--status-success)' : 'var(--status-danger)', fontWeight: '700' }}>{latestPerf.responseTime}ms</span>
            </div>
          </div>

          {/* Card 4: Security */}
          <div 
            className="glass-card" 
            style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '12px' }}
            onClick={() => setActiveTab('security')}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--status-danger)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
              </span>
              <span className="badge badge-info">{TRANSLATIONS.pillar4}</span>
            </div>
            <div>
              <h4 style={{ fontSize: '1.05rem', marginBottom: '4px' }}>{TRANSLATIONS.securityAuditCard}</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{TRANSLATIONS.securityAuditDesc}</p>
            </div>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '10px', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>{TRANSLATIONS.vulnerabilities}</span>
              <span style={{ color: totalOpenSec === 0 ? 'var(--status-success)' : 'var(--status-danger)', fontWeight: '700' }}>{totalOpenSec} {TRANSLATIONS.open}</span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

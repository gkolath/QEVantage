import React, { useState } from 'react';
import { useQEVantage } from '../context/QEVantageContextCore';

export const AutomationTab: React.FC = () => {
  const {
    testSuites,
    isHealingEnabled,
    setIsHealingEnabled,
    healingEvents,
    triggerSelfHealingSimulation,
    runAutomationSuites,
    quarantineFlakyTest,
    isSimulating
  } = useQEVantage();

  const [selectedSuite, setSelectedSuite] = useState<typeof testSuites[0] | null>(null);

  // Helper: pass-rate color (mirrors getCoverageColor in FunctionalTab)
  const getPassRateColor = (suite: typeof testSuites[0]) => {
    const rate = suite.total > 0 ? Math.round((suite.passed / suite.total) * 100) : 0;
    if (rate >= 90) return 'rgba(16, 185, 129, 0.8)';  // Green
    if (rate >= 75) return 'rgba(59, 130, 246, 0.8)';  // Blue
    if (rate >= 50) return 'rgba(245, 158, 11, 0.8)';  // Amber
    return 'rgba(239, 68, 68, 0.8)';                   // Red
  };

  const getPassRate = (suite: typeof testSuites[0]) =>
    suite.total > 0 ? Math.round((suite.passed / suite.total) * 100) : 0;

  // Framework icons
  const getFrameworkLogo = (fw: string) => {
    const style = { width: '20px', height: '20px', stroke: 'currentColor', strokeWidth: 1.5, fill: 'none', color: 'var(--accent-blue)' };
    switch (fw) {
      case 'Playwright':
        return (
          <svg style={style} viewBox="0 0 24 24">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
            <line x1="8" y1="21" x2="16" y2="21" />
            <line x1="12" y1="17" x2="12" y2="21" />
          </svg>
        );
      case 'Selenium':
        return (
          <svg style={{ ...style, color: 'var(--status-success)' }} viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
        );
      case 'Cypress':
        return (
          <svg style={{ ...style, color: 'var(--accent-purple)' }} viewBox="0 0 24 24">
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
          </svg>
        );
      case 'Appium':
        return (
          <svg style={{ ...style, color: 'var(--accent-cyan)' }} viewBox="0 0 24 24">
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
            <line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="3" strokeLinecap="round" />
          </svg>
        );
      default:
        return (
          <svg style={style} viewBox="0 0 24 24">
            <path d="M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zM5 10a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-8z" />
          </svg>
        );
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

      {/* ── Top Row: Suite Health Matrix (full-width, mirrors Live Coverage Heatmap) ── */}
      <section className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '8px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '4px' }}>Suite Health Matrix</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '24px' }}>Click any suite block to inspect execution details and pass-rate depth.</p>
          </div>
          <button
            className="btn btn-primary"
            onClick={runAutomationSuites}
            disabled={isSimulating}
            style={{ fontSize: '0.85rem', padding: '8px 16px' }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: isSimulating ? 'spin 1.5s linear infinite' : 'none' }}>
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
              </svg>
              {isSimulating ? 'Executing...' : 'Run All Suites'}
            </span>
          </button>
        </div>

        {/* Suite grid — equal fixed columns so labels are always fully visible */}
        <div className="heatmap-grid" style={{ display: 'grid', gridTemplateColumns: `repeat(${testSuites.length}, 1fr)`, gap: '12px', marginBottom: '24px' }}>
          {testSuites.map((suite) => (
            <div
              key={suite.id}
              className="heatmap-cell premium-segment"
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: selectedSuite?.id === suite.id ? '1px solid var(--accent-blue)' : '1px solid rgba(255, 255, 255, 0.05)',
                borderLeft: `4px solid ${getPassRateColor(suite)}`,
                padding: '14px 16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '108px',
                borderRadius: '12px',
                cursor: 'pointer',
                boxShadow: selectedSuite?.id === suite.id ? '0 0 15px rgba(59, 130, 246, 0.25)' : 'none'
              }}
              onClick={() => setSelectedSuite(suite)}
            >
              {/* Top row: framework icon + suite name */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: '100%' }}>
                <span style={{ flexShrink: 0 }}>{getFrameworkLogo(suite.framework)}</span>
                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-primary)', lineHeight: '1.3', wordBreak: 'break-word', textAlign: 'center' }} title={suite.name}>
                  {suite.name}
                </span>
              </div>
              {/* Centre: pass rate % */}
              <span style={{ fontSize: '1.3rem', fontWeight: '800', textAlign: 'center', color: 'var(--text-primary)', display: 'block', marginTop: '8px' }}>
                {getPassRate(suite)}%
              </span>
            </div>
          ))}
        </div>

        {/* Selected suite detail panel — mirrors node detail panel */}
        {selectedSuite ? (
          <div className="premium-segment" style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '6px' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: '600', margin: 0 }}>
                Suite: <span style={{ color: 'var(--accent-blue)' }}>{selectedSuite.name}</span>
              </h4>
              <span className={`badge ${
                selectedSuite.status === 'Running' ? 'badge-info' :
                selectedSuite.status === 'Failed'  ? 'badge-danger' : 'badge-success'
              }`}>{selectedSuite.status}</span>
            </div>

            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              Framework: <span className="badge badge-warning">{selectedSuite.framework}</span>
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', fontSize: '0.85rem' }}>
              <span>Total: <strong>{selectedSuite.total}</strong></span>
              <span style={{ color: 'var(--status-success)' }}>Passed: <strong>{selectedSuite.passed}</strong></span>
              {selectedSuite.failed > 0 && <span style={{ color: 'var(--status-danger)' }}>Failed: <strong>{selectedSuite.failed}</strong></span>}
              {selectedSuite.flaky  > 0 && <span style={{ color: 'var(--status-warning)' }}>Flaky: <strong>{selectedSuite.flaky}</strong></span>}
              <span style={{ color: 'var(--text-muted)' }}>Pass Rate: <strong style={{ color: 'var(--text-primary)' }}>{getPassRate(selectedSuite)}%</strong></span>
            </div>

            {selectedSuite.flaky > 0 && (
              <button
                className="btn btn-secondary"
                onClick={() => quarantineFlakyTest(selectedSuite.id)}
                style={{ padding: '5px 12px', fontSize: '0.78rem', borderRadius: '6px', marginTop: '12px' }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  Quarantine Flaky Tests
                </span>
              </button>
            )}
          </div>
        ) : (
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '12px 0' }}>
            Select a suite block to inspect execution depth and health metrics.
          </p>
        )}
      </section>

      {/* ── Bottom Row: 2-Column Grid (mirrors functional-grid) ── */}
      <div className="functional-grid">

        {/* Left Column: AI Self-Healing Engine (mirrors AI Requirement Ingestion) */}
        <section className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '4px' }}>AI Self-Healing Engine</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Detects locator drifts and performs automated selector patch resolution.</p>
          </div>

          {/* Toggle row */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: '800', color: 'var(--label-color)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Engine Status</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                className={`toggle-container ${isHealingEnabled ? 'active' : ''}`}
                onClick={() => setIsHealingEnabled(!isHealingEnabled)}
                style={{ cursor: 'pointer' }}
              >
                <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
                  {isHealingEnabled ? 'Active' : 'Offline'}
                </span>
                <div className="toggle-switch"></div>
              </div>
            </div>
          </div>

          {/* Selector drift scan trigger */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: '800', color: 'var(--label-color)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Drift Scan</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              <button
                className={`segment-selector-btn ${isSimulating ? 'active-blue' : ''}`}
                onClick={triggerSelfHealingSimulation}
                disabled={isSimulating}
                type="button"
              >
                {isSimulating ? 'Scanning...' : 'Trigger Scan'}
              </button>
            </div>
          </div>

          {/* Healing stats summary */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: '800', color: 'var(--label-color)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Healing Summary</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {[
                { label: 'Total Healed', value: healingEvents.length, color: 'var(--status-success)' },
                { label: 'Avg Confidence', value: healingEvents.length > 0 ? `${Math.round(healingEvents.reduce((a, e) => a + e.confidence, 0) / healingEvents.length)}%` : '—', color: 'var(--accent-blue)' },
                { label: 'Frameworks', value: [...new Set(healingEvents.map(e => e.framework))].length || '—', color: 'var(--accent-purple)' },
                { label: 'Engine', value: isHealingEnabled ? 'ON' : 'OFF', color: isHealingEnabled ? 'var(--status-success)' : 'var(--status-danger)' },
              ].map((stat) => (
                <div key={stat.label} className="premium-segment" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', padding: '12px 14px' }}>
                  <p style={{ fontSize: '0.72rem', color: 'var(--label-color)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px 0' }}>{stat.label}</p>
                  <p style={{ fontSize: '1.1rem', fontWeight: '800', color: stat.color, margin: 0 }}>{stat.value}</p>
                </div>
              ))}
            </div>
          </div>

          <button
            className="btn btn-primary"
            onClick={triggerSelfHealingSimulation}
            disabled={isSimulating}
            style={{ alignSelf: 'flex-start', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
            </svg>
            {isSimulating ? 'Running Scan...' : 'Run Selector Drift Scan'}
          </button>
        </section>

        {/* Right Column: Healing Events Log (mirrors Requirement Traceability Matrix) */}
        <section className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '24px', height: '100%' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '4px' }}>Self-Healing Repair Log</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Live audit trail of AI-resolved locator drifts across all active automation frameworks.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', overflowY: 'auto', maxHeight: '460px', paddingRight: '8px' }}>
            {healingEvents.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '32px 0' }}>No active script anomalies logged. Trigger a drift scan to populate this log.</p>
            ) : (
              healingEvents.map((event) => (
                <div key={event.id} className="premium-segment" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '24px 28px', border: '1px solid rgba(255, 255, 255, 0.05)', position: 'relative' }}>

                  {/* Header row — mirrors story title + badge */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                    <h4 style={{ fontSize: '1.0rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0, lineHeight: '1.4', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'monospace' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                      </svg>
                      {event.script}
                    </h4>
                    <span className="badge badge-success" style={{ whiteSpace: 'nowrap' }}>
                      Confidence: {event.confidence}%
                    </span>
                  </div>

                  {/* Meta row — mirrors module + traceability row */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
                      </svg>
                      Framework: <strong style={{ color: 'var(--text-primary)' }}>{event.framework}</strong>
                    </span>
                    <span style={{ color: 'rgba(255,255,255,0.15)' }}>|</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--status-success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                      Status: <strong style={{ color: 'var(--status-success)' }}>Auto-Healed</strong>
                    </span>
                    <span style={{ color: 'rgba(255,255,255,0.15)' }}>|</span>
                    <span>{event.timestamp}</span>
                  </div>

                  {/* Selector diff block — mirrors auto-generated assertions block */}
                  <div style={{ background: 'rgba(0, 0, 0, 0.15)', padding: '16px 20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)', marginTop: '4px' }}>
                    <h5 style={{ fontSize: '0.78rem', color: 'var(--label-color)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" /><path d="m9 12 2 2 4-4" />
                      </svg>
                      Selector Patch Applied
                    </h5>
                    <ul style={{ listStyleType: 'none', paddingLeft: 0, display: 'flex', flexDirection: 'column', gap: '8px', margin: 0 }}>
                      <li style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'flex-start', gap: '10px', lineHeight: '1.5', fontFamily: 'monospace' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', minWidth: '16px', marginTop: '3px' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--status-danger)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
                          </svg>
                        </span>
                        <span style={{ color: 'var(--status-danger)' }}>broken: <code>{event.brokenSelector}</code></span>
                      </li>
                      <li style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'flex-start', gap: '10px', lineHeight: '1.5', fontFamily: 'monospace' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', minWidth: '16px', marginTop: '3px' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--status-success)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </span>
                        <span style={{ color: 'var(--status-success)' }}>healed: <code>{event.healedSelector}</code></span>
                      </li>
                    </ul>
                  </div>

                </div>
              ))
            )}
          </div>
        </section>

      </div>
    </div>
  );
};

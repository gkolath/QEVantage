import React, { useState } from 'react';
import { useQEVantage } from '../context/QEVantageContextCore';
import type { ArchivedRelease, RRSVertical } from '../context/QEVantageContextCore';

// Historical deployments (from data/deployments.json)
const HISTORICAL_DEPLOYMENTS = [
  { label: 'v2.0.0', date: '2025-10-01', score: 56, verdict: 'NO-GO',           incident: true  },
  { label: 'v2.0.1', date: '2025-10-08', score: 74, verdict: 'CONDITIONAL GO',  incident: false },
  { label: 'v2.1.0', date: '2025-11-12', score: 85, verdict: 'GO',              incident: false },
  { label: 'v2.2.0', date: '2025-12-05', score: 42, verdict: 'NO-GO',           incident: true  },
  { label: 'v2.3.0', date: '2026-01-20', score: 93, verdict: 'GO',              incident: false },
  { label: 'v2.4.0', date: '2026-03-10', score: 82, verdict: 'GO',              incident: false },
  { label: 'v2.5.0', date: '2026-04-22', score: 61, verdict: 'CONDITIONAL GO',  incident: true  },
  { label: 'v2.6.0', date: '2026-05-27', score: 88, verdict: 'GO',              incident: false },
] as const;

const VERTICAL_LABELS: Record<RRSVertical, string> = {
  default:    'Default (Equal)',
  fintech:    'Fintech (Security+)',
  retail:     'Retail (Performance+)',
  healthcare: 'Healthcare (Security+Functional)',
};

const TRANSLATIONS = {
  stepperTitle: 'Rollout Pipeline Stepper',
  stepperDesc: 'Visual deployment gate tracking approvals (Score threshold:',
  startRollout: 'Start Release Rollout',
  deploying: 'Deploying...',
  terminalIdle: "Rollout terminal idle. Click 'Start Release Rollout' to deploy.",
  codePush: 'Code Push',
  qaAudit: 'QA Audit',
  security: 'Security',
  uatGates: 'UAT Gates',
  rollout: 'Rollout',
  integrationConsoleTitle: 'Stakeholder Integration Console',
  integrationConsoleDesc: 'Dispatch release notifications automatically across communication pipelines.',
  slackTitle: 'Slack Notifications',
  slackDesc: 'Send evidence summaries to `#release-pipeline`.',
  teamsTitle: 'Microsoft Teams',
  teamsDesc: 'Ping deployment coordinates to corporate ops channels.',
  pagerdutyTitle: 'PagerDuty Escalations',
  pagerdutyDesc: 'Alert on-call engineers if deployment is blocked by SLA breach.',
  emailTitle: 'Email Summarizer',
  emailDesc: 'Email markdown release notes to compliance managers.',
  auditVaultsTitle: 'Evidence Audit Vaults',
  auditVaultsDesc: 'Historical repository of deploy credentials and compliance audits. Click any entry to inspect the full evidence package.',
  noDeployments: 'No previous deployments logged.',
  readinessScore: 'Readiness Score',
  slaLatency: 'SLA Latency',
  regressionPassRate: 'Regression Pass Rate',
  functionalCover: 'Functional Cover',
  evidencePackageTitle: 'Compiled Evidence Package',
  export: 'Export',
  delete: 'Delete',
};

export const ReleaseTab: React.FC = () => {
  const {
    pipelineStage,
    pipelineStatus,
    integrationSettings,
    setIntegrationSettings,
    archivedReleases,
    deleteArchivedRelease,
    releaseReadinessScore,
    readyToShipStatus,
    rrsDimensions,
    rrsVertical,
    setRrsVertical,
    releaseLogs,
    triggerRelease,
    isReleaseTriggered
  } = useQEVantage();

  const [selectedArchive, setSelectedArchive] = useState<ArchivedRelease | null>(null);

  const getProgressWidth = () => {
    if (pipelineStatus === 'idle') return '0%';
    switch (pipelineStage) {
      case 'code_push':          return '10%';
      case 'automated_qa':       return '35%';
      case 'security_gate':      return '60%';
      case 'uat_approval':       return '85%';
      case 'production_rollout': return '100%';
      default:                   return '0%';
    }
  };

  const isStepActive    = (step: string) => pipelineStatus !== 'idle' && pipelineStage === step;
  const isStepCompleted = (step: string) => {
    if (pipelineStatus === 'idle') return false;
    if (pipelineStatus === 'completed') return true;
    const stages = ['code_push', 'automated_qa', 'security_gate', 'uat_approval', 'production_rollout'];
    return stages.indexOf(step) < stages.indexOf(pipelineStage);
  };

  const handleToggleIntegration = (key: keyof typeof integrationSettings) => {
    setIntegrationSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleDownloadArchive = (release: ArchivedRelease) => {
    const blob = new Blob([release.notes], { type: 'text/markdown' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `QEVantage_AuditEvidence_${release.build}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const integrations = [
    {
      key:   'slack' as const,
      title: TRANSLATIONS.slackTitle,
      desc:  TRANSLATIONS.slackDesc,
      icon:  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
    },
    {
      key:   'teams' as const,
      title: TRANSLATIONS.teamsTitle,
      desc:  TRANSLATIONS.teamsDesc,
      icon:  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--status-success)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
    },
    {
      key:   'pagerduty' as const,
      title: TRANSLATIONS.pagerdutyTitle,
      desc:  TRANSLATIONS.pagerdutyDesc,
      icon:  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--status-danger)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" /></svg>
    },
    {
      key:   'email' as const,
      title: TRANSLATIONS.emailTitle,
      desc:  TRANSLATIONS.emailDesc,
      icon:  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-cyan)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
    },
  ];

  const verdictColor = (v: string) =>
    v === 'GO' ? 'var(--status-success)' : v === 'CONDITIONAL GO' ? 'var(--status-warning)' : 'var(--status-danger)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

      {/* ── RRS™ Score Breakdown ── */}
      <section className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
              Release Readiness Score™ Breakdown
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Five-dimension composite score · Verdict bands: GO ≥80 · CONDITIONAL GO 60–79 · NO-GO &lt;60
            </p>
          </div>
          {/* Vertical selector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
            <label style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Weight Profile
            </label>
            <select
              value={rrsVertical}
              onChange={e => setRrsVertical(e.target.value as RRSVertical)}
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid var(--glass-border)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                fontSize: '0.82rem',
                fontWeight: '600',
                padding: '6px 10px',
                cursor: 'pointer',
                outline: 'none',
                fontFamily: 'inherit',
              }}
            >
              {(Object.keys(VERTICAL_LABELS) as RRSVertical[]).map(v => (
                <option key={v} value={v}>{VERTICAL_LABELS[v]}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Composite score hero */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '16px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
          <div style={{ fontSize: '3rem', fontWeight: '800', fontFamily: 'var(--font-display)', color: verdictColor(readyToShipStatus), lineHeight: 1 }}>
            {releaseReadinessScore}
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Out of 100</div>
            <div style={{ fontSize: '1rem', fontWeight: '700', color: verdictColor(readyToShipStatus), marginTop: '2px' }}>
              {readyToShipStatus === 'GO' ? '✅' : readyToShipStatus === 'CONDITIONAL GO' ? '⚠️' : '❌'} {readyToShipStatus}
            </div>
          </div>
        </div>

        {/* Dimension rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {rrsDimensions.map(dim => {
            const color = dim.score >= 80 ? 'var(--status-success)' : dim.score >= 60 ? 'var(--status-warning)' : 'var(--status-danger)';
            return (
              <div key={dim.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '5px' }}>
                  <div>
                    <span style={{ fontSize: '0.88rem', fontWeight: '600', color: 'var(--text-primary)' }}>{dim.name}</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: '8px' }}>{Math.round(dim.weight * 100)}% weight</span>
                  </div>
                  <span style={{ fontSize: '0.95rem', fontWeight: '700', color }}>{dim.score}/100</span>
                </div>
                {/* Bar */}
                <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${dim.score}%`, background: color, borderRadius: '3px', transition: 'width 0.6s ease' }} />
                </div>
                {/* Explanation + flag */}
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '3px' }}>{dim.explanation}</p>
                {dim.flag && (
                  <p style={{ fontSize: '0.72rem', color: 'var(--status-warning)', marginTop: '2px' }}>⚠ {dim.flag}</p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Historical Deployments Chart ── */}
      <section className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '4px' }}>Historical RRS™ Scores</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Past 8 deployments — incidents marked in red</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '100px', paddingBottom: '4px' }}>
          {HISTORICAL_DEPLOYMENTS.map(d => {
            const barColor = d.verdict === 'GO' ? 'var(--status-success)' : d.verdict === 'CONDITIONAL GO' ? 'var(--status-warning)' : 'var(--status-danger)';
            return (
              <div key={d.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: '700' }}>{d.score}</span>
                <div style={{ width: '100%', height: `${d.score}px`, background: barColor, borderRadius: '4px 4px 0 0', opacity: 0.8, position: 'relative', transition: 'height 0.4s ease' }}>
                  {d.incident && (
                    <span style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', fontSize: '10px' }}>🔴</span>
                  )}
                </div>
                <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.2 }}>{d.label}</span>
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: '16px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><span style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'var(--status-success)', display: 'inline-block' }}/>GO ≥80</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><span style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'var(--status-warning)', display: 'inline-block' }}/>CONDITIONAL GO 60–79</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><span style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'var(--status-danger)', display: 'inline-block' }}/>NO-GO &lt;60 · 🔴 Incident</span>
        </div>
      </section>

      {/* ── Tier 1: Rollout Pipeline Stepper (full-width) ── */}
      <section className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '8px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '4px' }}>{TRANSLATIONS.stepperTitle}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '24px' }}>
              {TRANSLATIONS.stepperDesc} {releaseReadinessScore}/100). Trigger the rollout to track live deployment gate approvals.
            </p>
          </div>
          <button
            className="btn btn-primary"
            onClick={triggerRelease}
            disabled={isReleaseTriggered || readyToShipStatus === 'NO-GO'}
            style={{
              opacity: readyToShipStatus === 'NO-GO' ? 0.4 : 1,
              cursor:  readyToShipStatus === 'NO-GO' ? 'not-allowed' : 'pointer',
              fontSize: '0.85rem', padding: '8px 16px',
              display: 'flex', alignItems: 'center', gap: '6px'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4.5 16.5c-1.5 1.25-2.5 3.5-2.5 3.5s2.25-1 3.5-2.5M14 2l7.5 7.5-11.5 11.5-3-3L18.5 6.5M9 15l-1.5-.5M15 9l-.5-1.5" />
            </svg>
            {isReleaseTriggered ? TRANSLATIONS.deploying : TRANSLATIONS.startRollout}
          </button>
        </div>

        {/* Pipeline steps */}
        <div className="pipeline-stepper" style={{ marginBottom: '24px' }}>
          <div className="pipeline-progress-bar" style={{ width: getProgressWidth() }}></div>
          {[
            { key: 'code_push',          label: TRANSLATIONS.codePush, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg> },
            { key: 'automated_qa',       label: TRANSLATIONS.qaAudit,  icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg> },
            { key: 'security_gate',      label: TRANSLATIONS.security, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg> },
            { key: 'uat_approval',       label: TRANSLATIONS.uatGates, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg> },
            { key: 'production_rollout', label: TRANSLATIONS.rollout,  icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.25-2.5 3.5-2.5 3.5s2.25-1 3.5-2.5M14 2l7.5 7.5-11.5 11.5-3-3L18.5 6.5M9 15l-1.5-.5M15 9l-.5-1.5" /></svg> },
          ].map(({ key, label, icon }) => (
            <div key={key} className={`pipeline-step ${isStepCompleted(key) ? 'completed' : ''} ${isStepActive(key) ? 'active' : ''}`}>
              {icon}
              <span className="pipeline-step-label">{label}</span>
            </div>
          ))}
        </div>

        {/* Terminal log */}
        <div className="terminal-container" style={{
          border: '1px solid var(--glass-border)',
          borderRadius: '10px', padding: '16px', fontFamily: 'monospace', fontSize: '0.8rem',
          minHeight: '120px', maxHeight: '180px', overflowY: 'auto'
        }}>
          {releaseLogs.length === 0 ? (
            <span style={{ color: 'var(--text-muted)' }}>{TRANSLATIONS.terminalIdle}</span>
          ) : (
            releaseLogs.map((log, idx) => (
              <div key={idx} style={{
                marginBottom: '6px',
                color: log.includes('CRITICAL') || log.includes('[CRITICAL]')
                  ? 'var(--status-danger)'
                  : log.includes('[SYSTEM]') ? 'var(--terminal-system)' : 'var(--terminal-success)'
              }}>
                &gt; {log}
              </div>
            ))
          )}
        </div>
      </section>

      {/* ── Tier 2: Stakeholder Integration Console (full-width) ── */}
      <section className="glass-card">
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '4px' }}>{TRANSLATIONS.integrationConsoleTitle}</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{TRANSLATIONS.integrationConsoleDesc}</p>
        </div>

        {/* 4 integration toggles in a responsive grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px', marginBottom: '24px' }}>
          {integrations.map(({ key, title, desc, icon }) => (
            <div
              key={key}
              className="premium-segment"
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: 'rgba(255,255,255,0.02)',
                border: integrationSettings[key] ? '1px solid rgba(59,130,246,0.3)' : '1px solid var(--glass-border)',
                borderLeft: integrationSettings[key] ? '4px solid var(--accent-blue)' : '4px solid transparent',
                borderRadius: '12px', padding: '14px 16px',
                boxShadow: integrationSettings[key] ? '0 0 12px rgba(59,130,246,0.08)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: '600', margin: '0 0 2px 0' }}>{title}</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: 0 }}>{desc}</p>
                </div>
              </div>
              <div
                className={`toggle-container ${integrationSettings[key] ? 'active' : ''}`}
                onClick={() => handleToggleIntegration(key)}
                style={{ cursor: 'pointer', flexShrink: 0 }}
              >
                <div className="toggle-switch"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Active channels summary chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '0.78rem', fontWeight: '800', color: 'var(--label-color)', textTransform: 'uppercase', letterSpacing: '0.08em', marginRight: '4px' }}>
            Active:
          </label>
          {integrations.filter(({ key }) => integrationSettings[key]).length === 0 ? (
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>No channels active.</span>
          ) : (
            integrations
              .filter(({ key }) => integrationSettings[key])
              .map(({ key, title }) => (
                <button key={key} type="button" className="segment-selector-btn active-blue" style={{ cursor: 'default' }}>
                  {title}
                </button>
              ))
          )}
        </div>
      </section>

      {/* ── Tier 3: Evidence Audit Vaults (full-width) ── */}
      <section className="glass-card">
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '4px' }}>{TRANSLATIONS.auditVaultsTitle}</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{TRANSLATIONS.auditVaultsDesc}</p>
        </div>

        {archivedReleases.length === 0 ? (
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '32px 0' }}>
            {TRANSLATIONS.noDeployments}
          </p>
        ) : (
          <div className="release-cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(340px, 100%), 1fr))', gap: '20px' }}>
            {archivedReleases.map((release) => (
              <div
                key={release.id}
                className="premium-segment"
                style={{
                  display: 'flex', flexDirection: 'column', gap: '16px',
                  padding: '24px 28px',
                  border: selectedArchive?.id === release.id ? '1px solid var(--accent-blue)' : '1px solid rgba(255,255,255,0.05)',
                  boxShadow: selectedArchive?.id === release.id ? '0 0 15px rgba(59,130,246,0.15)' : 'none',
                  cursor: 'pointer', transition: 'all 0.2s ease'
                }}
                onClick={() => setSelectedArchive(prev => prev?.id === release.id ? null : release)}
              >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                    {release.build}
                  </h4>
                  <span className={`badge ${
                    release.status === 'NO-GO'          ? 'badge-danger' :
                    release.status === 'CONDITIONAL GO' ? 'badge-warning' : 'badge-success'
                  }`} style={{ whiteSpace: 'nowrap' }}>
                    {release.status}
                  </span>
                </div>

                {/* Meta row */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '0.82rem', color: 'var(--text-muted)', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '14px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                      <line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/>
                      <line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/>
                    </svg>
                    Score: <strong style={{ color: 'var(--accent-blue)' }}>{release.score}/100</strong>
                  </span>
                  <span style={{ color: 'rgba(255,255,255,0.15)' }}>|</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={release.score >= 75 ? 'var(--status-success)' : 'var(--status-warning)'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                    Pass Rate: <strong style={{ color: release.score >= 75 ? 'var(--status-success)' : 'var(--status-warning)' }}>{release.passRate}%</strong>
                  </span>
                  <span style={{ color: 'rgba(255,255,255,0.15)' }}>|</span>
                  <span>{release.timestamp}</span>
                </div>

                {/* Expanded detail — shown when selected */}
                {selectedArchive?.id === release.id && (
                  <>
                    {/* Metrics grid */}
                    <div style={{ background: 'rgba(0,0,0,0.15)', padding: '16px 20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
                      <h5 style={{ fontSize: '0.78rem', color: 'var(--label-color)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" /><path d="m9 12 2 2 4-4" />
                        </svg>
                        Release Metrics
                      </h5>
                      <div className="two-col-grid" style={{ gap: '12px' }}>
                        {[
                          { label: TRANSLATIONS.readinessScore,    value: `${release.score}/100` },
                          { label: TRANSLATIONS.slaLatency,        value: `${release.latency}ms` },
                          { label: TRANSLATIONS.regressionPassRate, value: `${release.passRate}%` },
                          { label: TRANSLATIONS.functionalCover,   value: `${release.coverage}%` },
                        ].map(({ label, value }) => (
                          <div key={label}>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>{label}</span>
                            <span style={{ fontSize: '1.0rem', fontWeight: '700', color: 'var(--text-primary)' }}>{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Evidence notes */}
                    <div style={{ background: 'rgba(0,0,0,0.15)', padding: '16px 20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
                      <h5 style={{ fontSize: '0.78rem', color: 'var(--label-color)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                        </svg>
                        {TRANSLATIONS.evidencePackageTitle}
                      </h5>
                      <pre className="terminal-container" style={{
                        border: '1px solid var(--glass-border)',
                        borderRadius: '8px', padding: '12px', fontFamily: 'monospace',
                        fontSize: '0.75rem', color: 'var(--text-secondary)',
                        maxHeight: '140px', overflowY: 'auto', whiteSpace: 'pre-wrap', margin: 0
                      }}>
                        {release.notes}
                      </pre>
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        className="btn btn-secondary"
                        onClick={(e) => { e.stopPropagation(); handleDownloadArchive(release); }}
                        style={{ padding: '6px 12px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        {TRANSLATIONS.export}
                      </button>
                      <button
                        className="btn btn-secondary"
                        onClick={(e) => { e.stopPropagation(); deleteArchivedRelease(release.id); setSelectedArchive(null); }}
                        style={{ padding: '6px 12px', fontSize: '0.75rem', borderColor: 'var(--status-danger)', color: 'var(--status-danger)', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          <line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" />
                        </svg>
                        {TRANSLATIONS.delete}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
};

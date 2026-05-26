import React, { useState } from 'react';
import { useQEVantage } from '../context/QEVantageContextCore';

const TRANSLATIONS = {
  profilerTitle: 'Continuous Latency Profiler',
  profilerDesc: 'Dynamic statistical profiling tracked per-commit.',
  telemetryActive: 'Live Telemetry Active',
  enableLiveFeed: 'Enable Live Feed',
  slaLimit: 'SLA LIMIT',
  commitTarget: 'Commit Target:',
  throughput: 'Throughput:',
  reqSec: 'req/sec',
  slaBreach: 'SLA BREACH',
  passed: '✓ PASSED',
  clickInspect: 'Click any plot dot on the graph to inspect build benchmarks.',
  gateTitle: 'Interactive Quality Gate SLA',
  gateDesc: 'Drag the SLA slider to dynamically trigger pipeline blockages in real-time.',
  slaLimitLabel: 'Latency SLA Limit',
  threshold: 'threshold',
  strictLabel: 'Strict (150ms)',
  lenientLabel: 'Lenient (350ms)',
  simulatorTitle: 'Capacity Load Simulator',
  simulatorDesc: 'Simulate real-time retail user traffic profiles to test API elasticity.',
  standardLoad: 'Standard Load',
  peakLoad: 'Black Friday Load',
  bulkLoad: 'Inventory Sync',
  streamingPayloads: 'Streaming stress payloads to target clusters...',
  anomalyTitle: 'ML Anomaly Detection Alerts',
  anomalyDesc: 'Statistical benchmark drift alerts surfaced per-commit across active performance targets.',
  anomalyClean: 'Continuous dynamic baselines clean. Zero performance drift detected.',
  driftCaught: 'Statistical benchmark drift caught on build',
  driftFrom: 'Dynamic baseline drifted from',
  driftTo: 'to'
};

export const PerformanceTab: React.FC = () => {
  const {
    perfHistory,
    latencySla,
    setLatencySla,
    anomalies,
    triggerLoadSimulation,
    isSimulating,
    liveTelemetryActive,
    setLiveTelemetryActive
  } = useQEVantage();

  const [selectedBuild, setSelectedBuild] = useState<typeof perfHistory[0] | null>(null);

  // SVG Chart sizing
  const width = 500;
  const height = 200;
  const padding = 35;
  const maxVal = Math.max(...perfHistory.map(b => b.responseTime), latencySla, 350);

  const getX = (index: number) => padding + (index * (width - 2 * padding)) / (perfHistory.length - 1);
  const getY = (val: number) => height - padding - (val * (height - 2 * padding)) / maxVal;

  const latestPerf = perfHistory.slice(-1)[0];

  // Colour helper for build dots — mirrors getCoverageColor
  const getBuildColor = (responseTime: number) => {
    const ratio = responseTime / latencySla;
    if (ratio <= 0.6) return 'rgba(16, 185, 129, 0.8)';  // Green
    if (ratio <= 0.85) return 'rgba(59, 130, 246, 0.8)'; // Blue
    if (ratio <= 1.0)  return 'rgba(245, 158, 11, 0.8)'; // Amber
    return 'rgba(239, 68, 68, 0.8)';                     // Red
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

      {/* ── Top Row: Continuous Latency Profiler (full-width, mirrors Live Coverage Heatmap) ── */}
      <section className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '8px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '4px' }}>{TRANSLATIONS.profilerTitle}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '24px' }}>{TRANSLATIONS.profilerDesc} {TRANSLATIONS.clickInspect}</p>
          </div>
          <button
            className={`telemetry-switch ${liveTelemetryActive ? 'active' : ''}`}
            onClick={() => setLiveTelemetryActive(!liveTelemetryActive)}
          >
            <span className={liveTelemetryActive ? 'pulse-dot' : ''}></span>
            {liveTelemetryActive ? TRANSLATIONS.telemetryActive : TRANSLATIONS.enableLiveFeed}
          </button>
        </div>

        {/* SVG Chart */}
        <div className="chart-container" style={{ borderRadius: '8px', border: '1px solid var(--glass-border)', padding: '16px 12px 8px 12px', overflow: 'hidden', marginBottom: '20px' }}>
          <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>

            {/* Gridlines */}
            {[0, 1, 2, 3].map((_, i) => {
              const val = Math.round((maxVal / 3) * i);
              const y = getY(val);
              return (
                <g key={i}>
                  <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="var(--chart-grid)" strokeWidth="1" />
                  <text x={padding - 6} y={y + 4} fill="var(--chart-label)" fontSize="9" textAnchor="end">{val}ms</text>
                </g>
              );
            })}

            {/* SLA Threshold Line */}
            <line
              x1={padding} y1={getY(latencySla)}
              x2={width - padding} y2={getY(latencySla)}
              stroke="var(--status-danger)" strokeWidth="1.5" strokeDasharray="4,4"
              style={{ transition: 'y 0.3s ease' }}
            />
            <text
              x={width - padding - 6} y={getY(latencySla) - 6}
              fill="var(--status-danger)" fontSize="9" fontWeight="700" textAnchor="end"
              style={{ transition: 'y 0.3s ease' }}
            >
              {TRANSLATIONS.slaLimit} ({latencySla}ms)
            </text>

            {/* Line path */}
            <path
              d={perfHistory.map((b, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(b.responseTime)}`).join(' ')}
              fill="none" stroke="var(--accent-blue)" strokeWidth="2.5"
              style={{ transition: 'all 0.5s ease' }}
            />

            {/* Interactive dots */}
            {perfHistory.map((b, i) => (
              <circle
                key={i}
                cx={getX(i)} cy={getY(b.responseTime)}
                r={selectedBuild?.build === b.build ? 7 : 5}
                fill={b.responseTime > latencySla ? 'var(--status-danger)' : 'var(--accent-blue)'}
                stroke="var(--bg-primary)" strokeWidth="1.5"
                cursor="pointer"
                style={{ transition: 'r 0.2s ease, cy 0.5s ease' }}
                onClick={() => setSelectedBuild(b)}
              />
            ))}

            {/* X-axis labels */}
            {perfHistory.map((b, i) => (
              <text key={i} x={getX(i)} y={height - 8} fill="var(--chart-label)" fontSize="9" textAnchor="middle">
                {b.build}
              </text>
            ))}
          </svg>
        </div>

        {/* Build detail panel — mirrors node detail panel */}
        {selectedBuild ? (
          <div className="premium-segment" style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '6px' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: '600', margin: 0 }}>
                {TRANSLATIONS.commitTarget} <span style={{ color: 'var(--accent-blue)' }}>{selectedBuild.build}</span>
              </h4>
              <span
                className={`badge ${selectedBuild.responseTime > latencySla ? 'badge-danger' : 'badge-success'}`}
              >
                {selectedBuild.responseTime > latencySla ? TRANSLATIONS.slaBreach : TRANSLATIONS.passed}
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              {TRANSLATIONS.throughput} <strong style={{ color: 'var(--text-primary)' }}>{selectedBuild.throughput} {TRANSLATIONS.reqSec}</strong>
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Response Time:</span>
              <input
                type="range" min="0" max={maxVal}
                value={selectedBuild.responseTime}
                readOnly
                style={{ flex: 1, accentColor: selectedBuild.responseTime > latencySla ? 'var(--status-danger)' : 'var(--accent-blue)', height: '4px', cursor: 'default' }}
              />
              <span style={{
                fontSize: '0.9rem', fontWeight: '700', minWidth: '60px', textAlign: 'right',
                color: selectedBuild.responseTime > latencySla ? 'var(--status-danger)' : 'var(--status-success)'
              }}>
                {selectedBuild.responseTime}ms
              </span>
            </div>
          </div>
        ) : (
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '12px 0' }}>
            Select a build dot on the graph to inspect commit benchmark details.
          </p>
        )}
      </section>

      {/* ── Bottom Row: 2-Column Grid (mirrors functional-grid) ── */}
      <div className="functional-grid">

        {/* Left Column: SLA Gate + Load Simulator (mirrors AI Requirement Ingestion) */}
        <section className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '4px' }}>{TRANSLATIONS.gateTitle}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{TRANSLATIONS.gateDesc}</p>
          </div>

          {/* SLA Slider */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: '800', color: 'var(--label-color)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {TRANSLATIONS.slaLimitLabel}
            </label>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: '600', marginBottom: '4px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>{TRANSLATIONS.slaLimitLabel}</span>
              <span style={{ color: latestPerf.responseTime > latencySla ? 'var(--status-danger)' : 'var(--status-success)' }}>
                {latencySla}ms {TRANSLATIONS.threshold}
              </span>
            </div>
            <input
              type="range" min="150" max="350" step="10"
              value={latencySla}
              onChange={(e) => setLatencySla(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--accent-blue)', height: '6px', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <span>{TRANSLATIONS.strictLabel}</span>
              <span>{TRANSLATIONS.lenientLabel}</span>
            </div>
          </div>

          {/* Load Profile selector — mirrors Target Module segment buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: '800', color: 'var(--label-color)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Load Profile
            </label>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>{TRANSLATIONS.simulatorDesc}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
              {[
                { label: TRANSLATIONS.standardLoad, type: 'Concurrent' },
                { label: TRANSLATIONS.peakLoad,     type: 'Peak' },
                { label: TRANSLATIONS.bulkLoad,     type: 'Bulk' },
              ].map(({ label, type }) => (
                <button
                  key={type}
                  type="button"
                  className="segment-selector-btn"
                  onClick={() => triggerLoadSimulation(type)}
                  disabled={isSimulating}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Simulation progress indicator */}
          {isSimulating && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.15)', padding: '10px 14px', borderRadius: '8px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1.5s linear infinite' }}>
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
              <span style={{ fontSize: '0.8rem', color: 'var(--accent-blue)', fontWeight: '600' }}>{TRANSLATIONS.streamingPayloads}</span>
            </div>
          )}

          {/* Run button — mirrors "Process Requirement" */}
          <button
            className="btn btn-primary"
            onClick={() => triggerLoadSimulation('Concurrent')}
            disabled={isSimulating}
            style={{ alignSelf: 'flex-start', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              style={{ animation: isSimulating ? 'spin 1.5s linear infinite' : 'none' }}>
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
            {isSimulating ? 'Simulating...' : 'Run Load Simulation'}
          </button>
        </section>

        {/* Right Column: Anomaly Detection Log (mirrors Requirement Traceability Matrix) */}
        <section className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '24px', height: '100%' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '4px' }}>{TRANSLATIONS.anomalyTitle}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{TRANSLATIONS.anomalyDesc}</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', overflowY: 'auto', maxHeight: '460px', paddingRight: '8px' }}>
            {anomalies.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '32px 0' }}>
                {TRANSLATIONS.anomalyClean}
              </p>
            ) : (
              anomalies.map((anom) => (
                <div key={anom.id} className="premium-segment" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '24px 28px', border: '1px solid rgba(255, 255, 255, 0.05)', position: 'relative' }}>

                  {/* Header — mirrors story title + badge */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--status-danger)', margin: 0, lineHeight: '1.4', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--status-danger)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                      </svg>
                      {anom.metric}
                    </h4>
                    <span className="badge badge-danger" style={{ whiteSpace: 'nowrap' }}>{anom.severity}</span>
                  </div>

                  {/* Meta row — mirrors module + traceability row */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '0.82rem', color: 'var(--text-muted)', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '14px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/>
                        <line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/>
                      </svg>
                      Build: <strong style={{ color: 'var(--text-primary)' }}>{anom.build}</strong>
                    </span>
                    <span style={{ color: 'rgba(255,255,255,0.15)' }}>|</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--status-danger)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                      </svg>
                      Drift: <strong style={{ color: 'var(--text-primary)' }}>{anom.baseline}ms</strong>
                      <span style={{ color: 'var(--text-muted)' }}>→</span>
                      <strong style={{ color: 'var(--status-danger)' }}>{anom.actual}ms</strong>
                    </span>
                    <span style={{ color: 'rgba(255,255,255,0.15)' }}>|</span>
                    <span>{anom.timestamp}</span>
                  </div>

                  {/* Drift detail block — mirrors auto-generated assertions block */}
                  <div style={{ background: 'rgba(0, 0, 0, 0.15)', padding: '16px 20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)', marginTop: '4px' }}>
                    <h5 style={{ fontSize: '0.78rem', color: 'var(--label-color)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
                        <line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                      </svg>
                      Drift Analysis
                    </h5>
                    <ul style={{ listStyleType: 'none', paddingLeft: 0, display: 'flex', flexDirection: 'column', gap: '8px', margin: 0 }}>
                      <li style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'flex-start', gap: '10px', lineHeight: '1.5' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', minWidth: '16px', marginTop: '3px' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </span>
                        <span>{TRANSLATIONS.driftCaught} <strong style={{ color: 'var(--text-primary)' }}>{anom.build}</strong>.</span>
                      </li>
                      <li style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'flex-start', gap: '10px', lineHeight: '1.5' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', minWidth: '16px', marginTop: '3px' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--status-danger)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </span>
                        <span>
                          {TRANSLATIONS.driftFrom} <strong style={{ color: 'var(--text-primary)' }}>{anom.baseline}ms</strong> {TRANSLATIONS.driftTo} <strong style={{ color: 'var(--status-danger)' }}>{anom.actual}ms</strong>.
                        </span>
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

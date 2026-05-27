import React, { useState } from 'react';
import { useQEVantage } from '../context/QEVantageContextCore';
import type { SecurityFinding } from '../context/QEVantageContextCore';

export const SecurityTab: React.FC = () => {
  const {
    securityFindings,
    triageFinding,
    complianceProgress
  } = useQEVantage();

  const [selectedFinding, setSelectedFinding] = useState<SecurityFinding | null>(null);

  // Helper for severity color indicators
  const getSeverityClass = (sev: string) => {
    switch (sev) {
      case 'Critical': return 'badge-danger';
      case 'High': return 'badge-danger';
      case 'Medium': return 'badge-warning';
      default: return 'badge-success';
    }
  };

  return (
    <div className="security-outer-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(360px, 100%), 1fr))', gap: '32px' }}>
      
      {/* Left Column: Vulnerability Grid & Compliance */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        {/* Compliance Progress Metrics */}
        <section className="glass-card">
          <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '16px' }}>Compliance Security Auditing</h3>
          
          <div className="two-col-grid" style={{ gap: '20px' }}>
            
            {/* SOC2 Progress */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>SOC2 Auditing</span>
                <span style={{ color: 'var(--accent-blue)', fontWeight: '700' }}>{complianceProgress.SOC2}%</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', height: '8px', borderRadius: '4px', border: '1px solid var(--glass-border)', overflow: 'hidden' }}>
                <div style={{ width: `${complianceProgress.SOC2}%`, background: 'var(--accent-blue)', height: '100%', borderRadius: '4px', transition: 'width 0.5s ease' }}></div>
              </div>
            </div>

            {/* PCI-DSS Progress */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>PCI-DSS Compliance</span>
                <span style={{ color: 'var(--status-success)', fontWeight: '700' }}>{complianceProgress.PCI_DSS}%</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', height: '8px', borderRadius: '4px', border: '1px solid var(--glass-border)', overflow: 'hidden' }}>
                <div style={{ width: `${complianceProgress.PCI_DSS}%`, background: 'var(--status-success)', height: '100%', borderRadius: '4px', transition: 'width 0.5s ease' }}></div>
              </div>
            </div>

            {/* GDPR Progress */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>GDPR Regulations</span>
                <span style={{ color: 'var(--accent-purple)', fontWeight: '700' }}>{complianceProgress.GDPR}%</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', height: '8px', borderRadius: '4px', border: '1px solid var(--glass-border)', overflow: 'hidden' }}>
                <div style={{ width: `${complianceProgress.GDPR}%`, background: 'var(--accent-purple)', height: '100%', borderRadius: '4px', transition: 'width 0.5s ease' }}></div>
              </div>
            </div>

            {/* OWASP Top 10 */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>OWASP Core Defense</span>
                <span style={{ color: 'var(--status-warning)', fontWeight: '700' }}>{complianceProgress.OWASP_10}%</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', height: '8px', borderRadius: '4px', border: '1px solid var(--glass-border)', overflow: 'hidden' }}>
                <div style={{ width: `${complianceProgress.OWASP_10}%`, background: 'var(--status-warning)', height: '100%', borderRadius: '4px', transition: 'width 0.5s ease' }}></div>
              </div>
            </div>

          </div>
        </section>

        {/* Security Findings List */}
        <section className="glass-card">
          <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '8px' }}>Active Security Threats</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '20px' }}>Shift-left vulnerabilities categorized by severity and business impact.</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {securityFindings.map((finding) => (
              <div 
                key={finding.id}
                className="premium-segment"
                style={{
                  border: selectedFinding?.id === finding.id ? '1px solid var(--accent-blue)' : '1px solid rgba(255, 255, 255, 0.05)',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  boxShadow: selectedFinding?.id === finding.id ? '0 0 15px rgba(59, 130, 246, 0.25)' : 'none',
                  padding: '14px 20px'
                }}
                onClick={() => setSelectedFinding(finding)}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxWidth: '70%' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)' }}>{finding.title}</h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Scanner: <strong>{finding.type}</strong> | File: <strong style={{ color: 'var(--text-secondary)' }}>{finding.file.split('/').pop()}</strong></span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                  <span className={`badge ${getSeverityClass(finding.severity)}`} style={{ fontSize: '0.65rem' }}>
                    {finding.severity}
                  </span>
                  <span className={`badge ${finding.status === 'Fixed' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.65rem' }}>
                    {finding.status}
                  </span>
                </div>

              </div>
            ))}
          </div>
        </section>

      </div>

      {/* Right Column: Inline PR comment code visualizer & Triage Panel */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        {/* Triage Panel */}
        {selectedFinding ? (
          <section className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>Threat Triage Desk</h3>
            
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '4px' }}>{selectedFinding.title}</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Location: <code>{selectedFinding.file}:{selectedFinding.line}</code></p>
            </div>

            <div className="two-col-grid">
              
              {/* Recalculate Business Hazard Impact */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Business Hazard Impact</label>
                <select
                  value={selectedFinding.businessImpact}
                  onChange={(e) => {
                    const impactVal = e.target.value as SecurityFinding['businessImpact'];
                    triageFinding(selectedFinding.id, impactVal, selectedFinding.status);
                    setSelectedFinding(prev => prev ? { ...prev, businessImpact: impactVal } : null);
                  }}
                  style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', padding: '8px', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                >
                  <option value="Critical">🔴 Critical Hazard</option>
                  <option value="High">🔴 High Hazard</option>
                  <option value="Medium">🟡 Medium Hazard</option>
                  <option value="Low">🟢 Low Hazard</option>
                </select>
              </div>

              {/* Modify Patch Resolution Status */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Resolution Action</label>
                <select
                  value={selectedFinding.status}
                  onChange={(e) => {
                    const statusVal = e.target.value as SecurityFinding['status'];
                    triageFinding(selectedFinding.id, selectedFinding.businessImpact, statusVal);
                    setSelectedFinding(prev => prev ? { ...prev, status: statusVal } : null);
                  }}
                  style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', padding: '8px', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                >
                  <option value="Open">❌ Keep Open</option>
                  <option value="Triaged">🟡 Triaged (Reviewing)</option>
                  <option value="Fixed">✅ Apply Security Patch</option>
                </select>
              </div>

            </div>
          </section>
        ) : (
          <section className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '120px' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Select a vulnerability on the left to triage or inspect.</p>
          </section>
        )}

        {/* Developer-Native Pull Request Code Inspector simulation */}
        <section className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.4rem' }}>🐙</span>
            <div>
              <h3 style={{ fontSize: '1.05rem', color: 'var(--text-primary)' }}>GitHub Pull Request #482</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Automated QEVantage™ Code Comment</p>
            </div>
          </div>

          {/* GitHub PR Diff representation */}
          <div className="premium-segment" style={{
            background: 'rgba(13, 17, 29, 0.6) !important',
            fontFamily: 'monospace',
            fontSize: '0.75rem',
            overflow: 'hidden',
            padding: '0px !important',
            borderRadius: '12px'
          }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px 16px', color: '#8b949e', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
              app/api/checkout/route.ts
            </div>
            
            <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <div style={{ color: '#8b949e' }}>39:  export async function POST(req: Request) &#123;</div>
              <div style={{ color: '#8b949e' }}>40:    const &#123; cartId, postalCode &#125; = await req.json();</div>
              <div style={{ background: 'rgba(248, 81, 73, 0.15)', color: '#ff7b72', paddingLeft: '4px' }}>41: -  const query = `SELECT * FROM carts WHERE id = '$&#123;cartId&#125;'`;</div>
              <div style={{ background: 'rgba(248, 81, 73, 0.15)', color: '#ff7b72', paddingLeft: '4px' }}>42: -  const cart = await db.raw(query);</div>
              <div style={{ background: 'rgba(46, 160, 67, 0.15)', color: '#7ee787', paddingLeft: '4px' }}>41: +  const cart = await db('carts').where(&#123; id: cartId &#125;).first();</div>
            </div>

            {/* Simulated QEVantage comment block */}
            <div style={{ 
              background: 'rgba(59, 130, 246, 0.05)', 
              borderTop: '1px solid rgba(59, 130, 246, 0.15)', 
              padding: '12px',
              color: 'var(--text-secondary)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <span style={{ fontSize: '1rem' }}>🛡️</span>
                <strong style={{ color: 'var(--accent-blue)', fontSize: '0.8rem' }}>QEVantage™ Security Engine</strong>
                <span className="badge badge-danger" style={{ fontSize: '0.6rem' }}>Critical Threat</span>
              </div>
              <p style={{ fontSize: '0.75rem', lineHeight: '1.4', marginBottom: '8px' }}>
                <strong>SQL Injection Vulnerability Detected:</strong> Directly concatenating request payloads inside raw database queries exposes the billing transaction pipeline to complete database exposure.
              </p>
              <p style={{ fontSize: '0.75rem', lineHeight: '1.4' }}>
                💡 <strong>Remediation:</strong> Use safe ORM parameters or parameterized queries to isolate user input payloads before query executions.
              </p>
            </div>

          </div>
        </section>

      </div>

    </div>
  );
};

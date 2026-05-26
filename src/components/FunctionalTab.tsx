import React, { useState } from 'react';
import { useQEVantage } from '../context/QEVantageContextCore';

export const FunctionalTab: React.FC = () => {
  const { stories, addStory, heatmapNodes, updateNodeCoverage } = useQEVantage();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [module, setModule] = useState('CheckoutRouting');
  const [risk, setRisk] = useState<'Low' | 'Medium' | 'High'>('High');
  const [selectedNode, setSelectedNode] = useState<typeof heatmapNodes[0] | null>(null);
  
  // Simulated AI synthesis ingestion loading
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    
    setIsProcessing(true);
    setProcessingStep(0);
    
    setTimeout(() => setProcessingStep(1), 800);
    setTimeout(() => setProcessingStep(2), 1600);
    
    setTimeout(() => {
      addStory(title, description, module, risk);
      setTitle('');
      setDescription('');
      setIsProcessing(false);
    }, 2400);
  };

  // Helper for heatmap colors
  const getCoverageColor = (cov: number) => {
    if (cov >= 90) return 'rgba(16, 185, 129, 0.8)'; // Green
    if (cov >= 75) return 'rgba(59, 130, 246, 0.8)'; // Blue
    if (cov >= 50) return 'rgba(245, 158, 11, 0.8)'; // Amber
    return 'rgba(239, 68, 68, 0.8)'; // Red
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Top Row: Live Coverage Heatmap (Stretched across) */}
      <section className="glass-card">
        <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '8px' }}>Live Coverage Heatmap</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '24px' }}>Click any module grid block to dynamically calibrate test depth.</p>
        
        <div className="heatmap-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '12px', marginBottom: '24px' }}>
          {heatmapNodes.map((node) => (
            <div
              key={node.id}
              className="heatmap-cell premium-segment"
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: selectedNode?.id === node.id ? '1px solid var(--accent-blue)' : '1px solid rgba(255, 255, 255, 0.05)',
                borderLeft: `4px solid ${getCoverageColor(node.coverage)}`,
                padding: '12px 14px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '84px',
                borderRadius: '12px',
                boxShadow: selectedNode?.id === node.id ? '0 0 15px rgba(59, 130, 246, 0.25)' : 'none'
              }}
              onClick={() => setSelectedNode(node)}
            >
              {/* Top row: name + risk icon */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '4px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-primary)', lineHeight: '1.4', wordBreak: 'break-word' }} title={node.name}>{node.name}</span>
                {node.risk === 'High' && (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--status-danger)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '1px' }}>
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                )}
                {node.risk === 'Medium' && (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--status-warning)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '1px' }}>
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                )}
                {node.risk === 'Low' && (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--status-success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '1px' }}>
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                )}
              </div>
              {/* Centre: coverage % */}
              <span style={{ fontSize: '1.2rem', fontWeight: '800', textAlign: 'center', color: 'var(--text-primary)', display: 'block', marginTop: '6px' }}>{node.coverage}%</span>
            </div>
          ))}
        </div>

        {/* Node detail and live adjustment slider */}
        {selectedNode ? (
          <div className="premium-segment" style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: '600', marginBottom: '6px' }}>Module: <span style={{ color: 'var(--accent-blue)' }}>{selectedNode.name}</span></h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>Risk Priority: <span className="badge badge-warning">{selectedNode.risk} Risk</span></p>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Coverage:</span>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={selectedNode.coverage} 
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  updateNodeCoverage(selectedNode.id, val);
                  setSelectedNode(prev => prev ? { ...prev, coverage: val } : null);
                }}
                style={{ flex: 1, accentColor: 'var(--accent-blue)', height: '4px', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.9rem', fontWeight: '700', minWidth: '40px', textAlign: 'right' }}>{selectedNode.coverage}%</span>
            </div>
          </div>
        ) : (
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '12px 0' }}>Select a module node to adjust coverage depth manually.</p>
        )}
      </section>

      {/* Bottom Row: 2-Column Grid */}
      <div className="functional-grid">
        
        {/* Left Column: Story Ingestion Form */}
        <section className="glass-card" style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {isProcessing && (
            <div className="ingestion-overlay">
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 4s linear infinite' }}><rect x="4" y="4" width="16" height="16" rx="2" ry="2" /><rect x="9" y="9" width="6" height="6" /><line x1="9" y1="1" x2="9" y2="4" /><line x1="15" y1="1" x2="15" y2="4" /><line x1="9" y1="20" x2="9" y2="23" /><line x1="15" y1="20" x2="15" y2="23" /><line x1="20" y1="9" x2="23" y2="9" /><line x1="20" y1="15" x2="23" y2="15" /><line x1="1" y1="9" x2="4" y2="9" /><line x1="1" y1="15" x2="4" y2="15" /></svg>
              </div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-primary)' }}>QEVantage™ AI Synthesizer</h4>
              
              <div className="scanning-bar">
                <div className="scanning-line"></div>
              </div>
              
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', minHeight: '24px', transition: 'all 0.3s ease' }}>
                {processingStep === 0 && 'Parsing user story metrics & boundary criteria...'}
                {processingStep === 1 && 'Compiling semantic test suites schema...'}
                {processingStep === 2 && 'Synthesizing automated quality assertions...'}
              </p>
            </div>
          )}

          <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '4px' }}>AI Requirement Ingestion</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '24px' }}>Type custom requirements to trigger real-time AI scenario generations.</p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: '800', color: 'var(--label-color)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Story Title</label>
              <input 
                type="text" 
                placeholder="e.g. Integrate Apple Pay Express Gateway" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: '800', color: 'var(--label-color)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Acceptance Criteria</label>
              <textarea 
                rows={3}
                placeholder="e.g. As an e-commerce buyer, I want single-tap payment options so that authentication overhead is reduced by 60%..." 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ resize: 'vertical' }}
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: '800', color: 'var(--label-color)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Target Module</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {['AuthGate', 'CheckoutRouting', 'BillingGateway', 'InventorySync'].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setModule(m)}
                      className={`segment-selector-btn ${module === m ? 'active-blue' : ''}`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: '800', color: 'var(--label-color)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Risk Priority</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {(['Low', 'Medium', 'High'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRisk(r)}
                      className={`segment-selector-btn ${
                        risk === r 
                          ? r === 'High' 
                            ? 'active-danger' 
                            : r === 'Medium' 
                              ? 'active-warning' 
                              : 'active-green' 
                          : ''
                      }`}
                    >
                      {r} Priority
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2" /><rect x="9" y="9" width="6" height="6" /><line x1="9" y1="1" x2="9" y2="4" /><line x1="15" y1="1" x2="15" y2="4" /><line x1="9" y1="20" x2="9" y2="23" /><line x1="15" y1="20" x2="15" y2="23" /><line x1="20" y1="9" x2="23" y2="9" /><line x1="20" y1="15" x2="23" y2="15" /><line x1="1" y1="9" x2="4" y2="9" /><line x1="1" y1="15" x2="4" y2="15" /></svg>
              Process Requirement
            </button>
          </form>
        </section>

        {/* Right Column: Traceability List */}
        <section className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '24px', height: '100%' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '4px' }}>Requirement Traceability Matrix</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Direct semantic alignment mapping product user stories to live active code coverage assertions.</p>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', overflowY: 'auto', maxHeight: '460px', paddingRight: '8px' }}>
            {stories.map((story) => (
              <div key={story.id} className="premium-segment" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '24px 28px', border: '1px solid rgba(255, 255, 255, 0.05)', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0, lineHeight: '1.4' }}>{story.title}</h4>
                  <span className={`badge ${story.risk === 'High' ? 'badge-danger' : story.risk === 'Medium' ? 'badge-warning' : 'badge-success'}`} style={{ whiteSpace: 'nowrap' }}>
                    {story.risk} Priority
                  </span>
                </div>
                
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: 0, lineHeight: '1.6' }}>{story.description}</p>
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '0.82rem', color: 'var(--text-muted)', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '14px', marginTop: '4px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/></svg>
                    Module: <strong style={{ color: 'var(--text-primary)' }}>{story.module}</strong>
                  </span>
                  <span style={{ color: 'rgba(255,255,255,0.15)' }}>|</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={story.coverage >= 75 ? 'var(--status-success)' : 'var(--status-warning)'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    Traceability: <strong style={{ color: story.coverage >= 75 ? 'var(--status-success)' : 'var(--status-warning)' }}>{story.coverage}% Verified</strong>
                  </span>
                </div>

                {/* Generated assertions */}
                <div style={{ background: 'rgba(0, 0, 0, 0.15)', padding: '16px 20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)', marginTop: '4px' }}>
                  <h5 style={{ fontSize: '0.78rem', color: 'var(--label-color)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px', margin: '0 0 12px 0' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
                    Auto-Generated Quality Assertions
                  </h5>
                  <ul style={{ listStyleType: 'none', paddingLeft: 0, display: 'flex', flexDirection: 'column', gap: '8px', margin: 0 }}>
                    {story.testCases.map((tc, idx) => (
                      <li key={idx} style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'flex-start', gap: '10px', lineHeight: '1.5' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', minWidth: '16px', marginTop: '3px' }}>
                          {tc.includes('PENDING') ? (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--status-warning)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                          ) : (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--status-success)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                          )}
                        </span>
                        <span>{tc}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
};

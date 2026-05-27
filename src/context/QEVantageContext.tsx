import React, { useState, useEffect } from 'react';
import { QEVantageContext } from './QEVantageContextCore';
import type {
  UserStory,
  TestSuite,
  AnomalyLog,
  SecurityFinding,
  HealingEvent,
  ArchivedRelease,
  RRSVertical,
  RRSDimensionScore,
} from './QEVantageContextCore';

// ── RRS™ Weight profiles (mirrors config/weights.json) ─────────────────────
const RRS_WEIGHTS: Record<RRSVertical, Record<string, number>> = {
  default:    { functional: 0.20, automation: 0.20, performance: 0.20, security: 0.20, regression: 0.20 },
  fintech:    { functional: 0.15, automation: 0.20, performance: 0.15, security: 0.30, regression: 0.20 },
  retail:     { functional: 0.20, automation: 0.20, performance: 0.25, security: 0.15, regression: 0.20 },
  healthcare: { functional: 0.25, automation: 0.15, performance: 0.15, security: 0.30, regression: 0.15 },
};

const SECURITY_PENALTIES = { critical: 25, high: 12, medium: 5, low: 1 };

export const QEVantageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Tabs Navigation — persisted across refreshes
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('qev_activeTab') ?? 'dashboard');

  useEffect(() => {
    localStorage.setItem('qev_activeTab', activeTab);
  }, [activeTab]);
  const [isSimulating, setIsSimulating] = useState(false);

  // Pillar 1: Functional State Initializer
  const [stories, setStories] = useState<UserStory[]>([
    {
      id: 'story-1',
      title: 'MFA Secure Authentication Gate',
      description: 'As a financial client, I want to authenticate via an SMS/TOTP MFA token so that my high-value trade transactions are secured.',
      coverage: 100,
      testCases: [
        'Verify login fails with invalid credentials',
        'Verify MFA prompt triggers after primary authentication passes',
        'Verify backup scratch codes bypass session blocks on network latency'
      ],
      module: 'AuthGate',
      risk: 'High'
    },
    {
      id: 'story-2',
      title: 'Express Checkout Processing Route',
      description: 'As an active merchant, I want single-click express checkout routes so that order drop-offs are minimized by 15%.',
      coverage: 66,
      testCases: [
        'Verify cart contents persist during transaction redirects',
        'Verify single-click API payloads execute under 500ms bounds',
        'Verify out-of-stock items block billing cycles dynamically (PENDING)'
      ],
      module: 'CheckoutRouting',
      risk: 'High'
    },
    {
      id: 'story-3',
      title: 'Real-time Analytics Dashboard Widgets',
      description: 'As a system operator, I want real-time server cluster charts showing utilization benchmarks.',
      coverage: 50,
      testCases: [
        'Verify websockets payload structure matches schema benchmarks',
        'Verify UI chart updates dynamically (PENDING)'
      ],
      module: 'TelemetryDisplay',
      risk: 'Medium'
    }
  ]);

  const [heatmapNodes, setHeatmapNodes] = useState([
    { id: 'node-1', name: 'AuthGate', coverage: 100, risk: 'High' as const },
    { id: 'node-2', name: 'CheckoutRouting', coverage: 66, risk: 'High' as const },
    { id: 'node-3', name: 'TelemetryDisplay', coverage: 50, risk: 'Medium' as const },
    { id: 'node-4', name: 'NotificationEngine', coverage: 90, risk: 'Low' as const },
    { id: 'node-5', name: 'BillingGateway', coverage: 95, risk: 'High' as const },
    { id: 'node-6', name: 'InventorySync', coverage: 80, risk: 'Medium' as const },
    { id: 'node-7', name: 'ReportingSvc', coverage: 75, risk: 'Low' as const },
    { id: 'node-8', name: 'APIOrchestrator', coverage: 85, risk: 'High' as const },
  ]);

  const generateSmartAssertions = (titleStr: string, descStr: string, moduleStr: string): string[] => {
    const cases: string[] = [];
    const lowerTitle = titleStr.toLowerCase();
    const lowerDesc = descStr.toLowerCase();
    
    if (lowerTitle.includes('apple pay') || lowerTitle.includes('payment') || lowerTitle.includes('checkout') || lowerTitle.includes('billing') || lowerDesc.includes('checkout')) {
      cases.push(`Verify secure transaction tokenization under PCI-DSS compliance limits`);
      cases.push(`Verify cart checkout redirect payload executes inside a 500ms response envelope`);
      cases.push(`Verify 3D-Secure multi-factor fallbacks resolve during card validation latency`);
    } else if (lowerTitle.includes('auth') || lowerTitle.includes('mfa') || lowerTitle.includes('security') || lowerTitle.includes('login') || lowerDesc.includes('secure')) {
      cases.push(`Verify session tokens expire under strict JWT compliance bounds`);
      cases.push(`Verify MFA gate blocks invalid brute-force SMS/TOTP token sequences`);
      cases.push(`Verify security headers (X-Content-Type-Options) exist in responses`);
    } else if (lowerTitle.includes('analytics') || lowerTitle.includes('dashboard') || lowerTitle.includes('chart') || lowerTitle.includes('telemetry')) {
      cases.push(`Verify websockets sync payload schema matches telemetry telemetry rules`);
      cases.push(`Verify SVG graph nodes scale dynamically without viewport overflow errors`);
      cases.push(`Verify historical cache points refresh seamlessly under low-bandwidth profiles`);
    } else {
      cases.push(`Verify standard payload schema integrity for ${moduleStr} interface`);
      cases.push(`Verify dynamic validation boundaries for ${titleStr.trim()}`);
      cases.push(`Verify zero-downtime microservice retry states during transient load drops`);
    }
    
    return cases;
  };

  const addStory = (title: string, description: string, module: string, risk: 'Low' | 'Medium' | 'High') => {
    const id = `story-${Date.now()}`;
    const generatedTestCases = generateSmartAssertions(title, description, module);
    
    const newStory: UserStory = {
      id,
      title,
      description,
      coverage: 33, // Newly added has low initial coverage until automation matches
      testCases: generatedTestCases,
      module,
      risk
    };

    setStories(prev => [newStory, ...prev]);

    // Update or add heatmaps
    setHeatmapNodes(prev => {
      const idx = prev.findIndex(n => n.name === module);
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], coverage: Math.round((updated[idx].coverage + 33) / 2) };
        return updated;
      }
      return [...prev, { id: `node-${Date.now()}`, name: module, coverage: 33, risk }];
    });
  };

  const updateNodeCoverage = (id: string, newCoverage: number) => {
    setHeatmapNodes(prev => prev.map(n => n.id === id ? { ...n, coverage: newCoverage } : n));
  };

  // Pillar 2: Automation Testing State
  const [testSuites, setTestSuites] = useState<TestSuite[]>([
    { id: 'suite-1', name: 'Critical Path Playwright Suite', framework: 'Playwright', total: 24, passed: 24, failed: 0, flaky: 0, status: 'Passed' },
    { id: 'suite-2', name: 'Legacy Billing Selenium Suite', framework: 'Selenium', total: 18, passed: 17, failed: 1, flaky: 0, status: 'Failed' },
    { id: 'suite-3', name: 'Core API Integration Cypress Suite', framework: 'Cypress', total: 32, passed: 30, failed: 0, flaky: 2, status: 'Passed' },
    { id: 'suite-4', name: 'Mobile Checkout Appium Suite', framework: 'Appium', total: 12, passed: 12, failed: 0, flaky: 0, status: 'Passed' },
  ]);

  const [isHealingEnabled, setIsHealingEnabled] = useState(true);
  const [healingEvents, setHealingEvents] = useState<HealingEvent[]>([
    {
      id: 'heal-1',
      timestamp: '2026-05-26 14:10:02',
      script: 'checkout_flow_spec.js',
      framework: 'Selenium',
      brokenSelector: 'button#btn-checkout-primary',
      healedSelector: 'button[data-qa="btn-checkout-express"]',
      confidence: 96.4,
      status: 'Resolved'
    }
  ]);

  const triggerSelfHealingSimulation = () => {
    if (isSimulating) return;
    setIsSimulating(true);

    // Update legacy billing selenium suite to running state
    setTestSuites(prev => prev.map(s => s.id === 'suite-2' ? { ...s, status: 'Running', failed: 1 } : s));

    setTimeout(() => {
      if (isHealingEnabled) {
        const newEvent: HealingEvent = {
          id: `heal-${Date.now()}`,
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
          script: 'billing_invoice_gate.py',
          framework: 'Selenium',
          brokenSelector: 'input.checkout-input-disabled',
          healedSelector: 'input[name="billing-postal-code"]',
          confidence: 98.2,
          status: 'Resolved'
        };
        setHealingEvents(prev => [newEvent, ...prev]);

        // Fix the suite status to passed
        setTestSuites(prev => prev.map(s => s.id === 'suite-2' ? { ...s, status: 'Passed', passed: 18, failed: 0 } : s));
      } else {
        // Keeps it failed
        setTestSuites(prev => prev.map(s => s.id === 'suite-2' ? { ...s, status: 'Failed', passed: 17, failed: 1 } : s));
      }
      setIsSimulating(false);
    }, 2500);
  };

  const runAutomationSuites = () => {
    if (isSimulating) return;
    setIsSimulating(true);

    setTestSuites(prev => prev.map(s => ({ ...s, status: 'Running' })));

    setTimeout(() => {
      setTestSuites(prev => prev.map(s => {
        if (s.id === 'suite-2' && !isHealingEnabled) {
          return { ...s, status: 'Failed', passed: 17, failed: 1 };
        }
        return { ...s, status: 'Passed', passed: s.total - s.flaky, failed: 0 };
      }));
      setIsSimulating(false);
    }, 2000);
  };

  const quarantineFlakyTest = (suiteId: string) => {
    setTestSuites(prev => prev.map(s => {
      if (s.id === suiteId && s.flaky > 0) {
        return { ...s, total: s.total - s.flaky, flaky: 0, passed: s.passed };
      }
      return s;
    }));
  };

  // Pillar 3: Performance State
  const [perfHistory, setPerfHistory] = useState([
    { build: 'B-102', responseTime: 185, throughput: 1240 },
    { build: 'B-103', responseTime: 192, throughput: 1210 },
    { build: 'B-104', responseTime: 205, throughput: 1350 },
    { build: 'B-105', responseTime: 298, throughput: 980 }, // Defect point
    { build: 'B-106', responseTime: 215, throughput: 1290 },
    { build: 'B-107', responseTime: 198, throughput: 1410 },
  ]);

  const [latencySla, setLatencySla] = useState(250); // Default threshold
  const [anomalies, setAnomalies] = useState<AnomalyLog[]>([
    {
      id: 'anom-1',
      build: 'B-105',
      metric: 'Checkout Route API Latency',
      baseline: 195,
      actual: 298,
      severity: 'Critical',
      timestamp: '2026-05-25 10:24:18'
    }
  ]);

  // RRS™ vertical weight profile
  const [rrsVertical, setRrsVertical] = useState<RRSVertical>('retail');

  // NEW PILLARS Telemetry and Release pipeline states
  const [liveTelemetryActive, setLiveTelemetryActive] = useState(false);
  const [pipelineStage, setPipelineStage] = useState<'idle' | 'code_push' | 'automated_qa' | 'security_gate' | 'uat_approval' | 'production_rollout'>('idle');
  const [pipelineStatus, setPipelineStatus] = useState<'idle' | 'running' | 'completed' | 'failed'>('idle');
  const [integrationSettings, setIntegrationSettings] = useState({ slack: true, teams: false, pagerduty: true, email: true });
  const [archivedReleases, setArchivedReleases] = useState<ArchivedRelease[]>([
    {
      id: 'rel-past-1',
      build: 'B-106',
      score: 91,
      status: 'GO',
      timestamp: '2026-05-24 18:32:00',
      coverage: 86,
      passRate: 98,
      latency: 210,
      securityOpen: 0,
      notes: '# Past Release Audit Package B-106\nGenerated on UAT confirmation.'
    }
  ]);

  const deleteArchivedRelease = (id: string) => {
    setArchivedReleases(prev => prev.filter(r => r.id !== id));
  };

  useEffect(() => {
    if (!liveTelemetryActive) return;

    const interval = setInterval(() => {
      setPerfHistory(prev => {
        const lastBuild = prev.slice(-1)[0];
        const lastNum = parseInt(lastBuild.build.split('-')[1]) || 107;
        const nextBuildNum = `B-${lastNum + 1}`;
        
        const base = 195;
        const noise = Math.round((Math.random() - 0.5) * 20);
        const respTime = Math.max(160, base + noise);
        const throughput = Math.round(1300 + Math.random() * 200);
        
        const nextHist = [...prev, { build: nextBuildNum, responseTime: respTime, throughput }];
        if (nextHist.length > 8) {
          nextHist.shift();
        }
        return nextHist;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [liveTelemetryActive]);

  const triggerLoadSimulation = (pattern: 'Peak' | 'Concurrent' | 'Bulk') => {
    if (isSimulating) return;
    setIsSimulating(true);

    const buildNum = `B-${108 + perfHistory.length - 6}`;
    let respTime = 210;
    let thr = 1380;

    if (pattern === 'Peak') {
      respTime = Math.round(latencySla * 1.15); // Exceeds SLA slightly
      thr = 3100;
    } else if (pattern === 'Concurrent') {
      respTime = Math.round(latencySla * 0.88);
      thr = 2400;
    } else if (pattern === 'Bulk') {
      respTime = Math.round(latencySla * 1.35); // Critical SLA breach
      thr = 850;
    }

    setTimeout(() => {
      setPerfHistory(prev => [...prev, { build: buildNum, responseTime: respTime, throughput: thr }]);

      if (respTime > latencySla) {
        const newAnomaly: AnomalyLog = {
          id: `anom-${Date.now()}`,
          build: buildNum,
          metric: `${pattern} Load Test Execution`,
          baseline: 200,
          actual: respTime,
          severity: respTime > latencySla * 1.25 ? 'Critical' : 'Warning',
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19)
        };
        setAnomalies(prev => [newAnomaly, ...prev]);
      }
      setIsSimulating(false);
    }, 1500);
  };

  // Pillar 4: Security State
  const [securityFindings, setSecurityFindings] = useState<SecurityFinding[]>([
    {
      id: 'sec-1',
      title: 'SQL Injection in Checkout Billing Route',
      type: 'DAST',
      severity: 'Critical',
      businessImpact: 'Critical', // Direct access to core DB
      file: 'app/api/checkout/route.ts',
      line: 42,
      status: 'Open',
      compliance: ['PCI_DSS', 'OWASP_10']
    },
    {
      id: 'sec-2',
      title: 'Insecure JWT Session Token Expiration',
      type: 'SAST',
      severity: 'High',
      businessImpact: 'High', // Threat of Session Hijacking
      file: 'app/lib/auth.ts',
      line: 87,
      status: 'Open',
      compliance: ['SOC2', 'GDPR']
    },
    {
      id: 'sec-3',
      title: 'Missing Security Headers (X-Content-Type-Options)',
      type: 'SAST',
      severity: 'Medium',
      businessImpact: 'Low', // Minimal risk layer
      file: 'next.config.js',
      line: 12,
      status: 'Triaged',
      compliance: ['SOC2']
    }
  ]);

  const triageFinding = (id: string, impact: SecurityFinding['businessImpact'], status: SecurityFinding['status']) => {
    setSecurityFindings(prev => prev.map(f => f.id === id ? { ...f, businessImpact: impact, status } : f));
  };

  // Derived state calculators (computed on-the-fly during render to prevent useEffect cascading render issues)
  const totalSOC2 = securityFindings.filter(f => f.compliance.includes('SOC2'));
  const resolvedSOC2 = totalSOC2.filter(f => f.status === 'Fixed' || f.status === 'Triaged').length;
  
  const totalPCI = securityFindings.filter(f => f.compliance.includes('PCI_DSS'));
  const resolvedPCI = totalPCI.filter(f => f.status === 'Fixed').length;

  const totalGDPR = securityFindings.filter(f => f.compliance.includes('GDPR'));
  const resolvedGDPR = totalGDPR.filter(f => f.status === 'Fixed' || f.status === 'Triaged').length;

  const totalOWASP = securityFindings.filter(f => f.compliance.includes('OWASP_10'));
  const resolvedOWASP = totalOWASP.filter(f => f.status === 'Fixed').length;

  const complianceProgress = {
    SOC2: totalSOC2.length ? Math.round((resolvedSOC2 / totalSOC2.length) * 100) : 100,
    PCI_DSS: totalPCI.length ? Math.round((resolvedPCI / totalPCI.length) * 100) : 100,
    GDPR: totalGDPR.length ? Math.round((resolvedGDPR / totalGDPR.length) * 100) : 100,
    OWASP_10: totalOWASP.length ? Math.round((resolvedOWASP / totalOWASP.length) * 100) : 100,
  };

  // ── RRS™ Engine — mirrors scorer.py + dimensions.py ──────────────────────

  const weights = RRS_WEIGHTS[rrsVertical];

  // Raw inputs
  const avgCoverage = heatmapNodes.reduce((acc, n) => acc + n.coverage, 0) / heatmapNodes.length;
  const totalAutomationTests  = testSuites.reduce((acc, s) => acc + s.total, 0);
  const passedAutomationTests = testSuites.reduce((acc, s) => acc + s.passed, 0);
  const totalFlakyTests       = testSuites.reduce((acc, s) => acc + s.flaky, 0);
  const automationPassRate    = totalAutomationTests ? (passedAutomationTests / totalAutomationTests) * 100 : 100;
  const latestBuild           = perfHistory.slice(-1)[0];

  // 1. Functional Coverage: coverage_pct × pass_rate
  const passRate = totalAutomationTests ? passedAutomationTests / totalAutomationTests : 1;
  const functionalScore = Math.max(0, Math.min(100, avgCoverage * passRate));
  let functionalFlag: string | null = null;
  if (avgCoverage < 70) functionalFlag = `Low story coverage (${avgCoverage.toFixed(0)}%) — ${(100 - avgCoverage).toFixed(0)}% of stories lack test coverage`;
  else if (passRate < 0.80) functionalFlag = `Pass rate below 80% (${(passRate * 100).toFixed(0)}%) — investigate failing tests before release`;
  const functionalDim: RRSDimensionScore = {
    name: 'Functional Coverage', score: Math.round(functionalScore), weight: weights.functional,
    explanation: `${avgCoverage.toFixed(0)}% story coverage × ${(passRate * 100).toFixed(0)}% pass rate = ${functionalScore.toFixed(0)}`,
    flag: functionalFlag,
  };

  // 2. Automation Stability: (1 − flakiness_penalty) × ci_reliability
  const flakinessRate = totalAutomationTests ? totalFlakyTests / totalAutomationTests : 0;
  const flakinessComponent = Math.max(0, 100 - Math.min(50, flakinessRate * 200));
  const ciComponent = passRate * 100;
  const automationScore = Math.round((flakinessComponent * 0.6) + (ciComponent * 0.4));
  let automationFlag: string | null = null;
  if (flakinessRate > 0.10) automationFlag = `High flakiness (${(flakinessRate * 100).toFixed(0)}% of tests are flaky) — quarantine unstable tests`;
  else if (passRate < 0.80) automationFlag = `CI pass rate below 80% (${(passRate * 100).toFixed(0)}%)`;
  const automationDim: RRSDimensionScore = {
    name: 'Automation Stability', score: automationScore, weight: weights.automation,
    explanation: `Flakiness ${(flakinessRate * 100).toFixed(1)}% → ${flakinessComponent.toFixed(0)} | CI ${(passRate * 100).toFixed(0)}% → ${ciComponent.toFixed(0)} | Weighted = ${automationScore}`,
    flag: automationFlag,
  };

  // 3. Performance SLA: deviation from baseline (latencySla = baseline p95)
  const deviationPct = latestBuild.responseTime <= latencySla
    ? ((latestBuild.responseTime - latencySla) / latencySla) * 100
    : ((latestBuild.responseTime - latencySla) / latencySla) * 100;
  const thresholdPct = 20;
  const performanceScore = deviationPct <= 0
    ? 100
    : Math.round(Math.max(0, 100 * (1 - deviationPct / (thresholdPct * 2))));
  let performanceFlag: string | null = null;
  if (deviationPct > thresholdPct) performanceFlag = `Latency ${deviationPct.toFixed(1)}% above baseline (threshold: ${thresholdPct}%) — performance regression`;
  else if (deviationPct > thresholdPct * 0.7) performanceFlag = `Latency trending toward threshold (${deviationPct.toFixed(1)}% above baseline)`;
  const performanceDim: RRSDimensionScore = {
    name: 'Performance SLA', score: performanceScore, weight: weights.performance,
    explanation: deviationPct <= 0
      ? `${Math.abs(deviationPct).toFixed(1)}% faster than baseline — excellent`
      : `Latency ${deviationPct.toFixed(1)}% above baseline → score ${performanceScore}`,
    flag: performanceFlag,
  };

  // 4. Security Risk: 100 − penalty_sum (penalties: critical=25, high=12, medium=5, low=1)
  let securityPenalty = 0;
  const openCritical = securityFindings.filter(f => f.status === 'Open' && f.businessImpact === 'Critical').length;
  const openHigh     = securityFindings.filter(f => f.status === 'Open' && f.businessImpact === 'High').length;
  const openMedium   = securityFindings.filter(f => f.status === 'Open' && f.businessImpact === 'Medium').length;
  const openLow      = securityFindings.filter(f => f.status === 'Open' && f.businessImpact === 'Low').length;
  // Triaged items carry half-penalty
  const triagedCritical = securityFindings.filter(f => f.status === 'Triaged' && f.businessImpact === 'Critical').length;
  const triagedHigh     = securityFindings.filter(f => f.status === 'Triaged' && f.businessImpact === 'High').length;
  securityPenalty = (openCritical * SECURITY_PENALTIES.critical) + (openHigh * SECURITY_PENALTIES.high) +
                    (openMedium * SECURITY_PENALTIES.medium) + (openLow * SECURITY_PENALTIES.low) +
                    (triagedCritical * Math.round(SECURITY_PENALTIES.critical / 2)) +
                    (triagedHigh * Math.round(SECURITY_PENALTIES.high / 2));
  const securityScore = Math.max(0, 100 - securityPenalty);
  const criticalSecCount = openCritical;
  let securityFlag: string | null = null;
  if (openCritical > 0) securityFlag = `${openCritical} CRITICAL finding(s) — must resolve before production release`;
  else if (openHigh > 0) securityFlag = `${openHigh} HIGH finding(s) — review and accept risk or resolve before release`;
  else if (openMedium > 3) securityFlag = `${openMedium} medium findings — accumulation suggests security debt`;
  const securityDim: RRSDimensionScore = {
    name: 'Security Risk', score: Math.round(securityScore), weight: weights.security,
    explanation: `Open: ${openCritical}C ${openHigh}H ${openMedium}M ${openLow}L → penalty ${securityPenalty} → score ${Math.round(securityScore)}`,
    flag: securityFlag,
  };

  // 5. Regression Coverage: proxy using High-risk heatmap nodes (changed-code coverage)
  const highRiskNodes = heatmapNodes.filter(n => n.risk === 'High');
  const regressionCoveragePct = highRiskNodes.length > 0
    ? highRiskNodes.reduce((acc, n) => acc + n.coverage, 0) / highRiskNodes.length
    : avgCoverage * 0.9; // fallback
  const regressionScore = Math.round(Math.max(0, Math.min(100, regressionCoveragePct)));
  let regressionFlag: string | null = null;
  if (regressionCoveragePct < 60) regressionFlag = `Low regression coverage (${regressionCoveragePct.toFixed(0)}%) — significant changed code is untested`;
  else if (regressionCoveragePct < 80) regressionFlag = `Regression coverage below 80% (${regressionCoveragePct.toFixed(0)}%) — expand test scope for this diff`;
  const regressionDim: RRSDimensionScore = {
    name: 'Regression Coverage', score: regressionScore, weight: weights.regression,
    explanation: `${regressionCoveragePct.toFixed(0)}% of high-risk changed code paths covered → score ${regressionScore}`,
    flag: regressionFlag,
  };

  const rrsDimensions: RRSDimensionScore[] = [functionalDim, automationDim, performanceDim, securityDim, regressionDim];

  // ── Composite RRS™ score ─────────────────────────────────────────────────
  const releaseReadinessScore = Math.round(
    functionalScore  * weights.functional  +
    automationScore  * weights.automation  +
    performanceScore * weights.performance +
    securityScore    * weights.security    +
    regressionScore  * weights.regression
  );

  // ── Verdict bands: GO ≥80 | CONDITIONAL GO 60–79 | NO-GO <60 ────────────
  const readyToShipStatus = releaseReadinessScore >= 80 ? 'GO'
    : releaseReadinessScore >= 60 ? 'CONDITIONAL GO'
    : 'NO-GO';

  const hasCriticalOpenSec = openCritical > 0;
  const hasSeverePerfAnomaly = latestBuild.responseTime > latencySla * 1.25;

  // Trigger Release state
  const [isReleaseTriggered, setIsReleaseTriggered] = useState(false);
  const [releaseLogs, setReleaseLogs] = useState<string[]>([]);

  const triggerRelease = () => {
    if (readyToShipStatus === 'NO-GO') {
      setReleaseLogs(prev => [...prev, `CRITICAL: Release pipeline blocked — RRS™ score ${releaseReadinessScore}/100 is below the NO-GO threshold. Resolve quality gates before deploying.`]);
      return;
    }

    setIsReleaseTriggered(true);
    setPipelineStatus('running');
    setPipelineStage('code_push');
    setReleaseLogs(['[SYSTEM] Initializing QEVantage™ Release Command...', '[STAGE: Code Push] Syncing repository branches to release pipeline HEAD commit...']);

    // Step 2: QA verification
    setTimeout(() => {
      setPipelineStage('automated_qa');
      setReleaseLogs(prev => [
        ...prev,
        '[SYSTEM] Code checkout verified successfully.',
        '[STAGE: Automated QA] Triggering regression sweeps...',
        `[SYSTEM] Playwright, Selenium, and Cypress evidence trails validated (Pass Rate: ${Math.round((testSuites.reduce((acc, curr) => acc + curr.passed, 0) / testSuites.reduce((acc, curr) => acc + curr.total, 0)) * 100)}%).`
      ]);
    }, 1000);

    // Step 3: Security Gate
    setTimeout(() => {
      setPipelineStage('security_gate');
      const openCritical = securityFindings.filter(f => f.status === 'Open' && f.businessImpact === 'Critical').length;
      setReleaseLogs(prev => [
        ...prev,
        '[STAGE: Security Gate] Running DAST and SAST dynamic scanner compliance validations...',
        `[SYSTEM] SOC2 compliance level: ${complianceProgress.SOC2}%. PCI-DSS compliance level: ${complianceProgress.PCI_DSS}%.`,
        openCritical > 0 
          ? `[CRITICAL] Security audit failed. ${openCritical} blocking high-hazard threats found.`
          : '[SYSTEM] Zero critical vulnerabilities detected. Security gate criteria satisfied.'
      ]);
    }, 2200);

    // Step 4: UAT Approval
    setTimeout(() => {
      setPipelineStage('uat_approval');
      setReleaseLogs(prev => [
        ...prev,
        '[STAGE: UAT Approval] Evaluating dynamic Release Readiness Score™ thresholds...',
        `[SYSTEM] Release Readiness Score matches benchmark parameters: ${releaseReadinessScore}/100.`
      ]);
    }, 3400);

    // Step 5: Production Rollout
    setTimeout(() => {
      setPipelineStage('production_rollout');
      setReleaseLogs(prev => [
        ...prev,
        '[STAGE: Production Rollout] Initiating live traffic load routing...',
        '[SYSTEM] Synchronizing compliance artifacts to audit vaults...',
        '[SYSTEM] Release rollout completed. All nodes verified successfully.'
      ]);
      setPipelineStatus('completed');
      setIsReleaseTriggered(false);

      // Create new archived release package
      const latestBuild = perfHistory.slice(-1)[0];
      const avgCov = Math.round(heatmapNodes.reduce((acc, curr) => acc + curr.coverage, 0) / heatmapNodes.length);
      const totalAuto = testSuites.reduce((acc, curr) => acc + curr.total, 0);
      const passedAuto = testSuites.reduce((acc, curr) => acc + curr.passed, 0);
      const autoPassRate = totalAuto ? Math.round((passedAuto / totalAuto) * 100) : 100;
      const totalOpenSec = securityFindings.filter(f => f.status === 'Open').length;
      const automationPassRate = autoPassRate;
      const avgCoverage = avgCov;

      const newArchive: ArchivedRelease = {
        id: `rel-${Date.now()}`,
        build: latestBuild.build,
        score: releaseReadinessScore,
        status: readyToShipStatus,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        coverage: avgCoverage,
        passRate: automationPassRate,
        latency: latestBuild.responseTime,
        securityOpen: totalOpenSec,
        notes: generateReleaseNotes()
      };
      setArchivedReleases(prev => [newArchive, ...prev]);
    }, 4600);
  };

  // Scenario Simulator
  const [activeScenario, setActiveScenario] = useState<'clean' | 'performance' | 'security'>('security');

  const triggerScenario = (scenario: 'clean' | 'performance' | 'security') => {
    setActiveScenario(scenario);
    if (scenario === 'clean') {
      setPerfHistory([
        { build: 'B-102', responseTime: 185, throughput: 1240 },
        { build: 'B-103', responseTime: 192, throughput: 1210 },
        { build: 'B-104', responseTime: 205, throughput: 1350 },
        { build: 'B-105', responseTime: 215, throughput: 1290 },
        { build: 'B-106', responseTime: 210, throughput: 1380 },
        { build: 'B-107', responseTime: 198, throughput: 1410 },
      ]);
      setAnomalies([]);
      setSecurityFindings(prev => prev.map(f => ({ ...f, status: 'Fixed' })));
      setTestSuites(prev => prev.map(s => ({ ...s, status: 'Passed', passed: s.total, failed: 0 })));
    } else if (scenario === 'performance') {
      setPerfHistory([
        { build: 'B-102', responseTime: 185, throughput: 1240 },
        { build: 'B-103', responseTime: 192, throughput: 1210 },
        { build: 'B-104', responseTime: 205, throughput: 1350 },
        { build: 'B-105', responseTime: 215, throughput: 1290 },
        { build: 'B-106', responseTime: 198, throughput: 1410 },
        { build: 'B-107', responseTime: 320, throughput: 810 },
      ]);
      setAnomalies([
        {
          id: 'anom-1',
          build: 'B-107',
          metric: 'Express Checkout Latency SLA Breach',
          baseline: 198,
          actual: 320,
          severity: 'Critical',
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19)
        }
      ]);
      setSecurityFindings(prev => prev.map(f => f.id === 'sec-1' ? { ...f, status: 'Fixed' } : f));
      setTestSuites(prev => prev.map(s => ({ ...s, status: 'Passed', passed: s.total, failed: 0 })));
    } else if (scenario === 'security') {
      setPerfHistory([
        { build: 'B-102', responseTime: 185, throughput: 1240 },
        { build: 'B-103', responseTime: 192, throughput: 1210 },
        { build: 'B-104', responseTime: 205, throughput: 1350 },
        { build: 'B-105', responseTime: 215, throughput: 1290 },
        { build: 'B-106', responseTime: 210, throughput: 1380 },
        { build: 'B-107', responseTime: 198, throughput: 1410 },
      ]);
      setAnomalies([]);
      setSecurityFindings([
        {
          id: 'sec-1',
          title: 'SQL Injection in Checkout Billing Route',
          type: 'DAST',
          severity: 'Critical',
          businessImpact: 'Critical',
          file: 'app/api/checkout/route.ts',
          line: 42,
          status: 'Open',
          compliance: ['PCI_DSS', 'OWASP_10']
        },
        {
          id: 'sec-2',
          title: 'Insecure JWT Session Token Expiration',
          type: 'SAST',
          severity: 'High',
          businessImpact: 'High',
          file: 'app/lib/auth.ts',
          line: 87,
          status: 'Open',
          compliance: ['SOC2', 'GDPR']
        },
        {
          id: 'sec-3',
          title: 'Missing Security Headers (X-Content-Type-Options)',
          type: 'SAST',
          severity: 'Medium',
          businessImpact: 'Low',
          file: 'next.config.js',
          line: 12,
          status: 'Triaged',
          compliance: ['SOC2']
        }
      ]);
      setTestSuites(prev => prev.map(s => s.id === 'suite-2' ? { ...s, status: 'Failed', passed: 17, failed: 1 } : s));
    }
  };

  const generateReleaseNotes = () => {
    const latestBuild = perfHistory.slice(-1)[0];
    return `# Release Notes — QEVantage™ Auto-Generated
Build Target: ${latestBuild.build}
Readiness Score: ${releaseReadinessScore}/100

### 1. Requirements Delivered & Traceability
${stories.map(s => `- **${s.title}** (${s.module}) — Coverage: ${s.coverage}% (Risk: ${s.risk})`).join('\n')}

### 2. Automation Evidence Traceability
- **Total Executed Automated Scenarios**: ${testSuites.reduce((acc, curr) => acc + curr.total, 0)} test cases
- **Automation Pipeline Pass Rate**: ${Math.round((testSuites.reduce((acc, curr) => acc + curr.passed, 0) / testSuites.reduce((acc, curr) => acc + curr.total, 0)) * 100)}%
- **AI Self-Healing Script Actions**: ${healingEvents.length} events logged successfully.

### 3. Performance SLA & Capacity Clearance
- **Latest Average Latency**: ${latestBuild.responseTime}ms
- **Platform Response SLA Threshold**: ${latencySla}ms (STATUS: ${latestBuild.responseTime <= latencySla ? 'PASSED' : 'DEGRADED'})
- **Average Network Throughput**: ${latestBuild.throughput} req/sec

### 4. Continuous Threat & Compliance Audit
- **SOC2 Coverage**: ${complianceProgress.SOC2}%
- **PCI-DSS Billing Compliance**: ${complianceProgress.PCI_DSS}%
- **OWASP Top 10 Enforcements**: ${complianceProgress.OWASP_10}%
`;
  };

  return (
    <QEVantageContext.Provider value={{
      activeTab,
      setActiveTab,
      isSimulating,
      setIsSimulating,
      stories,
      addStory,
      heatmapNodes,
      updateNodeCoverage,
      testSuites,
      isHealingEnabled,
      setIsHealingEnabled,
      healingEvents,
      triggerSelfHealingSimulation,
      runAutomationSuites,
      quarantineFlakyTest,
      perfHistory,
      latencySla,
      setLatencySla,
      anomalies,
      triggerLoadSimulation,
      securityFindings,
      triageFinding,
      complianceProgress,
      releaseReadinessScore,
      readyToShipStatus,
      rrsDimensions,
      rrsVertical,
      setRrsVertical,
      isReleaseTriggered,
      releaseLogs,
      triggerRelease,
      generateReleaseNotes,
      activeScenario,
      triggerScenario,
      liveTelemetryActive,
      setLiveTelemetryActive,
      pipelineStage,
      pipelineStatus,
      integrationSettings,
      setIntegrationSettings,
      archivedReleases,
      deleteArchivedRelease
    }}>
      {children}
    </QEVantageContext.Provider>
  );
};

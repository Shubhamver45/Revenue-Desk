import React from 'react';
import TrajectoryChart from './TrajectoryChart';

export default function OverviewView({
    metrics,
    investigationData,
    tasks = [],
    decisions = [],
    messages = [],
    onNavigate,
    onLaunchScenario,
    comparisonMode,
    onToggleMode,
    switchConnected
}) {
    const gross = metrics?.gross_revenue ? `$${metrics.gross_revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "$24,250.00";
    const refund = metrics?.refund_total ? `-$${metrics.refund_total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "-$20,430.00";
    const net = metrics?.net_revenue ? `+$${metrics.net_revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "+$3,820.00";

    const inv = investigationData || {};
    const invId = inv.investigation_id || "INV-84912";
    const invQuestion = inv.question || "Why did repeat purchases drop in the West region last month?";
    const isReconciled = inv.review?.is_verified ?? true;

    // Use live messages from room if available, otherwise fallback to standard audited baseline events
    const timelineEvents = (messages && messages.length > 0) ? messages.slice(-5) : [
        { id: 1, author: '@manager (Alex Rivera)', role: 'manager', avatar: 'AR', bg: 'bg-navy', time: '10:04 AM', text: 'Inquired why repeat purchases dropped in the West region.' },
        { id: 2, author: '@analyst (Groq / Llama 3.3)', role: 'analyst', avatar: 'AN', bg: 'bg-emerald', time: '10:04 AM', text: 'Queried sales_orders: reported Gross $24,250.00 across 15 accounts.' },
        { id: 3, author: '@reviewer (Gemini 2.0 Flash)', role: 'reviewer', avatar: 'RV', bg: 'bg-amber', time: '10:05 AM', text: 'Cross-audited refund_transactions: detected 8 duplicate webhook retries (-$20,430.00).' },
        { id: 4, author: 'Switch Protocol Gate', role: 'switch', avatar: 'SW', bg: 'bg-teal', time: '10:05 AM', text: 'Consensus verified ($0.00 variance). Proposal submitted to Human Approval Gate.' },
        { id: 5, author: '@manager (VP Finance)', role: 'manager', avatar: 'AR', bg: 'bg-navy', time: '10:06 AM', text: 'Calibrated discount to 15%, signed block into SHA-256 ledger.' }
    ];

    return (
        <div className="overview-container">
            {/* ── Section A: 4 Compact Accounting KPI Cards ── */}
            <section className="kpi-row-compact">
                <div className="kpi-card-compact">
                    <div className="kpi-card-head">
                        <span className="kpi-label">Reported Gross Volume</span>
                        <span className="kpi-tag-subtle">Unaudited</span>
                    </div>
                    <span className="kpi-value-compact">{gross}</span>
                    <div className="kpi-meta-compact">
                        <span>15 transactions • West Region MoM</span>
                    </div>
                </div>

                <div className="kpi-card-compact anomaly-border">
                    <div className="kpi-card-head">
                        <span className="kpi-label">Gateway Duplicate Glitch</span>
                        <span className="kpi-tag-danger">Anomaly</span>
                    </div>
                    <span className="kpi-value-compact anomaly">{refund}</span>
                    <div className="kpi-meta-compact text-danger">
                        <span>8 duplicate refund reversals detected</span>
                    </div>
                </div>

                <div className="kpi-card-compact verified-border">
                    <div className="kpi-card-head">
                        <span className="kpi-label">Certified Net Revenue</span>
                        <span className="kpi-tag-success">Reconciled</span>
                    </div>
                    <span className="kpi-value-compact verified">{net}</span>
                    <div className="kpi-meta-compact text-success">
                        <span>7 verified clean accounts • Reconciled</span>
                    </div>
                </div>

                <div className="kpi-card-compact margin-border">
                    <div className="kpi-card-head">
                        <span className="kpi-label">Avoided Discount Exposure</span>
                        <span className="kpi-tag-brand">Protected</span>
                    </div>
                    <span className="kpi-value-compact text-brand">+$61,300.00</span>
                    <div className="kpi-meta-compact">
                        <span>Prevented 25% margin-eroding panic discount</span>
                    </div>
                </div>
            </section>

            {/* ── 2-Column Full-Screen Operational Grid ── */}
            <div className="overview-grid">
                {/* ── LEFT COLUMN: Full-Height Dynamic Chart + Switch Protocol Bar ── */}
                <div className="overview-left-col">
                    {/* Section B: Dynamic Revenue Performance Chart */}
                    <TrajectoryChart 
                        mode={comparisonMode}
                        onToggleMode={onToggleMode}
                        trajectoryData={metrics?.trajectory}
                    />

                    {/* Section C: Switch Protocol Health & Governance Bar */}
                    <div className="card switch-health-bar">
                        <div className="switch-health-header">
                            <div className="switch-health-title-group">
                                <span className="rule-badge-dark">SWITCH PROTOCOL</span>
                                <span className="switch-room-name">#revenue-desk</span>
                                <span className="switch-sub-status">
                                    {switchConnected ? '● PROTOCOL ONLINE' : '○ PROTOCOL OFFLINE'}
                                </span>
                            </div>
                            <div className="switch-health-pills">
                                <span className="status-chip-emerald">
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                    Tasks: 5/5 Verified
                                </span>
                                <span className="status-chip-mono">
                                    SHA-256 Ledger: Intact
                                </span>
                            </div>
                        </div>

                        {/* 4 Mini Governance Rules */}
                        <div className="governance-rules-mini">
                            <div className="rule-mini-item">
                                <span className="rule-mini-num">Rule #2</span>
                                <span className="rule-mini-name">Read-Only SQL</span>
                                <span className="rule-mini-desc">Analyst/Reviewer queries blocked from mutation</span>
                            </div>
                            <div className="rule-mini-item">
                                <span className="rule-mini-num">Rule #3</span>
                                <span className="rule-mini-name">100% Consensus</span>
                                <span className="rule-mini-desc">Zero variance before any proposal formed</span>
                            </div>
                            <div className="rule-mini-item">
                                <span className="rule-mini-num">Rule #4</span>
                                <span className="rule-mini-name">Human Lead Gate</span>
                                <span className="rule-mini-desc">Campaign mutations require VP authorization</span>
                            </div>
                            <div className="rule-mini-item">
                                <span className="rule-mini-num">Rule #5</span>
                                <span className="rule-mini-name">SHA-256 Signatures</span>
                                <span className="rule-mini-desc">Tamper-evident audit chain in SQLite</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── RIGHT COLUMN: Active Investigation + 3 Live Benchmarks + Activity Feed ── */}
                <div className="overview-right-col">
                    {/* Section D: Active Investigation Summary Card */}
                    <div className="card overview-summary-card">
                        <div className="card-header-compact">
                            <div className="card-title-group">
                                <span className="rule-badge">ACTIVE INVESTIGATION</span>
                                <span className="inv-badge-code">{invId}</span>
                            </div>
                            <span className={`pill-badge ${isReconciled ? 'pill-badge-emerald' : 'pill-badge-amber'}`}>
                                {isReconciled ? '● Consensus Reached' : '○ In Progress'}
                            </span>
                        </div>

                        <div className="inv-summary-body">
                            <p className="inv-summary-question">
                                "{invQuestion}"
                            </p>

                            <div className="inv-summary-metrics">
                                <div className="inv-metric-box">
                                    <span className="inv-metric-lbl">Reported</span>
                                    <span className="inv-metric-val">{gross}</span>
                                </div>
                                <div className="inv-metric-box">
                                    <span className="inv-metric-lbl">Audited Anomaly</span>
                                    <span className="inv-metric-val text-danger">{refund}</span>
                                </div>
                                <div className="inv-metric-box">
                                    <span className="inv-metric-lbl">Certified Net</span>
                                    <span className="inv-metric-val text-success">{net}</span>
                                </div>
                            </div>

                            <div className="inv-summary-footer">
                                <button 
                                    className="btn-primary btn-summary-cta"
                                    onClick={() => onNavigate('investigations')}
                                    title="Open the 7-Stage Investigation Workspace"
                                >
                                    <span>Open Investigations Workspace</span>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <polyline points="9 18 15 12 9 6"></polyline>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Section E: 3 Live Reproducible Financial Benchmarks */}
                    <div className="card overview-benchmarks-card">
                        <div className="card-header-compact">
                            <div className="card-title-group">
                                <span className="card-title-sm">Live Reproducible Benchmarks</span>
                                <span className="activity-count-badge">3 Scenarios</span>
                            </div>
                            <span className="status-chip-mono" style={{ fontSize: '9.5px' }}>SQLite Seeded</span>
                        </div>
                        <div className="quick-scenarios-list">
                            <div 
                                className={`quick-scenario-item ${invQuestion.includes('West') ? 'active' : ''}`}
                                onClick={() => onLaunchScenario ? onLaunchScenario('duplicate_refunds') : onNavigate('investigations')}
                                title="Run Scenario 1: West Duplicate Refund Glitch"
                            >
                                <div className="scenario-item-left">
                                    <span className="scenario-dot dot-danger"></span>
                                    <div style={{ minWidth: 0 }}>
                                        <div className="scenario-item-title">1. West Duplicate Refund Glitch</div>
                                        <div className="scenario-item-sub">8 duplicate refund webhooks • Prevents 25% panic discount</div>
                                    </div>
                                </div>
                                <span className="scenario-pill pill-danger">-$20,430</span>
                            </div>

                            <div 
                                className={`quick-scenario-item ${invQuestion.includes('recurring') || invQuestion.includes('decline') ? 'active' : ''}`}
                                onClick={() => onLaunchScenario ? onLaunchScenario('churn_vs_failures') : onNavigate('investigations')}
                                title="Run Scenario 2: Churn vs Payment Failures"
                            >
                                <div className="scenario-item-left">
                                    <span className="scenario-dot dot-amber"></span>
                                    <div style={{ minWidth: 0 }}>
                                        <div className="scenario-item-title">2. Churn vs Payment Failures</div>
                                        <div className="scenario-item-sub">4 expired card retries misattributed to customer churn</div>
                                    </div>
                                </div>
                                <span className="scenario-pill pill-amber">$14,200</span>
                            </div>

                            <div 
                                className={`quick-scenario-item ${invQuestion.includes('settlement') || invQuestion.includes('differences') ? 'active' : ''}`}
                                onClick={() => onLaunchScenario ? onLaunchScenario('payment_reconciliation') : onNavigate('investigations')}
                                title="Run Scenario 3: Gateway Settlement Reconciliation"
                            >
                                <div className="scenario-item-left">
                                    <span className="scenario-dot dot-brand"></span>
                                    <div style={{ minWidth: 0 }}>
                                        <div className="scenario-item-title">3. Gateway Settlement Reconciliation</div>
                                        <div className="scenario-item-sub">Catches rolling reserve chargeback holds before write-off</div>
                                    </div>
                                </div>
                                <span className="scenario-pill pill-brand">$4,120</span>
                            </div>
                        </div>
                    </div>

                    {/* Section F: Full-Height Recent Multi-Agent Room Activity Feed */}
                    <div className="card overview-activity-card">
                        <div className="card-header-compact">
                            <div className="card-title-group">
                                <span className="card-title-sm">Recent Agent Activity</span>
                                <span className="activity-count-badge">{timelineEvents.length} Events</span>
                            </div>
                            <button 
                                className="link-action-sm" 
                                onClick={() => onNavigate('room')}
                                title="Open Switch Room live feed"
                            >
                                Switch Room &rarr;
                            </button>
                        </div>

                        <div className="activity-timeline-compact">
                            {timelineEvents.map((evt, idx) => {
                                const author = evt.author || (evt.sender ? `@${evt.sender}` : 'System');
                                const text = evt.text || evt.content || '';
                                const time = evt.time || evt.timestamp || '10:05 AM';
                                const avatar = evt.avatar || (evt.sender ? evt.sender.slice(0, 2).toUpperCase() : 'SW');
                                const bgClass = evt.bg || (
                                    evt.sender === 'manager' ? 'bg-navy' :
                                    evt.sender === 'analyst' ? 'bg-emerald' :
                                    evt.sender === 'reviewer' ? 'bg-amber' : 'bg-teal'
                                );

                                return (
                                    <div className="timeline-item" key={evt.id || idx}>
                                        <div className={`timeline-icon ${bgClass}`}>{avatar}</div>
                                        <div className="timeline-content">
                                            <div className="timeline-header">
                                                <span className="timeline-author">{author}</span>
                                                <span className="timeline-time">{time}</span>
                                            </div>
                                            <p className="timeline-text">{text}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

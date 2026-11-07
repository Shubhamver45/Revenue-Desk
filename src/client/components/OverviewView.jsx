import React from 'react';
import TrajectoryChart from './TrajectoryChart';

export default function OverviewView({
    metrics,
    investigationData,
    tasks = [],
    decisions = [],
    onNavigate,
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
    const hasPendingApproval = inv.proposal && !inv.approval_record;

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

            {/* ── 2-Column Responsive Workspace: Fit for 1440 × 900 ── */}
            <div className="overview-grid">
                {/* ── LEFT COLUMN: Compact Chart + Switch Protocol Health Bar ── */}
                <div className="overview-left-col">
                    {/* Section B: Compact Revenue Performance Chart */}
                    <TrajectoryChart 
                        mode={comparisonMode}
                        onToggleMode={onToggleMode}
                        trajectoryData={metrics?.trajectory}
                    />

                    {/* Section E: Compact Switch Protocol Health & Governance Bar */}
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

                {/* ── RIGHT COLUMN: Investigation Summary + Recent Activity Feed ── */}
                <div className="overview-right-col">
                    {/* Section C: Investigation Summary Card */}
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

                    {/* Section D: Recent Multi-Agent Room Activity Feed */}
                    <div className="card overview-activity-card">
                        <div className="card-header-compact">
                            <div className="card-title-group">
                                <span className="card-title-sm">Recent Agent Activity</span>
                                <span className="activity-count-badge">5 Events</span>
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
                            <div className="timeline-item">
                                <div className="timeline-icon bg-navy">AR</div>
                                <div className="timeline-content">
                                    <div className="timeline-header">
                                        <span className="timeline-author">@manager (Alex Rivera)</span>
                                        <span className="timeline-time">10:04 AM</span>
                                    </div>
                                    <p className="timeline-text">Inquired why repeat purchases dropped in the West region.</p>
                                </div>
                            </div>

                            <div className="timeline-item">
                                <div className="timeline-icon bg-emerald">AN</div>
                                <div className="timeline-content">
                                    <div className="timeline-header">
                                        <span className="timeline-author">@analyst (Groq / Llama 3.3)</span>
                                        <span className="timeline-time">10:04 AM</span>
                                    </div>
                                    <p className="timeline-text">Queried <code>sales_orders</code>: reported Gross $24,250.00 across 15 accounts.</p>
                                </div>
                            </div>

                            <div className="timeline-item">
                                <div className="timeline-icon bg-amber">RV</div>
                                <div className="timeline-content">
                                    <div className="timeline-header">
                                        <span className="timeline-author">@reviewer (Gemini 2.0 Flash)</span>
                                        <span className="timeline-time">10:05 AM</span>
                                    </div>
                                    <p className="timeline-text">Cross-audited <code>refund_transactions</code>: detected 8 duplicate webhook retries (-$20,430.00).</p>
                                </div>
                            </div>

                            <div className="timeline-item">
                                <div className="timeline-icon bg-teal">SW</div>
                                <div className="timeline-content">
                                    <div className="timeline-header">
                                        <span className="timeline-author">Switch Protocol Gate</span>
                                        <span className="timeline-time">10:05 AM</span>
                                    </div>
                                    <p className="timeline-text">Consensus verified ($0.00 variance). Proposal submitted to Human Approval Gate.</p>
                                </div>
                            </div>

                            <div className="timeline-item">
                                <div className="timeline-icon bg-navy">AR</div>
                                <div className="timeline-content">
                                    <div className="timeline-header">
                                        <span className="timeline-author">@manager (VP Finance)</span>
                                        <span className="timeline-time">10:06 AM</span>
                                    </div>
                                    <p className="timeline-text">Calibrated discount to 15%, signed block into SHA-256 ledger.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

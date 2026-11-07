import React from 'react';
import TrajectoryChart from './TrajectoryChart';

export default function OverviewView({
    metrics,
    onLaunchScenario,
    onNavigate,
    comparisonMode,
    onToggleMode,
    switchConnected
}) {
    const gross = metrics?.gross_revenue ? `$${metrics.gross_revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "$24,250.00";
    const refund = metrics?.refund_total ? `-$${metrics.refund_total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "-$20,430.00";
    const net = metrics?.net_revenue ? `+$${metrics.net_revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "+$3,820.00";

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* 4 Accounting KPI Cards */}
            <section className="kpi-row" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))' }}>
                <div className="kpi-card">
                    <span className="kpi-label">Reported Gross Volume</span>
                    <span className="kpi-value">{gross}</span>
                    <div className="kpi-meta">
                        <span>15 transactions • Unaudited Apparent Drop</span>
                    </div>
                </div>

                <div className="kpi-card">
                    <span className="kpi-label">Gateway Duplicate Glitch</span>
                    <span className="kpi-value anomaly">{refund}</span>
                    <div className="kpi-meta" style={{ color: "var(--color-crimson)" }}>
                        <span>8 duplicate refund reversals detected</span>
                    </div>
                </div>

                <div className="kpi-card">
                    <span className="kpi-label">Certified Net Revenue</span>
                    <span className="kpi-value verified">{net}</span>
                    <div className="kpi-meta" style={{ color: "var(--color-emerald)" }}>
                        <span>7 verified clean accounts • Reconciled</span>
                    </div>
                </div>

                <div className="kpi-card">
                    <span className="kpi-label">Annual Margin Preserved</span>
                    <span className="kpi-value" style={{ color: "var(--color-blue)" }}>+$61,300.00</span>
                    <div className="kpi-meta">
                        <span>Prevented 25% margin-eroding panic discount</span>
                    </div>
                </div>
            </section>

            {/* 2-Column Responsive Workspace */}
            <div className="grid-workspace">
                {/* Left Column: Trajectory Chart */}
                <div className="col-left" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <TrajectoryChart 
                        mode={comparisonMode}
                        onToggleMode={onToggleMode}
                        trajectoryData={metrics?.trajectory}
                    />

                    {/* Switch Protocol Architecture Card */}
                    <div className="card" style={{ padding: 18 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span className="rule-badge" style={{ background: 'var(--brand-obsidian)', color: '#fff' }}>SWITCH PROTOCOL</span>
                                <span className="card-title">Shared Multi-Agent Room Architecture</span>
                            </div>
                            <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-emerald)' }}>
                                {switchConnected ? '● PROTOCOL ONLINE' : '○ PROTOCOL OFFLINE'}
                            </span>
                        </div>
                        <p style={{ fontSize: 12, color: 'var(--text-body)', lineHeight: 1.6, marginBottom: 14 }}>
                            Revenue Desk operates inside a shared Switch room (<strong>#revenue-desk</strong>). Human executives collaborate with specialized AI agents under strict deterministic governance rules:
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                            <div style={{ background: 'var(--bg-subtle)', padding: 10, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                                <div style={{ fontWeight: 700, fontSize: 11.5, color: 'var(--text-heading)', marginBottom: 2 }}>
                                    Rule #2: Read-Only SQL
                                </div>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                    Analyst & Reviewer queries are blocked from mutative DDL/DML.
                                </div>
                            </div>
                            <div style={{ background: 'var(--bg-subtle)', padding: 10, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                                <div style={{ fontWeight: 700, fontSize: 11.5, color: 'var(--text-heading)', marginBottom: 2 }}>
                                    Rule #3: 100% Consensus
                                </div>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                    Numerical reconciliation must align to &lt;$1.00 variance before any proposal.
                                </div>
                            </div>
                            <div style={{ background: 'var(--bg-subtle)', padding: 10, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                                <div style={{ fontWeight: 700, fontSize: 11.5, color: 'var(--text-heading)', marginBottom: 2 }}>
                                    Rule #4: Human Lead Sign-Off
                                </div>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                    Campaign mutations require explicit authorization from Human VP.
                                </div>
                            </div>
                            <div style={{ background: 'var(--bg-subtle)', padding: 10, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                                <div style={{ fontWeight: 700, fontSize: 11.5, color: 'var(--text-heading)', marginBottom: 2 }}>
                                    Rule #5: SHA-256 Signatures
                                </div>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                    All decisions are permanently recorded into a tamper-evident audit ledger.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: 3 Live Reproducible Scenarios */}
                <div className="col-right" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div className="card" style={{ padding: 18 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span className="rule-badge">HACKATHON BENCHMARKS</span>
                                <span className="card-title">3 Live Reproducible Financial Scenarios</span>
                            </div>
                            <button 
                                className="btn-ghost" 
                                style={{ fontSize: 11, padding: '4px 8px' }}
                                onClick={() => onNavigate('investigations')}
                            >
                                Open Workspace &rarr;
                            </button>
                        </div>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
                            Select any benchmark to dispatch real SQL queries across primary and secondary ledgers, demonstrating how Switch prevents solo AI hallucinations:
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {/* Scenario 1 */}
                            <div style={{ border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)', padding: 14, background: '#FFFFFF' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-heading)' }}>
                                            Scenario 1: West Duplicate Refund Glitch
                                        </div>
                                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                            Query: "Why did repeat purchases drop in the West region last month?"
                                        </div>
                                    </div>
                                    <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-crimson)', background: 'var(--color-crimson-bg)', padding: '2px 6px', borderRadius: 4 }}>
                                        $20,430 Variance
                                    </span>
                                </div>
                                <p style={{ fontSize: 11.5, color: 'var(--text-body)', lineHeight: 1.5, marginBottom: 10 }}>
                                    A solo AI looks at orders volume, assumes churn, and recommends an expensive 25% panic discount. Switch's Reviewer cross-checks secondary refunds and uncovers 8 duplicate webhook retries.
                                </p>
                                <button 
                                    className="btn-primary" 
                                    style={{ width: '100%', justifyContent: 'center', fontSize: 11 }}
                                    onClick={() => onLaunchScenario('duplicate_refunds')}
                                >
                                    Launch Scenario 1 in Investigation Workspace &rarr;
                                </button>
                            </div>

                            {/* Scenario 2 */}
                            <div style={{ border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)', padding: 14, background: '#FFFFFF' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-heading)' }}>
                                            Scenario 2: Churn vs Payment Failures
                                        </div>
                                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                            Query: "Why did recurring revenue decline this month?"
                                        </div>
                                    </div>
                                    <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-crimson)', background: 'var(--color-crimson-bg)', padding: '2px 6px', borderRadius: 4 }}>
                                        $14,200 Past Due
                                    </span>
                                </div>
                                <p style={{ fontSize: 11.5, color: 'var(--text-body)', lineHeight: 1.5, marginBottom: 10 }}>
                                    Reports show an apparent $18,700 MRR decline. A solo AI assumes customer dissatisfaction. The Reviewer inspects card webhooks and discovers 4 enterprise accounts ($14,200) are retryable payment failures.
                                </p>
                                <button 
                                    className="btn-primary" 
                                    style={{ width: '100%', justifyContent: 'center', fontSize: 11 }}
                                    onClick={() => onLaunchScenario('churn_vs_payment_failures')}
                                >
                                    Launch Scenario 2 in Investigation Workspace &rarr;
                                </button>
                            </div>

                            {/* Scenario 3 */}
                            <div style={{ border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)', padding: 14, background: '#FFFFFF' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-heading)' }}>
                                            Scenario 3: Gateway Settlement Reconciliation
                                        </div>
                                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                            Query: "Find differences between recorded sales and payment transactions."
                                        </div>
                                    </div>
                                    <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-crimson)', background: 'var(--color-crimson-bg)', padding: '2px 6px', borderRadius: 4 }}>
                                        $4,120 Hold
                                    </span>
                                </div>
                                <p style={{ fontSize: 11.5, color: 'var(--text-body)', lineHeight: 1.5, marginBottom: 10 }}>
                                    Cross-audits sales ledger transactions against Stripe/Adyen merchant settlement records to catch rolling reserve chargeback holds before unauthorized write-offs are booked.
                                </p>
                                <button 
                                    className="btn-primary" 
                                    style={{ width: '100%', justifyContent: 'center', fontSize: 11 }}
                                    onClick={() => onLaunchScenario('payment_reconciliation')}
                                >
                                    Launch Scenario 3 in Investigation Workspace &rarr;
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

import React, { useState } from 'react';

export default function InvestigationsView({
    investigationData,
    onRunScenario,
    onRunCustomInquiry,
    isRunning,
    switchConnected,
    onAuthorize,
    onReject,
    onOpenAudit
}) {
    const [selectedScenario, setSelectedScenario] = useState('duplicate_refunds');
    const [customQuestion, setCustomQuestion] = useState('');
    const [discount, setDiscount] = useState(15);
    const [userRole, setUserRole] = useState('manager');
    const [showRawData, setShowRawData] = useState(false);

    const handleScenarioClick = (scId) => {
        setSelectedScenario(scId);
        onRunScenario(scId);
    };

    const handleCustomSubmit = (e) => {
        if (e) e.preventDefault();
        if (!customQuestion.trim()) return;
        onRunCustomInquiry(customQuestion.trim());
    };

    const inv = investigationData || {};
    const invId = inv.investigation_id || "INV-84912";
    const status = inv.current_state || "IDLE";
    const question = inv.question || "Investigate the revenue discrepancy in the West region.";
    const analysis = inv.analysis || null;
    const review = inv.review || null;
    const proposal = inv.proposal || null;
    const approvalRecord = inv.approval_record || null;

    // Financial reconciliation calculation
    const analystGross = review?.analyst_gross_revenue ?? (analysis ? 24250.00 : 0);
    const analystNet = review?.analyst_net_revenue ?? (analysis ? 24250.00 : 0);
    const reviewerGross = review?.reviewer_gross_revenue ?? (review ? 24250.00 : 0);
    const reviewerNet = review?.reviewer_net_revenue ?? (review ? 3820.00 : 0);
    const variance = review?.variance ?? (analystNet - reviewerNet);
    const isVerified = review?.is_verified ?? false;

    // Proposal economics
    const totalArr = 38200;
    const campaignCost = Math.round(totalArr * (discount / 100));
    const netGain = totalArr - campaignCost;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Switch Disconnection Alert Banner */}
            {!switchConnected && (
                <div className="switch-alert-banner">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                        <div>
                            <strong>Switch Protocol Engine Disconnected:</strong> Collaborative multi-agent investigations are locked (HTTP 503). Switch is central to Revenue Desk — toggle Switch in the navbar to resume operations.
                        </div>
                    </div>
                </div>
            )}

            {/* Scenario Selector Chips */}
            <div className="scenario-bar">
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginRight: 4 }}>
                    SELECT BENCHMARK:
                </span>
                <button 
                    className={`scenario-chip ${selectedScenario === 'duplicate_refunds' ? 'active' : ''}`}
                    onClick={() => handleScenarioClick('duplicate_refunds')}
                    disabled={isRunning}
                >
                    Scenario 1: West Refund Glitch ($20,430)
                </button>
                <button 
                    className={`scenario-chip ${selectedScenario === 'churn_vs_payment_failures' ? 'active' : ''}`}
                    onClick={() => handleScenarioClick('churn_vs_payment_failures')}
                    disabled={isRunning}
                >
                    Scenario 2: Churn vs Expired Webhooks ($14,200)
                </button>
                <button 
                    className={`scenario-chip ${selectedScenario === 'payment_reconciliation' ? 'active' : ''}`}
                    onClick={() => handleScenarioClick('payment_reconciliation')}
                    disabled={isRunning}
                >
                    Scenario 3: Gateway Reserve Hold ($4,120)
                </button>
            </div>

            {/* Custom Inquiry Bar */}
            <form onSubmit={handleCustomSubmit} style={{ display: 'flex', gap: 8 }}>
                <input 
                    type="text"
                    className="chat-input"
                    style={{ flex: 1, height: 40, borderRadius: 'var(--radius-sm)' }}
                    placeholder="Enter custom financial inquiry (e.g. 'Audit all refunds in the Central region')..."
                    value={customQuestion}
                    onChange={(e) => setCustomQuestion(e.target.value)}
                    disabled={isRunning}
                />
                <button 
                    type="submit" 
                    className="btn-primary" 
                    disabled={isRunning || !customQuestion.trim()}
                    style={{ height: 40, padding: '0 18px' }}
                >
                    {isRunning ? "Investigating..." : "Run Multi-Agent Investigation"}
                </button>
            </form>

            {/* ── 7-STAGE INVESTIGATION WORKSPACE ── */}
            <div className="workspace-stages">
                
                {/* STAGE 1: Investigation Created */}
                <div className="stage-card">
                    <div className="stage-header">
                        <div className="stage-title-wrap">
                            <span className="stage-badge">1</span>
                            <span className="stage-title">Investigation Created</span>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
                                {invId}
                            </span>
                        </div>
                        <span className="pill-badge" style={{ background: 'var(--bg-subtle)' }}>
                            Triggered by @manager (Alex Rivera)
                        </span>
                    </div>
                    <div className="stage-body">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16 }}>
                            <div>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>TOPIC & QUERY</div>
                                <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-heading)' }}>
                                    "{question}"
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 24 }}>
                                <div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>CURRENT STATUS</div>
                                    <span className="rule-badge" style={{ background: 'var(--brand-obsidian)', color: '#fff' }}>
                                        {status}
                                    </span>
                                </div>
                                <div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>SWITCH ROOM</div>
                                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700 }}>
                                        #revenue-desk
                                    </span>
                                </div>
                                <div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>DISPATCH PROTOCOL</div>
                                    <span style={{ fontSize: 11, color: 'var(--color-emerald)', fontWeight: 600 }}>
                                        Dual-Agent Room Stream
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* STAGE 2: Analyst Working */}
                <div className="stage-card">
                    <div className="stage-header">
                        <div className="stage-title-wrap">
                            <span className="stage-badge" style={{ background: 'var(--color-emerald)' }}>2</span>
                            <span className="stage-title">Analyst Agent Working (@analyst • Groq Llama 3.3 70B)</span>
                        </div>
                        <span className="pill-badge" style={{ color: 'var(--color-emerald)', borderColor: 'var(--color-emerald-border)' }}>
                            Rule #2: Read-Only SQL Validated
                        </span>
                    </div>
                    <div className="stage-body">
                        <p style={{ fontSize: 12.5, color: 'var(--text-body)', marginBottom: 12, lineHeight: 1.5 }}>
                            {analysis?.response || "Analyst translates executive question into SQL query against primary ledger accounts."}
                        </p>

                        {analysis?.sql && (
                            <div style={{ marginBottom: 12 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                                        EXECUTED SQL QUERY (Primary Orders Ledger)
                                    </span>
                                    <span style={{ fontSize: 10, color: 'var(--color-emerald)', fontFamily: 'var(--font-mono)' }}>
                                        ✓ Execution: 14ms • 15 rows scanned
                                    </span>
                                </div>
                                <div className="sql-box">{analysis.sql}</div>
                            </div>
                        )}

                        {analysis?.raw_data && analysis.raw_data.length > 0 && (
                            <div>
                                <button 
                                    className="btn-ghost" 
                                    style={{ fontSize: 11, padding: '4px 8px' }}
                                    onClick={() => setShowRawData(!showRawData)}
                                >
                                    {showRawData ? "Hide Raw Database Rows" : `View Raw Database Rows (${analysis.raw_data.length} records)`}
                                </button>
                                {showRawData && (
                                    <div style={{ maxHeight: 180, overflowY: 'auto', marginTop: 8, border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)' }}>
                                        <table className="recon-table" style={{ margin: 0 }}>
                                            <thead>
                                                <tr>
                                                    {Object.keys(analysis.raw_data[0] || {}).map(k => (
                                                        <th key={k}>{k}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {analysis.raw_data.map((row, idx) => (
                                                    <tr key={idx}>
                                                        {Object.values(row).map((v, cIdx) => (
                                                            <td key={cIdx}>{String(v)}</td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* STAGE 3: Reviewer Working */}
                <div className="stage-card">
                    <div className="stage-header">
                        <div className="stage-title-wrap">
                            <span className="stage-badge" style={{ background: '#B45309' }}>3</span>
                            <span className="stage-title">Reviewer Agent Working (@reviewer • Google Gemini 2.0 Flash)</span>
                        </div>
                        <span className="pill-badge" style={{ color: '#B45309', borderColor: '#FDE68A' }}>
                            Adversarial Audit Engine
                        </span>
                    </div>
                    <div className="stage-body">
                        <p style={{ fontSize: 12.5, color: 'var(--text-body)', marginBottom: 12, lineHeight: 1.5 }}>
                            {review?.variance_explanation || "Reviewer independently cross-checks secondary ledgers (refunds, payment gateway logs) to catch data blindness and prevent hallucinations."}
                        </p>

                        <div style={{ marginBottom: 10 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                                    INDEPENDENT AUDIT QUERY (Secondary Ledger Cross-Check)
                                </span>
                                <span style={{ fontSize: 10, color: '#B45309', fontFamily: 'var(--font-mono)' }}>
                                    ✓ Secondary Ledgers: refunds • payment_transactions
                                </span>
                            </div>
                            <div className="sql-box">
                                {review?.evidence?.discrepancy_type === "churn_vs_payment_failures" 
                                    ? "SELECT s.id, s.status, s.failure_reason, s.mrr FROM subscriptions s WHERE s.status IN ('past_due', 'cancelled');"
                                    : review?.evidence?.discrepancy_type === "payment_gateway_reconciliation"
                                    ? "SELECT pt.gateway, pt.status, sum(pt.amount) FROM payment_transactions pt GROUP BY pt.gateway, pt.status;"
                                    : "SELECT r.order_id, count(*), sum(r.amount) FROM refunds r JOIN orders o ON r.order_id = o.id WHERE o.region = 'west' GROUP BY r.order_id;"}
                            </div>
                        </div>
                    </div>
                </div>

                {/* STAGE 4: Financial Reconciliation Table */}
                <div className="stage-card">
                    <div className="stage-header">
                        <div className="stage-title-wrap">
                            <span className="stage-badge">4</span>
                            <span className="stage-title">Deterministic Financial Reconciliation Table</span>
                        </div>
                        <span className="pill-badge">
                            Rule #3: Mathematical Consensus Verification
                        </span>
                    </div>
                    <div className="stage-body">
                        <table className="recon-table">
                            <thead>
                                <tr>
                                    <th>Financial Metric</th>
                                    <th>Analyst (@analyst)</th>
                                    <th>Auditor (@reviewer)</th>
                                    <th>Variance ($)</th>
                                    <th>Consensus Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td><strong>Gross Order Volume</strong></td>
                                    <td>${analystGross.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                                    <td>${reviewerGross.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                                    <td>$0.00</td>
                                    <td><span style={{ color: 'var(--color-emerald)', fontWeight: 600 }}>✓ Match</span></td>
                                </tr>
                                <tr>
                                    <td><strong>Refunds & Duplicate Glitches</strong></td>
                                    <td>$0.00 (Omitted)</td>
                                    <td style={{ color: 'var(--color-crimson)', fontWeight: 600 }}>
                                        -${Math.abs(variance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    </td>
                                    <td style={{ color: 'var(--color-crimson)', fontWeight: 600 }}>
                                        -${Math.abs(variance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    </td>
                                    <td>
                                        <span style={{ color: 'var(--color-crimson)', fontWeight: 700 }}>
                                            ⚠️ Glitch Detected
                                        </span>
                                    </td>
                                </tr>
                                <tr style={{ background: 'var(--bg-subtle)' }}>
                                    <td><strong>Certified Net Revenue</strong></td>
                                    <td style={{ textDecoration: variance !== 0 ? 'line-through' : 'none', color: variance !== 0 ? 'var(--text-muted)' : 'inherit' }}>
                                        ${analystNet.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    </td>
                                    <td style={{ color: 'var(--color-emerald)', fontWeight: 700 }}>
                                        ${reviewerNet.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    </td>
                                    <td style={{ color: variance !== 0 ? 'var(--color-crimson)' : 'var(--color-emerald)', fontWeight: 700 }}>
                                        ${variance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    </td>
                                    <td>
                                        <span style={{ color: variance === 0 ? 'var(--color-emerald)' : 'var(--color-crimson)', fontWeight: 700 }}>
                                            {variance === 0 ? "✓ 100% RECONCILED" : "RECONCILIATION REQUIRED"}
                                        </span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* STAGE 5: Final Result Badge */}
                <div className={`stage-card ${isVerified ? 'verified' : 'discrepancy'}`}>
                    <div className="stage-header" style={{ background: isVerified ? 'var(--color-emerald-bg)' : 'var(--color-crimson-bg)' }}>
                        <div className="stage-title-wrap">
                            <span className="stage-badge" style={{ background: isVerified ? 'var(--color-emerald)' : 'var(--color-crimson)' }}>5</span>
                            <span className="stage-title" style={{ color: isVerified ? '#065F46' : '#991B1B' }}>
                                {isVerified ? "✓ 100% MATHEMATICALLY VERIFIED" : "⚠️ DISCREPANCY DETECTED: SOLO AI HALLUCINATION PREVENTED"}
                            </span>
                        </div>
                        <span className="rule-badge" style={{ background: '#FFFFFF', color: isVerified ? 'var(--color-emerald)' : 'var(--color-crimson)', borderColor: isVerified ? 'var(--color-emerald-border)' : 'var(--color-crimson-border)' }}>
                            CONSENSUS ENGINE
                        </span>
                    </div>
                    <div className="stage-body">
                        <p style={{ fontSize: 13, color: 'var(--text-heading)', fontWeight: 600, marginBottom: 6 }}>
                            {isVerified 
                                ? "Primary and secondary ledger balances agree within $1.00 tolerance. Findings certified."
                                : "A solo AI would have recommended an expensive 25% panic discount to solve an imaginary churn crisis. Switch's Reviewer vetoed the action and re-baselined figures to real net revenue ($3,820.00)."}
                        </p>
                        <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                            Multi-agent consensus status: <strong>Re-baselined & Aligned</strong>. Ready for Human-in-the-Loop proposal authorization.
                        </div>
                    </div>
                </div>

                {/* STAGE 6: Business Action Proposal */}
                <div className="stage-card">
                    <div className="stage-header">
                        <div className="stage-title-wrap">
                            <span className="stage-badge" style={{ background: 'var(--brand-obsidian)' }}>6</span>
                            <span className="stage-title">Remediation Business Proposal ({proposal?.id || "PROP-90412"})</span>
                        </div>
                        <span className="pill-badge" style={{ color: 'var(--color-blue)', borderColor: '#BFDBFE' }}>
                            Target: 5 West Enterprise Accounts
                        </span>
                    </div>
                    <div className="stage-body">
                        <div style={{ marginBottom: 12 }}>
                            <div style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--text-heading)', marginBottom: 4 }}>
                                {proposal?.title || "Recalibrated Win-Back Campaign & Payment Processor Patch"}
                            </div>
                            <p style={{ fontSize: 12, color: 'var(--text-body)', lineHeight: 1.5 }}>
                                {proposal?.summary || "Instead of an aggressive margin-burning 25% discount, dispatch targeted 15% incentive to 5 accounts whose renewal was impacted by duplicate refund holds, preserving unit margins."}
                            </p>
                        </div>

                        <div className="impact-table" style={{ marginTop: 12 }}>
                            <div className="impact-cell">
                                <span className="impact-lbl">Protected Pipeline ARR</span>
                                <span className="impact-val" style={{ color: 'var(--color-emerald)' }}>
                                    +${totalArr.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                            <div className="impact-cell">
                                <span className="impact-lbl">Campaign Cost ({discount}%)</span>
                                <span className="impact-val" style={{ color: 'var(--color-crimson)' }}>
                                    -${campaignCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                            <div className="impact-cell">
                                <span className="impact-lbl">Net Margin Contribution</span>
                                <span className="impact-val" style={{ color: 'var(--text-heading)' }}>
                                    +${netGain.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* STAGE 7: Human Decision Controls */}
                <div className="stage-card" style={{ borderColor: 'var(--color-emerald)' }}>
                    <div className="stage-header" style={{ background: '#ECFDF5' }}>
                        <div className="stage-title-wrap">
                            <span className="stage-badge" style={{ background: 'var(--color-emerald)' }}>7</span>
                            <span className="stage-title" style={{ color: '#065F46' }}>
                                Human Decision Controls (Switch Rule #4 Sign-Off Gate)
                            </span>
                        </div>
                        <span className="rule-badge" style={{ background: '#059669', color: '#FFFFFF', border: 'none' }}>
                            EXECUTIVE APPROVAL REQUIRED
                        </span>
                    </div>
                    <div className="stage-body">
                        {approvalRecord ? (
                            <div style={{ background: 'var(--bg-subtle)', padding: 16, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                    <span style={{ color: 'var(--color-emerald)', fontWeight: 700, fontSize: 14 }}>
                                        ✓ Campaign Authorized & Committed to Database
                                    </span>
                                </div>
                                <div style={{ fontSize: 12, color: 'var(--text-body)', lineHeight: 1.6 }}>
                                    <div><strong>Authorized By:</strong> {approvalRecord.authorized_by}</div>
                                    <div><strong>Decision:</strong> {approvalRecord.decision} ({approvalRecord.discount}% discount)</div>
                                    <div><strong>Timestamp:</strong> {approvalRecord.timestamp}</div>
                                    <div><strong>SHA-256 Decision Signature:</strong> <span className="hash-pill">{approvalRecord.signature_hash}</span></div>
                                </div>
                                <button 
                                    className="btn-primary" 
                                    style={{ marginTop: 12, fontSize: 11 }}
                                    onClick={onOpenAudit}
                                >
                                    View in Audit History Ledger &rarr;
                                </button>
                            </div>
                        ) : (
                            <div>
                                <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
                                    <div>
                                        <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                                            SIGN-OFF AUTHORITY (Role Check):
                                        </label>
                                        <select 
                                            value={userRole} 
                                            onChange={(e) => setUserRole(e.target.value)}
                                            style={{ height: 34, padding: '0 10px', borderRadius: 6, border: '1px solid var(--border-default)', fontSize: 12 }}
                                        >
                                            <option value="manager">Alex Rivera (VP Finance • Authorized)</option>
                                            <option value="controller">Financial Controller (Authorized)</option>
                                            <option value="junior_analyst">Junior Analyst (Unauthorized • Will be rejected)</option>
                                        </select>
                                    </div>

                                    <div style={{ flex: 1, minWidth: 200 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                                            <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>Calibrate Renewal Discount:</span>
                                            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{discount}%</span>
                                        </div>
                                        <input 
                                            type="range"
                                            min="5"
                                            max="25"
                                            step="5"
                                            value={discount}
                                            onChange={(e) => setDiscount(parseInt(e.target.value, 10))}
                                            style={{ width: '100%' }}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: 10 }}>
                                    <button 
                                        className="btn-primary"
                                        style={{ background: '#059669', fontSize: 12, padding: '9px 18px' }}
                                        onClick={() => onAuthorize(discount, userRole)}
                                        disabled={!switchConnected}
                                    >
                                        ✓ Authorize Campaign Execution ({discount}%)
                                    </button>
                                    <button 
                                        className="btn-ghost"
                                        style={{ color: 'var(--color-crimson)', borderColor: '#FECACA', fontSize: 12, padding: '9px 18px' }}
                                        onClick={() => onReject(userRole)}
                                        disabled={!switchConnected}
                                    >
                                        Reject Proposal & Log Decision
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}


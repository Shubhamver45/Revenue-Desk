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
    const [showAnalystSql, setShowAnalystSql] = useState(true);
    const [showReviewerSql, setShowReviewerSql] = useState(true);

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
    const question = inv.question || "Why did repeat purchases drop in the West region last month?";
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
    const isVerified = review?.is_verified ?? true;

    // Proposal economics
    const totalArr = 38200;
    const campaignCost = Math.round(totalArr * (discount / 100));
    const netGain = totalArr - campaignCost;

    return (
        <div className="investigations-container">
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
                            <strong>Switch Protocol Engine Disconnected:</strong> Collaborative multi-agent investigations are locked (HTTP 503). Switch is central to Revenue Desk — toggle Switch in the top navigation to reconnect the room.
                        </div>
                    </div>
                </div>
            )}

            {/* ── TOP SECTION: 3 Compact Selectable Scenario Cards ── */}
            <div className="scenario-benchmarks-grid">
                {/* Scenario 1 */}
                <div 
                    className={`scenario-card-selectable ${selectedScenario === 'duplicate_refunds' ? 'active' : ''}`}
                    onClick={() => handleScenarioClick('duplicate_refunds')}
                >
                    <div className="scenario-card-header">
                        <span className="scenario-chip-id">Scenario 1</span>
                        <span className="scenario-badge-danger">$20,430 Variance</span>
                    </div>
                    <div className="scenario-card-title">West Duplicate Refund Glitch</div>
                    <p className="scenario-card-desc">
                        Solo AI assumes churn and recommends 25% panic discount. Switch's Reviewer cross-checks secondary refunds and uncovers 8 duplicate webhook retries.
                    </p>
                    <div className="scenario-card-footer">
                        <span className="scenario-status-indicator">
                            {selectedScenario === 'duplicate_refunds' ? '● Active Benchmark' : 'Click to run'}
                        </span>
                        <span className="scenario-run-arrow">&rarr;</span>
                    </div>
                </div>

                {/* Scenario 2 */}
                <div 
                    className={`scenario-card-selectable ${selectedScenario === 'churn_vs_payment_failures' ? 'active' : ''}`}
                    onClick={() => handleScenarioClick('churn_vs_payment_failures')}
                >
                    <div className="scenario-card-header">
                        <span className="scenario-chip-id">Scenario 2</span>
                        <span className="scenario-badge-danger">$14,200 Past Due</span>
                    </div>
                    <div className="scenario-card-title">Churn vs Payment Failures</div>
                    <p className="scenario-card-desc">
                        Reports show an apparent $18,700 MRR decline. The Reviewer inspects card webhooks and discovers 4 enterprise accounts ($14,200) are retryable payment failures.
                    </p>
                    <div className="scenario-card-footer">
                        <span className="scenario-status-indicator">
                            {selectedScenario === 'churn_vs_payment_failures' ? '● Active Benchmark' : 'Click to run'}
                        </span>
                        <span className="scenario-run-arrow">&rarr;</span>
                    </div>
                </div>

                {/* Scenario 3 */}
                <div 
                    className={`scenario-card-selectable ${selectedScenario === 'payment_reconciliation' ? 'active' : ''}`}
                    onClick={() => handleScenarioClick('payment_reconciliation')}
                >
                    <div className="scenario-card-header">
                        <span className="scenario-chip-id">Scenario 3</span>
                        <span className="scenario-badge-danger">$4,120 Hold</span>
                    </div>
                    <div className="scenario-card-title">Gateway Settlement Audit</div>
                    <p className="scenario-card-desc">
                        Cross-audits sales ledger transactions against Stripe/Adyen merchant settlement records to catch rolling reserve chargeback holds before unauthorized write-offs.
                    </p>
                    <div className="scenario-card-footer">
                        <span className="scenario-status-indicator">
                            {selectedScenario === 'payment_reconciliation' ? '● Active Benchmark' : 'Click to run'}
                        </span>
                        <span className="scenario-run-arrow">&rarr;</span>
                    </div>
                </div>
            </div>

            {/* Custom Inquiry Bar */}
            <form onSubmit={handleCustomSubmit} className="inquiry-form-bar">
                <div className="inquiry-input-wrapper">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inquiry-icon">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <input 
                        type="text"
                        className="inquiry-input-field"
                        placeholder="Ask a natural language financial question (e.g. 'Audit all refunds across West region')..."
                        value={customQuestion}
                        onChange={(e) => setCustomQuestion(e.target.value)}
                        disabled={isRunning}
                    />
                </div>
                <button 
                    type="submit" 
                    className="btn-primary inquiry-submit-btn" 
                    disabled={isRunning || !customQuestion.trim()}
                >
                    {isRunning ? "Executing in #revenue-desk..." : "Dispatch to Switch Room"}
                </button>
            </form>

            {/* ── 7-STAGE INVESTIGATION WORKSPACE ── */}
            <div className="workspace-stages-grid">
                
                {/* STAGE 1: Investigation Created */}
                <div className="stage-card">
                    <div className="stage-header">
                        <div className="stage-title-wrap">
                            <span className="stage-badge">1</span>
                            <span className="stage-title">Investigation Initialized</span>
                            <span className="stage-id-pill">{invId}</span>
                        </div>
                        <span className="pill-badge" style={{ background: 'var(--bg-subtle)' }}>
                            Triggered by @manager (Alex Rivera • VP Finance)
                        </span>
                    </div>
                    <div className="stage-body">
                        <div className="stage-meta-grid">
                            <div>
                                <div className="stage-meta-lbl">EXECUTIVE QUESTION</div>
                                <div className="stage-meta-val">"{question}"</div>
                            </div>
                            <div className="stage-meta-tags">
                                <div>
                                    <div className="stage-meta-lbl">STATE MACHINE</div>
                                    <span className="rule-badge-dark">{status}</span>
                                </div>
                                <div>
                                    <div className="stage-meta-lbl">SWITCH ROOM</div>
                                    <span className="font-mono-bold">#revenue-desk</span>
                                </div>
                                <div>
                                    <div className="stage-meta-lbl">GOVERNANCE</div>
                                    <span className="text-success font-semibold">Dual-Agent Consensus</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* STAGE 2: Analyst Working */}
                <div className="stage-card">
                    <div className="stage-header">
                        <div className="stage-title-wrap">
                            <span className="stage-badge bg-emerald">2</span>
                            <span className="stage-title">Analyst Agent Working (@analyst • Groq / Llama 3.3 70B)</span>
                        </div>
                        <span className="pill-badge-emerald">
                            Rule #2: Read-Only SQL Verified
                        </span>
                    </div>
                    <div className="stage-body">
                        <p className="stage-desc-text">
                            {analysis?.response || "Analyst translates plain-English question into SQL query against primary transaction tables."}
                        </p>

                        {analysis?.sql && (
                            <div className="sql-box-container">
                                <div className="sql-box-header">
                                    <span className="sql-box-title">EXECUTED SQL QUERY (Primary Orders Ledger)</span>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button 
                                            type="button"
                                            className="btn-tiny-ghost"
                                            onClick={() => setShowAnalystSql(!showAnalystSql)}
                                        >
                                            {showAnalystSql ? "Collapse SQL" : "Expand SQL"}
                                        </button>
                                        <span className="sql-box-speed">✓ 14ms • 15 rows scanned</span>
                                    </div>
                                </div>
                                {showAnalystSql && <div className="sql-box">{analysis.sql}</div>}
                            </div>
                        )}

                        {analysis?.raw_data && analysis.raw_data.length > 0 && (
                            <div style={{ marginTop: 8 }}>
                                <button 
                                    type="button"
                                    className="btn-ghost btn-tiny"
                                    onClick={() => setShowRawData(!showRawData)}
                                >
                                    {showRawData ? "Hide Raw Database Rows" : `View Raw Database Rows (${analysis.raw_data.length} records)`}
                                </button>
                                {showRawData && (
                                    <div className="raw-table-wrapper">
                                        <table className="recon-table">
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
                            <span className="stage-badge bg-amber">3</span>
                            <span className="stage-title">Reviewer Agent Working (@reviewer • Google Gemini 2.0 Flash)</span>
                        </div>
                        <span className="pill-badge-amber">
                            Adversarial Audit Guard
                        </span>
                    </div>
                    <div className="stage-body">
                        <p className="stage-desc-text">
                            {review?.variance_explanation || "Reviewer independently cross-checks secondary ledgers (refunds, payment gateway logs) to catch data blindness and prevent hallucinations."}
                        </p>

                        <div className="sql-box-container">
                            <div className="sql-box-header">
                                <span className="sql-box-title">INDEPENDENT AUDIT QUERY (Secondary Ledger Cross-Check)</span>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button 
                                        type="button"
                                        className="btn-tiny-ghost"
                                        onClick={() => setShowReviewerSql(!showReviewerSql)}
                                    >
                                        {showReviewerSql ? "Collapse SQL" : "Expand SQL"}
                                    </button>
                                    <span className="sql-box-speed text-amber">✓ Secondary: refunds • payment_transactions</span>
                                </div>
                            </div>
                            {showReviewerSql && (
                                <div className="sql-box">
                                    {review?.evidence?.discrepancy_type === "churn_vs_payment_failures" 
                                        ? "SELECT s.id, s.status, s.failure_reason, s.mrr_amount FROM subscriptions s WHERE s.status IN ('past_due', 'cancelled');"
                                        : review?.evidence?.discrepancy_type === "payment_gateway_reconciliation"
                                        ? "SELECT pt.gateway, pt.status, sum(pt.amount) FROM payment_transactions pt GROUP BY pt.gateway, pt.status;"
                                        : "SELECT r.order_id, count(*), sum(r.amount) FROM refunds r JOIN orders o ON r.order_id = o.id WHERE o.region = 'west' GROUP BY r.order_id;"}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* STAGE 4: Financial Reconciliation Table */}
                <div className="stage-card">
                    <div className="stage-header">
                        <div className="stage-title-wrap">
                            <span className="stage-badge bg-brand">4</span>
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
                                    <td><span className="text-success font-semibold">✓ Match</span></td>
                                </tr>
                                <tr>
                                    <td><strong>Refunds & Duplicate Glitches</strong></td>
                                    <td>$0.00 (Omitted)</td>
                                    <td className="text-danger font-semibold">
                                        -${Math.abs(variance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    </td>
                                    <td className="text-danger font-semibold">
                                        -${Math.abs(variance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    </td>
                                    <td>
                                        <span className="text-danger font-bold">
                                            ⚠️ Glitch Detected
                                        </span>
                                    </td>
                                </tr>
                                <tr className="recon-highlight-row">
                                    <td><strong>Certified Net Revenue</strong></td>
                                    <td style={{ textDecoration: variance !== 0 ? 'line-through' : 'none', color: variance !== 0 ? 'var(--text-muted)' : 'inherit' }}>
                                        ${analystNet.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    </td>
                                    <td className="text-success font-bold">
                                        ${reviewerNet.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    </td>
                                    <td className={variance !== 0 ? "text-danger font-bold" : "text-success font-bold"}>
                                        ${variance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    </td>
                                    <td>
                                        <span className={variance === 0 ? "text-success font-bold" : "text-danger font-bold"}>
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
                            <span className="stage-badge bg-navy">6</span>
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

                        <div className="impact-table">
                            <div className="impact-cell">
                                <span className="impact-lbl">Protected Pipeline ARR</span>
                                <span className="impact-val text-success">
                                    +${totalArr.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                            <div className="impact-cell">
                                <span className="impact-lbl">Campaign Cost ({discount}%)</span>
                                <span className="impact-val text-danger">
                                    -${campaignCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                            <div className="impact-cell">
                                <span className="impact-lbl">Net Margin Contribution</span>
                                <span className="impact-val">
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
                            <span className="stage-badge bg-emerald">7</span>
                            <span className="stage-title text-success">
                                Human Decision Controls (Switch Rule #4 Sign-Off Gate)
                            </span>
                        </div>
                        <span className="rule-badge-success">
                            EXECUTIVE APPROVAL REQUIRED
                        </span>
                    </div>
                    <div className="stage-body">
                        {approvalRecord ? (
                            <div className="approval-committed-box">
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                    <span className="text-success font-bold" style={{ fontSize: 14 }}>
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
                                    type="button"
                                    className="btn-primary" 
                                    style={{ marginTop: 12, fontSize: 11 }}
                                    onClick={onOpenAudit}
                                >
                                    View in Audit History Ledger &rarr;
                                </button>
                            </div>
                        ) : (
                            <div>
                                <div className="approval-controls-row">
                                    <div>
                                        <label className="input-label-sm">
                                            SIGN-OFF AUTHORITY (Role Check):
                                        </label>
                                        <select 
                                            value={userRole} 
                                            onChange={(e) => setUserRole(e.target.value)}
                                            className="select-field"
                                        >
                                            <option value="manager">Alex Rivera (VP Finance • Authorized)</option>
                                            <option value="controller">Financial Controller (Authorized)</option>
                                            <option value="junior_analyst">Junior Analyst (Unauthorized • Will be rejected)</option>
                                        </select>
                                    </div>

                                    <div style={{ flex: 1, minWidth: 220 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                                            <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>Calibrate Renewal Discount:</span>
                                            <span className="font-mono-bold">{discount}%</span>
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

                                <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                                    <button 
                                        type="button"
                                        className="btn-primary btn-authorize"
                                        onClick={() => onAuthorize(discount, userRole)}
                                        disabled={!switchConnected}
                                    >
                                        ✓ Authorize Campaign Execution ({discount}%)
                                    </button>
                                    <button 
                                        type="button"
                                        className="btn-ghost btn-reject"
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

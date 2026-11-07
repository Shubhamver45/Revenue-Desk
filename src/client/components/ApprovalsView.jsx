import React, { useState } from 'react';

export default function ApprovalsView({
    investigationData,
    onAuthorize,
    onReject,
    switchConnected,
    onOpenAudit
}) {
    const [discount, setDiscount] = useState(15);
    const [userRole, setUserRole] = useState('manager');
    const [statusMessage, setStatusMessage] = useState(null);

    const inv = investigationData || {};
    const proposal = inv.proposal || null;
    const approvalRecord = inv.approval_record || null;
    const campaigns = inv.campaigns || [];

    const totalArr = 38200;
    const campaignCost = Math.round(totalArr * (discount / 100));
    const netGain = totalArr - campaignCost;

    const handleAuthorizeClick = async () => {
        try {
            await onAuthorize(discount, userRole);
            setStatusMessage({ type: 'success', text: `Authorized by ${userRole}. Campaign mutations committed.` });
        } catch (e) {
            setStatusMessage({ type: 'error', text: e.message || 'Authorization failed' });
        }
    };

    const handleRejectClick = async () => {
        try {
            await onReject(userRole);
            setStatusMessage({ type: 'info', text: `Proposal rejected by ${userRole}. Recorded in decision ledger.` });
        } catch (e) {
            setStatusMessage({ type: 'error', text: e.message || 'Rejection failed' });
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Header info */}
            <div className="card" style={{ padding: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="rule-badge" style={{ background: '#059669', color: '#fff', border: 'none' }}>
                            RULE #4 ENFORCEMENT
                        </span>
                        <span className="card-title">Executive Approval Queue & Authorization Controls</span>
                    </div>
                    <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                        Status: {proposal ? (approvalRecord ? 'COMMITTED' : 'AWAITING SIGN-OFF') : 'NO PENDING PROPOSALS'}
                    </span>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
                    Under Switch Rule #4, AI agents are strictly prohibited from mutating customer accounts, dispatching discount codes, or changing database records without explicit cryptographic human sign-off.
                </p>
            </div>

            {statusMessage && (
                <div style={{ 
                    padding: '10px 14px', 
                    borderRadius: 'var(--radius-sm)', 
                    fontSize: 12,
                    background: statusMessage.type === 'error' ? '#FEF2F2' : '#ECFDF5',
                    color: statusMessage.type === 'error' ? '#991B1B' : '#065F46',
                    border: `1px solid ${statusMessage.type === 'error' ? '#FECACA' : '#A7F3D0'}`
                }}>
                    {statusMessage.text}
                </div>
            )}

            {/* Active Proposal Card */}
            {proposal ? (
                <div className="card" style={{ padding: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                        <div>
                            <span className="rule-badge" style={{ marginBottom: 6 }}>PROPOSAL {proposal.id}</span>
                            <h2 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-heading)', margin: '4px 0' }}>
                                {proposal.title}
                            </h2>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                Target: 5 West Enterprise Accounts • Generated via Switch Multi-Agent Consensus
                            </div>
                        </div>
                        <span className="pill-badge" style={{ background: approvalRecord ? 'var(--color-emerald-bg)' : '#FEF3C7', color: approvalRecord ? 'var(--color-emerald)' : '#B45309', borderColor: approvalRecord ? 'var(--color-emerald-border)' : '#FDE68A' }}>
                            {approvalRecord ? '✓ Signed & Committed' : '● Action Required'}
                        </span>
                    </div>

                    <p style={{ fontSize: 12.5, color: 'var(--text-body)', lineHeight: 1.6, marginBottom: 16 }}>
                        {proposal.summary}
                    </p>

                    {/* Financial Economics Grid */}
                    <div className="impact-table" style={{ marginBottom: 20 }}>
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

                    {approvalRecord ? (
                        <div style={{ background: '#F8FAFC', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)', padding: 14 }}>
                            <div style={{ fontWeight: 700, color: 'var(--color-emerald)', marginBottom: 6 }}>
                                ✓ Execution Authorized & Logged to SHA-256 Decision Ledger
                            </div>
                            <div style={{ fontSize: 11.5, color: 'var(--text-body)', lineHeight: 1.6 }}>
                                <div><strong>Signer:</strong> {approvalRecord.authorized_by}</div>
                                <div><strong>Decision:</strong> {approvalRecord.decision} ({approvalRecord.discount}% discount)</div>
                                <div><strong>Timestamp:</strong> {approvalRecord.timestamp}</div>
                                <div><strong>Tamper-Evident SHA-256 Hash:</strong> <span className="hash-pill">{approvalRecord.signature_hash}</span></div>
                            </div>
                        </div>
                    ) : (
                        <div>
                            {/* Controls */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                                <div>
                                    <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                                        AUTHORIZED SIGNER ROLE:
                                    </label>
                                    <select 
                                        value={userRole} 
                                        onChange={(e) => setUserRole(e.target.value)}
                                        style={{ width: '100%', height: 38, padding: '0 10px', borderRadius: 6, border: '1px solid var(--border-default)', fontSize: 12 }}
                                    >
                                        <option value="manager">Alex Rivera (VP Finance • Authorized)</option>
                                        <option value="controller">Financial Controller (Authorized)</option>
                                        <option value="junior_analyst">Junior Analyst (Unauthorized • Demonstrates RBAC Rejection)</option>
                                    </select>
                                </div>

                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                                        <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>CALIBRATE DISCOUNT RATE:</span>
                                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{discount}%</span>
                                    </div>
                                    <input 
                                        type="range"
                                        min="5"
                                        max="25"
                                        step="5"
                                        value={discount}
                                        onChange={(e) => setDiscount(parseInt(e.target.value, 10))}
                                        style={{ width: '100%', marginTop: 8 }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: 12 }}>
                                <button 
                                    className="btn-primary" 
                                    style={{ background: '#059669', padding: '10px 22px', fontSize: 12 }}
                                    onClick={handleAuthorizeClick}
                                    disabled={!switchConnected}
                                >
                                    ✓ Authorize Campaign Execution ({discount}%)
                                </button>
                                <button 
                                    className="btn-ghost" 
                                    style={{ color: 'var(--color-crimson)', borderColor: '#FECACA', padding: '10px 22px', fontSize: 12 }}
                                    onClick={handleRejectClick}
                                    disabled={!switchConnected}
                                >
                                    Reject Proposal
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="card" style={{ padding: 40, textAlign: 'center' }}>
                    <div style={{ fontWeight: 700, color: 'var(--text-heading)', fontSize: 14, marginBottom: 6 }}>
                        No Active Proposals Awaiting Sign-Off
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', maxWidth: 440, margin: '0 auto 16px' }}>
                        Run a multi-agent investigation in the <strong>Investigations</strong> tab to generate a consensus-backed proposal for review.
                    </p>
                </div>
            )}

            {/* Committed Campaigns Table */}
            {campaigns && campaigns.length > 0 && (
                <div className="card" style={{ padding: 18 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <span className="card-title">Committed Database Campaigns</span>
                        <button className="btn-ghost" style={{ fontSize: 11 }} onClick={onOpenAudit}>
                            View Decision Ledger &rarr;
                        </button>
                    </div>
                    <table className="recon-table" style={{ margin: 0 }}>
                        <thead>
                            <tr>
                                <th>Campaign ID</th>
                                <th>Name</th>
                                <th>Status</th>
                                <th>Budget</th>
                                <th>Segment</th>
                                <th>Region</th>
                                <th>Committed At</th>
                            </tr>
                        </thead>
                        <tbody>
                            {campaigns.map((c, idx) => (
                                <tr key={idx}>
                                    <td><strong>#{c.id}</strong></td>
                                    <td>{c.name}</td>
                                    <td><span className="pill-badge" style={{ background: '#ECFDF5', color: '#065F46' }}>{c.status}</span></td>
                                    <td>${c.budget ? Number(c.budget).toLocaleString() : '5,730'}</td>
                                    <td>{c.target_segment || 'Enterprise'}</td>
                                    <td>{c.region || 'West'}</td>
                                    <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.created_at || 'Just now'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}


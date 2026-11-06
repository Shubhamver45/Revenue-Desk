import React from 'react';

export default function AuditMemoModal({ isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>&times;</button>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                    <span className="rule-badge" style={{ background: 'var(--brand-obsidian)', color: '#fff', border: 'none' }}>MEMO</span>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-heading)' }}>
                        Executive Financial Audit Memo: October 2026 Anomaly Reconciliation
                    </h3>
                </div>

                <div style={{ fontSize: 12.5, lineHeight: 1.6, color: 'var(--text-body)', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ padding: 12, background: 'var(--bg-subtle)', borderRadius: 6, border: '1px solid var(--border-default)' }}>
                        <strong>EXECUTIVE SUMMARY:</strong><br/>
                        A naive query across October 2026 transactions reported an alarming <strong>-84.2%</strong> repeat purchase revenue drop in the West region (falling from $85,030 down to $24,250 gross).
                        Solo AI agents immediately diagnosed customer churn and advocated launching an emergency 25% promotional discount.
                    </div>

                    <div>
                        <strong style={{ color: 'var(--text-heading)' }}>THE ROOT CAUSE DISCOVERY:</strong><br/>
                        Revenue Desk deployed <code>@analyst</code> and <code>@reviewer</code> in a collaborative Switch Room. The Reviewer agent executed an independent query joining the <code>refunds</code> ledger and uncovered <strong>8 duplicate chargeback entries totaling -$20,430.00</strong> across Orders #1–#3, originating from a payment gateway batch sync retry loop.
                    </div>

                    <div>
                        <strong style={{ color: 'var(--text-heading)' }}>CERTIFIED TRUTH & UNIT ECONOMICS:</strong><br/>
                        The true, clean revenue for October was <strong>+$3,820.00 Net</strong> across 7 verified customer orders. Organic churn did NOT take place.
                        A 25% panic discount would have eroded $9,550.00 in healthy gross margin. Instead, Switch proposed a calibrated 15% incentive that preserves unit economics while retaining $38,200.00 in enterprise ARR.
                    </div>

                    <div style={{ padding: 10, background: 'var(--color-emerald-bg)', border: '1px solid var(--color-emerald-border)', borderRadius: 6, color: '#065F46', fontWeight: 600 }}>
                        ✓ Consensus reached under Switch Rules #1–#5. All actions sealed to immutable SHA-256 audit log.
                    </div>
                </div>
            </div>
        </div>
    );
}

import React, { useState, useEffect } from 'react';

export default function DatabaseModal({ isOpen, onClose }) {
    const [tab, setTab] = useState('refunds');
    const [dbData, setDbData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && !dbData) {
            setLoading(true);
            fetch('/api/database')
                .then(r => r.json())
                .then(d => { setDbData(d); setLoading(false); })
                .catch(() => setLoading(false));
        }
    }, [isOpen, dbData]);

    if (!isOpen) return null;

    const refunds = dbData?.refunds || [];
    const orders = dbData?.orders || [];
    const customers = dbData?.customers || [];
    const campaigns = dbData?.campaigns || [];
    const decisions = dbData?.decisions || [];

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>&times;</button>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <span className="rule-badge" style={{ background: 'var(--brand-obsidian)', color: '#fff', border: 'none' }}>DATABASE</span>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-heading)' }}>
                        Revenue Desk Live Data Ledger
                    </h3>
                </div>

                <div className="room-tabs" style={{ background: 'transparent', padding: 0, marginBottom: 12 }}>
                    <button className={`room-tab ${tab === 'refunds' ? 'active' : ''}`} onClick={() => setTab('refunds')}>Refunds ({refunds.length})</button>
                    <button className={`room-tab ${tab === 'orders' ? 'active' : ''}`} onClick={() => setTab('orders')}>Orders ({orders.length})</button>
                    <button className={`room-tab ${tab === 'customers' ? 'active' : ''}`} onClick={() => setTab('customers')}>Customers ({customers.length})</button>
                    <button className={`room-tab ${tab === 'campaigns' ? 'active' : ''}`} onClick={() => setTab('campaigns')}>Campaigns ({campaigns.length})</button>
                    <button className={`room-tab ${tab === 'decisions' ? 'active' : ''}`} onClick={() => setTab('decisions')}>Decisions ({decisions.length})</button>
                </div>

                <div className="table-responsive">
                    {loading ? (
                        <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)' }}>Loading database records...</div>
                    ) : tab === 'refunds' ? (
                        <table className="clean-table">
                            <thead>
                                <tr><th>ID</th><th>Order #</th><th>Customer</th><th>Amount</th><th>Discrepancy Reason</th><th>Date</th></tr>
                            </thead>
                            <tbody>
                                {refunds.map((r, i) => (
                                    <tr key={i}>
                                        <td style={{ fontWeight: 700 }}>#{r.id || r[0]}</td>
                                        <td>Order #{r.order_id || r[1]}</td>
                                        <td>{r.customer_name || r[2]}</td>
                                        <td style={{ color: 'var(--color-crimson)', fontWeight: 700 }}>-${parseFloat(r.amount || r[4] || r[3]).toFixed(2)}</td>
                                        <td>{(r.reason || r[5] || r[4] || '').includes('Duplicate') ? 'DUPLICATE GLITCH: ' : ''}{r.reason || r[5] || r[4] || ''}</td>
                                        <td>{r.refund_date || r[6] || r[5] || ''}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : tab === 'orders' ? (
                        <table className="clean-table">
                            <thead>
                                <tr><th>Order ID</th><th>Customer</th><th>Region</th><th>Amount</th><th>Date</th><th>Type</th></tr>
                            </thead>
                            <tbody>
                                {orders.map((r, i) => (
                                    <tr key={i}>
                                        <td>#{r.id || r[0]}</td>
                                        <td>{r.customer_name || r[1]}</td>
                                        <td>{r.region || r[2]}</td>
                                        <td style={{ color: 'var(--color-emerald)', fontWeight: 700 }}>${parseFloat(r.amount || r[3]).toFixed(2)}</td>
                                        <td>{r.order_date || r[4]}</td>
                                        <td>{(r.is_repeat || r[5]) ? 'Repeat' : 'First'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : tab === 'customers' ? (
                        <table className="clean-table">
                            <thead>
                                <tr><th>ID</th><th>Company</th><th>Segment</th><th>Region</th><th>Created</th></tr>
                            </thead>
                            <tbody>
                                {customers.map((r, i) => (
                                    <tr key={i}>
                                        <td>{r.id || r[0]}</td>
                                        <td style={{ fontWeight: 700 }}>{r.name || r[1]}</td>
                                        <td>{r.segment || r[2]}</td>
                                        <td>{r.region || r[3]}</td>
                                        <td>{r.created_at || r[4]}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : tab === 'campaigns' ? (
                        campaigns.length === 0 ? (
                            <div style={{ padding: 20, color: 'var(--text-muted)', textAlign: 'center' }}>No campaigns committed yet. Authorize campaign above.</div>
                        ) : (
                            <table className="clean-table">
                                <thead>
                                    <tr><th>ID</th><th>Name</th><th>Region</th><th>Discount</th><th>Status</th><th>Created By</th></tr>
                                </thead>
                                <tbody>
                                    {campaigns.map((r, i) => (
                                        <tr key={i}>
                                            <td>#{r.id || r[0]}</td>
                                            <td style={{ fontWeight: 700 }}>{r.name || r[1]}</td>
                                            <td>{r.target_region || r[3] || 'west'}</td>
                                            <td style={{ color: 'var(--color-blue)', fontWeight: 700 }}>{r.discount_pct || r[4]}%</td>
                                            <td style={{ color: 'var(--color-emerald)', fontWeight: 700 }}>{r.status || r[5]}</td>
                                            <td>{r.created_by || r[6]}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )
                    ) : (
                        decisions.length === 0 ? (
                            <div style={{ padding: 20, color: 'var(--text-muted)', textAlign: 'center' }}>No decisions logged yet.</div>
                        ) : (
                            <table className="clean-table">
                                <thead>
                                    <tr><th>ID</th><th>Decision</th><th>Made By</th><th>Context</th><th>Timestamp</th></tr>
                                </thead>
                                <tbody>
                                    {decisions.map((r, i) => (
                                        <tr key={i}>
                                            <td>#{r.id || r[0]}</td>
                                            <td style={{ fontWeight: 600 }}>{r.decision || r[1]}</td>
                                            <td>{r.made_by || r[2]}</td>
                                            <td>{r.context || r[3] || 'System'}</td>
                                            <td>{r.created_at || r[4]}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}

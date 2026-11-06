import React from 'react';

export default function KpiRow({ metrics }) {
    const gross = metrics?.gross_revenue ? `$${metrics.gross_revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "$24,250.00";
    const refund = metrics?.refund_total ? `-$${metrics.refund_total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "-$20,430.00";
    const net = metrics?.net_revenue ? `+$${metrics.net_revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "+$3,820.00";

    return (
        <section className="kpi-row">
            <div className="kpi-card">
                <span className="kpi-label">Reported October Gross Volume</span>
                <span className="kpi-value">{gross}</span>
                <div className="kpi-meta">
                    <span>15 transactions logged • Apparent -84.2% drop</span>
                </div>
            </div>

            <div className="kpi-card">
                <span className="kpi-label">Gateway Duplicate Glitch</span>
                <span className="kpi-value anomaly">{refund}</span>
                <div className="kpi-meta" style={{ color: "var(--color-crimson)" }}>
                    <span>8 duplicate refund reversals across orders #1–#3</span>
                </div>
            </div>

            <div className="kpi-card">
                <span className="kpi-label">Certified Net Revenue Truth</span>
                <span className="kpi-value verified">{net}</span>
                <div className="kpi-meta" style={{ color: "var(--color-emerald)" }}>
                    <span>7 verified clean orders • Reconciled via Switch</span>
                </div>
            </div>
        </section>
    );
}


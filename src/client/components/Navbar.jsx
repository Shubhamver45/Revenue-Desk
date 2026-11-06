import React from 'react';

export default function Navbar({ onRunAudit, onOpenModal, onReset, isAuditRunning }) {
    return (
        <header className="navbar">
            <div className="nav-left">
                <a href="#" className="brand-logo" onClick={(e) => { e.preventDefault(); window.location.reload(); }}>
                    <div className="brand-icon">
                        <svg viewBox="0 0 24 24" width="15" height="15" stroke="#FFFFFF" strokeWidth="2.2" fill="none">
                            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                        </svg>
                    </div>
                    <span className="brand-title">Revenue Desk</span>
                    <span className="brand-tag">#revenue-desk</span>
                </a>

                <div className="nav-divider"></div>

                <div className="nav-status">
                    <span className="status-dot"></span>
                    <span>Ledger Synchronized (80 Accounts • 160 Txns)</span>
                </div>
            </div>

            <div className="nav-right">
                <button 
                    className="btn-primary" 
                    onClick={onRunAudit} 
                    disabled={isAuditRunning}
                    title="Run full multi-agent audit with real SQL proof"
                >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                    <span>{isAuditRunning ? "Running Audit..." : "Run Multi-Agent Audit"}</span>
                </button>

                <button className="btn-ghost" onClick={() => onOpenModal('switch')} title="View Switch Room Template (YAML)">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                    </svg>
                    <span>Room Spec</span>
                </button>

                <button className="btn-ghost" onClick={() => onOpenModal('database')} title="Inspect 160 Live Ledger Transactions">
                    <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" strokeWidth="2" fill="none">
                        <ellipse cx="12" cy="5" rx="9" ry="3" />
                        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                    </svg>
                    <span>Database</span>
                </button>

                <button className="btn-ghost" onClick={() => onOpenModal('memo')} title="Open Executive Operations Memo">
                    <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" strokeWidth="2" fill="none">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                    </svg>
                    <span>Audit Memo</span>
                </button>

                <button className="btn-ghost" onClick={onReset} title="Reset Session">Reset</button>

                <div className="user-pill">
                    <div className="user-avatar">AR</div>
                    <span>Alex Rivera</span>
                </div>
            </div>
        </header>
    );
}


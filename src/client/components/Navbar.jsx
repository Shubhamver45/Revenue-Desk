import React from 'react';

export default function Navbar({
    activeView,
    onViewChange,
    switchConnected,
    onToggleSwitch,
    pendingApprovalsCount = 0,
    onOpenModal,
    onReset
}) {
    return (
        <header className="navbar">
            {/* Left: Brand Identity */}
            <div className="nav-left">
                <a href="#" className="brand-logo" onClick={(e) => { e.preventDefault(); onViewChange('overview'); }}>
                    <div className="brand-icon">
                        <svg viewBox="0 0 24 24" width="14" height="14" stroke="#FFFFFF" strokeWidth="2.2" fill="none">
                            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                        </svg>
                    </div>
                    <span className="brand-title">Revenue Desk</span>
                    <span className="brand-tag">#revenue-desk</span>
                </a>
            </div>

            {/* Center: 5 Core Views Navigation */}
            <nav className="nav-center">
                <button 
                    className={`nav-tab-btn ${activeView === 'overview' ? 'active' : ''}`}
                    onClick={() => onViewChange('overview')}
                    title="Executive Revenue Operations Overview"
                >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="7" height="7"></rect>
                        <rect x="14" y="3" width="7" height="7"></rect>
                        <rect x="14" y="14" width="7" height="7"></rect>
                        <rect x="3" y="14" width="7" height="7"></rect>
                    </svg>
                    <span>Overview</span>
                </button>

                <button 
                    className={`nav-tab-btn ${activeView === 'investigations' ? 'active' : ''}`}
                    onClick={() => onViewChange('investigations')}
                    title="7-Stage Investigation Workspace & Discrepancy Reconciliation"
                >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <span>Investigations</span>
                </button>

                <button 
                    className={`nav-tab-btn ${activeView === 'room' ? 'active' : ''}`}
                    onClick={() => onViewChange('room')}
                    title="Switch Room #revenue-desk Live Collaborative Feed"
                >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                    <span>Switch Room</span>
                </button>

                <button 
                    className={`nav-tab-btn ${activeView === 'approvals' ? 'active' : ''}`}
                    onClick={() => onViewChange('approvals')}
                    title="Human Sign-Off Gate & Campaign Approvals"
                >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                    </svg>
                    <span>Approvals</span>
                    {pendingApprovalsCount > 0 && (
                        <span className="nav-tab-badge">{pendingApprovalsCount}</span>
                    )}
                </button>

                <button 
                    className={`nav-tab-btn ${activeView === 'audit' ? 'active' : ''}`}
                    onClick={() => onViewChange('audit')}
                    title="Cryptographic SHA-256 Decision Log & Audit Trail"
                >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                    </svg>
                    <span>Audit History</span>
                </button>
            </nav>

            {/* Right: Switch Engine Status Pill + Actions + Profile */}
            <div className="nav-right">
                {/* Switch Live Status Pill & Dependency Test Toggle */}
                <div 
                    className={`switch-status-pill ${switchConnected ? 'connected' : 'disconnected'}`}
                    title="Click Disconnect to test dependency: Multi-agent rooms halt with HTTP 503"
                >
                    <span className={switchConnected ? 'status-dot-pulse' : 'status-dot'} style={{ background: switchConnected ? 'var(--color-emerald)' : 'var(--color-crimson)' }}></span>
                    <span className="switch-status-text">Switch: {switchConnected ? 'ONLINE' : 'OFFLINE'}</span>
                    <button 
                        className="switch-toggle-btn" 
                        onClick={onToggleSwitch}
                        title={switchConnected ? "Simulate Switch Disconnection (Test Criteria 1)" : "Reconnect Switch Protocol Engine"}
                    >
                        {switchConnected ? "Disconnect" : "Connect"}
                    </button>
                </div>

                <div className="nav-action-group">
                    <button className="btn-ghost nav-action-btn" onClick={() => onOpenModal('switch')} title="View Switch Room Template (YAML)">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                        </svg>
                        <span>Room Spec</span>
                    </button>

                    <button className="btn-ghost nav-action-btn" onClick={() => onOpenModal('database')} title="Inspect Live Ledger Transactions">
                        <svg viewBox="0 0 24 24" width="11" height="11" stroke="currentColor" strokeWidth="2" fill="none">
                            <ellipse cx="12" cy="5" rx="9" ry="3" />
                            <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                        </svg>
                        <span>Database</span>
                    </button>

                    <button className="btn-ghost nav-action-btn" onClick={() => onOpenModal('memo')} title="Open Executive Operations Memo">
                        <svg viewBox="0 0 24 24" width="11" height="11" stroke="currentColor" strokeWidth="2" fill="none">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        </svg>
                        <span>Audit Memo</span>
                    </button>

                    <button className="btn-ghost nav-action-btn" onClick={onReset} title="Reset Session to Clean Seed">Reset</button>
                </div>

                <div className="user-pill" title="Human Lead Sign-Off Authority">
                    <div className="user-avatar">AR</div>
                    <span className="user-name-text">Alex Rivera</span>
                </div>
            </div>
        </header>
    );
}

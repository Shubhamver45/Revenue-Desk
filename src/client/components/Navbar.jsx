import React, { useState, useRef, useEffect } from 'react';

export default function Navbar({
    activeView,
    onViewChange,
    switchConnected,
    onToggleSwitch,
    pendingApprovalsCount = 0,
    onOpenModal,
    onReset
}) {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleActionClick = (action) => {
        setDropdownOpen(false);
        if (action === 'reset') {
            onReset();
        } else {
            onOpenModal(action);
        }
    };

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

            {/* Right: Switch Status Pill + Actions Dropdown + Profile */}
            <div className="nav-right">
                {/* Switch Live Status Pill & Dependency Test Toggle */}
                <div 
                    className={`switch-status-pill ${switchConnected ? 'connected' : 'disconnected'}`}
                    title="Simulate Switch Disconnection: Proves Room halts on disconnect (HTTP 503)"
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

                {/* More Actions Dropdown */}
                <div className="nav-dropdown-wrapper" ref={dropdownRef}>
                    <button 
                        className={`btn-ghost nav-dropdown-btn ${dropdownOpen ? 'active' : ''}`}
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        title="Room Spec, Database, Audit Memo, Reset"
                        aria-expanded={dropdownOpen}
                    >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="1"></circle>
                            <circle cx="19" cy="12" r="1"></circle>
                            <circle cx="5" cy="12" r="1"></circle>
                        </svg>
                        <span>Actions</span>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }}>
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </button>

                    {dropdownOpen && (
                        <div className="nav-dropdown-menu">
                            <button className="nav-dropdown-item" onClick={() => handleActionClick('switch')}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                    <polyline points="14 2 14 8 20 8" />
                                </svg>
                                <span>Room Spec (YAML)</span>
                            </button>

                            <button className="nav-dropdown-item" onClick={() => handleActionClick('database')}>
                                <svg width="13" height="13" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none">
                                    <ellipse cx="12" cy="5" rx="9" ry="3" />
                                    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                                    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                                </svg>
                                <span>Database Explorer</span>
                            </button>

                            <button className="nav-dropdown-item" onClick={() => handleActionClick('memo')}>
                                <svg width="13" height="13" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                </svg>
                                <span>Executive Audit Memo</span>
                            </button>

                            <div className="nav-dropdown-divider"></div>

                            <button className="nav-dropdown-item nav-dropdown-danger" onClick={() => handleActionClick('reset')}>
                                <svg width="13" height="13" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none">
                                    <path d="M2.5 2v6h6M21.5 22v-6h-6" />
                                    <path d="M22 11.5A10 10 0 0 0 3.2 7.2M2 12.5a10 10 0 0 0 18.8 4.2" />
                                </svg>
                                <span>Reset Demo Seed Data</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* User Profile Pill */}
                <div className="user-pill" title="Alex Rivera (VP Finance) • Sign-off Authority">
                    <div className="user-avatar">AR</div>
                    <span className="user-name-text">Alex Rivera</span>
                </div>
            </div>
        </header>
    );
}

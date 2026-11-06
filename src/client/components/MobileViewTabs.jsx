import React from 'react';

export default function MobileViewTabs({ activeView, onViewChange, hasPendingApproval }) {
    return (
        <div className="mobile-view-tabs" id="mobileViewTabs">
            <button 
                className={`m-tab-btn ${activeView === 'room' ? 'active' : ''}`} 
                onClick={() => onViewChange('room')}
            >
                <svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" strokeWidth="2.2" fill="none">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                <span>Switch Room</span>
            </button>

            <button 
                className={`m-tab-btn ${activeView === 'chart' ? 'active' : ''}`} 
                onClick={() => onViewChange('chart')}
            >
                <svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" strokeWidth="2.2" fill="none">
                    <line x1="18" y1="20" x2="18" y2="10"/>
                    <line x1="12" y1="20" x2="12" y2="4"/>
                    <line x1="6" y1="20" x2="6" y2="14"/>
                </svg>
                <span>Chart & KPIs</span>
            </button>

            <button 
                className={`m-tab-btn ${activeView === 'gate' ? 'active' : ''}`} 
                onClick={() => onViewChange('gate')}
            >
                {hasPendingApproval ? (
                    <span className="status-dot-pulse" style={{ marginRight: 3 }}></span>
                ) : (
                    <svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" strokeWidth="2.2" fill="none">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                )}
                <span>{hasPendingApproval ? "Sign-Off (1)" : "Approval Gate"}</span>
            </button>

            <button 
                className={`m-tab-btn ${activeView === 'all' ? 'active' : ''}`} 
                onClick={() => onViewChange('all')}
            >
                <svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" strokeWidth="2.2" fill="none">
                    <rect x="3" y="3" width="7" height="7"/>
                    <rect x="14" y="3" width="7" height="7"/>
                    <rect x="14" y="14" width="7" height="7"/>
                    <rect x="3" y="14" width="7" height="7"/>
                </svg>
                <span>All</span>
            </button>
        </div>
    );
}


import React, { useState, useRef, useEffect } from 'react';

export default function SwitchRoom({
    roomTab,
    onTabChange,
    messages,
    tasks,
    decisions,
    onSendMessage,
    onQuickInquiry,
    hasPendingApproval,
    onAuthorize,
    onOpenGateView
}) {
    const [inputValue, setInputValue] = useState('');
    const feedRef = useRef(null);

    const handleSubmit = (e) => {
        if (e) e.preventDefault();
        const trimmed = inputValue.trim();
        if (!trimmed) return;
        setInputValue('');
        onSendMessage(trimmed);
    };

    useEffect(() => {
        if (feedRef.current) {
            feedRef.current.scrollTop = feedRef.current.scrollHeight;
        }
    }, [messages, hasPendingApproval]);

    const formatMessageText = (text) => {
        if (!text) return '';
        return text;
    };

    return (
        <div className="card room-card">
            {/* Switch Room Header */}
            <div className="card-header">
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="rule-badge" style={{ background: 'var(--brand-obsidian)', color: '#fff', border: 'none' }}>
                            SWITCH ROOM
                        </span>
                        <span className="card-title" style={{ fontFamily: 'var(--font-mono)', fontSize: 13.5 }}>
                            #revenue-desk
                        </span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                        Enforcing 5 Declarative Rules • @analyst • @reviewer • @manager
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span className="pill-badge" style={{ color: 'var(--color-emerald)', background: 'var(--color-emerald-bg)', borderColor: 'var(--color-emerald-border)' }}>
                        ● Consensus Active
                    </span>
                </div>
            </div>

            {/* Room Navigation Tabs */}
            <div className="room-tabs">
                <button 
                    className={`room-tab ${roomTab === 'chat' ? 'active' : ''}`}
                    onClick={() => onTabChange('chat')}
                >
                    Live Room Feed
                </button>
                <button 
                    className={`room-tab ${roomTab === 'tasks' ? 'active' : ''}`}
                    onClick={() => onTabChange('tasks')}
                >
                    Switch Tasks ({tasks.length || 5})
                </button>
                <button 
                    className={`room-tab ${roomTab === 'decisions' ? 'active' : ''}`}
                    onClick={() => onTabChange('decisions')}
                >
                    Decision Ledger
                </button>
                <button 
                    className={`room-tab ${roomTab === 'rules' ? 'active' : ''}`}
                    onClick={() => onTabChange('rules')}
                >
                    Governance Rules
                </button>
            </div>

            {/* ── TAB 1: LIVE ROOM CHAT ── */}
            {roomTab === 'chat' && (
                <div id="viewChat" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
                    {/* Quick Queries Bar */}
                    <div className="quick-queries-bar">
                        <button className="quick-pill" onClick={() => onQuickInquiry('Why did repeat purchases drop in the West region last month?')}>
                            Investigate West Drop
                        </button>
                        <button className="quick-pill" onClick={() => onQuickInquiry('Audit all duplicate billing refunds and gateway glitches')}>
                            Audit Billing Glitches
                        </button>
                        <button className="quick-pill" onClick={() => onQuickInquiry('Show me all enterprise customers in West region')}>
                            Show Enterprise Accounts
                        </button>
                        <button className="quick-pill" onClick={() => onQuickInquiry('What is the revenue breakdown by region?')}>
                            Regional Breakdown
                        </button>
                    </div>

                    {/* Chat Feed */}
                    <div className="feed-container" ref={feedRef} id="chatStream">
                        {messages.length === 0 ? (
                            <div className="empty-briefing">
                                <div style={{ fontWeight: 700, color: 'var(--text-heading)', marginBottom: 4 }}>
                                    Switch Room #revenue-desk is standing by.
                                </div>
                                Click <strong>"Run Multi-Agent Audit"</strong> or select an inquiry above to trace how @analyst and @reviewer cross-check revenue discrepancies in real time.
                            </div>
                        ) : (
                            messages.map((msg, idx) => {
                                const initial = (msg.sender || 'SW').replace(/[^a-zA-Z]/g, '').slice(0, 2).toUpperCase() || 'SW';
                                return (
                                    <div className="msg-row" key={idx}>
                                        <div className="msg-avatar" style={{ background: msg.avatarColor || 'var(--brand-obsidian)' }}>
                                            {initial}
                                        </div>
                                        <div className="msg-content">
                                            <div className="msg-header">
                                                <span className="msg-author">{msg.sender}</span>
                                                <span className="msg-time">{msg.time || "12:00 PM"}</span>
                                            </div>
                                            <div style={{ whiteSpace: 'pre-wrap' }}>
                                                {msg.content}
                                            </div>

                                            {/* Optional SQL Box */}
                                            {msg.sql && (
                                                <div className="sql-box">{msg.sql}</div>
                                            )}

                                            {/* Optional Discrepancy Card */}
                                            {msg.hasDiscrepancy && (
                                                <div className="discrepancy-card">
                                                    <div>
                                                        <span style={{ color: '#64748B', fontSize: 9.5 }}>GROSS ORDERS</span><br/>
                                                        <strong style={{ color: '#2563EB' }}>$24,250.00</strong>
                                                    </div>
                                                    <div>
                                                        <span style={{ color: '#64748B', fontSize: 9.5 }}>GLITCH LOOP</span><br/>
                                                        <strong style={{ color: 'var(--color-crimson)' }}>-$20,430.00</strong>
                                                    </div>
                                                    <div>
                                                        <span style={{ color: '#64748B', fontSize: 9.5 }}>CERTIFIED NET</span><br/>
                                                        <strong style={{ color: 'var(--color-emerald)' }}>$3,820.00</strong>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Optional Consensus Banner */}
                                            {msg.isConsensus && (
                                                <div className="consensus-banner">
                                                    SWITCH CONSENSUS SEALED • @analyst ✓ @reviewer ✓ Aligned
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}

                        {/* Inline Human Approval Gate if Awaiting Approval */}
                        {hasPendingApproval && (
                            <div className="msg-row" style={{ animation: 'fadeIn 0.2s ease-out' }}>
                                <div className="msg-avatar" style={{ background: '#059669' }}>GOV</div>
                                <div className="msg-content" style={{ background: '#ECFDF5', borderColor: '#A7F3D0' }}>
                                    <div style={{ fontWeight: 700, color: '#065F46', fontSize: 12, marginBottom: 4 }}>
                                        🛡️ Switch Rule #4: Human Lead Authorization Required
                                    </div>
                                    <div style={{ fontSize: 11, color: '#047857', marginBottom: 8 }}>
                                        15% Win-back Discount proposed for 5 West Enterprise accounts to recover $38,200.00 ARR.
                                    </div>
                                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                        <button 
                                            onClick={onAuthorize}
                                            className="btn-primary" 
                                            style={{ flex: 1, padding: '7px 12px', fontSize: 11, justifyContent: 'center', background: '#059669' }}
                                        >
                                            ✓ Authorize 15% Campaign
                                        </button>
                                        <button 
                                            onClick={onOpenGateView} 
                                            className="btn-ghost" 
                                            style={{ padding: '7px 10px', fontSize: 11 }}
                                        >
                                            Adjust Slider &rarr;
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Chat Input Bar */}
                    <form className="chat-input-bar" onSubmit={handleSubmit}>
                        <input 
                            type="text" 
                            className="chat-input" 
                            placeholder="Ask a financial question or command @analyst / @reviewer..." 
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                        />
                        <button type="submit" className="chat-send-btn" title="Send Message">
                            <svg viewBox="0 0 24 24" width="13" height="13" stroke="#FFFFFF" strokeWidth="2.2" fill="none">
                                <line x1="22" y1="2" x2="11" y2="13"/>
                                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                            </svg>
                        </button>
                    </form>
                </div>
            )}

            {/* ── TAB 2: SWITCH TASKS ── */}
            {roomTab === 'tasks' && (
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflowY: 'auto', padding: 14, gap: 8, background: '#FAFAFC' }}>
                    <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginBottom: 4 }}>
                        Active workflow tasks tracked in Switch Room <code>#revenue-desk</code>:
                    </div>
                    {tasks.map((t) => {
                        const statusText = t.status === 'completed' ? '✓ Completed' : t.status === 'in_progress' ? '● In Progress' : '○ Pending';
                        const statusColor = t.status === 'completed' ? 'var(--color-emerald)' : t.status === 'in_progress' ? 'var(--color-blue)' : 'var(--text-muted)';
                        return (
                            <div className="task-card-item" key={t.id}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <span className="rule-badge">{t.id}</span>
                                    <div>
                                        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-heading)' }}>{t.title}</div>
                                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Assigned: {t.assigned_to}</div>
                                    </div>
                                </div>
                                <span style={{ fontSize: 10.5, fontWeight: 700, fontFamily: 'var(--font-mono)', color: statusColor }}>
                                    {statusText}
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ── TAB 3: DECISION LEDGER ── */}
            {roomTab === 'decisions' && (
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflowY: 'auto', padding: 14, gap: 10, background: '#FAFAFC' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>Cryptographic decision audit trail:</span>
                        <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--color-emerald)', fontWeight: 700 }}>
                            ● ZERO UNVERIFIED MUTATIONS
                        </span>
                    </div>
                    <div className="table-responsive" style={{ background: '#FFFFFF', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                        {decisions.length === 0 ? (
                            <div style={{ padding: 20, fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>
                                No decisions committed yet. Authorize a campaign to append to the Switch immutable ledger.
                            </div>
                        ) : (
                            <table className="clean-table">
                                <thead>
                                    <tr>
                                        <th>Decision ID</th>
                                        <th>Action Taken</th>
                                        <th>Authorized By</th>
                                        <th>Context & Justification</th>
                                        <th>Verification</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {decisions.map((d, i) => (
                                        <tr key={i}>
                                            <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>#DEC-{d.id || i + 1}</td>
                                            <td style={{ fontWeight: 700, color: 'var(--text-heading)' }}>{d.decision || d[1]}</td>
                                            <td style={{ color: 'var(--text-muted)' }}>{d.made_by || d[2]}</td>
                                            <td style={{ color: 'var(--text-muted)', fontSize: 11 }}>{d.context || d[3] || "Switch Consensus"}</td>
                                            <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-emerald)', fontWeight: 700 }}>✓ SHA-256 Verified</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            )}

            {/* ── TAB 4: GOVERNANCE RULES ── */}
            {roomTab === 'rules' && (
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflowY: 'auto', padding: 14, gap: 8, background: '#FAFAFC' }}>
                    <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginBottom: 4 }}>
                        Strict multi-agent policies enforced inside Switch Room <code>#revenue-desk</code>:
                    </div>

                    <div className="rule-card-item">
                        <span className="rule-badge">RULE 1</span>
                        <div>
                            <strong style={{ color: 'var(--text-heading)' }}>Mandatory SQL Proof:</strong>
                            <div style={{ color: 'var(--text-muted)', marginTop: 2 }}>
                                The Analyst agent MUST show raw, executable SQL for every revenue finding. Zero hallucinated metrics.
                            </div>
                        </div>
                    </div>

                    <div className="rule-card-item">
                        <span className="rule-badge">RULE 2</span>
                        <div>
                            <strong style={{ color: 'var(--text-heading)' }}>Independent Cross-Check:</strong>
                            <div style={{ color: 'var(--text-muted)', marginTop: 2 }}>
                                The Reviewer agent MUST run an independent query — never trusting the Analyst numbers without verification.
                            </div>
                        </div>
                    </div>

                    <div className="rule-card-item">
                        <span className="rule-badge">RULE 3</span>
                        <div>
                            <strong style={{ color: 'var(--text-heading)' }}>Refund Audit Completeness:</strong>
                            <div style={{ color: 'var(--text-muted)', marginTop: 2 }}>
                                All revenue calculations MUST join with the <code>refunds</code> table before reporting net figures.
                            </div>
                        </div>
                    </div>

                    <div className="rule-card-item">
                        <span className="rule-badge">RULE 4</span>
                        <div>
                            <strong style={{ color: 'var(--text-heading)' }}>Human-in-the-Loop Sign-Off Gate:</strong>
                            <div style={{ color: 'var(--text-muted)', marginTop: 2 }}>
                                No campaign mutation or customer incentive may be committed to production without explicit Human Lead sign-off.
                            </div>
                        </div>
                    </div>

                    <div className="rule-card-item">
                        <span className="rule-badge">RULE 5</span>
                        <div>
                            <strong style={{ color: 'var(--text-heading)' }}>Immutable Decision Logging:</strong>
                            <div style={{ color: 'var(--text-muted)', marginTop: 2 }}>
                                Every human and agent decision MUST be recorded in the cryptographic audit table with full context lineage.
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

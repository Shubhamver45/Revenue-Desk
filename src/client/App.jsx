import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import OverviewView from './components/OverviewView';
import InvestigationsView from './components/InvestigationsView';
import ApprovalsView from './components/ApprovalsView';
import AuditView from './components/AuditView';
import SwitchRoom from './components/SwitchRoom';
import DatabaseModal from './components/DatabaseModal';
import RoomSpecModal from './components/RoomSpecModal';
import AuditMemoModal from './components/AuditMemoModal';

export default function App() {
    // ── Application State with URL Sync ──
    const getInitialView = () => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const viewParam = params.get('view');
            if (viewParam && ['overview', 'investigations', 'room', 'approvals', 'audit'].includes(viewParam)) {
                return viewParam;
            }
            const hash = window.location.hash.replace('#', '');
            if (hash && ['overview', 'investigations', 'room', 'approvals', 'audit'].includes(hash)) {
                return hash;
            }
        }
        return 'overview';
    };

    const [activeView, setActiveView] = useState(getInitialView);

    const handleViewChange = (newView) => {
        setActiveView(newView);
        if (typeof window !== 'undefined' && window.history?.pushState) {
            const url = new URL(window.location);
            url.searchParams.set('view', newView);
            window.history.pushState({}, '', url);
        }
    };
    const [switchConnected, setSwitchConnected] = useState(true);
    const [metrics, setMetrics] = useState(null);
    const [investigationData, setInvestigationData] = useState(null);
    const [messages, setMessages] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [decisions, setDecisions] = useState([]);
    const [roomTab, setRoomTab] = useState('chat');
    const [activeModal, setActiveModal] = useState(null);
    const [isRunning, setIsRunning] = useState(false);
    const [comparisonMode, setComparisonMode] = useState('with');
    const [toastMessage, setToastMessage] = useState(null);

    // Show temporary banner / toast
    const showToast = (text, type = 'info') => {
        setToastMessage({ text, type });
        setTimeout(() => setToastMessage(null), 5000);
    };

    // ── Fetch Initial State ──
    const fetchState = async () => {
        try {
            const res = await fetch('/api/state');
            if (res.ok) {
                const data = await res.json();
                setInvestigationData(data);
                if (data.is_switch_connected !== undefined) {
                    setSwitchConnected(data.is_switch_connected);
                }
                if (data.messages && data.messages.length > 0) {
                    setMessages(data.messages);
                }
                if (data.tasks) {
                    setTasks(data.tasks);
                }
                if (data.decisions) {
                    setDecisions(data.decisions);
                }
            }
        } catch (e) {
            console.warn("Could not fetch /api/state", e);
        }
    };

    const fetchMetrics = async () => {
        try {
            const res = await fetch('/api/metrics');
            if (res.ok) {
                const data = await res.json();
                setMetrics(data);
            }
        } catch (e) {
            console.warn("Could not fetch /api/metrics", e);
        }
    };

    useEffect(() => {
        fetchState();
        fetchMetrics();
    }, []);

    // ── Toggle Switch Connection (Dependency Test) ──
    const handleToggleSwitch = async () => {
        try {
            const res = await fetch('/api/switch/toggle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'toggle' })
            });
            const data = await res.json();
            setSwitchConnected(data.is_connected);
            if (!data.is_connected) {
                showToast("⚠️ Switch Engine DISCONNECTED. Multi-agent rooms are paused (demonstrating criteria 1 Switch dependency).", "warning");
            } else {
                showToast("✓ Switch Engine RECONNECTED. Multi-agent rooms are active.", "success");
            }
            fetchState();
        } catch (e) {
            console.warn("Failed to toggle Switch", e);
        }
    };

    // ── Launch Benchmark Scenario ──
    const handleLaunchScenario = async (scenarioId) => {
        handleViewChange('investigations');
        setIsRunning(true);
        try {
            const res = await fetch('/api/scenarios/run', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ scenario_id: scenarioId })
            });

            if (res.status === 503) {
                const err = await res.json();
                showToast(`Switch Dependency Block: ${err.error}`, "warning");
                setIsRunning(false);
                return;
            }

            const data = await res.json();
            if (data.state) {
                setInvestigationData(data.state);
                if (data.state.messages) setMessages(data.state.messages);
                if (data.state.tasks) setTasks(data.state.tasks);
                if (data.state.decisions) setDecisions(data.state.decisions);
            }
            showToast("✓ Investigation completed via Switch dual-agent room stream.", "success");
        } catch (e) {
            console.warn("Scenario run failed", e);
            showToast(`Error: ${e.message}`, "warning");
        } finally {
            setIsRunning(false);
            fetchMetrics();
        }
    };

    // ── Run Custom Natural Language Inquiry ──
    const handleRunCustomInquiry = async (question) => {
        setIsRunning(true);
        try {
            const res = await fetch('/api/ask', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question, initiator: "@manager (Alex Rivera • VP Finance)" })
            });

            if (res.status === 503) {
                const err = await res.json();
                showToast(`Switch Dependency Block: ${err.error}`, "warning");
                setIsRunning(false);
                return;
            }

            const data = await res.json();
            setInvestigationData(data);
            if (data.messages) setMessages(data.messages);
            if (data.tasks) setTasks(data.tasks);
            if (data.decisions) setDecisions(data.decisions);
            showToast("✓ Inquiry executed & cross-audited in #revenue-desk.", "success");
        } catch (e) {
            console.warn("Inquiry failed", e);
            showToast(`Error: ${e.message}`, "warning");
        } finally {
            setIsRunning(false);
            fetchMetrics();
        }
    };

    // ── Authorize Proposal ──
    const handleAuthorize = async (discount, userRole) => {
        try {
            const res = await fetch('/api/approve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    response: `Approved. Change discount to ${discount}%.`,
                    discount: discount,
                    user_role: userRole,
                    authorized_by: userRole === 'manager' ? "Alex Rivera (VP Finance)" : "Staff Member"
                })
            });

            if (res.status === 403) {
                const errData = await res.json();
                showToast(`Security Check: ${errData.error}`, "warning");
                throw new Error(errData.error);
            }

            if (res.status === 503) {
                const errData = await res.json();
                showToast(`Switch Unavailable: ${errData.error}`, "warning");
                throw new Error(errData.error);
            }

            const data = await res.json();
            if (data.state) {
                setInvestigationData(data.state);
                if (data.state.messages) setMessages(data.state.messages);
                if (data.state.decisions) setDecisions(data.state.decisions);
            }
            showToast(`✓ Campaign authorized at ${discount}% and committed to SHA-256 decision ledger.`, "success");
            fetchMetrics();
        } catch (e) {
            console.warn("Authorization error", e);
            throw e;
        }
    };

    // ── Reject Proposal ──
    const handleReject = async (userRole) => {
        try {
            const res = await fetch('/api/approve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    decision: "rejected",
                    user_role: userRole,
                    authorized_by: "Alex Rivera (VP Finance)"
                })
            });

            if (res.status === 403) {
                const errData = await res.json();
                showToast(`Security Check: ${errData.error}`, "warning");
                throw new Error(errData.error);
            }

            const data = await res.json();
            if (data.state) {
                setInvestigationData(data.state);
                if (data.state.decisions) setDecisions(data.state.decisions);
            }
            showToast("✓ Proposal rejected. Recorded in tamper-evident decision log.", "info");
        } catch (e) {
            console.warn("Rejection error", e);
            throw e;
        }
    };

    // ── Reset Session ──
    const handleReset = async () => {
        try {
            await fetch('/api/reset');
            showToast("Room state reset to clean baseline.", "info");
            fetchState();
            fetchMetrics();
        } catch (e) {
            window.location.reload();
        }
    };

    const pendingApprovalsCount = (investigationData?.proposal && !investigationData?.approval_record) ? 1 : 0;

    return (
        <>
            <Navbar 
                activeView={activeView}
                onViewChange={handleViewChange}
                switchConnected={switchConnected}
                onToggleSwitch={handleToggleSwitch}
                pendingApprovalsCount={pendingApprovalsCount}
                onOpenModal={setActiveModal}
                onReset={handleReset}
            />

            {/* Notification Toast */}
            {toastMessage && (
                <div style={{
                    position: 'fixed',
                    top: 64,
                    right: 24,
                    zIndex: 100,
                    padding: '10px 16px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 12.5,
                    fontWeight: 600,
                    boxShadow: 'var(--shadow-modal)',
                    background: toastMessage.type === 'warning' ? '#FEF2F2' : toastMessage.type === 'success' ? '#ECFDF5' : '#EFF6FF',
                    color: toastMessage.type === 'warning' ? '#991B1B' : toastMessage.type === 'success' ? '#065F46' : '#1E40AF',
                    border: `1px solid ${toastMessage.type === 'warning' ? '#FECACA' : toastMessage.type === 'success' ? '#A7F3D0' : '#BFDBFE'}`,
                    animation: 'fadeIn 0.2s ease-out'
                }}>
                    {toastMessage.text}
                </div>
            )}

            <main className="workspace">
                {/* VIEW 1: OVERVIEW */}
                {activeView === 'overview' && (
                    <OverviewView 
                        metrics={metrics}
                        investigationData={investigationData}
                        tasks={tasks}
                        decisions={decisions}
                        messages={messages}
                        onLaunchScenario={handleLaunchScenario}
                        onNavigate={handleViewChange}
                        comparisonMode={comparisonMode}
                        onToggleMode={setComparisonMode}
                        switchConnected={switchConnected}
                    />
                )}

                {/* VIEW 2: INVESTIGATIONS */}
                {activeView === 'investigations' && (
                    <InvestigationsView 
                        investigationData={investigationData}
                        onRunScenario={handleLaunchScenario}
                        onRunCustomInquiry={handleRunCustomInquiry}
                        isRunning={isRunning}
                        switchConnected={switchConnected}
                        onAuthorize={handleAuthorize}
                        onReject={handleReject}
                        onOpenAudit={() => handleViewChange('audit')}
                    />
                )}

                {/* VIEW 3: SWITCH ROOM */}
                {activeView === 'room' && (
                    <div className="room-view-layout">
                        {/* Left Pane: Room Details & Participants */}
                        <div className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div>
                                <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>ROOM SPECIFICATION</div>
                                <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-heading)', marginTop: 2 }}>#revenue-desk</div>
                                <div style={{ fontSize: 11, color: 'var(--color-emerald)', marginTop: 2 }}>● Switch v2.0 Protocol Engine</div>
                            </div>

                            <div style={{ borderTop: '1px solid var(--border-default)', paddingTop: 12 }}>
                                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8 }}>PARTICIPANTS (3)</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <div className="msg-avatar" style={{ background: '#0F172A', width: 26, height: 26, fontSize: 10 }}>AR</div>
                                        <div>
                                            <div style={{ fontSize: 12, fontWeight: 600 }}>Alex Rivera</div>
                                            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Human Lead (VP Finance)</div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <div className="msg-avatar" style={{ background: '#059669', width: 26, height: 26, fontSize: 10 }}>AN</div>
                                        <div>
                                            <div style={{ fontSize: 12, fontWeight: 600 }}>@analyst</div>
                                            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Groq Llama 3.3 70B • SQL Engine</div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <div className="msg-avatar" style={{ background: '#B45309', width: 26, height: 26, fontSize: 10 }}>RV</div>
                                        <div>
                                            <div style={{ fontSize: 12, fontWeight: 600 }}>@reviewer</div>
                                            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Gemini 2.0 Flash • Audit Guard</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ borderTop: '1px solid var(--border-default)', paddingTop: 12 }}>
                                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8 }}>ROOM GOVERNANCE</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 11, color: 'var(--text-body)' }}>
                                    <div>✓ Rule 1: Multi-Agent Required</div>
                                    <div>✓ Rule 2: Read-Only Queries</div>
                                    <div>✓ Rule 3: 100% Consensus</div>
                                    <div>✓ Rule 4: Human Sign-Off Gate</div>
                                    <div>✓ Rule 5: SHA-256 Signatures</div>
                                </div>
                            </div>
                        </div>

                        {/* Center Pane: Real-Time Stream */}
                        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <SwitchRoom 
                                roomTab={roomTab}
                                onTabChange={setRoomTab}
                                messages={messages}
                                tasks={tasks}
                                decisions={decisions}
                                onSendMessage={handleRunCustomInquiry}
                                onQuickInquiry={handleRunCustomInquiry}
                                hasPendingApproval={pendingApprovalsCount > 0}
                                onAuthorize={() => handleAuthorize(15, 'manager')}
                                onOpenGateView={() => handleViewChange('approvals')}
                            />
                        </div>

                        {/* Right Pane: Switch Tasks & Lineage */}
                        <div className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div>
                                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6 }}>SWITCH TASKS</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {tasks.map(t => (
                                        <div key={t.id} style={{ background: 'var(--bg-subtle)', padding: '8px 10px', borderRadius: 6, border: '1px solid var(--border-subtle)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontSize: 10.5, fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{t.id}</span>
                                                <span style={{ fontSize: 10, color: t.status === 'completed' ? 'var(--color-emerald)' : 'var(--text-muted)', fontWeight: 600 }}>
                                                    {t.status === 'completed' ? '✓ DONE' : '○ PENDING'}
                                                </span>
                                            </div>
                                            <div style={{ fontSize: 11, color: 'var(--text-heading)', marginTop: 2, fontWeight: 600 }}>{t.title}</div>
                                            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{t.assigned_to}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div style={{ borderTop: '1px solid var(--border-default)', paddingTop: 12 }}>
                                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6 }}>DECISION LINAGE</div>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                    {decisions.length} cryptographic decisions recorded in current session.
                                </div>
                                <button className="btn-ghost" style={{ marginTop: 8, fontSize: 11, width: '100%', justifyContent: 'center' }} onClick={() => handleViewChange('audit')}>
                                    Open Full Audit Ledger &rarr;
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* VIEW 4: APPROVALS */}
                {activeView === 'approvals' && (
                    <ApprovalsView 
                        investigationData={investigationData}
                        onAuthorize={handleAuthorize}
                        onReject={handleReject}
                        switchConnected={switchConnected}
                        onOpenAudit={() => handleViewChange('audit')}
                    />
                )}

                {/* VIEW 5: AUDIT HISTORY */}
                {activeView === 'audit' && (
                    <AuditView />
                )}
            </main>

            {/* Modals */}
            <DatabaseModal 
                isOpen={activeModal === 'database'} 
                onClose={() => setActiveModal(null)} 
            />
            <RoomSpecModal 
                isOpen={activeModal === 'switch'} 
                onClose={() => setActiveModal(null)} 
            />
            <AuditMemoModal 
                isOpen={activeModal === 'memo'} 
                onClose={() => setActiveModal(null)} 
            />
        </>
    );
}

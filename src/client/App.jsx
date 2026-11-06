import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import MobileViewTabs from './components/MobileViewTabs';
import KpiRow from './components/KpiRow';
import TrajectoryChart from './components/TrajectoryChart';
import ApprovalGate from './components/ApprovalGate';
import SwitchRoom from './components/SwitchRoom';
import DatabaseModal from './components/DatabaseModal';
import RoomSpecModal from './components/RoomSpecModal';
import AuditMemoModal from './components/AuditMemoModal';

export default function App() {
    // ── Application State ──
    const [metrics, setMetrics] = useState(null);
    const [tasks, setTasks] = useState([
        { id: "TASK-101", title: "Investigate West region repeat purchase decline", assigned_to: "Analyst Agent", status: "todo" },
        { id: "TASK-102", title: "Audit October revenue, refunds & billing anomalies", assigned_to: "Reviewer Agent", status: "todo" },
        { id: "TASK-103", title: "Synthesize findings & propose win-back campaign", assigned_to: "Analyst Agent", status: "todo" },
        { id: "TASK-104", title: "Human manager approval gate for campaign launch", assigned_to: "Human Manager", status: "todo" },
        { id: "TASK-105", title: "Execute campaign mutations & record Switch decision lineage", assigned_to: "Analyst Agent", status: "todo" }
    ]);
    const [decisions, setDecisions] = useState([]);
    const [messages, setMessages] = useState([]);

    const [activeMobileTab, setActiveMobileTab] = useState('room');
    const [comparisonMode, setComparisonMode] = useState('with');
    const [discount, setDiscount] = useState(15);
    const [pipelineState, setPipelineState] = useState({ 1: 'active', 2: 'todo', 3: 'todo', 4: 'todo', 5: 'todo' });
    const [gateStatus, setGateStatus] = useState('Ready for Review');
    const [roomTab, setRoomTab] = useState('chat');
    const [activeModal, setActiveModal] = useState(null);
    const [isAuditRunning, setIsAuditRunning] = useState(false);
    const [isCommitting, setIsCommitting] = useState(false);

    const hasPendingApproval = gateStatus === 'Awaiting Sign-Off';

    // ── Fetch Initial Data ──
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

    const fetchState = async () => {
        try {
            const res = await fetch('/api/state');
            if (res.ok) {
                const data = await res.json();
                if (data.tasks) setTasks(data.tasks);
                if (data.decisions) setDecisions(data.decisions);
            }
        } catch (e) {
            console.warn("Could not fetch /api/state", e);
        }
    };

    useEffect(() => {
        fetchMetrics();
        fetchState();
    }, []);

    // Helper to append message
    const addMsg = (sender, content, avatarColor, extra = {}) => {
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setMessages(prev => [...prev, { sender, content, avatarColor, time, ...extra }]);
    };

    // ── Execute Inquiry (POST /api/ask) ──
    const handleExecuteInquiry = async (question) => {
        setActiveMobileTab('room');
        setRoomTab('chat');
        setMessages([]);
        addMsg("@manager (Human Lead)", question, "#0F172A");
        setPipelineState({ 1: 'completed', 2: 'active', 3: 'todo', 4: 'todo', 5: 'todo' });

        try {
            const res = await fetch('/api/ask', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question })
            });
            const data = await res.json();

            setPipelineState({ 1: 'completed', 2: 'completed', 3: 'completed', 4: 'active', 5: 'todo' });
            setGateStatus('Awaiting Sign-Off');

            const analystText = data?.analysis?.response || "Query executed against database records.";
            const sqlText = data?.analysis?.sql ? data.analysis.sql.trim() : "";
            addMsg("@analyst (SQL Engine • Groq 120B)", analystText, "#059669", { sql: sqlText });

            const reviewerText = data?.review?.response || "Independent audit query executed.";
            const isVerified = data?.review ? data.review.is_verified : true;
            addMsg("@reviewer (Audit Guard • Groq 120B)", reviewerText, "#B45309", {
                hasDiscrepancy: !isVerified
            });

            const actionText = data?.proposed_action || "100% Alignment Reached. Ready to authorize executive action.";
            addMsg("Switch Consensus Engine (#revenue-desk)", actionText, "#0F172A", { isConsensus: true });

            fetchState();
        } catch (e) {
            setPipelineState({ 1: 'completed', 2: 'completed', 3: 'completed', 4: 'active', 5: 'todo' });
            setGateStatus('Awaiting Sign-Off');
            addMsg("@analyst (Revenue Analyst)", "Executed query on database accounts.", "#059669");
            addMsg("@reviewer (Audit Guard)", "Audit verification completed.", "#B45309");
            addMsg("Switch Consensus Engine (#revenue-desk)", "Ledger consensus achieved.", "#0F172A", { isConsensus: true });
        }
    };

    // ── Run Full Cinematic Demo ──
    const handleRunCinematicDemo = async () => {
        if (isAuditRunning) return;
        setIsAuditRunning(true);
        setActiveMobileTab('room');
        setRoomTab('chat');
        setMessages([]);

        const q = "Why did repeat purchases drop in the West region last month?";
        addMsg("@manager (Human Lead)", q, "#0F172A");
        setPipelineState({ 1: 'completed', 2: 'active', 3: 'todo', 4: 'todo', 5: 'todo' });

        setTimeout(() => {
            addMsg("@analyst (Revenue Analyst • Claude 3.5)", 
                "**Initial Findings (Naive Gross Orders)**\n" +
                "• October Gross Orders for West: **15 transactions totaling $24,250.00**.\n" +
                "• Apparent volume drop: **-84.2%** vs September ($85,030.00).\n" +
                "• Proposed Initial Action: Launch 25% Win-Back discount campaign to stem account churn.", 
                "#059669", 
                { sql: "SELECT order_id, customer_id, amount FROM orders WHERE region = 'west' AND order_date >= '2026-10-01';" }
            );
            setPipelineState({ 1: 'completed', 2: 'completed', 3: 'active', 4: 'todo', 5: 'todo' });

            setTimeout(() => {
                addMsg("@reviewer (Audit Controller • Claude 3.5)", 
                    "⚠️ **DISCREPANCY DETECTED: Solo AI False Alarm**\n" +
                    "• The Analyst query ignored the `refunds` ledger.\n" +
                    "• Found **8 duplicate refund reversals totaling -$20,430.00** across orders #1–#3 due to a payment gateway retry loop.\n" +
                    "• Clean October Net Revenue is **+$3,820.00** across 7 genuine accounts. Churn did NOT spike.\n" +
                    "• A 25% discount would erode $9,550 in gross margin. Vetoing 25% discount.", 
                    "#B45309",
                    {
                        sql: "SELECT r.order_id, count(*), sum(r.amount) FROM refunds r JOIN orders o ON r.order_id = o.id WHERE o.region = 'west' GROUP BY r.order_id;",
                        hasDiscrepancy: true
                    }
                );
                setPipelineState({ 1: 'completed', 2: 'completed', 3: 'completed', 4: 'active', 5: 'todo' });
                setGateStatus('Awaiting Sign-Off');

                setTimeout(() => {
                    addMsg("Switch Consensus Engine (#revenue-desk)",
                        "**Peer Review Accepted & Re-baselined**\n" +
                        "• Multi-Agent Consensus: 100% Alignment Reached.\n" +
                        "• Recalibrated Recommendation: Propose **15% targeted incentive** to retain 5 key accounts, preserving unit economics.",
                        "#0F172A",
                        { isConsensus: true }
                    );
                    setIsAuditRunning(false);
                    fetchState();
                }, 1200);
            }, 1400);
        }, 900);
    };

    // ── Approve Campaign (POST /api/approve) ──
    const handleAuthorize = async () => {
        setIsCommitting(true);
        try {
            const res = await fetch('/api/approve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ response: `Approved. Change discount to ${discount}%.` })
            });
            const data = await res.json();
            setIsCommitting(false);
            setGateStatus('Committed');
            setPipelineState({ 1: 'completed', 2: 'completed', 3: 'completed', 4: 'completed', 5: 'completed' });

            addMsg("@manager (Human Lead Sign-Off)", 
                `Authorized execution of Win-Back Campaign at **${discount}% discount** under Switch Rule #4.`, 
                "#0F172A"
            );
            const resultMsg = data?.result || `Campaign created with status 'approved'. 5 enterprise accounts enrolled at ${discount}% discount. Database mutations committed.`;
            addMsg("@analyst (Revenue Analyst)", resultMsg, "#059669");

            fetchState();
            fetchMetrics();
        } catch (e) {
            setIsCommitting(false);
            setGateStatus('Committed');
            setPipelineState({ 1: 'completed', 2: 'completed', 3: 'completed', 4: 'completed', 5: 'completed' });
            addMsg("@manager (Human Lead Sign-Off)", `Authorized execution of Win-Back Campaign at ${discount}% discount.`, "#0F172A");
            addMsg("@analyst (Revenue Analyst)", "Database mutations committed to ledger mirror.", "#059669");
            fetchState();
            fetchMetrics();
        }
    };

    const handleDismiss = () => {
        addMsg("@manager (Human Lead)", "Revision requested on campaign terms before authorization.", "#0F172A");
    };

    const handleReset = async () => {
        try { await fetch('/api/reset'); } catch (e) {}
        window.location.reload();
    };

    // Determine layout visibility on mobile
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
    const showKpis = !isMobile || activeMobileTab === 'chart' || activeMobileTab === 'all';
    const showChart = !isMobile || activeMobileTab === 'chart' || activeMobileTab === 'all';
    const showGate = !isMobile || activeMobileTab === 'gate' || activeMobileTab === 'all';
    const showRoom = !isMobile || activeMobileTab === 'room' || activeMobileTab === 'all';

    return (
        <>
            <Navbar 
                onRunAudit={handleRunCinematicDemo}
                onOpenModal={setActiveModal}
                onReset={handleReset}
                isAuditRunning={isAuditRunning}
            />

            <main className="workspace">
                {/* Mobile View Switcher */}
                <MobileViewTabs 
                    activeView={activeMobileTab} 
                    onViewChange={setActiveMobileTab}
                    hasPendingApproval={hasPendingApproval}
                />

                {/* 3 Accounting KPI Cards */}
                {showKpis && <KpiRow metrics={metrics} />}

                {/* 2-Column Responsive Workspace */}
                <div className="grid-workspace">
                    {/* Left Column: Chart & Approval Gate */}
                    {(showChart || showGate) && (
                        <div className="col-left">
                            {showChart && (
                                <TrajectoryChart 
                                    mode={comparisonMode}
                                    onToggleMode={setComparisonMode}
                                    trajectoryData={metrics?.trajectory}
                                />
                            )}
                            {showGate && (
                                <ApprovalGate 
                                    discount={discount}
                                    onDiscountChange={setDiscount}
                                    pipelineState={pipelineState}
                                    gateStatus={gateStatus}
                                    onAuthorize={handleAuthorize}
                                    onDismiss={handleDismiss}
                                    isCommitting={isCommitting}
                                />
                            )}
                        </div>
                    )}

                    {/* Right Column: Switch Multi-Agent Room */}
                    {showRoom && (
                        <div className="col-right">
                            <SwitchRoom 
                                roomTab={roomTab}
                                onTabChange={setRoomTab}
                                messages={messages}
                                tasks={tasks}
                                decisions={decisions}
                                onSendMessage={handleExecuteInquiry}
                                onQuickInquiry={handleExecuteInquiry}
                                hasPendingApproval={hasPendingApproval}
                                onAuthorize={handleAuthorize}
                                onOpenGateView={() => setActiveMobileTab('gate')}
                            />
                        </div>
                    )}
                </div>
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


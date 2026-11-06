import React from 'react';

export default function ApprovalGate({
    discount,
    onDiscountChange,
    pipelineState,
    gateStatus,
    onAuthorize,
    onDismiss,
    isCommitting
}) {
    const totalArr = 38200;
    const cost = Math.round(totalArr * (discount / 100));
    const gain = totalArr - cost;

    const steps = [
        { id: 1, name: "TASK-101 (Ask)" },
        { id: 2, name: "TASK-102 (SQL)" },
        { id: 3, name: "TASK-103 (Audit)" },
        { id: 4, name: "TASK-104 (Sign-Off)" },
        { id: 5, name: "TASK-105 (Commit)" }
    ];

    const currentStepNum = Object.keys(pipelineState).reduce((acc, step) => {
        return pipelineState[step] === 'active' || pipelineState[step] === 'completed' ? Math.max(acc, parseInt(step)) : acc;
    }, 1);

    return (
        <div className="card gate-card">
            <div className="gate-header">
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="rule-badge">SWITCH RULE #4</span>
                        <span className="card-title">Human-in-the-Loop Sign-Off Gate</span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                        Declarative guardrail: Database mutations blocked until Human Lead explicitly signs off.
                    </div>
                </div>
                <span className="gate-status" id="gateBadge">{gateStatus}</span>
            </div>

            {/* Desktop Horizontal Stepper */}
            <div className="stepper-desktop">
                {steps.map((s, idx) => {
                    const status = pipelineState[s.id] || (s.id === 1 ? 'completed' : 'todo');
                    return (
                        <React.Fragment key={s.id}>
                            <div className={`step-item ${status}`}>
                                <span className="step-num">{status === 'completed' ? '✓' : s.id}</span>
                                <span>{s.name}</span>
                            </div>
                            {idx < steps.length - 1 && <span style={{ color: 'var(--border-strong)' }}>&rarr;</span>}
                        </React.Fragment>
                    );
                })}
            </div>

            {/* Mobile Adaptive Stepper */}
            <div className="stepper-mobile" id="mobileStepper">
                <div className="mobile-step-header">
                    <span className="mobile-step-badge">Step {currentStepNum} of 5</span>
                    <span className="mobile-step-name">{steps[currentStepNum - 1]?.name}</span>
                </div>
                <div className="mobile-step-track">
                    <div className="mobile-step-fill" style={{ width: `${(currentStepNum / 5) * 100}%` }}></div>
                </div>
            </div>

            {/* Discount Slider */}
            <div className="slider-section">
                <div className="slider-meta">
                    <span>Renewal Incentive Calibration:</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }} id="sliderValue">{discount}%</span>
                </div>
                <input 
                    type="range" 
                    min="5" 
                    max="25" 
                    step="5" 
                    value={discount} 
                    onChange={(e) => onDiscountChange(parseInt(e.target.value, 10))}
                    id="discountInput"
                />
            </div>

            {/* Impact Calculation Grid */}
            <div className="impact-table">
                <div className="impact-cell">
                    <span className="impact-lbl">Protected Pipeline</span>
                    <span className="impact-val" style={{ color: 'var(--color-emerald)' }}>
                        +${totalArr.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                </div>
                <div className="impact-cell">
                    <span className="impact-lbl">Campaign Cost</span>
                    <span className="impact-val" style={{ color: 'var(--color-crimson)' }}>
                        -${cost.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                </div>
                <div className="impact-cell">
                    <span className="impact-lbl">Net Margin Contribution</span>
                    <span className="impact-val" style={{ color: 'var(--text-heading)' }}>
                        +${gain.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="gate-actions">
                <button 
                    className="btn-authorize" 
                    onClick={onAuthorize} 
                    disabled={isCommitting || gateStatus === 'Committed'}
                >
                    <svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" strokeWidth="2.2" fill="none">
                        <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    <span>{isCommitting ? "Committing..." : gateStatus === 'Committed' ? "✓ Campaign Executed & Logged" : "Authorize Campaign Execution"}</span>
                </button>
                <button className="btn-dismiss" onClick={onDismiss}>Dismiss</button>
            </div>
        </div>
    );
}

import React, { useRef, useEffect, useState } from 'react';

export default function TrajectoryChart({ mode, onToggleMode, trajectoryData }) {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const [tooltip, setTooltip] = useState(null);

    const defaultPoints = [
        { label: "Jun", gross: 70510, net: 70510 },
        { label: "Jul", gross: 74630, net: 74630 },
        { label: "Aug", gross: 78350, net: 78350 },
        { label: "Sep", gross: 85030, net: 85030 },
        { label: "Oct", gross: 24250, net: 3820 }
    ];

    const soloFailPoints = [
        { label: "Jun", gross: 70510, net: 70510 },
        { label: "Jul", gross: 74630, net: 74630 },
        { label: "Aug", gross: 78350, net: 78350 },
        { label: "Sep", gross: 85030, net: 85030 },
        { label: "Oct", gross: 24250, net: -9550 }
    ];

    const isSoloFail = mode === 'without';
    const points = isSoloFail ? soloFailPoints : (trajectoryData || defaultPoints);

    const renderChart = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;

        canvas.width = Math.round(rect.width * dpr);
        canvas.height = Math.round(rect.height * dpr);
        if (ctx.resetTransform) ctx.resetTransform();
        else ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);

        const w = rect.width;
        const h = rect.height;
        ctx.clearRect(0, 0, w, h);

        const padLeft = 46;
        const padRight = 20;
        const padTop = 16;
        const padBottom = 24;
        const plotW = w - padLeft - padRight;
        const plotH = h - padTop - padBottom;

        let maxVal = 90000;
        let minVal = isSoloFail ? -15000 : 0;
        const valRange = maxVal - minVal;

        const mapX = (idx) => padLeft + (idx / (points.length - 1)) * plotW;
        const mapY = (val) => padTop + plotH - ((val - minVal) / valRange) * plotH;

        // Subtle Grid Lines
        const gridTicks = isSoloFail ? [-10000, 0, 25000, 50000, 75000] : [0, 25000, 50000, 75000];
        ctx.strokeStyle = "#E2E8F0";
        ctx.lineWidth = 1;
        ctx.fillStyle = "#94A3B8";
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";

        gridTicks.forEach(tick => {
            const y = mapY(tick);
            ctx.beginPath();
            ctx.moveTo(padLeft, y);
            ctx.lineTo(w - padRight, y);
            ctx.stroke();
            const lbl = tick < 0 ? `-$${Math.abs(tick / 1000)}k` : `$${tick / 1000}k`;
            ctx.fillText(lbl, padLeft - 6, y);
        });

        // X Labels
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        points.forEach((p, idx) => {
            const x = mapX(idx);
            ctx.fillStyle = (tooltip && tooltip.index === idx) ? "#0F172A" : "#94A3B8";
            ctx.font = (tooltip && tooltip.index === idx) ? '600 10px "JetBrains Mono", monospace' : '10px "JetBrains Mono", monospace';
            ctx.fillText(p.label, x, h - padBottom + 6);
        });

        // Draw Gross Volume Line
        ctx.beginPath();
        points.forEach((p, idx) => {
            const x = mapX(idx);
            const y = mapY(p.gross);
            if (idx === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.strokeStyle = "#94A3B8";
        ctx.lineWidth = 1.75;
        ctx.stroke();

        // Draw Net Revenue Line
        ctx.beginPath();
        points.forEach((p, idx) => {
            const x = mapX(idx);
            const y = mapY(p.net);
            if (idx === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.strokeStyle = isSoloFail ? "#DC2626" : "#059669";
        ctx.lineWidth = 2.25;
        ctx.stroke();

        // Dots on Net Revenue
        points.forEach((p, idx) => {
            const x = mapX(idx);
            const y = mapY(p.net);
            const isHovered = tooltip && tooltip.index === idx;

            ctx.beginPath();
            ctx.arc(x, y, isHovered ? 6 : (idx === points.length - 1 ? 5 : 3.5), 0, Math.PI * 2);
            ctx.fillStyle = isSoloFail ? "#DC2626" : "#059669";
            ctx.fill();
            ctx.strokeStyle = "#FFFFFF";
            ctx.lineWidth = 1.5;
            ctx.stroke();
        });

        // Anomaly vertical gap on October
        const lastIdx = points.length - 1;
        const pLast = points[lastIdx];
        if (pLast && pLast.gross !== pLast.net) {
            ctx.beginPath();
            ctx.setLineDash([3, 3]);
            ctx.moveTo(mapX(lastIdx), mapY(pLast.gross));
            ctx.lineTo(mapX(lastIdx), mapY(pLast.net));
            ctx.strokeStyle = "#DC2626";
            ctx.lineWidth = 1.8;
            ctx.stroke();
            ctx.setLineDash([]);
        }

        // Active vertical guide line on hover
        if (tooltip) {
            const x = mapX(tooltip.index);
            ctx.beginPath();
            ctx.setLineDash([2, 2]);
            ctx.moveTo(x, padTop);
            ctx.lineTo(x, h - padBottom);
            ctx.strokeStyle = "#CBD5E1";
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.setLineDash([]);
        }
    };

    const handleMouseMove = (e) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const padLeft = 46;
        const padRight = 20;
        const plotW = rect.width - padLeft - padRight;

        let closestIdx = -1;
        let minDiff = Infinity;
        points.forEach((p, idx) => {
            const x = padLeft + (idx / (points.length - 1)) * plotW;
            const diff = Math.abs(x - mouseX);
            if (diff < minDiff && diff < 36) {
                minDiff = diff;
                closestIdx = idx;
            }
        });

        if (closestIdx !== -1) {
            const pt = points[closestIdx];
            setTooltip({
                index: closestIdx,
                label: pt.label,
                gross: pt.gross,
                net: pt.net,
                x: padLeft + (closestIdx / (points.length - 1)) * plotW,
                y: e.clientY - rect.top
            });
        } else {
            setTooltip(null);
        }
    };

    const handleMouseLeave = () => {
        setTooltip(null);
    };

    useEffect(() => {
        renderChart();
        const handleResize = () => renderChart();
        window.addEventListener('resize', handleResize);

        let ro = null;
        if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
            ro = new ResizeObserver(() => renderChart());
            ro.observe(containerRef.current);
        }

        return () => {
            window.removeEventListener('resize', handleResize);
            if (ro) ro.disconnect();
        };
    }, [mode, trajectoryData]);

    return (
        <div className="card chart-card-compact" ref={containerRef}>
            <div className="chart-header-compact">
                <div className="card-title-group">
                    <span className="card-title-sm">Revenue Trajectory & Anomaly Inspection</span>
                    <span className="pill-badge">West Region MoM</span>
                </div>

                <div className="segment-toggle-compact">
                    <button 
                        className={`segment-btn ${mode === 'with' ? 'active' : ''}`}
                        onClick={() => onToggleMode('with')}
                        title="Show Switch dual-agent verified reconciliation"
                    >
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-emerald)' }}></span>
                        With Switch AI
                    </button>
                    <button 
                        className={`segment-btn ${mode === 'without' ? 'active' : ''}`}
                        onClick={() => onToggleMode('without')}
                        title="Show solo AI hallucination resulting in margin erosion"
                    >
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-crimson)' }}></span>
                        Without Switch (Solo AI)
                    </button>
                </div>
            </div>

            <div 
                className="canvas-wrap-compact" 
                id="canvasAreaContainer"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{ position: 'relative' }}
            >
                <canvas ref={canvasRef} id="revenueCanvas"></canvas>

                {/* Floating Interactive Tooltip */}
                {tooltip && (
                    <div 
                        className="chart-tooltip" 
                        style={{
                            left: Math.min(Math.max(tooltip.x - 70, 10), (containerRef.current?.clientWidth || 300) - 160),
                            top: 10
                        }}
                    >
                        <div className="tooltip-header">{tooltip.label} 2026</div>
                        <div className="tooltip-row">
                            <span className="tooltip-lbl">Reported Gross:</span>
                            <span className="tooltip-val">${tooltip.gross.toLocaleString()}</span>
                        </div>
                        <div className="tooltip-row">
                            <span className="tooltip-lbl">{mode === 'without' ? 'Solo AI Assumed:' : 'Reconciled Net:'}</span>
                            <span className="tooltip-val" style={{ color: mode === 'without' ? 'var(--color-crimson)' : 'var(--color-emerald)', fontWeight: 700 }}>
                                {tooltip.net < 0 ? `-$${Math.abs(tooltip.net).toLocaleString()}` : `$${tooltip.net.toLocaleString()}`}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            <div className="chart-footer-compact">
                {mode === 'without' ? (
                    <>
                        <span style={{ color: 'var(--color-crimson)', fontWeight: 700 }}>
                            🚨 Without Switch: Solo AI missed duplicate webhook retries, assumed churn
                        </span>
                        <span style={{ color: 'var(--color-crimson)', fontWeight: 700 }}>
                            Panic 25% discount • -$9,550 Lost Margin
                        </span>
                    </>
                ) : (
                    <>
                        <span style={{ color: 'var(--color-crimson)', fontWeight: 700 }}>
                            Audited Anomaly: -$20,430.00 duplicate loop • Orders #1–#3
                        </span>
                        <span style={{ color: 'var(--color-emerald)', fontWeight: 700 }}>
                            Certified Baseline: $3,820.00 Net Truth
                        </span>
                    </>
                )}
            </div>
        </div>
    );
}

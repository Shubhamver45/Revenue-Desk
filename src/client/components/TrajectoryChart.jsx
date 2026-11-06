import React, { useRef, useEffect } from 'react';

export default function TrajectoryChart({ mode, onToggleMode, trajectoryData }) {
    const canvasRef = useRef(null);

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

        const isSoloFail = mode === 'without';
        const points = isSoloFail ? soloFailPoints : (trajectoryData || defaultPoints);

        const padLeft = 45;
        const padRight = 24;
        const padTop = 18;
        const padBottom = 26;
        const plotW = w - padLeft - padRight;
        const plotH = h - padTop - padBottom;

        let maxVal = 90000;
        let minVal = isSoloFail ? -15000 : 0;
        const valRange = maxVal - minVal;

        const mapX = (idx) => padLeft + (idx / (points.length - 1)) * plotW;
        const mapY = (val) => padTop + plotH - ((val - minVal) / valRange) * plotH;

        // Grid lines
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

        // X labels
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        points.forEach((p, idx) => {
            const x = mapX(idx);
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
        ctx.lineWidth = 2;
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
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Dots on Net Revenue
        points.forEach((p, idx) => {
            const x = mapX(idx);
            const y = mapY(p.net);
            ctx.beginPath();
            ctx.arc(x, y, idx === points.length - 1 ? 5 : 3.5, 0, Math.PI * 2);
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
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.setLineDash([]);
        }
    };

    useEffect(() => {
        renderChart();
        const handleResize = () => renderChart();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [mode, trajectoryData]);

    return (
        <div className="card chart-card">
            <div className="card-header">
                <div className="card-title-group">
                    <span className="card-title">Revenue Trajectory & Anomaly Inspection</span>
                    <span className="pill-badge">West Region MoM</span>
                </div>

                <div className="segment-toggle">
                    <button 
                        className={`segment-btn ${mode === 'with' ? 'active' : ''}`}
                        onClick={() => onToggleMode('with')}
                    >
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-emerald)' }}></span>
                        With Switch AI
                    </button>
                    <button 
                        className={`segment-btn ${mode === 'without' ? 'active' : ''}`}
                        onClick={() => onToggleMode('without')}
                    >
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-crimson)' }}></span>
                        Without Switch (Solo AI)
                    </button>
                </div>
            </div>

            <div className="canvas-wrap" id="canvasAreaContainer">
                <canvas ref={canvasRef} id="revenueCanvas"></canvas>
            </div>

            <div className="chart-footer">
                {mode === 'without' ? (
                    <>
                        <span style={{ color: 'var(--color-crimson)', fontWeight: 700 }}>
                            🚨 Without Switch (Solo AI Blindness): Missed refund table, assumed 84.2% churn
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

import React, { useState, useEffect } from 'react';

export default function RoomSpecModal({ isOpen, onClose }) {
    const [spec, setSpec] = useState('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (isOpen && !spec) {
            fetch('/api/switch/template')
                .then(r => r.json())
                .then(d => setSpec(d.template_yaml || d.room_yaml || ''))
                .catch(() => setSpec('# Failed to load Switch room spec'));
        }
    }, [isOpen, spec]);

    const handleCopy = () => {
        navigator.clipboard.writeText(spec).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>&times;</button>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span className="rule-badge" style={{ background: 'var(--brand-obsidian)', color: '#fff', border: 'none' }}>SPEC</span>
                        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-heading)' }}>
                            Switch Room Template (revenue-desk.template.yaml)
                        </h3>
                    </div>
                    <button className="btn-ghost" onClick={handleCopy} style={{ fontSize: 11, padding: '5px 10px', marginRight: 32 }}>
                        {copied ? "✓ Copied!" : "Copy YAML"}
                    </button>
                </div>
                <div className="sql-box" style={{ background: '#0F172A', color: '#38BDF8', maxHeight: '60vh', overflowY: 'auto', whiteSpace: 'pre-wrap' }}>
                    {spec || 'Loading Switch Room spec...'}
                </div>
            </div>
        </div>
    );
}


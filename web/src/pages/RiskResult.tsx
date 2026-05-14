import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import AppShell from '../components/AppShell';

const getColor = (score: number) => {
    if (score >= 70) return '#16a34a';
    if (score >= 40) return '#f59e0b';
    return '#ef4444';
};

const RiskResult: React.FC = () => {
    const location: any = useLocation();
    const { loan, aiDecision } = location.state || {};
    const score = aiDecision ? aiDecision.riskScore || aiDecision.risk_score : null;

    return (
        <AppShell
            title="AI Risk Result"
            subtitle="A clear, visual summary of the simulated AI decision for your loan."
            videoSrc="/videos/banking.mp4"
        >
            {!aiDecision ? (
                <div className="glass-card fade-in-up">
                    <div className="card-title-lg">No result to show</div>
                    <div className="stat-sub" style={{ marginTop: 8 }}>
                        Return to <Link to="/apply-loan">Apply</Link>.
                    </div>
                </div>
            ) : (
                <div className="cards-grid cards-grid-main">
                    <div className="glass-card card-dark fade-in-up">
                        <div className="card-header">
                            <div>
                                <div className="card-title">Risk Score</div>
                                <div className="stat-sub">Lower is better</div>
                            </div>
                            <span className="stat-badge neutral">{score}%</span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px' }}>
                            <div className="score-ring-wrap" aria-label={`Risk score ${score}%`}>
                                <svg width="110" height="110" viewBox="0 0 36 36">
                                    <path stroke="rgba(255,255,255,0.10)" strokeWidth="3.2" fill="none" d="M18 2a16 16 0 1 1 0 32 16 16 0 1 1 0-32" />
                                    <path stroke={getColor(score)} strokeWidth="3.2" strokeLinecap="round" fill="none" strokeDasharray={`${(score / 100) * 100} 100`} d="M18 2a16 16 0 1 1 0 32 16 16 0 1 1 0-32" />
                                </svg>
                                <div className="score-ring-value">
                                    {score}
                                    <small>/100</small>
                                </div>
                            </div>
                        </div>

                        <hr className="divider" />
                        <div className="filter-pills">
                            <Link to="/apply-loan" className="btn btn-ghost btn-sm">New application</Link>
                            <Link to="/loan-status" className="btn btn-primary btn-sm">View loans</Link>
                        </div>
                    </div>

                    <div className="glass-card fade-in-up">
                        <div className="card-header">
                            <div>
                                <div className="card-title">Decision</div>
                                <div className="card-title-lg" style={{ color: getColor(score), textTransform: 'uppercase' }}>
                                    {aiDecision.decision || aiDecision.approval_status}
                                </div>
                                <div className="stat-sub" style={{ marginTop: 6 }}>
                                    <strong>Confidence:</strong> {aiDecision.confidence || 'N/A'}
                                </div>
                            </div>
                            <span className="chip chip-teal">{loan?.sector || '—'}</span>
                        </div>

                        <div className="stat-sub" style={{ marginTop: 10 }}>
                            <strong>Explanation:</strong> {aiDecision.explanation}
                        </div>
                        <div className="stat-sub" style={{ marginTop: 10 }}>
                            <strong>Requested:</strong> RWF {Number(loan?.amount || 0).toLocaleString()} • <strong>Duration:</strong> {loan?.duration || 12} months
                        </div>
                        <hr className="divider" />
                        <Link to="/dashboard" className="btn btn-primary">Go to Dashboard</Link>
                    </div>
                </div>
            )}
        </AppShell>
    );
};

export default RiskResult;

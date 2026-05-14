import React from 'react';
import AppShell from '../components/AppShell';

const Reports: React.FC = () => {
    return (
        <AppShell
            title="Reports & Analytics"
            subtitle="Exportable reports, charts, and dataset downloads (ready to connect to reporting APIs)."
            videoSrc="/videos/banking.mp4"
            headerRight={<span className="chip chip-teal">Reports</span>}
        >
            <div className="cards-grid cards-grid-main">
                <div className="glass-card card-dark fade-in-up">
                    <div className="card-header">
                        <div>
                            <div className="card-title">Report Builder</div>
                            <div className="stat-sub">Select data sources and export</div>
                        </div>
                        <span className="stat-badge neutral">Placeholder</span>
                    </div>

                    <div style={{ display: 'grid', gap: 12, marginTop: 10 }}>
                        <div className="tx-row">
                            <div className="tx-icon icon-box teal" aria-hidden="true">⇩</div>
                            <div className="tx-desc">
                                <strong>CSV export</strong>
                                <span>Transactions, loans, savings</span>
                            </div>
                            <div className="tx-amount">
                                <strong>Coming</strong>
                                <span style={{ color: '#7ea4bb' }}>Download</span>
                            </div>
                        </div>
                        <div className="tx-row">
                            <div className="tx-icon icon-box gold" aria-hidden="true">◎</div>
                            <div className="tx-desc">
                                <strong>Charts</strong>
                                <span>Trends, risk, category breakdown</span>
                            </div>
                            <div className="tx-amount">
                                <strong>Coming</strong>
                                <span style={{ color: '#7ea4bb' }}>Visualize</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gap: 18 }}>
                    <div className="glass-card fade-in-up">
                        <div className="card-header">
                            <div>
                                <div className="card-title">Next steps</div>
                                <div className="stat-sub">Connect APIs and permissions</div>
                            </div>
                            <span className="insight-pill low">Plan</span>
                        </div>

                        <div className="stat-sub" style={{ marginTop: 10 }}>
                            Add backend endpoints for report generation, role-based access, and export formats (CSV/Excel/PDF).
                        </div>
                        <hr className="divider" />
                        <div className="filter-pills">
                            <button className="btn btn-ghost btn-sm" type="button">Create template</button>
                            <button className="btn btn-primary btn-sm" type="button">Export sample</button>
                        </div>
                    </div>
                </div>
            </div>
        </AppShell>
    );
};

export default Reports;

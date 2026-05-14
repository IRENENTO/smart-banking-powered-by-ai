import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../components/AppShell';
import SectionCard from '../components/SectionCard';
import LoadingButton from '../components/LoadingButton';
import { FileText, Download, Calendar, Filter } from 'lucide-react';

interface Statement {
  id: number;
  statement_type: string;
  statement_period: string;
  file_path: string;
  file_size: number;
  download_count: number;
  generated_at: string;
}

const Statements: React.FC = () => {
  const [statements, setStatements] = useState<Statement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const navigate = useNavigate();

  useEffect(() => {
    const loadStatements = async () => {
      setLoading(true);
      try {
        // Mock data for now - would connect to backend
        const mockStatements: Statement[] = [
          {
            id: 1,
            statement_type: 'monthly',
            statement_period: 'January 2024',
            file_path: '/statements/january-2024.pdf',
            file_size: 245760,
            download_count: 12,
            generated_at: '2024-02-01T10:00:00Z'
          },
          {
            id: 2,
            statement_type: 'monthly',
            statement_period: 'December 2023',
            file_path: '/statements/december-2023.pdf',
            file_size: 189432,
            download_count: 8,
            generated_at: '2024-01-01T10:00:00Z'
          },
          {
            id: 3,
            statement_type: 'quarterly',
            statement_period: 'Q4 2023',
            file_path: '/statements/q4-2023.pdf',
            file_size: 567890,
            download_count: 5,
            generated_at: '2024-01-01T10:00:00Z'
          },
          {
            id: 4,
            statement_type: 'annual',
            statement_period: 'Annual 2023',
            file_path: '/statements/annual-2023.pdf',
            file_size: 2345678,
            download_count: 15,
            generated_at: '2024-01-01T10:00:00Z'
          }
        ];
        setStatements(mockStatements);
      } catch (err: any) {
        setError('Failed to load statements');
      } finally {
        setLoading(false);
      }
    };

    loadStatements();
  }, []);

  const handleDownload = async (statement: Statement) => {
    try {
      // Mock download - would trigger actual file download
      const link = document.createElement('a');
      link.href = statement.file_path;
      link.download = `${statement.statement_period}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Update download count
      setStatements(prev => prev.map(s => 
        s.id === statement.id 
          ? { ...s, download_count: s.download_count + 1 }
          : s
      ));
    } catch (err: any) {
      setError('Failed to download statement');
    }
  };

  const handleGenerateStatement = async (type: string) => {
    try {
      // Mock API call
      const newStatement: Statement = {
        id: statements.length + 1,
        statement_type: type,
        statement_period: type === 'monthly' 
          ? `${new Date().toLocaleString('en-US', { month: 'long' })} ${new Date().getFullYear()}`
          : type === 'quarterly'
          ? `Q${Math.ceil((new Date().getMonth() + 1) / 3)} ${new Date().getFullYear()}`
          : `Annual ${new Date().getFullYear()}`,
        file_path: `/statements/${type}-${Date.now()}.pdf`,
        file_size: Math.floor(Math.random() * 1000000) + 500000,
        download_count: 0,
        generated_at: new Date().toISOString()
      };
      
      setStatements(prev => [newStatement, ...prev]);
      setError('');
      
      // Auto-download the new statement
      setTimeout(() => handleDownload(newStatement), 1000);
    } catch (err: any) {
      setError('Failed to generate statement');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const dm = Math.pow(10, i < 2 ? 2 : 2);
    const r = Math.round((bytes / Math.pow(k, i)) * dm) / dm;
    return parseFloat(r.toString()) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const filteredStatements = statements.filter(statement => {
    if (selectedType === 'all') return true;
    if (selectedType === 'monthly') return statement.statement_type === 'monthly';
    if (selectedType === 'quarterly') return statement.statement_type === 'quarterly';
    if (selectedType === 'annual') return statement.statement_type === 'annual';
    return true;
  }).filter(statement => 
    statement.statement_period.includes(selectedYear)
  );

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'monthly':
        return <Calendar size={20} style={{ color: '#0A9396' }} />;
      case 'quarterly':
        return <FileText size={20} style={{ color: '#059669' }} />;
      case 'annual':
        return <FileText size={20} style={{ color: '#d97706' }} />;
      default:
        return <FileText size={20} style={{ color: '#64748b' }} />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'monthly':
        return '#0A9396';
      case 'quarterly':
        return '#059669';
      case 'annual':
        return '#d97706';
      default:
        return '#64748b';
    }
  };

  return (
    <AppShell
      title="Account Statements"
      subtitle="Download and manage your account statements"
      videoSrc="/videos/banking.mp4"
    >
      <div style={{ display: 'grid', gap: 24 }}>
        {error && <div className="toast toast-error">{error}</div>}

        <SectionCard 
          title="Generate New Statement"
          subtitle="Create custom statements for specific periods"
          headerRight={
            <FileText size={24} style={{ color: '#0A9396' }} />
          }
        >
          <div style={{ display: 'grid', gap: 16, marginTop: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              <LoadingButton
                onClick={() => handleGenerateStatement('monthly')}
                variant="primary"
                style={{ width: '100%' }}
              >
                📅 Monthly Statement
              </LoadingButton>
              <LoadingButton
                onClick={() => handleGenerateStatement('quarterly')}
                variant="secondary"
                style={{ width: '100%' }}
              >
                📊 Quarterly Statement
              </LoadingButton>
              <LoadingButton
                onClick={() => handleGenerateStatement('annual')}
                variant="ghost"
                style={{ width: '100%' }}
              >
                📈 Annual Statement
              </LoadingButton>
            </div>
          </div>
        </SectionCard>

        <SectionCard 
          title="Available Statements"
          subtitle="Your generated statements and documents"
          headerRight={
            <Download size={24} style={{ color: '#0A9396' }} />
          }
        >
          <div style={{ marginTop: 16 }}>
            {/* Filters */}
            <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Filter size={20} style={{ color: '#64748b' }} />
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  style={{ 
                    padding: '8px 12px', 
                    borderRadius: 8, 
                    border: '1px solid #cbd5e1',
                    background: '#f8fafc',
                    fontSize: '14px'
                  }}
                >
                  <option value="all">All Types</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="annual">Annual</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Calendar size={20} style={{ color: '#64748b' }} />
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  style={{ 
                    padding: '8px 12px', 
                    borderRadius: 8, 
                    border: '1px solid #cbd5e1',
                    background: '#f8fafc',
                    fontSize: '14px'
                  }}
                >
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                  <option value="2022">2022</option>
                  <option value="2021">2021</option>
                </select>
              </div>
            </div>

            {/* Statements List */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div>Loading statements...</div>
              </div>
            ) : filteredStatements.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{ color: '#64748b', marginBottom: 16 }}>No statements found for the selected criteria</div>
                <LoadingButton
                  onClick={() => handleGenerateStatement('monthly')}
                  variant="primary"
                >
                  Generate Monthly Statement
                </LoadingButton>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 16 }}>
                {filteredStatements.map((statement) => (
                  <div key={statement.id} style={{
                    background: 'white',
                    padding: 20,
                    borderRadius: 12,
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: 8,
                        background: getTypeColor(statement.statement_type),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {getTypeIcon(statement.statement_type)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: '#0B1F3A', marginBottom: 4 }}>
                          {statement.statement_period}
                        </div>
                        <div style={{ color: '#64748b', fontSize: '14px' }}>
                          {statement.statement_type.charAt(0).toUpperCase() + statement.statement_type.slice(1)} Statement
                        </div>
                        <div style={{ color: '#64748b', fontSize: '12px', marginTop: 4 }}>
                          Generated: {formatDate(statement.generated_at)}
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '12px', color: '#64748b', marginBottom: 4 }}>
                        {formatFileSize(statement.file_size)}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginBottom: 8 }}>
                        Downloaded {statement.download_count} times
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <LoadingButton
                        size="sm"
                        variant="primary"
                        onClick={() => handleDownload(statement)}
                      >
                        <Download size={16} />
                      </LoadingButton>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </SectionCard>

        <SectionCard 
          title="Statement Settings"
          subtitle="Configure your statement preferences"
          headerRight={
            <FileText size={24} style={{ color: '#64748b' }} />
          }
        >
          <div style={{ display: 'grid', gap: 16, marginTop: 16 }}>
            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <FileText size={20} style={{ color: '#0A9396' }} />
                <div style={{ fontWeight: 600, color: '#0B1F3A' }}>Email Notifications</div>
              </div>
              <div style={{ color: '#64748b', fontSize: '14px' }}>
                Receive email when new statements are available
              </div>
            </div>

            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <Calendar size={20} style={{ color: '#059669' }} />
                <div style={{ fontWeight: 600, color: '#0B1F3A' }}>Auto-Generation</div>
              </div>
              <div style={{ color: '#64748b', fontSize: '14px' }}>
                Automatically generate monthly statements
              </div>
            </div>

            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <Download size={20} style={{ color: '#d97706' }} />
                <div style={{ fontWeight: 600, color: '#0B1F3A' }}>Statement Format</div>
              </div>
              <div style={{ color: '#64748b', fontSize: '14px' }}>
                Choose PDF or Excel format for downloads
              </div>
            </div>

            <LoadingButton
              variant="primary"
              style={{ width: '100%', marginTop: 16 }}
            >
              Save Preferences
            </LoadingButton>
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
};

export default Statements;

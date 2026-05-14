import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import SectionCard from '../components/SectionCard';
import LoadingButton from '../components/LoadingButton';
import { motion } from 'framer-motion';
import { TrendingUp, Lightbulb, PieChart, Target, Plus, Edit2, Trash2, Calculator } from 'lucide-react';
import { investmentService } from '../services/api';

interface Investment {
  id: number;
  type: string;
  amount: number;
  duration: number;
  risk_level: string;
  expected_return: number;
  actual_return: number;
  status: string;
  created_at: string;
  updated_at: string;
}

interface InvestmentType {
  id: string;
  name: string;
  description: string;
  min_amount: number;
  risk_levels: string[];
  expected_returns: { [key: string]: number };
}

const Investments: React.FC = () => {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [investmentTypes, setInvestmentTypes] = useState<InvestmentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null);
  const [showCalculator, setShowCalculator] = useState(false);
  
  const [formData, setFormData] = useState({
    type: 'stocks',
    amount: '',
    duration: '',
    risk_level: 'medium',
    expected_return: ''
  });
  
  const [calculatorData, setCalculatorData] = useState({
    type: 'stocks',
    amount: '',
    duration: '',
    risk_level: 'medium'
  });
  
  const [calculatorResult, setCalculatorResult] = useState<any>(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    loadInvestments();
    loadInvestmentTypes();
  }, []);

  const loadInvestments = async () => {
    try {
      const response = await investmentService.getInvestments();
      setInvestments(response.data || []);
    } catch (err: any) {
      setError(err.response?.data?.msg || 'Failed to load investments');
    } finally {
      setLoading(false);
    }
  };

  const loadInvestmentTypes = async () => {
    try {
      const response = await investmentService.getInvestmentTypes();
      setInvestmentTypes(response.data || []);
    } catch (err: any) {
      console.error('Failed to load investment types:', err);
    }
  };

  const handleCreateInvestment = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy('create');
    setError('');
    setMessage('');

    try {
      const investmentData = {
        type: formData.type,
        amount: Number(formData.amount),
        duration: Number(formData.duration),
        risk_level: formData.risk_level,
        expected_return: formData.expected_return ? Number(formData.expected_return) : undefined
      };

      await investmentService.createInvestment(investmentData);
      setMessage('Investment created successfully');
      setShowCreateForm(false);
      resetForm();
      loadInvestments();
    } catch (err: any) {
      setError(err.response?.data?.msg || 'Failed to create investment');
    } finally {
      setBusy(null);
    }
  };

  const handleUpdateInvestment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInvestment) return;

    setBusy('update');
    setError('');
    setMessage('');

    try {
      const investmentData = {
        amount: Number(formData.amount),
        duration: Number(formData.duration),
        risk_level: formData.risk_level,
        expected_return: formData.expected_return ? Number(formData.expected_return) : undefined
      };

      await investmentService.updateInvestment(editingInvestment.id, investmentData);
      setMessage('Investment updated successfully');
      setEditingInvestment(null);
      resetForm();
      loadInvestments();
    } catch (err: any) {
      setError(err.response?.data?.msg || 'Failed to update investment');
    } finally {
      setBusy(null);
    }
  };

  const handleDeleteInvestment = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this investment?')) return;

    setBusy(`delete-${id}`);
    setError('');
    setMessage('');

    try {
      await investmentService.deleteInvestment(id);
      setMessage('Investment deleted successfully');
      loadInvestments();
    } catch (err: any) {
      setError(err.response?.data?.msg || 'Failed to delete investment');
    } finally {
      setBusy(null);
    }
  };

  const handleCalculateReturns = async () => {
    if (!calculatorData.amount || !calculatorData.duration) {
      setError('Please enter amount and duration for calculation');
      return;
    }

    try {
      const response = await investmentService.calculateReturns({
        type: calculatorData.type,
        amount: Number(calculatorData.amount),
        duration: Number(calculatorData.duration),
        risk_level: calculatorData.risk_level
      });
      setCalculatorResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.msg || 'Failed to calculate returns');
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'stocks',
      amount: '',
      duration: '',
      risk_level: 'medium',
      expected_return: ''
    });
  };

  const startEditInvestment = (investment: Investment) => {
    setEditingInvestment(investment);
    setFormData({
      type: investment.type,
      amount: investment.amount.toString(),
      duration: investment.duration.toString(),
      risk_level: investment.risk_level,
      expected_return: investment.expected_return.toString()
    });
    setShowCreateForm(true);
  };

  const getInvestmentTypeInfo = (typeId: string) => {
    return investmentTypes.find(t => t.id === typeId);
  };

  if (loading) {
    return (
      <PageLayout title="Investments" subtitle="Loading your investment portfolio...">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <div>Loading investments...</div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout 
      title="Investments"
      subtitle="Manage your investment portfolio with AI guidance"
    >
      <div style={{ display: 'grid', gap: 30 }}>
        {/* Error and Message Display */}
        {error && <div className="toast toast-error">{error}</div>}
        {message && <div className="toast toast-success">{message}</div>}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <LoadingButton
            onClick={() => setShowCreateForm(!showCreateForm)}
            variant="primary"
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <Plus size={16} />
            {showCreateForm ? 'Cancel' : 'Create Investment'}
          </LoadingButton>
          <LoadingButton
            onClick={() => setShowCalculator(!showCalculator)}
            variant="secondary"
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <Calculator size={16} />
            {showCalculator ? 'Hide Calculator' : 'Calculate Returns'}
          </LoadingButton>
        </div>

        {/* Investment Calculator */}
        {showCalculator && (
          <SectionCard 
            title="Investment Calculator"
            subtitle="Calculate potential returns for different investment scenarios"
          >
            <div style={{ display: 'grid', gap: 16, marginTop: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                <label style={{ display: 'grid', gap: 8 }}>
                  <span>Investment Type</span>
                  <select
                    value={calculatorData.type}
                    onChange={(e) => setCalculatorData({ ...calculatorData, type: e.target.value })}
                    style={{ padding: '10px', borderRadius: 8, border: '1px solid #cbd5e1' }}
                  >
                    {investmentTypes.map(type => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                </label>
                <label style={{ display: 'grid', gap: 8 }}>
                  <span>Amount (RWF)</span>
                  <input
                    type="number"
                    value={calculatorData.amount}
                    onChange={(e) => setCalculatorData({ ...calculatorData, amount: e.target.value })}
                    placeholder="10000"
                    style={{ padding: '10px', borderRadius: 8, border: '1px solid #cbd5e1' }}
                  />
                </label>
                <label style={{ display: 'grid', gap: 8 }}>
                  <span>Duration (months)</span>
                  <input
                    type="number"
                    value={calculatorData.duration}
                    onChange={(e) => setCalculatorData({ ...calculatorData, duration: e.target.value })}
                    placeholder="12"
                    style={{ padding: '10px', borderRadius: 8, border: '1px solid #cbd5e1' }}
                  />
                </label>
                <label style={{ display: 'grid', gap: 8 }}>
                  <span>Risk Level</span>
                  <select
                    value={calculatorData.risk_level}
                    onChange={(e) => setCalculatorData({ ...calculatorData, risk_level: e.target.value })}
                    style={{ padding: '10px', borderRadius: 8, border: '1px solid #cbd5e1' }}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </label>
              </div>
              <button
                onClick={handleCalculateReturns}
                className="btn btn-primary"
                style={{ justifySelf: 'start' }}
              >
                Calculate Returns
              </button>
            </div>

            {calculatorResult && (
              <div style={{
                background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)',
                padding: '20px',
                borderRadius: 8,
                marginTop: 20
              }}>
                <h4 style={{ color: '#0A9396', marginTop: 0 }}>Projected Returns</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16, marginTop: 16 }}>
                  <div>
                    <div style={{ color: '#64748b', fontSize: '12px' }}>Principal</div>
                    <div style={{ fontSize: '18px', fontWeight: 600 }}>
                      {calculatorResult.principal?.toLocaleString()} RWF
                    </div>
                  </div>
                  <div>
                    <div style={{ color: '#64748b', fontSize: '12px' }}>Expected Returns</div>
                    <div style={{ fontSize: '18px', fontWeight: 600, color: '#059669' }}>
                      {calculatorResult.total_returns?.toLocaleString()} RWF
                    </div>
                  </div>
                  <div>
                    <div style={{ color: '#64748b', fontSize: '12px' }}>Final Amount</div>
                    <div style={{ fontSize: '18px', fontWeight: 600, color: '#0A9396' }}>
                      {calculatorResult.final_amount?.toLocaleString()} RWF
                    </div>
                  </div>
                  <div>
                    <div style={{ color: '#64748b', fontSize: '12px' }}>Return Rate</div>
                    <div style={{ fontSize: '18px', fontWeight: 600 }}>
                      {calculatorResult.expected_return_rate}%
                    </div>
                  </div>
                </div>
              </div>
            )}
          </SectionCard>
        )}

        {/* Create/Edit Investment Form */}
        {showCreateForm && (
          <SectionCard 
            title={editingInvestment ? 'Edit Investment' : 'Create New Investment'}
            subtitle={editingInvestment ? 'Update your existing investment details' : 'Start a new investment with AI guidance'}
          >
            <form onSubmit={editingInvestment ? handleUpdateInvestment : handleCreateInvestment} style={{ display: 'grid', gap: 16, marginTop: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                {!editingInvestment && (
                  <label style={{ display: 'grid', gap: 8 }}>
                    <span>Investment Type</span>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      required
                      style={{ padding: '10px', borderRadius: 8, border: '1px solid #cbd5e1' }}
                    >
                      {investmentTypes.map(type => (
                        <option key={type.id} value={type.id}>{type.name}</option>
                      ))}
                    </select>
                  </label>
                )}
                <label style={{ display: 'grid', gap: 8 }}>
                  <span>Amount (RWF)</span>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="10000"
                    required
                    min={getInvestmentTypeInfo(formData.type)?.min_amount || 5000}
                    style={{ padding: '10px', borderRadius: 8, border: '1px solid #cbd5e1' }}
                  />
                  {getInvestmentTypeInfo(formData.type) && (
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      Minimum: {getInvestmentTypeInfo(formData.type)?.min_amount?.toLocaleString()} RWF
                    </div>
                  )}
                </label>
                <label style={{ display: 'grid', gap: 8 }}>
                  <span>Duration (months)</span>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="12"
                    required
                    min="1"
                    style={{ padding: '10px', borderRadius: 8, border: '1px solid #cbd5e1' }}
                  />
                </label>
                <label style={{ display: 'grid', gap: 8 }}>
                  <span>Risk Level</span>
                  <select
                    value={formData.risk_level}
                    onChange={(e) => setFormData({ ...formData, risk_level: e.target.value })}
                    required
                    style={{ padding: '10px', borderRadius: 8, border: '1px solid #cbd5e1' }}
                  >
                    {getInvestmentTypeInfo(formData.type)?.risk_levels.map(level => (
                      <option key={level} value={level}>{level.charAt(0).toUpperCase() + level.slice(1)}</option>
                    ))}
                  </select>
                </label>
                <label style={{ display: 'grid', gap: 8 }}>
                  <span>Expected Return % (Optional)</span>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.expected_return}
                    onChange={(e) => setFormData({ ...formData, expected_return: e.target.value })}
                    placeholder={getInvestmentTypeInfo(formData.type)?.expected_returns[formData.risk_level]?.toString()}
                    style={{ padding: '10px', borderRadius: 8, border: '1px solid #cbd5e1' }}
                  />
                </label>
              </div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={busy !== null}
                  aria-busy={busy !== null}
                >
                  {busy === 'create' || busy === 'update' ? 'Processing...' : (editingInvestment ? 'Update Investment' : 'Create Investment')}
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingInvestment(null);
                    resetForm();
                  }}
                  disabled={busy !== null}
                >
                  Cancel
                </button>
              </div>
            </form>
          </SectionCard>
        )}

        {/* Current Investments */}
        <SectionCard 
          title="Your Investments"
          subtitle={investments.length === 0 ? "Start building your investment portfolio" : "Manage your active investments"}
        >
          {investments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div style={{ color: '#64748b', marginBottom: 16 }}>No investments yet. Create your first investment to get started!</div>
              <LoadingButton
                onClick={() => setShowCreateForm(true)}
                variant="primary"
              >
                Create Your First Investment
              </LoadingButton>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 16 }}>
              {investments.map((investment) => {
                const typeInfo = getInvestmentTypeInfo(investment.type);
                return (
                  <motion.div
                    key={investment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      background: 'white',
                      padding: '25px',
                      borderRadius: 12,
                      border: '1px solid rgba(10, 147, 150, 0.1)',
                      display: 'grid',
                      gridTemplateColumns: '1fr auto',
                      gap: 20,
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                        <h4 style={{ margin: 0, color: '#0B1F3A' }}>{typeInfo?.name}</h4>
                        <span className={`chip ${investment.status === 'active' ? 'chip-green' : 'chip-yellow'}`}>
                          {investment.status}
                        </span>
                        <span className={`chip chip-${investment.risk_level}`}>
                          {investment.risk_level} risk
                        </span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16 }}>
                        <div>
                          <div style={{ color: '#64748b', fontSize: '12px' }}>Amount</div>
                          <div style={{ fontSize: '16px', fontWeight: 600 }}>
                            {investment.amount.toLocaleString()} RWF
                          </div>
                        </div>
                        <div>
                          <div style={{ color: '#64748b', fontSize: '12px' }}>Duration</div>
                          <div style={{ fontSize: '16px', fontWeight: 600 }}>
                            {investment.duration} months
                          </div>
                        </div>
                        <div>
                          <div style={{ color: '#64748b', fontSize: '12px' }}>Expected Return</div>
                          <div style={{ fontSize: '16px', fontWeight: 600, color: '#059669' }}>
                            {investment.expected_return}%
                          </div>
                        </div>
                        <div>
                          <div style={{ color: '#64748b', fontSize: '12px' }}>Actual Returns</div>
                          <div style={{ fontSize: '16px', fontWeight: 600, color: '#0A9396' }}>
                            {investment.actual_return.toLocaleString()} RWF
                          </div>
                        </div>
                      </div>
                      <div style={{ marginTop: 12, fontSize: '12px', color: '#64748b' }}>
                        Created: {new Date(investment.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {investment.status === 'active' && (
                        <LoadingButton
                          onClick={() => startEditInvestment(investment)}
                          disabled={busy !== null}
                          variant="secondary"
                          size="sm"
                          style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                        >
                          <Edit2 size={14} />
                          Edit
                        </LoadingButton>
                      )}
                      <LoadingButton
                        onClick={() => handleDeleteInvestment(investment.id)}
                        disabled={busy === `delete-${investment.id}` || investment.status !== 'active'}
                        variant="ghost"
                        size="sm"
                        style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                      >
                        <Trash2 size={14} />
                        Delete
                      </LoadingButton>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </SectionCard>
      </div>
    </PageLayout>
  );
};

export default Investments;

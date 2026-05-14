import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../components/AppShell';
import SectionCard from '../components/SectionCard';
import LoadingButton from '../components/LoadingButton';
import { CreditCard, Plus, Trash2, Shield, Star } from 'lucide-react';

interface Card {
  id: number;
  card_type: string;
  card_number: string;
  card_holder_name: string;
  expiry_date: string;
  cvv: string;
  card_status: string;
  is_default: boolean;
  daily_limit: number;
  created_at: string;
}

const CardsManagement: React.FC = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadCards = async () => {
      setLoading(true);
      try {
        // Mock data for now - would connect to backend
        const mockCards: Card[] = [
          {
            id: 1,
            card_type: 'debit',
            card_number: '**** **** **** 1234',
            card_holder_name: 'John Doe',
            expiry_date: '12/26',
            cvv: '***',
            card_status: 'active',
            is_default: true,
            daily_limit: 500000,
            created_at: '2024-01-15'
          }
        ];
        setCards(mockCards);
      } catch (err: any) {
        setError('Failed to load cards');
      } finally {
        setLoading(false);
      }
    };

    loadCards();
  }, []);

  const handleDeleteCard = async (cardId: number) => {
    const confirmed = window.confirm('Are you sure you want to delete this card? This action cannot be undone.');
    if (!confirmed) return;

    try {
      // Mock API call
      setCards(prev => prev.filter(card => card.id !== cardId));
      setSuccess('Card deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError('Failed to delete card');
    }
  };

  const handleSetDefault = async (cardId: number) => {
    try {
      // Mock API call
      setCards(prev => prev.map(card => 
        card.id === cardId ? { ...card, is_default: true } : { ...card, is_default: false }
      ));
      setSuccess('Default card updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError('Failed to update default card');
    }
  };

  const handleBlockCard = async (cardId: number) => {
    try {
      // Mock API call
      setCards(prev => prev.map(card => 
        card.id === cardId ? { ...card, card_status: 'blocked' } : card
      ));
      setSuccess('Card blocked successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError('Failed to block card');
    }
  };

  const handleUnblockCard = async (cardId: number) => {
    try {
      // Mock API call
      setCards(prev => prev.map(card => 
        card.id === cardId ? { ...card, card_status: 'active' } : card
      ));
      setSuccess('Card unblocked successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError('Failed to unblock card');
    }
  };

  const getCardIcon = (cardType: string) => {
    switch (cardType) {
      case 'debit':
        return <CreditCard size={20} style={{ color: '#059669' }} />;
      case 'credit':
        return <CreditCard size={20} style={{ color: '#dc2626' }} />;
      case 'virtual':
        return <Shield size={20} style={{ color: '#7c3aed' }} />;
      default:
        return <CreditCard size={20} style={{ color: '#64748b' }} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#10b981';
      case 'blocked':
        return '#ef4444';
      case 'expired':
        return '#f59e0b';
      default:
        return '#64748b';
    }
  };

  const maskCardNumber = (cardNumber: string) => {
    if (!cardNumber) return '**** **** **** ****';
    const last4 = cardNumber.slice(-4);
    return `**** **** **** ${last4}`;
  };

  return (
    <AppShell
      title="Cards & Payment Methods"
      subtitle="Manage your cards and payment options"
      videoSrc="/videos/banking.mp4"
    >
      <div style={{ display: 'grid', gap: 24 }}>
        {error && <div className="toast toast-error">{error}</div>}
        {success && <div className="toast toast-success">{success}</div>}

        <SectionCard 
          title="Add New Card"
          subtitle="Add a new payment method to your account"
          headerRight={
            <Plus size={24} style={{ color: '#0A9396' }} />
          }
        >
          <div style={{ marginTop: 16 }}>
            <LoadingButton
              onClick={() => setShowAddForm(!showAddForm)}
              variant="primary"
              style={{ width: '100%' }}
            >
              {showAddForm ? 'Cancel' : 'Add New Card'}
            </LoadingButton>
            
            {showAddForm && (
              <div style={{
                marginTop: 16,
                padding: 16,
                background: '#f8fafc',
                borderRadius: 12,
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                  <div style={{ display: 'grid', gap: 8 }}>
                    <label style={{ display: 'grid', gap: 8 }}>
                      <span style={{ color: '#64748b', fontSize: '14px', fontWeight: 500 }}>Card Type</span>
                      <select style={{ 
                        padding: 12, 
                        borderRadius: 8, 
                        border: '1px solid #cbd5e1',
                        background: '#f8fafc',
                        fontSize: '14px'
                      }}>
                        <option value="debit">Debit Card</option>
                        <option value="credit">Credit Card</option>
                        <option value="virtual">Virtual Card</option>
                      </select>
                    </label>
                  </div>

                  <div style={{ display: 'grid', gap: 8 }}>
                    <label style={{ display: 'grid', gap: 8 }}>
                      <span style={{ color: '#64748b', fontSize: '14px', fontWeight: 500 }}>Card Number</span>
                      <input type="text" placeholder="1234 5678 9012 3456" style={{ 
                        padding: 12, 
                        borderRadius: 8, 
                        border: '1px solid #cbd5e1',
                        background: '#f8fafc',
                        fontSize: '14px'
                      }} />
                    </label>
                  </div>

                  <div style={{ display: 'grid', gap: 8 }}>
                    <label style={{ display: 'grid', gap: 8 }}>
                      <span style={{ color: '#64748b', fontSize: '14px', fontWeight: 500 }}>Cardholder Name</span>
                      <input type="text" placeholder="John Doe" style={{ 
                        padding: 12, 
                        borderRadius: 8, 
                        border: '1px solid #cbd5e1',
                        background: '#f8fafc',
                        fontSize: '14px'
                      }} />
                    </label>
                  </div>

                  <div style={{ display: 'grid', gap: 8 }}>
                    <label style={{ display: 'grid', gap: 8 }}>
                      <span style={{ color: '#64748b', fontSize: '14px', fontWeight: 500 }}>Expiry Date</span>
                      <input type="text" placeholder="MM/YY" style={{ 
                        padding: 12, 
                        borderRadius: 8, 
                        border: '1px solid #cbd5e1',
                        background: '#f8fafc',
                        fontSize: '14px'
                      }} />
                    </label>
                  </div>

                  <div style={{ display: 'grid', gap: 8 }}>
                    <label style={{ display: 'grid', gap: 8 }}>
                      <span style={{ color: '#64748b', fontSize: '14px', fontWeight: 500 }}>CVV</span>
                      <input type="text" placeholder="123" style={{ 
                        padding: 12, 
                        borderRadius: 8, 
                        border: '1px solid #cbd5e1',
                        background: '#f8fafc',
                        fontSize: '14px'
                      }} />
                    </label>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                  <LoadingButton variant="primary">Add Card</LoadingButton>
                  <LoadingButton variant="ghost" onClick={() => setShowAddForm(false)}>Cancel</LoadingButton>
                </div>
              </div>
            )}
          </div>
        </SectionCard>

        <SectionCard 
          title="Your Cards"
          subtitle="Manage your existing payment methods"
          headerRight={
            <CreditCard size={24} style={{ color: '#0A9396' }} />
          }
        >
          <div style={{ marginTop: 16 }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div>Loading your cards...</div>
              </div>
            ) : cards.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{ color: '#64748b', marginBottom: 16 }}>No cards added yet</div>
                <LoadingButton
                  onClick={() => setShowAddForm(true)}
                  variant="primary"
                >
                  Add Your First Card
                </LoadingButton>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 16 }}>
                {cards.map((card) => (
                  <div key={card.id} style={{
                    background: 'white',
                    padding: 20,
                    borderRadius: 12,
                    border: '1px solid #e2e8f0',
                    position: 'relative'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {getCardIcon(card.card_type)}
                        <div>
                          <div style={{ fontWeight: 600, color: '#0B1F3A', marginBottom: 4 }}>
                            {card.card_type.charAt(0).toUpperCase() + card.card_type.slice(1)} Card
                          </div>
                          <div style={{ color: '#64748b', fontSize: '14px' }}>
                            {maskCardNumber(card.card_number)}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {card.is_default && (
                          <span style={{
                            background: '#10b981',
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: 12,
                            fontSize: '12px',
                            fontWeight: 600
                          }}>
                            Default
                          </span>
                        )}
                        <span style={{
                          background: getStatusColor(card.card_status),
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: 12,
                          fontSize: '12px',
                          fontWeight: 600
                        }}>
                          {card.card_status}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      <div>
                        <div style={{ color: '#64748b', fontSize: '14px', marginBottom: 4 }}>Cardholder</div>
                        <div style={{ fontWeight: 600, color: '#0B1F3A' }}>
                          {card.card_holder_name}
                        </div>
                      </div>
                      <div>
                        <div style={{ color: '#64748b', fontSize: '14px', marginBottom: 4 }}>Expires</div>
                        <div style={{ fontWeight: 600, color: '#0B1F3A' }}>
                          {card.expiry_date}
                        </div>
                      </div>
                    </div>

                    <div style={{ marginTop: 12 }}>
                      <div style={{ color: '#64748b', fontSize: '14px', marginBottom: 8 }}>Daily Limit</div>
                      <div style={{ fontSize: '18px', fontWeight: 700, color: '#0A9396' }}>
                        {new Intl.NumberFormat('rw-RW', {
                          style: 'currency',
                          currency: 'RWF',
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0
                        }).format(card.daily_limit)}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                      {card.card_status === 'active' ? (
                        <>
                          {!card.is_default && (
                            <LoadingButton
                              size="sm"
                              variant="secondary"
                              onClick={() => handleSetDefault(card.id)}
                            >
                              Set Default
                            </LoadingButton>
                          )}
                          <LoadingButton
                            size="sm"
                            variant="ghost"
                            onClick={() => handleBlockCard(card.id)}
                          >
                            Block Card
                          </LoadingButton>
                        </>
                      ) : (
                        <LoadingButton
                          size="sm"
                          variant="primary"
                          onClick={() => handleUnblockCard(card.id)}
                        >
                          Unblock Card
                        </LoadingButton>
                      )}
                      <LoadingButton
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteCard(card.id)}
                      >
                        <Trash2 size={16} />
                      </LoadingButton>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </SectionCard>

        <SectionCard 
          title="Card Security"
          subtitle="Security features and tips"
          headerRight={
            <Shield size={24} style={{ color: '#0A9396' }} />
          }
        >
          <div style={{ display: 'grid', gap: 16, marginTop: 16 }}>
            <div style={{ padding: '16px', background: '#f0f9ff', borderRadius: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <Shield size={20} style={{ color: '#0A9396' }} />
                <div style={{ fontWeight: 600, color: '#0B1F3A' }}>Fraud Protection</div>
              </div>
              <div style={{ color: '#64748b', fontSize: '14px' }}>
                Advanced fraud detection monitors your transactions 24/7
              </div>
            </div>

            <div style={{ padding: '16px', background: '#fef3c7', borderRadius: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <Star size={20} style={{ color: '#f59e0b' }} />
                <div style={{ fontWeight: 600, color: '#0B1F3A' }}>Virtual Cards</div>
              </div>
              <div style={{ color: '#64748b', fontSize: '14px' }}>
                Create virtual cards for online shopping with enhanced security
              </div>
            </div>

            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <CreditCard size={20} style={{ color: '#059669' }} />
                <div style={{ fontWeight: 600, color: '#0B1F3A' }}>Instant Freeze</div>
              </div>
              <div style={{ color: '#64748b', fontSize: '14px' }}>
                Freeze your cards instantly if you suspect fraud
              </div>
            </div>
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
};

export default CardsManagement;

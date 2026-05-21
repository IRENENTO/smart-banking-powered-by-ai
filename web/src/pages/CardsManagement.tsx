import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../components/AppShell';
import SectionCard from '../components/SectionCard';
import LoadingButton from '../components/LoadingButton';
import { settingsService } from '../services/settingsService';
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
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCard, setNewCard] = useState({
    card_type: 'debit',
    card_number: '',
    card_holder_name: '',
    expiry_date: '',
    cvv: ''
  });
  const navigate = useNavigate();

  const loadCards = async () => {
    setLoading(true);
    try {
      const response = await settingsService.getCards();
      if (response.data.success) {
        setCards(response.data.data);
      }
    } catch (err: any) {
      setError('Failed to load cards');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCards();
  }, []);

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await settingsService.addCard(newCard);
      if (response.data.success) {
        setSuccess('Card added successfully');
        setShowAddForm(false);
        setNewCard({
          card_type: 'debit',
          card_number: '',
          card_holder_name: '',
          expiry_date: '',
          cvv: ''
        });
        loadCards();
      }
    } catch (err: any) {
      setError(err.response?.data?.msg || 'Failed to add card');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCard = async (cardId: number) => {
    const confirmed = window.confirm('Are you sure you want to delete this card? This action cannot be undone.');
    if (!confirmed) return;

    try {
      const response = await settingsService.deleteCard(cardId);
      if (response.data.success) {
        setCards(prev => prev.filter(card => card.id !== cardId));
        setSuccess('Card deleted successfully');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err: any) {
      setError('Failed to delete card');
    }
  };

  const handleSetDefault = async (cardId: number) => {
    try {
      const response = await settingsService.setDefaultCard(cardId);
      if (response.data.success) {
        setCards(prev => prev.map(card => 
          card.id === cardId ? { ...card, is_default: true } : { ...card, is_default: false }
        ));
        setSuccess('Default card updated successfully');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err: any) {
      setError('Failed to update default card');
    }
  };

  const handleBlockCard = async (cardId: number) => {
    try {
      const response = await settingsService.updateCardStatus(cardId, 'blocked');
      if (response.data.success) {
        setCards(prev => prev.map(card => 
          card.id === cardId ? { ...card, card_status: 'blocked' } : card
        ));
        setSuccess('Card blocked successfully');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err: any) {
      setError('Failed to block card');
    }
  };

  const handleUnblockCard = async (cardId: number) => {
    try {
      const response = await settingsService.updateCardStatus(cardId, 'active');
      if (response.data.success) {
        setCards(prev => prev.map(card => 
          card.id === cardId ? { ...card, card_status: 'active' } : card
        ));
        setSuccess('Card unblocked successfully');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err: any) {
      setError('Failed to unblock card');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewCard(prev => ({ ...prev, [name]: value }));
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
              <form onSubmit={handleAddCard} style={{
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
                      <select 
                        name="card_type"
                        value={newCard.card_type}
                        onChange={handleInputChange}
                        style={{ 
                          padding: 12, 
                          borderRadius: 8, 
                          border: '1px solid #cbd5e1',
                          background: '#f8fafc',
                          fontSize: '14px'
                        }}
                      >
                        <option value="debit">Debit Card</option>
                        <option value="credit">Credit Card</option>
                        <option value="virtual">Virtual Card</option>
                      </select>
                    </label>
                  </div>

                  <div style={{ display: 'grid', gap: 8 }}>
                    <label style={{ display: 'grid', gap: 8 }}>
                      <span style={{ color: '#64748b', fontSize: '14px', fontWeight: 500 }}>Card Number</span>
                      <input 
                        type="text" 
                        name="card_number"
                        value={newCard.card_number}
                        onChange={handleInputChange}
                        placeholder="1234 5678 9012 3456" 
                        required
                        style={{ 
                          padding: 12, 
                          borderRadius: 8, 
                          border: '1px solid #cbd5e1',
                          background: '#f8fafc',
                          fontSize: '14px'
                        }} 
                      />
                    </label>
                  </div>

                  <div style={{ display: 'grid', gap: 8 }}>
                    <label style={{ display: 'grid', gap: 8 }}>
                      <span style={{ color: '#64748b', fontSize: '14px', fontWeight: 500 }}>Cardholder Name</span>
                      <input 
                        type="text" 
                        name="card_holder_name"
                        value={newCard.card_holder_name}
                        onChange={handleInputChange}
                        placeholder="John Doe" 
                        required
                        style={{ 
                          padding: 12, 
                          borderRadius: 8, 
                          border: '1px solid #cbd5e1',
                          background: '#f8fafc',
                          fontSize: '14px'
                        }} 
                      />
                    </label>
                  </div>

                  <div style={{ display: 'grid', gap: 8 }}>
                    <label style={{ display: 'grid', gap: 8 }}>
                      <span style={{ color: '#64748b', fontSize: '14px', fontWeight: 500 }}>Expiry Date</span>
                      <input 
                        type="text" 
                        name="expiry_date"
                        value={newCard.expiry_date}
                        onChange={handleInputChange}
                        placeholder="MM/YY" 
                        required
                        style={{ 
                          padding: 12, 
                          borderRadius: 8, 
                          border: '1px solid #cbd5e1',
                          background: '#f8fafc',
                          fontSize: '14px'
                        }} 
                      />
                    </label>
                  </div>

                  <div style={{ display: 'grid', gap: 8 }}>
                    <label style={{ display: 'grid', gap: 8 }}>
                      <span style={{ color: '#64748b', fontSize: '14px', fontWeight: 500 }}>CVV</span>
                      <input 
                        type="password" 
                        name="cvv"
                        value={newCard.cvv}
                        onChange={handleInputChange}
                        placeholder="123" 
                        maxLength={4}
                        required
                        style={{ 
                          padding: 12, 
                          borderRadius: 8, 
                          border: '1px solid #cbd5e1',
                          background: '#f8fafc',
                          fontSize: '14px'
                        }} 
                      />
                    </label>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                  <LoadingButton type="submit" variant="primary" loading={saving} disabled={saving}>
                    {saving ? 'Adding...' : 'Add Card'}
                  </LoadingButton>
                  <LoadingButton type="button" variant="ghost" onClick={() => setShowAddForm(false)}>Cancel</LoadingButton>
                </div>
              </form>
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
                    background: card.card_type === 'debit' ? 'linear-gradient(135deg, #0B1F3A 0%, #1e293b 100%)' : card.card_type === 'credit' ? 'linear-gradient(135deg, #0A9396 0%, #059669 100%)' : 'linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)',
                    padding: 24,
                    borderRadius: 16,
                    color: 'white',
                    position: 'relative',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                    display: 'grid',
                    gap: 20
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {getCardIcon(card.card_type)}
                        <div style={{ fontWeight: 700, fontSize: '16px', letterSpacing: '1px' }}>
                          {card.card_type.toUpperCase()}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {card.is_default && (
                          <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: 20, fontSize: '10px', fontWeight: 700 }}>DEFAULT</span>
                        )}
                        <span style={{ background: card.card_status === 'active' ? '#10b981' : '#ef4444', padding: '4px 10px', borderRadius: 20, fontSize: '10px', fontWeight: 700 }}>
                          {card.card_status.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <div style={{ fontSize: '20px', letterSpacing: '3px', fontWeight: 500, margin: '10px 0' }}>
                      {maskCardNumber(card.card_number)}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                      <div>
                        <div style={{ fontSize: '10px', opacity: 0.6, marginBottom: 4 }}>CARD HOLDER</div>
                        <div style={{ fontSize: '14px', fontWeight: 600 }}>{card.card_holder_name.toUpperCase()}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '10px', opacity: 0.6, marginBottom: 4 }}>EXPIRES</div>
                        <div style={{ fontSize: '14px', fontWeight: 600 }}>{card.expiry_date}</div>
                      </div>
                    </div>

                    <div style={{ 
                      position: 'absolute', 
                      bottom: 0, 
                      right: 0, 
                      left: 0, 
                      background: 'rgba(255,255,255,0.05)', 
                      padding: '12px 24px', 
                      display: 'flex', 
                      gap: 16,
                      borderRadius: '0 0 16px 16px',
                      borderTop: '1px solid rgba(255,255,255,0.1)'
                    }}>
                      {card.card_status === 'active' ? (
                        <>
                          {!card.is_default && (
                            <button onClick={() => handleSetDefault(card.id)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '12px', cursor: 'pointer', opacity: 0.8 }}>Set Default</button>
                          )}
                          <button onClick={() => handleBlockCard(card.id)} style={{ background: 'none', border: 'none', color: '#fca5a5', fontSize: '12px', cursor: 'pointer' }}>Block Card</button>
                        </>
                      ) : (
                        <button onClick={() => handleUnblockCard(card.id)} style={{ background: 'none', border: 'none', color: '#86efac', fontSize: '12px', cursor: 'pointer' }}>Unblock Card</button>
                      )}
                      <button onClick={() => handleDeleteCard(card.id)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '12px', cursor: 'pointer', opacity: 0.6, marginLeft: 'auto' }}>Delete</button>
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

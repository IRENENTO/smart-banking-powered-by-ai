import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, User, TrendingUp, Shield, Lightbulb, PiggyBank, Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import LoadingButton from './LoadingButton';
import SectionCard from './SectionCard';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'advisor';
  timestamp: Date;
  type: 'text' | 'suggestion' | 'warning' | 'success';
  category?: string;
}

interface Suggestion {
  icon: any; // Lucide icon component
  text: string;
  category: string;
}

type AIResponse = {
  text: string;
  type: Message['type'];
  suggestion?: string;
};

const quickSuggestions: Suggestion[] = [
  { icon: TrendingUp, text: 'Analyze spending patterns', category: 'analytics' },
  { icon: Lightbulb, text: 'Optimize your budget', category: 'budget' },
  { icon: Shield, text: 'Investment recommendations', category: 'investment' },
  { icon: PiggyBank, text: 'Business growth advice', category: 'business' }
];

const statCards = [
  {
    icon: TrendingUp,
    label: 'Cash Flow',
    value: '+12%',
    detail: 'Improvement this month'
  },
  {
    icon: Shield,
    label: 'Safety Score',
    value: '84/100',
    detail: 'Healthy repayment outlook'
  },
  {
    icon: PiggyBank,
    label: 'Savings Momentum',
    value: 'RWF 75k',
    detail: 'Suggested weekly target'
  }
];

const generateAIResponse = (userInput: string): AIResponse => {
  const input = userInput.toLowerCase();
  
  if (input.includes('business') || input.includes('growth') || input.includes('startup') || input.includes('shop')) {
    return {
      text: "For business growth in Rwanda: \n1. **Digital Presence**: Use Mobile Money for all payments to build a digital credit trail.\n2. **Inventory Management**: Track stock levels daily to avoid overstocking.\n3. **Marketing**: Leverage social media for low-cost local reach.\n4. **Loan Readiness**: Keep your Debt-to-Income ratio below 40% to qualify for business expansion loans.",
      type: 'success',
      suggestion: "🚀 Growth Tip: Reinvest 30% of your profits back into the business for sustainable scaling."
    };
  }

  if (input.includes('market') || input.includes('trend')) {
    return {
      text: "Current market trends show high growth in: \n• **Agri-tech**: 15% increase in efficiency.\n• **E-commerce**: 25% growth in mobile transactions.\n• **Clean Energy**: Government incentives for solar startups.",
      type: 'text',
      suggestion: "📈 Check the 'Market Insights' tab for detailed sector performance."
    };
  }
  
  if (input.includes('spend') || input.includes('budget')) {
    return {
      text: "You spend 32% on transport which is above average. You can save 18,000 RWF monthly by reducing trips. Your dining expenses are 28% higher than recommended for your income level.",
      type: 'warning',
      suggestion: "💡 Pro tip: Use the 50/30/20 rule - 50% for needs, 30% for wants, and 20% for savings."
    };
  }
  
  if (input.includes('invest') || input.includes('investment')) {
    return {
      text: "Based on Rwanda's market trends, I recommend: 35% in poultry farming (high returns), 25% in mobile money services (stable income), 20% in food supply chain, and 20% in emergency fund. This portfolio could yield 22% annual returns.",
      type: 'success',
      suggestion: "📊 Start small with 50,000 RWF in poultry farming and scale up based on results."
    };
  }
  
  if (input.includes('save') || input.includes('savings')) {
    return {
      text: "You're currently saving 8% of your income. Increasing to 20% could help you build 1.2M RWF emergency fund in 18 months. Consider automated transfers of 85,000 RWF monthly.",
      type: 'success',
      suggestion: "🎯 Target: Save 150,000 RWF monthly by reducing entertainment expenses by 15%."
    };
  }

  if (input.includes('debt') || input.includes('loan')) {
    return {
      text: "Your debt-to-income ratio is 42%, which is manageable. Prioritize high-interest loans first. By paying 45,000 RWF extra monthly, you could be debt-free in 14 months instead of 24 months.",
      type: 'warning',
      suggestion: "💰 This strategy saves you 180,000 RWF in interest payments."
    };
  }

  return {
    text: "I can analyze your spending patterns (32% on transport, 28% on dining), suggest investments (poultry farming yields 22% returns), and help optimize your savings from 8% to 20%. What's your financial priority?",
    type: 'text'
  };
};

const AIFinancialAdvisor: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const { theme } = useTheme();
  const darkMode = theme === 'dark';

  useEffect(() => {
    const welcomeMessage: Message = {
      id: '1',
      text: "Hello! I'm your AI Financial Advisor. I can help with budget planning, savings strategies, investment ideas, and loan readiness. What would you like to improve today?",
      sender: 'advisor',
      timestamp: new Date(),
      type: 'text'
    };

    setMessages([welcomeMessage]);
  }, []);

  useEffect(() => {
    if (!messagesContainerRef.current) {
      return;
    }

    if (messages.length <= 1) {
      messagesContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isTyping]);

  const handleSendMessage = (nextInput?: string) => {
    const messageText = (nextInput ?? input).trim();
    if (!messageText) {
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    window.setTimeout(() => {
      const aiResponse = generateAIResponse(messageText);
      const advisorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse.text,
        sender: 'advisor',
        timestamp: new Date(),
        type: aiResponse.type
      };

      setMessages((prev) => [...prev, advisorMessage]);
      setIsTyping(false);

      if (aiResponse.suggestion) {
        window.setTimeout(() => {
          const suggestionMessage: Message = {
            id: (Date.now() + 2).toString(),
            text: aiResponse.suggestion || '',
            sender: 'advisor',
            timestamp: new Date(),
            type: 'suggestion',
            category: 'insight'
          };

          setMessages((prev) => [...prev, suggestionMessage]);
        }, 700);
      }
    }, 900);
  };

  return (
    <SectionCard
      title="AI Financial Advisor"
      subtitle="Personalized guidance for budgeting, saving, investing, and loan readiness."
      headerRight={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 12px',
              borderRadius: 999,
              background: darkMode ? 'rgba(15, 23, 42, 0.45)' : 'rgba(240, 253, 250, 0.9)',
              color: darkMode ? '#ccfbf1' : '#0f766e',
              fontSize: '12px',
              fontWeight: 700
            }}
          >
            <Sparkles size={14} />
            Live insights
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '6px 8px',
              borderRadius: '6px',
              color: darkMode ? '#94a3b8' : '#64748b',
              fontSize: '12px',
              fontWeight: 500,
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = darkMode ? 'rgba(148, 163, 184, 0.1)' : 'rgba(100, 116, 139, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'none';
            }}
          >
            {isExpanded ? '▼' : '▲'}
          </button>
        </div>
      }
      style={{
        margin: '40px auto 24px',
        width: '100%',
        maxWidth: 980,
        boxSizing: 'border-box',
        background: darkMode
          ? 'linear-gradient(135deg, rgba(11, 31, 58, 0.95), rgba(10, 147, 150, 0.24))'
          : 'linear-gradient(135deg, rgba(255,255,255,0.96), rgba(224, 242, 254, 0.92))',
        position: 'relative',
        zIndex: 10,
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 16,
          marginBottom: 20,
          justifyContent: 'center'
        }}
      >
        {statCards.map((stat) => (
          <div
            key={stat.label}
            style={{
              padding: 16,
              borderRadius: 18,
              background: darkMode ? 'rgba(15, 23, 42, 0.45)' : 'rgba(255, 255, 255, 0.72)',
              border: `1px solid ${darkMode ? 'rgba(148, 163, 184, 0.18)' : 'rgba(148, 163, 184, 0.15)'}`
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 14,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'linear-gradient(135deg, #0A9396, #059669)',
                  color: 'white'
                }}
              >
                <stat.icon size={18} />
              </div>
              <div>
                <div style={{ fontSize: '12px', color: darkMode ? '#cbd5e1' : '#64748b' }}>{stat.label}</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: darkMode ? '#f8fafc' : '#0f172a' }}>{stat.value}</div>
              </div>
            </div>
            <div style={{ fontSize: '12px', color: darkMode ? '#94a3b8' : '#475569', lineHeight: 1.5 }}>
              {stat.detail}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          padding: 12,
          borderRadius: 20,
          background: darkMode ? 'rgba(2, 6, 23, 0.35)' : 'rgba(255,255,255,0.72)',
          border: `1px solid ${darkMode ? 'rgba(148, 163, 184, 0.16)' : 'rgba(226, 232, 240, 0.9)'}`
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            flexWrap: 'wrap'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 14,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #0A9396, #059669)',
                color: 'white'
              }}
            >
              <Bot size={18} />
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: darkMode ? '#f8fafc' : '#0f172a' }}>
                Your smart money coach
              </div>
              <div style={{ fontSize: '12px', color: darkMode ? '#94a3b8' : '#64748b' }}>
                Ask for tailored help on spending, debt, savings, or investing.
              </div>
            </div>
          </div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 10px',
              borderRadius: 999,
              background: darkMode ? 'rgba(16, 185, 129, 0.12)' : 'rgba(16, 185, 129, 0.1)',
              color: '#059669',
              fontSize: '12px',
              fontWeight: 700
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
            Live insights
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            minHeight: isExpanded ? 260 : 180,
            maxHeight: isExpanded ? 420 : 280,
            overflowY: 'auto',
            padding: '12px 8px 4px',
            width: '100%',
            boxSizing: 'border-box'
          }}
          ref={messagesContainerRef}
        >
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -18 }}
                style={{
                  display: 'flex',
                  gap: 10,
                  maxWidth: '86%',
                  minWidth: 0,
                  alignSelf: message.sender === 'user' ? 'flex-end' : 'flex-start',
                  marginLeft: message.sender === 'user' ? 'auto' : 0
                }}
              >
                {message.sender === 'advisor' && (
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 12,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: darkMode ? 'rgba(10, 147, 150, 0.15)' : 'rgba(204, 251, 241, 0.8)',
                      color: '#0A9396',
                      flexShrink: 0
                    }}
                  >
                    <Bot size={16} />
                  </div>
                )}
                <div
                  style={{
                    padding: '12px 14px',
                    borderRadius: 16,
                    background:
                      message.sender === 'user'
                        ? 'linear-gradient(135deg, #0A9396, #059669)'
                        : darkMode
                          ? 'rgba(15, 23, 42, 0.82)'
                          : 'rgba(248, 250, 252, 0.95)',
                    color: message.sender === 'user' ? 'white' : darkMode ? '#f8fafc' : '#0f172a',
                    border:
                      message.sender === 'user'
                        ? 'none'
                        : `1px solid ${darkMode ? 'rgba(148, 163, 184, 0.16)' : 'rgba(226, 232, 240, 0.95)'}`
                  }}
                >
                  <div style={{ fontSize: '13px', lineHeight: 1.5, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', wordBreak: 'break-word' }}>{message.text}</div>
                  <div
                    style={{
                      fontSize: '11px',
                      marginTop: 6,
                      color:
                        message.sender === 'user'
                          ? 'rgba(255,255,255,0.82)'
                          : darkMode
                            ? '#94a3b8'
                            : '#64748b'
                    }}
                  >
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                {message.sender === 'user' && (
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 12,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'rgba(10, 147, 150, 0.12)',
                      color: '#0A9396',
                      flexShrink: 0
                    }}
                  >
                    <User size={16} />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                maxWidth: '60%'
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: darkMode ? 'rgba(10, 147, 150, 0.15)' : 'rgba(204, 251, 241, 0.8)',
                  color: '#0A9396'
                }}
              >
                <Bot size={16} />
              </div>
              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: 16,
                  background: darkMode ? 'rgba(15, 23, 42, 0.82)' : 'rgba(248, 250, 252, 0.95)',
                  color: darkMode ? '#94a3b8' : '#64748b',
                  fontSize: '12px',
                  border: `1px solid ${darkMode ? 'rgba(148, 163, 184, 0.16)' : 'rgba(226, 232, 240, 0.95)'}`
                }}
              >
                Thinking through your best next move...
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {quickSuggestions.map((suggestion) => (
            <motion.button
              key={suggestion.category}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSendMessage(suggestion.text)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 14px',
                borderRadius: 999,
                border: `1px solid ${darkMode ? 'rgba(94, 234, 212, 0.22)' : 'rgba(10, 147, 150, 0.18)'}`,
                background: darkMode ? 'rgba(15, 23, 42, 0.5)' : 'rgba(240, 253, 250, 0.75)',
                color: darkMode ? '#ccfbf1' : '#0f766e',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <suggestion.icon size={14} />
              {suggestion.text}
            </motion.button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                handleSendMessage();
              }
            }}
            placeholder="Ask about budgets, debt, savings, or investments..."
            style={{
              flex: '1 1 260px',
              minWidth: 0,
              padding: '12px 14px',
              borderRadius: 14,
              border: `1px solid ${darkMode ? 'rgba(148, 163, 184, 0.2)' : 'rgba(148, 163, 184, 0.25)'}`,
              background: darkMode ? 'rgba(2, 6, 23, 0.5)' : 'white',
              color: darkMode ? '#f8fafc' : '#0f172a',
              fontSize: 14,
              outline: 'none',
              width: '100%',
              boxSizing: 'border-box'
            }}
          />
          <LoadingButton
            onClick={() => handleSendMessage()}
            disabled={!input.trim()}
            variant="primary"
            size="md"
            style={{
              minWidth: 140,
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #0A9396, #059669)',
              border: 'none'
            }}
          >
            <Send size={16} />
            Ask Advisor
          </LoadingButton>
        </div>
      </div>
    </SectionCard>
  );
};

export default AIFinancialAdvisor;

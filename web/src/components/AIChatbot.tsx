import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Minimize2,
  RotateCcw,
  ChevronRight,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { aiService } from '../services/api';

// ─── Types ──────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: 'bot' | 'user';
  text: string;
  timestamp: Date;
  quickReplies?: string[];
}

// ─── Knowledge Base ──────────────────────────────────────────────────────────

const KB: { keywords: string[]; answer: string; quickReplies?: string[]; useAPI?: boolean }[] = [
  {
    keywords: ['hello', 'hi', 'hey', 'start', 'help', 'bonjour', 'muraho', 'marhaba', 'ahlan'],
    answer:
      "👋 Hello! I'm **Lend-AI**, your smart banking guide.\n\nI can help you with:\n📊 **Banking** – Dashboard, payments, sends, loans\n💰 **Finance** – Better budgets, savings, investments\n🚀 **Business** – Growth tips, market trends, debt help\n\nWhat would you like to know?",
    quickReplies: ['How to send money?', 'Look at my spending', 'Apply for a loan', 'Investment tips'],
  },
  {
    keywords: ['dashboard', 'home', 'overview', 'main page', 'summary'],
    answer:
      "📊 **Dashboard Guide**\n\nYour Dashboard shows your money at a glance!\n\n1. **Total Money** – All your money in RWF.\n2. **AI Risk Score** – A score out of 100 for your money health.\n3. **Recent Payments** – What you've done with your money.\n\n➡️ Click **Dashboard** in the top menu to go there.",
    quickReplies: ['What is AI Risk Score?', 'How to send money?', 'Check my transactions'],
  },
  {
    keywords: ['send', 'payment', 'transfer', 'pay', 'money', 'send money', 'recipient'],
    answer:
      "💸 **How to Send Money**\n\nIt's quick and easy!\n\n**Step 1:** Click **Payments** in the top menu.\n**Step 2:** Fill in:\n   • Recipient Name\n   • Account or Mobile Number\n   • Amount (in RWF)\n   • Note (optional)\n**Step 3:** Click the **Send Payment** button.\n\nYou'll see a green confirmation message when it's done! ✅",
    quickReplies: ['What is Mobile Money?', 'View scheduled payments', 'Go back to start'],
  },
  {
    keywords: ['mobile money', 'mtn', 'momo', 'airtel', 'mobile'],
    answer:
      "📱 **Mobile Money**\n\nWe support two mobile wallets:\n\n• **MTN MoMo** – Balance shown on the Payments page.\n• **Airtel Money** – Also listed on the Payments page.\n\nYou can use your mobile number as the recipient account when sending payments.\n\n➡️ Go to **Payments → Mobile Money** section to check your balance.",
    quickReplies: ['How to send money?', 'Schedule a payment', 'Go back to start'],
  },
  {
    keywords: ['schedule', 'scheduled', 'recurring', 'automatic', 'repeat'],
    answer:
      "🗓️ **Scheduled Payments**\n\nScheduled payments send money on their own (e.g., weekly, monthly).\n\nYou can view them on the **Payments** page in the **Scheduled Payments** panel on the right.\n\nEach entry shows:\n• Who you pay\n• How often (weekly/monthly)\n• The next due date\n• Amount in RWF",
    quickReplies: ['How to send money?', 'What is Mobile Money?', 'Go back to start'],
  },
  {
    keywords: ['account', 'accounts', 'balance', 'bank account', 'my account'],
    answer:
      "🏦 **Accounts Guide**\n\nYour **Accounts** page shows all your bank accounts.\n\nYou'll see:\n• **Account number** and type\n• **Current balance** in RWF\n• **Account status** (Active/Inactive)\n\n➡️ Click **Accounts** in the navigation to view them.",
    quickReplies: ['View my transactions', 'How to send money?', 'Savings help'],
  },
  {
    keywords: ['transaction', 'transactions', 'history', 'activity'],
    answer:
      "📋 **Transactions Guide**\n\nThe **Transactions** page shows all your payments.\n\nYou can:\n• See all money **put in** and **taken out**\n• Filter by **date** or **type**\n• View the **amount** and **info** for each\n\n➡️ Click **Transactions** in the top menu.",
    quickReplies: ['Check my balance', 'Send money', 'View AI Tips'],
  },
  {
    keywords: ['loan', 'loans', 'apply', 'loan application', 'borrow', 'credit', 'lending'],
    answer:
      "💳 **How to Apply for a Loan**\n\nApplying is simple:\n\n**Step 1:** Click **Loans** in the top menu.\n**Step 2:** Click **Apply for Loan**.\n**Step 3:** Fill in:\n   • Loan amount\n   • Purpose\n   • Pay back period\n**Step 4:** Submit. Our AI checks your risk right away!\n\n🤖 Your **AI Risk Score** decides if you qualify.",
    quickReplies: ['What is AI Risk Score?', 'Check loan status', 'Go back to start'],
  },
  {
    keywords: ['loan status', 'application status', 'my loan', 'pending loan'],
    answer:
      "🔍 **Loan Status**\n\nTo check your loan application:\n\n➡️ Click **Loans** in the top menu.\n\nYou'll see the current status:\n• **Pending** – Being checked\n• **Approved** ✅ – Good news!\n• **Rejected** ❌ – Try making your AI Risk Score better first.",
    quickReplies: ['Apply for a loan', 'What is AI Risk Score?', 'Go back to start'],
  },
  {
    keywords: ['savings', 'save', 'saving', 'goal', 'saving goal'],
    answer:
      "💰 **Savings Guide**\n\nThe **Savings** page helps you save money!\n\nYou can:\n• **Create saving goals** (e.g., new phone, vacation)\n• Track **progress** toward each goal\n• See your **total saved amount**\n\n➡️ Click **Savings** in the top menu to get started.",
    quickReplies: ['Create a saving goal', 'Check my balance', 'View AI Tips'],
  },
  {
    keywords: ['ai', 'insight', 'insights', 'ai insights', 'artificial intelligence', 'analysis', 'smart'],
    answer:
      "🤖 **AI Tips**\n\nThis is the brain of AI Smart Banking!\n\nThe AI looks at how you use money and gives you:\n• **Spending patterns** – Where your money goes\n• **Saving tips** – How to save more\n• **Risk check** – Your money health score\n• **Loan predictions** – How likely you can get one\n\n➡️ Click **AI Tips** in the top menu.",
    quickReplies: ['What is AI Risk Score?', 'Apply for a loan', 'Go back to start'],
  },
  {
    keywords: ['risk', 'risk score', 'score', 'health', 'financial health', 'credit score'],
    answer:
      "🛡️ **AI Risk Score Explained**\n\nYour Risk Score (out of 100) checks your money health.\n\n• **80–100** 🟢 Excellent – High approval chances\n• **60–79** 🟡 Good – Fair chance to get approved\n• **40–59** 🟠 Fair – Try to save more\n• **0–39** 🔴 Poor – Focus on paying back what you owe\n\n**To do better:** Save often, pay on time, and lower what you still owe on loans.",
    quickReplies: ['Apply for a loan', 'View AI Tips', 'Go back to start'],
  },
  {
    keywords: ['language', 'kinyarwanda', 'french', 'english', 'langue', 'translate', 'change language'],
    answer:
      "🌍 **Changing Language**\n\nAI Smart Banking supports 3 languages:\n• 🇬🇧 English\n• 🇷🇼 Kinyarwanda\n• 🇫🇷 Français\n\n**How to switch:**\n1. Look for the 🌐 globe icon in the top-right of the navigation bar.\n2. Click it and choose your language.\n\nThe entire interface will update instantly!",
    quickReplies: ['Go back to start', 'Dashboard help', 'Send money'],
  },
  {
    keywords: ['dark', 'light', 'theme', 'mode', 'night', 'dark mode'],
    answer:
      "🌙 **Dark / Light Mode**\n\nYou can switch between dark and light themes!\n\n**How to toggle:**\n➡️ Click the **☀️ / 🌙 icon** (sun or moon) in the top-right navigation bar.\n\nThe app will switch instantly for a more comfortable viewing experience.",
    quickReplies: ['Language settings', 'Go back to start', 'Dashboard help'],
  },
  {
    keywords: ['login', 'sign in', 'signin', 'log in', 'password', 'forgot password'],
    answer:
      "🔐 **Login Help**\n\nTo log in to AI Smart Banking:\n\n1. Go to the **Login** page.\n2. Enter your **email address** and **password**.\n3. Click **Sign In**.\n\n**Forgot your password?**\nClick the **'Forgot Password'** link on the login page to reset it via your email.",
    quickReplies: ['Register a new account', 'Go back to start'],
  },
  {
    keywords: ['register', 'sign up', 'signup', 'create account', 'new account', 'join'],
    answer:
      "✍️ **Creating a New Account**\n\nGetting started is free!\n\n1. Click **Register** on the login page.\n2. Fill in your:\n   • Full name\n   • Email address\n   • Password\n3. Click **Create Account**.\n\nOnce registered, you'll be taken to your Dashboard automatically! 🎉",
    quickReplies: ['Login help', 'How to send money?', 'Go back to start'],
  },
  {
    keywords: ['admin', 'administrator', 'manage users', 'admin panel'],
    answer:
      "⚙️ **Admin Panel**\n\nThe Admin Panel is for system admins only.\n\nAdmins can:\n• View all users and accounts\n• Manage loan applications\n• Make reports\n• Check system health\n\n➡️ Access via **Admin** in the navigation (needs admin access).",
    quickReplies: ['View Reports', 'Go back to start'],
  },
  {
    keywords: ['report', 'reports', 'export', 'download', 'statement'],
    answer:
      "📑 **Reports**\n\nThe **Reports** page lets you make money summaries.\n\nYou can:\n• View payment reports\n• Filter by date range\n• Save data for your records\n\n➡️ Click **Reports** from the admin menu.",
    quickReplies: ['Go back to start', 'View Transactions'],
  },
  {
    keywords: ['thank', 'thanks', 'merci', 'murakoze', 'bye', 'goodbye', 'great', 'awesome'],
    answer:
      "😊 You're welcome! I'm always here to help.\n\nIf you have more questions, just type them anytime. Happy banking with **AI Smart Banking**! 🏦✨",
    quickReplies: ['Go back to start', 'Send money', 'Apply for a loan'],
  },
  // Add fallback for general questions to use API
  {
    keywords: ['unknown', 'question', 'ask', 'tell', 'what', 'how', 'when', 'where', 'why'],
    answer: "Let me check that for you...",
    useAPI: true,
  },
  {
    keywords: ['budget', 'budgeting', 'spend', 'spending analysis', 'optimize budget', '50/30/20'],
    answer:
      "📊 **Budget Help**\n\nTo improve your budget:\n\n• **Try the 50/30/20 rule:** 50% for needs, 30% for wants, 20% for savings.\n• **Track every cost** for a month to find where your money goes.\n• **Stop extra subscriptions** and eat out less.\n• **Use auto-sends** to move savings on payday before you spend it.\n\n➡️ Go to **Transactions** to review your spending or **AI Tips** for a full breakdown.",
    quickReplies: ['Look at my spending', 'Investment tips', 'Go back to start'],
  },
  {
    keywords: ['invest', 'investment', 'portfolio', 'returns', 'poultry', 'stock'],
    answer:
      "📈 **Investment Tips for Rwanda**\n\nBased on current market trends:\n• **Poultry farming** – Good profits, easy to start\n• **Mobile money services** – Steady income from digital payments\n• **Food supply chain** – Growing demand in cities\n• **Emergency fund** – Keep 20% in savings you can get to\n\n💡 Start small with 50,000 RWF in one area and grow.",
    quickReplies: ['Business growth advice', 'Market trends', 'Optimize your budget'],
  },
  {
    keywords: ['business', 'growth', 'startup', 'entrepreneur', 'shop', 'enterprise'],
    answer:
      "🚀 **Business Growth Tips for Rwanda**\n\n1. **Build a digital credit trail** – Use Mobile Money for all payments.\n2. **Inventory management** – Track stock daily to avoid overstocking.\n3. **Social media marketing** – Low-cost reach to local customers.\n4. **Keep DTI below 40%** – To get business growth loans.\n\n💡 Put 30% of profits back into the business for steady growth.",
    quickReplies: ['Investment tips', 'Market trends', 'Apply for a loan'],
  },
  {
    keywords: ['debt', 'debt management', 'debt-to-income', 'overdraft', 'owing'],
    answer:
      "💰 **Debt Help**\n\n• **Pay high-growth loans first** to pay less total growth.\n• **Pay extra each month** – Even 45,000 RWF extra can shorten pay back time by months.\n• **Keep DTI below 40%** to be able to get loans.\n• **Combine debts** if you have many high-growth loans.\n\nThis plan can save you hundreds of thousands in growth costs.",
    quickReplies: ['Apply for a loan', 'Optimize your budget', 'Go back to start'],
  },
  {
    keywords: ['market', 'market trend', 'sector', 'economic', 'agri-tech', 'e-commerce', 'clean energy'],
    answer:
      "📊 **Current Market Trends in Rwanda**\n\nSectors growing fast:\n• **Agri-tech** – 15% better output with smart farming\n• **E-commerce** – 25% growth in mobile payments\n• **Clean Energy** – Government help for solar startups\n\n➡️ Check the **Market Insights** page for detailed area performance.",
    quickReplies: ['Investment tips', 'Business growth advice', 'Go back to start'],
  },
  {
    keywords: ['savings strategy', 'save more', 'emergency fund', 'savings rate', 'saving money'],
    answer:
      "🎯 **Savings Tips**\n\n• Try to save **20% of what you earn** each month.\n• Build a **3-6 month emergency fund** for surprise costs.\n• **Auto-send money** right after payday so you save before spending.\n• Cut **fun and eating out costs** by 15% to grow savings.\n\nTarget: Build 1.2M RWF emergency fund in 18 months by saving 85,000 RWF monthly.",
    quickReplies: ['Optimize your budget', 'Investment tips', 'Go back to start'],
  },
];

const FALLBACK: Message = {
  id: 'fallback',
  role: 'bot',
  text: "🤔 I'm not sure about that. Here are some things I can help you with:",
  timestamp: new Date(),
  quickReplies: ['How to send money?', 'Look at my spending', 'Apply for a loan', 'Investment tips', 'Go back to start'],
};

const WELCOME_MSG: Message = {
  id: 'welcome',
  role: 'bot',
  text: "👋 Hi! I'm **Lend-AI**, your smart banking guide.\n\nI can help you with:\n🏦 **Banking** – Send money, apply for loans, check balances\n📊 **Finance** – Better budgets, savings, investments\n🚀 **Business** – Growth tips, market trends, debt help\n\nWhat would you like help with today?",
  timestamp: new Date(),
  quickReplies: ['How to send money?', 'Look at my spending', 'Applying for a loan', 'Investment tips'],
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getBotResponse(input: string): Omit<Message, 'id' | 'timestamp'> & { useAPI?: boolean } {
  const lower = input.toLowerCase();
  const match = KB.find((kb) => kb.keywords.some((kw) => lower.includes(kw)));
  if (match) {
    return { role: 'bot', text: match.answer, quickReplies: match.quickReplies, useAPI: match.useAPI };
  }
  // If no match found, use API
  return { role: 'bot', text: "Let me check that for you...", useAPI: true };
}

function uid() {
  return Math.random().toString(36).slice(2);
}

function formatTime(d: Date) {
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Render bold markdown (**text**)
function renderBold(text: string) {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-semibold">
        {part}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const TypingIndicator: React.FC = () => (
  <div className="flex items-end gap-2 mb-4">
    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-[#0A9396] flex items-center justify-center flex-shrink-0">
      <Bot size={14} className="text-white" />
    </div>
    <div className="px-4 py-3 bg-white dark:bg-[#0B1F3A] rounded-2xl rounded-bl-sm border border-gray-100 dark:border-gray-700 shadow-sm">
      <div className="flex items-center gap-1.5 h-4">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full block"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>
    </div>
  </div>
);

const ChatBubble: React.FC<{ msg: Message }> = ({ msg }) => {
  const isBot = msg.role === 'bot';
  const lines = msg.text.split('\n');

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={`flex items-end gap-2 mb-4 ${isBot ? 'flex-row' : 'flex-row-reverse'}`}
    >
      {/* Avatar */}
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
          isBot
            ? 'bg-gradient-to-br from-blue-600 to-[#0A9396]'
            : 'bg-gradient-to-br from-purple-500 to-indigo-600'
        }`}
      >
        {isBot ? <Bot size={14} className="text-white" /> : <User size={14} className="text-white" />}
      </div>

      {/* Bubble */}
      <div className={`max-w-[82%] flex flex-col ${isBot ? 'items-start' : 'items-end'}`}>
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
            isBot
              ? 'bg-white dark:bg-[#0B1F3A] text-gray-800 dark:text-gray-100 rounded-bl-sm border border-gray-100 dark:border-gray-700'
              : 'bg-gradient-to-br from-blue-600 to-[#0A9396] text-white rounded-br-sm'
          }`}
        >
          {lines.map((line, idx) => (
            <p key={idx} className={line === '' ? 'mt-2' : ''}>
              {renderBold(line)}
            </p>
          ))}
        </div>
        <span className="text-xs text-gray-400 dark:text-gray-600 mt-1 px-1">
          {formatTime(msg.timestamp)}
        </span>
      </div>
    </motion.div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const AIChatbot: React.FC = () => {
  const { t, language } = useLanguage();
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME_MSG]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [unread, setUnread] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize Web Speech API
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      // Map language code to Speech API codes
      const langMap: Record<string, string> = {
        en: 'en-US',
        rw: 'rw-RW',
        fr: 'fr-FR',
        ar: 'ar-SA'
      };
      recognitionRef.current.lang = langMap[language] || 'en-US';

      recognitionRef.current.onstart = () => setIsListening(true);
      recognitionRef.current.onend = () => setIsListening(false);
      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setInput(transcript);
        handleSend(transcript);
      };
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
    }
  }, [language]);

  const speak = useCallback((text: string) => {
    if (!isSpeaking || !window.speechSynthesis) return;
    
    // Stop any current speech
    window.speechSynthesis.cancel();

    // Remove markdown bold tags for cleaner speech
    const cleanText = text.replace(/\*\*/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    const langMap: Record<string, string> = {
      en: 'en-US',
      rw: 'rw-RW',
      fr: 'fr-FR',
      ar: 'ar-SA'
    };
    utterance.lang = langMap[language] || 'en-US';
    
    window.speechSynthesis.speak(utterance);
  }, [isSpeaking, language]);

  const toggleMicrophone = () => {
    if (!recognitionRef.current) {
        alert("Speech recognition is not supported in your browser.");
        return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  // Scroll to bottom whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  // Focus input when opened
  useEffect(() => {
    if (open && !minimized) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open, minimized]);

  const pushBotMsg = useCallback((text: string, quickReplies?: string[]) => {
    const msg: Message = { id: uid(), role: 'bot', text, timestamp: new Date(), quickReplies };
    setMessages((prev) => [...prev, msg]);
  }, []);

  const handleSend = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      // Handle magic quick-replies
      if (trimmed === 'Go back to start') {
        setMessages([WELCOME_MSG]);
        setInput('');
        return;
      }

      // Push user message
      const userMsg: Message = { id: uid(), role: 'user', text: trimmed, timestamp: new Date() };
      setMessages((prev) => [...prev, userMsg]);
      setInput('');
      setTyping(true);

      try {
        const response = getBotResponse(trimmed);
        const botMsg: Message = { id: uid(), ...response, timestamp: new Date() };
        
        // If API call is needed
        if (response.useAPI) {
          try {
            const history = messages.slice(-10).map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', text: m.text }));
            const apiResponse = await aiService.chat(trimmed, history);
            botMsg.text = apiResponse.data.reply || apiResponse.data.response || apiResponse.data.message || "I got your message, but I'm not sure how to answer. Can you ask a different way?";
            botMsg.quickReplies = apiResponse.data.quickReplies || ['Go back to start'];
          } catch (apiError) {
            console.error('API call failed:', apiError);
            botMsg.text = "I'm having trouble connecting right now. Please try again later or ask about banking basics.";
            botMsg.quickReplies = ['How to send money?', 'Apply for a loan', 'View my balance'];
          }
        }
        
        setMessages((prev) => [...prev, botMsg]);
        speak(botMsg.text);
      } catch (error) {
        console.error('Error handling message:', error);
        const errorMsg: Message = { 
          id: uid(), 
          role: 'bot', 
          text: "Sorry, something went wrong. Please try again.", 
          timestamp: new Date(),
          quickReplies: ['Go back to start']
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setTyping(false);
      }
    },
    [open]
  );

  const handleOpen = () => {
    setOpen(true);
    setMinimized(false);
    setUnread(0);
  };

  const handleClose = () => {
    setOpen(false);
    setMinimized(false);
  };

  const handleReset = () => {
    setMessages([WELCOME_MSG]);
    setInput('');
  };

  return (
    <>
      {/* ── Floating Trigger Button ── */}
      <AnimatePresence>
        {!open && (
          <motion.button
            key="fab"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleOpen}
            aria-label="Open AI Assistant"
            className="fixed bottom-6 right-6 z-[9999] w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-[#0A9396] shadow-2xl shadow-blue-500/40 flex items-center justify-center text-white"
          >
            <MessageCircle size={26} />
            {unread > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center"
              >
                {unread}
              </motion.span>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Chat Window ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="chat-window"
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 280, damping: 28 }}
            className="fixed bottom-6 right-6 z-[9999] flex flex-col"
            style={{ width: 'min(380px, calc(100vw - 2rem))' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 to-[#0A9396] rounded-t-2xl shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                  <Bot size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm leading-tight">Lend-AI Assistant</p>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-400 inline-block animate-pulse" />
                    <p className="text-blue-100 text-xs">Always online to help</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsSpeaking(!isSpeaking)}
                  title={isSpeaking ? 'Mute' : 'Unmute'}
                  className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                >
                  {isSpeaking ? <Volume2 size={15} /> : <VolumeX size={15} />}
                </button>
                <button
                  onClick={handleReset}
                  title="Reset conversation"
                  className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <RotateCcw size={15} />
                </button>
                <button
                  onClick={() => setMinimized((m) => !m)}
                  title="Minimize"
                  className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <Minimize2 size={15} />
                </button>
                <button
                  onClick={handleClose}
                  title="Close"
                  className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Body – collapsible */}
            <AnimatePresence>
              {!minimized && (
                <motion.div
                  key="body"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  {/* Messages area */}
                  <div className="bg-gray-50 dark:bg-[#061428] border-x border-gray-200 dark:border-gray-800 flex flex-col overflow-y-auto p-4 gap-0"
                    style={{ height: 380 }}
                  >
                    {messages.map((msg) => (
                      <div key={msg.id}>
                        <ChatBubble msg={msg} />
                        {/* Quick reply chips */}
                        {msg.role === 'bot' && msg.quickReplies && msg.id === messages[messages.length - 1]?.id && !typing && (
                          <motion.div
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                            className="flex flex-wrap gap-2 mb-4 pl-9"
                          >
                            {msg.quickReplies.map((qr) => (
                              <button
                                key={qr}
                                onClick={() => handleSend(qr)}
                                className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full border border-blue-200 dark:border-[#0A9396]/40 bg-blue-50 dark:bg-[#0A9396]/10 text-blue-700 dark:text-[#0A9396] hover:bg-blue-100 dark:hover:bg-[#0A9396]/20 transition-colors font-medium"
                              >
                                {qr}
                                <ChevronRight size={12} />
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </div>
                    ))}

                    {typing && <TypingIndicator />}
                    <div ref={bottomRef} />
                  </div>

                  {/* Input area */}
                  <div className="flex items-center gap-2 px-3 py-3 bg-white dark:bg-[#0B1F3A] rounded-b-2xl border border-gray-200 dark:border-gray-800 border-t-0">
                    <input
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend(input)}
                      placeholder="Ask me anything…"
                      className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white text-sm rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#0A9396] placeholder-gray-400 dark:placeholder-gray-500 transition-all"
                    />
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={toggleMicrophone}
                      disabled={typing}
                      title={isListening ? 'Stop listening' : 'Start voice input'}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                        isListening
                          ? 'bg-red-500 text-white shadow-lg shadow-red-500/50'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      {isListening ? <Mic size={16} /> : <MicOff size={16} />}
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleSend(input)}
                      disabled={!input.trim() || typing}
                      className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-[#0A9396] text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-blue-500/30 hover:shadow-blue-500/50 transition-shadow flex-shrink-0"
                    >
                      <Send size={16} />
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Minimized bar */}
            {minimized && (
              <button
                onClick={() => setMinimized(false)}
                className="bg-white dark:bg-[#0B1F3A] border border-gray-200 dark:border-gray-800 border-t-0 rounded-b-2xl px-4 py-2.5 text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#0B1F3A]/80 transition-colors text-center w-full"
              >
                Click to expand chat ↑
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIChatbot;

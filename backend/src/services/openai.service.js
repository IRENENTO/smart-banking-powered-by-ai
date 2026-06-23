const axios = require('axios');
const { OPENAI_API_KEY } = require('../config/env');

const SYSTEM_PROMPT = `You are Lend-AI, the official AI financial assistant for AI Smart Banking. You ONLY answer questions related to the following:

1. ACCOUNT & BALANCE - Account balances, transactions, transfers, deposits, withdrawals
2. LOANS & CREDIT - Loan applications, eligibility, repayment, interest rates, credit scores
3. SAVINGS & GOALS - Savings strategies, goal setting, emergency funds, interest
4. SPENDING & BUDGETING - Spending analysis, category breakdowns, budget optimization
5. INVESTMENTS - Investment options, market trends, portfolio advice, risk assessment
6. FINANCIAL HEALTH - Financial health scores, risk scores, improvement tips
7. BANKING FEATURES - How to use dashboard, payments, mobile money, scheduled payments
8. MARKET INSIGHTS - Economic trends, sector performance, market predictions
9. INSURANCE - Insurance options, premium advice, coverage recommendations
10. SYSTEM FEATURES - How to navigate the app, language settings, theme, security settings

RULES:
- If a question is NOT about finance, banking, or the AI Smart Banking system, politely respond: "I'm Lend-AI, your financial assistant. I can only answer questions about finance, banking, and AI Smart Banking features. Please ask me something related to your finances or banking needs."
- Keep answers concise, practical, and helpful (2-4 sentences max).
- Use RWF currency since this is a Rwandan banking system.
- Be professional, friendly, and clear.
- If you don't know something specific about the user's account, guide them to check the relevant section in the app.
- NEVER discuss topics like politics, religion, entertainment, or general knowledge unrelated to finance.`;

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const FALLBACK_RESPONSES = {
    spending: "📊 **Spending Analysis Help**\n\nTo analyze your spending patterns, go to the **AI Insights** page from the top menu. There you'll find:\n• **Category breakdown** of your expenses\n• **Monthly spending trends**\n• **Personalized saving recommendations**\n\nAlternatively, check your **Transactions** page to review your recent activity.",
    default: "🤔 I'm having trouble connecting to my AI knowledge base right now.\n\nHere's what I can help with right now:\n• **How to send money** – Go to Payments\n• **Apply for a loan** – Go to Loans\n• **Check balance** – Go to Dashboard\n• **View transactions** – Go to Transactions\n\nOr try asking me a simpler banking question!"
};

function getFallbackResponse(message) {
    const lower = message.toLowerCase();
    if (lower.includes('spending') || lower.includes('spend') || lower.includes('analyze') || lower.includes('pattern')) {
        return FALLBACK_RESPONSES.spending;
    }
    return FALLBACK_RESPONSES.default;
}

const chatWithAI = async (message, conversationHistory = []) => {
    if (!OPENAI_API_KEY) {
        const fallback = getFallbackResponse(message);
        return { reply: fallback, quickReplies: ['How to send money?', 'Apply for a loan', 'View my balance', 'AI Insights help'] };
    }

    const messages = [
        { role: 'system', content: SYSTEM_PROMPT }
    ];

    if (conversationHistory.length > 0) {
        const recentHistory = conversationHistory.slice(-10);
        for (const msg of recentHistory) {
            if (msg.role === 'user' || msg.role === 'assistant') {
                messages.push({ role: msg.role, content: msg.text || msg.content });
            }
        }
    }

    messages.push({ role: 'user', content: message });

    const MAX_RETRIES = 3;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
            const response = await axios.post(
                'https://api.openai.com/v1/chat/completions',
                {
                    model: 'gpt-4o',
                    messages,
                    temperature: 0.7,
                    max_tokens: 500
                },
                {
                    headers: {
                        'Authorization': `Bearer ${OPENAI_API_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 30000
                }
            );

            const reply = response.data?.choices?.[0]?.message?.content;
            return { reply: reply || 'I apologize, but I could not generate a response right now. Please try again.' };
        } catch (error) {
            const status = error.response?.status;
            console.error(`OpenAI API error (attempt ${attempt + 1}/${MAX_RETRIES + 1}):`, error.message);

            if (status === 401) {
                const fallback = getFallbackResponse(message);
                return { reply: fallback, quickReplies: ['How to send money?', 'Apply for a loan', 'View my balance', 'AI Insights help'] };
            }

            if (status === 429 && attempt < MAX_RETRIES) {
                const backoff = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
                console.warn(`Rate limited. Retrying in ${Math.round(backoff)}ms...`);
                await sleep(backoff);
                continue;
            }

            if (status === 429) {
                const fallback = getFallbackResponse(message);
                return { reply: fallback, quickReplies: ['How to send money?', 'Apply for a loan', 'View my balance', 'AI Insights help'] };
            }

            if (error.code === 'ECONNABORTED') {
                const fallback = getFallbackResponse(message);
                return { reply: fallback, quickReplies: ['How to send money?', 'Apply for a loan', 'View my balance', 'AI Insights help'] };
            }

            const fallback = getFallbackResponse(message);
            return { reply: fallback, quickReplies: ['How to send money?', 'Apply for a loan', 'View my balance', 'AI Insights help'] };
        }
    }

    const fallback = getFallbackResponse(message);
    return { reply: fallback, quickReplies: ['How to send money?', 'Apply for a loan', 'View my balance', 'AI Insights help'] };
};

module.exports = { chatWithAI };
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

const chatWithAI = async (message, conversationHistory = []) => {
    if (!OPENAI_API_KEY) {
        return { reply: 'AI service is not configured. Please contact support.' };
    }

    try {
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
        console.error('OpenAI API error:', error.message);
        if (error.response?.status === 401) {
            return { reply: 'AI service authentication failed. Please contact support.' };
        }
        if (error.response?.status === 429) {
            return { reply: 'AI service is currently busy. Please try again in a moment.' };
        }
        return { reply: 'I apologize, but I am having trouble connecting to my knowledge base right now. Please try again or check the relevant section in the app.' };
    }
};

module.exports = { chatWithAI };
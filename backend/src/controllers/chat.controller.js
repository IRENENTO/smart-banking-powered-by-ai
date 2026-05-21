const generateChatReply = (message) => {
    const normalized = message.trim().toLowerCase();
    if (!normalized) {
        return 'Please type a question and I will help you with your AI banking account.';
    }

    // Balance
    if (normalized.includes('balance') || normalized.includes('amafaranga asigaye') || normalized.includes('rbalance') || normalized.includes('رصيد')) {
        return 'You can view your current balance on the home dashboard and the Transactions screen. / Urashobora kureba amafaranga ufite kuri konti yawe ahabanza cyangwa ahashyirwa ibyakozwe. / يمكنك عرض رصيدك الحالي على لوحة التحكم الرئيسية وشاشة المعاملات.';
    }
    
    // Loan
    if (normalized.includes('loan') || normalized.includes('inguzanyo') || normalized.includes('قرض')) {
        return 'To apply for a loan, open the Request Loan screen and fill out the loan details. / Kugira ngo usabe inguzanyo, fungura ahanditse "Saba Inguzanyo" wuzuze amakuru asabwa. / لطلب قرض، افتح شاشة طلب القرض واملأ تفاصيل القرض.';
    }
    
    // Transactions
    if (normalized.includes('transaction') || normalized.includes('deposit') || normalized.includes('withdraw') || normalized.includes('kohereza') || normalized.includes('تحويل') || normalized.includes('إيداع')) {
        return 'Open Transactions to see your history, make deposits, and withdraw funds. / Fungura "Ibyakozwe" kugira ngo urebe amateka yawe cyangwa wohereze amafaranga. / افتح المعاملات لمشاهدة تاريخك، وإيداع الأموال، وسحبها.';
    }
    
    // Savings
    if (normalized.includes('recommend') || normalized.includes('savings') || normalized.includes('budget') || normalized.includes('kwizigamira') || normalized.includes('ادخار') || normalized.includes('ميزانية')) {
        return 'I recommend saving at least 20% of your monthly income. Use Insights for personalized tips. / Turakugira inama yo kwizigamira nibura 20% by\'amafaranga winjiza. / نوصي بادخار 20٪ على الأقل من دخلك الشهري.';
    }

    // Business Advice
    if (normalized.includes('business') || normalized.includes('ubucuruzi') || normalized.includes('تجارة') || normalized.includes('استثمار') || normalized.includes('investment')) {
        return 'For business advice: 1. Research your market. 2. Keep track of every expense. 3. Start small and scale up. 4. Use our AI Market Insights for trends. / Inama ku bucuruzi: 1. Sura isoko ryawe. 2. Andika ibyo wasohoye byose. 3. Tangira buhoro uzamuka. / لنصائح العمل: 1. ابحث في سوقك. 2. تتبع كل مصاريفك. 3. ابدأ صغيراً ثم توسع.';
    }

    // Help
    if (normalized.includes('help') || normalized.includes('how') || normalized.includes('what') || normalized.includes('gufashwa') || normalized.includes('مساعدة')) {
        return 'Ask me about your account, loans, transactions, or business advice. / Mbaza ibyerekeye konti yawe, inguzanyo, cyangwa inama ku bucuruzi. / اسألني عن حسابك، أو القروض، أو المعاملات، أو نصائح العمل.';
    }

    return 'I am here to help with your AI banking and business needs. Try asking about your balance, loans, or business advice. / Ndi hano kugira ngo nkuvashe mu by\'imari n\'ubucuruzi. / أنا هنا للمساعدة في احتياجاتك المصرفية والتجارية.';
};

exports.chat = async (req, res) => {
    const { message } = req.body;
    if (!message || typeof message !== 'string') {
        return res.status(400).json({ msg: 'A valid message is required.' });
    }

    const reply = generateChatReply(message);
    return res.json({ reply });
};

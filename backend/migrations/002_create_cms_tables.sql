CREATE TABLE IF NOT EXISTS cms_sections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    page VARCHAR(100) NOT NULL,
    section VARCHAR(100) NOT NULL,
    content JSON NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by INT,
    UNIQUE KEY unique_page_section (page, section)
);

-- Seed default CMS content from existing public controller data
INSERT IGNORE INTO cms_sections (page, section, content) VALUES
('about', 'main', JSON_OBJECT(
    'title', 'About AI Banking Rwanda',
    'description', 'AI Banking is Rwanda''s leading digital banking platform, combining cutting-edge artificial intelligence with traditional banking services to provide you with a seamless, secure, and intelligent banking experience.',
    'mission', 'To revolutionize banking in Rwanda through AI-powered financial solutions that are accessible, affordable, and tailored to every Rwandan''s needs.',
    'vision', 'To become the most trusted digital banking partner for every Rwandan, empowering financial inclusion and economic growth through technology.',
    'values', JSON_ARRAY(
        JSON_OBJECT('title', 'Innovation', 'description', 'We leverage AI and technology to create smarter banking solutions'),
        JSON_OBJECT('title', 'Security', 'description', 'Your financial security is our top priority with advanced encryption and fraud detection'),
        JSON_OBJECT('title', 'Accessibility', 'description', 'Banking services available to everyone, everywhere in Rwanda'),
        JSON_OBJECT('title', 'Customer-Centric', 'description', 'Every solution is designed with our customers'' needs at the forefront')
    ),
    'stats', JSON_ARRAY(
        JSON_OBJECT('label', 'Active Users', 'value', '50,000+'),
        JSON_OBJECT('label', 'Transactions Daily', 'value', '10,000+'),
        JSON_OBJECT('label', 'Coverage', 'value', 'All 30 Districts'),
        JSON_OBJECT('label', 'Customer Satisfaction', 'value', '98%')
    )
)),
('contact', 'main', JSON_OBJECT(
    'title', 'Contact Us',
    'description', 'We''re here to help you with all your banking needs. Reach out to us through any of the following channels:',
    'contactMethods', JSON_ARRAY(
        JSON_OBJECT('type', 'Phone', 'value', '0787427123', 'description', 'Available 24/7 for customer support', 'icon', 'phone'),
        JSON_OBJECT('type', 'Email', 'value', 'smartbankingpoweredbyai@gmail.com', 'description', 'We''ll respond within 24 hours', 'icon', 'email'),
        JSON_OBJECT('type', 'WhatsApp', 'value', '0787427123', 'description', 'Chat with us instantly on WhatsApp', 'icon', 'whatsapp')
    ),
    'socialMedia', JSON_ARRAY(
        JSON_OBJECT('platform', 'Facebook', 'url', 'https://facebook.com/aibankingrw', 'handle', '@aibankingrw'),
        JSON_OBJECT('platform', 'Twitter', 'url', 'https://twitter.com/aibankingrw', 'handle', '@aibankingrw'),
        JSON_OBJECT('platform', 'LinkedIn', 'url', 'https://linkedin.com/company/aibankingrw', 'handle', 'AI Banking Rwanda'),
        JSON_OBJECT('platform', 'Instagram', 'url', 'https://instagram.com/aibankingrw', 'handle', '@aibankingrw')
    )
)),
('services', 'main', JSON_OBJECT(
    'title', 'Our Services',
    'description', 'Discover our comprehensive range of AI-powered banking services designed to meet your financial needs:',
    'services', JSON_ARRAY(
        JSON_OBJECT('title', 'Smart Savings', 'description', 'AI-powered savings accounts that help you save smarter with personalized recommendations and automated savings goals.', 'features', JSON_ARRAY('AI Savings Insights', 'Goal-based Savings', 'Automated Transfers', 'Competitive Interest Rates'), 'icon', 'savings'),
        JSON_OBJECT('title', 'Digital Loans', 'description', 'Quick and easy loan approvals powered by AI credit scoring. Get funds within minutes.', 'features', JSON_ARRAY('Instant Approval', 'Flexible Terms', 'Low Interest Rates', 'No Collateral Required'), 'icon', 'loan'),
        JSON_OBJECT('title', 'Mobile Banking', 'description', 'Complete banking services on your mobile device. Bank anytime, anywhere.', 'features', JSON_ARRAY('24/7 Access', 'Bill Payments', 'Money Transfers', 'Mobile Top-up'), 'icon', 'mobile'),
        JSON_OBJECT('title', 'Investment Services', 'description', 'AI-driven investment recommendations tailored to your risk profile and financial goals.', 'features', JSON_ARRAY('AI Portfolio Management', 'Risk Assessment', 'Market Insights', 'Diversified Options'), 'icon', 'investment'),
        JSON_OBJECT('title', 'Business Banking', 'description', 'Comprehensive banking solutions for businesses of all sizes in Rwanda.', 'features', JSON_ARRAY('Business Accounts', 'Payroll Services', 'Trade Finance', 'Business Loans'), 'icon', 'business'),
        JSON_OBJECT('title', 'Insurance Products', 'description', 'Protect what matters most with our range of insurance products.', 'features', JSON_ARRAY('Life Insurance', 'Health Insurance', 'Property Insurance', 'Vehicle Insurance'), 'icon', 'insurance')
    )
)),
('faq', 'main', JSON_OBJECT(
    'title', 'Frequently Asked Questions',
    'description', 'Find answers to common questions about AI Banking Rwanda:',
    'categories', JSON_ARRAY(
        JSON_OBJECT('category', 'Getting Started', 'questions', JSON_ARRAY(
            JSON_OBJECT('question', 'How do I open an account with AI Banking?', 'answer', 'You can open an account by clicking ''Register'' on our app or website. The process takes just a few minutes and you''ll need your email, phone number, and a valid ID.'),
            JSON_OBJECT('question', 'What documents do I need to register?', 'answer', 'You''ll need a valid national ID, email address, phone number, and to be at least 18 years old.'),
            JSON_OBJECT('question', 'Is AI Banking available in all parts of Rwanda?', 'answer', 'Yes! AI Banking is available across all 30 districts of Rwanda through our mobile app and physical branches.')
        )),
        JSON_OBJECT('category', 'Account Security', 'questions', JSON_ARRAY(
            JSON_OBJECT('question', 'How secure is my account?', 'answer', 'We use bank-level encryption, two-factor authentication, and AI-powered fraud detection to keep your account secure.'),
            JSON_OBJECT('question', 'What should I do if I forget my password?', 'answer', 'You can reset your password using the ''Forgot Password'' option on the login page. We''ll send you a secure link to reset it.'),
            JSON_OBJECT('question', 'How does the transaction PIN work?', 'answer', 'Your 4-digit transaction PIN adds an extra layer of security for all your banking transactions. Never share it with anyone.')
        )),
        JSON_OBJECT('category', 'Services & Fees', 'questions', JSON_ARRAY(
            JSON_OBJECT('question', 'What are the fees for using AI Banking?', 'answer', 'Basic account maintenance is free. We charge competitive fees for specific services like transfers and loans. Check our fee schedule for details.'),
            JSON_OBJECT('question', 'How quickly can I get a loan?', 'answer', 'With our AI-powered credit scoring, most loan applications are approved within minutes and funds are disbursed immediately.'),
            JSON_OBJECT('question', 'Can I use AI Banking internationally?', 'answer', 'Yes, you can access your account and make transactions internationally, though some fees may apply for international transfers.')
        ))
    )
));

// Public routes controller for landing page content

exports.getAboutUs = async (req, res) => {
    try {
        const aboutData = {
            title: "About AI Banking Rwanda",
            description: "AI Banking is Rwanda's leading digital banking platform, combining cutting-edge artificial intelligence with traditional banking services to provide you with a seamless, secure, and intelligent banking experience.",
            mission: "To revolutionize banking in Rwanda through AI-powered financial solutions that are accessible, affordable, and tailored to every Rwandan's needs.",
            vision: "To become the most trusted digital banking partner for every Rwandan, empowering financial inclusion and economic growth through technology.",
            values: [
                {
                    title: "Innovation",
                    description: "We leverage AI and technology to create smarter banking solutions"
                },
                {
                    title: "Security",
                    description: "Your financial security is our top priority with advanced encryption and fraud detection"
                },
                {
                    title: "Accessibility",
                    description: "Banking services available to everyone, everywhere in Rwanda"
                },
                {
                    title: "Customer-Centric",
                    description: "Every solution is designed with our customers' needs at the forefront"
                }
            ],
            stats: [
                { label: "Active Users", value: "50,000+" },
                { label: "Transactions Daily", value: "10,000+" },
                { label: "Coverage", value: "All 30 Districts" },
                { label: "Customer Satisfaction", value: "98%" }
            ]
        };

        res.json(aboutData);
    } catch (err) {
        console.error('Get About Us error:', err);
        res.status(500).json({ msg: `Server Error: ${err.message}` });
    }
};

exports.getContactUs = async (req, res) => {
    try {
        const contactData = {
            title: "Contact Us",
            description: "We're here to help you with all your banking needs. Reach out to us through any of the following channels:",
            contactMethods: [
                {
                    type: "Phone",
                    value: "+250 788 123 456",
                    description: "Available 24/7 for customer support",
                    icon: "phone"
                },
                {
                    type: "Email",
                    value: "support@aibanking.rw",
                    description: "We'll respond within 24 hours",
                    icon: "email"
                },
                {
                    type: "WhatsApp",
                    value: "+250 788 123 456",
                    description: "Chat with us instantly",
                    icon: "whatsapp"
                },
                {
                    type: "Physical Address",
                    value: "KG 7 Ave, Kigali, Rwanda",
                    description: "Visit our headquarters Monday-Friday 8AM-5PM",
                    icon: "location"
                }
            ],
            branches: [
                {
                    name: "Kigali Main Branch",
                    address: "KG 7 Ave, Kigali City",
                    phone: "+250 788 123 456",
                    hours: "Mon-Fri: 8AM-5PM, Sat: 9AM-1PM"
                },
                {
                    name: "Remera Branch",
                    address: "KN 4 Rd, Kigali",
                    phone: "+250 788 123 457",
                    hours: "Mon-Fri: 8AM-5PM"
                },
                {
                    name: "Nyabugogo Branch",
                    address: "KN 2 Rd, Kigali",
                    phone: "+250 788 123 458",
                    hours: "Mon-Fri: 8AM-5PM"
                }
            ],
            socialMedia: [
                {
                    platform: "Facebook",
                    url: "https://facebook.com/aibankingrw",
                    handle: "@aibankingrw"
                },
                {
                    platform: "Twitter",
                    url: "https://twitter.com/aibankingrw",
                    handle: "@aibankingrw"
                },
                {
                    platform: "LinkedIn",
                    url: "https://linkedin.com/company/aibankingrw",
                    handle: "AI Banking Rwanda"
                },
                {
                    platform: "Instagram",
                    url: "https://instagram.com/aibankingrw",
                    handle: "@aibankingrw"
                }
            ]
        };

        res.json(contactData);
    } catch (err) {
        console.error('Get Contact Us error:', err);
        res.status(500).json({ msg: `Server Error: ${err.message}` });
    }
};

exports.getServices = async (req, res) => {
    try {
        const servicesData = {
            title: "Our Services",
            description: "Discover our comprehensive range of AI-powered banking services designed to meet your financial needs:",
            services: [
                {
                    title: "Smart Savings",
                    description: "AI-powered savings accounts that help you save smarter with personalized recommendations and automated savings goals.",
                    features: ["AI Savings Insights", "Goal-based Savings", "Automated Transfers", "Competitive Interest Rates"],
                    icon: "savings"
                },
                {
                    title: "Digital Loans",
                    description: "Quick and easy loan approvals powered by AI credit scoring. Get funds within minutes.",
                    features: ["Instant Approval", "Flexible Terms", "Low Interest Rates", "No Collateral Required"],
                    icon: "loan"
                },
                {
                    title: "Mobile Banking",
                    description: "Complete banking services on your mobile device. Bank anytime, anywhere.",
                    features: ["24/7 Access", "Bill Payments", "Money Transfers", "Mobile Top-up"],
                    icon: "mobile"
                },
                {
                    title: "Investment Services",
                    description: "AI-driven investment recommendations tailored to your risk profile and financial goals.",
                    features: ["AI Portfolio Management", "Risk Assessment", "Market Insights", "Diversified Options"],
                    icon: "investment"
                },
                {
                    title: "Business Banking",
                    description: "Comprehensive banking solutions for businesses of all sizes in Rwanda.",
                    features: ["Business Accounts", "Payroll Services", "Trade Finance", "Business Loans"],
                    icon: "business"
                },
                {
                    title: "Insurance Products",
                    description: "Protect what matters most with our range of insurance products.",
                    features: ["Life Insurance", "Health Insurance", "Property Insurance", "Vehicle Insurance"],
                    icon: "insurance"
                }
            ]
        };

        res.json(servicesData);
    } catch (err) {
        console.error('Get Services error:', err);
        res.status(500).json({ msg: `Server Error: ${err.message}` });
    }
};

exports.getFAQ = async (req, res) => {
    try {
        const faqData = {
            title: "Frequently Asked Questions",
            description: "Find answers to common questions about AI Banking Rwanda:",
            categories: [
                {
                    category: "Getting Started",
                    questions: [
                        {
                            question: "How do I open an account with AI Banking?",
                            answer: "You can open an account by clicking 'Register' on our app or website. The process takes just a few minutes and you'll need your email, phone number, and a valid ID."
                        },
                        {
                            question: "What documents do I need to register?",
                            answer: "You'll need a valid national ID, email address, phone number, and to be at least 18 years old. You'll also need to complete our KYC verification process."
                        },
                        {
                            question: "Is AI Banking available in all parts of Rwanda?",
                            answer: "Yes! AI Banking is available across all 30 districts of Rwanda through our mobile app and physical branches."
                        }
                    ]
                },
                {
                    category: "Account Security",
                    questions: [
                        {
                            question: "How secure is my account?",
                            answer: "We use bank-level encryption, two-factor authentication, and AI-powered fraud detection to keep your account secure."
                        },
                        {
                            question: "What should I do if I forget my password?",
                            answer: "You can reset your password using the 'Forgot Password' option on the login page. We'll send you a secure link to reset it."
                        },
                        {
                            question: "How does the transaction PIN work?",
                            answer: "Your 4-digit transaction PIN adds an extra layer of security for all your banking transactions. Never share it with anyone."
                        }
                    ]
                },
                {
                    category: "Services & Fees",
                    questions: [
                        {
                            question: "What are the fees for using AI Banking?",
                            answer: "Basic account maintenance is free. We charge competitive fees for specific services like transfers and loans. Check our fee schedule for details."
                        },
                        {
                            question: "How quickly can I get a loan?",
                            answer: "With our AI-powered credit scoring, most loan applications are approved within minutes and funds are disbursed immediately."
                        },
                        {
                            question: "Can I use AI Banking internationally?",
                            answer: "Yes, you can access your account and make transactions internationally, though some fees may apply for international transfers."
                        }
                    ]
                }
            ]
        };

        res.json(faqData);
    } catch (err) {
        console.error('Get FAQ error:', err);
        res.status(500).json({ msg: `Server Error: ${err.message}` });
    }
};

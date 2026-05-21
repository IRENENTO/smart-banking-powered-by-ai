# AI-Powered Integrated Digital Banking Platform

## System Overview
An intelligent digital banking ecosystem designed for automated loan approval, financial risk assessment, and economic forecasting. The platform leverages machine learning to streamline credit decisions while providing a modern banking experience across web and mobile interfaces.

## Architecture
The system follows a microservices architecture:
- **Backend API**: Node.js/Express service handling user management, transactions, and business logic.
- **AI Engine**: Python/FastAPI service dedicated to ML-based risk scoring and forecasting.
- **Web Frontend**: React.js SPA for administrative and user banking operations.
- **Mobile App**: React Native application for on-the-go banking services.
- **Database**: MongoDB for flexible data storage.

## Project Structure
```
ai-banking/
├─ .env                  # Environment variables for local development configuration
├─ .idea/                # JetBrains IDE configuration and workspace settings
├─ .isocode/             # IDE or editor specific configuration files
├─ config.toml           # Global configuration settings for the entire platform
├─ database/             # Database migration scripts and schema definitions
│  └─ migration.sql      # SQL script for database initialization and updates
├─ db.js                 # Root-level database connection helper and utilities
├─ index.js              # Root-level server bootstrap and application entrypoint
├─ ai-engine/            # Python AI/ML service for risk scoring and economic forecasting
│  ├─ requirements.txt   # Python package dependencies for the AI engine
│  └─ app/
│     ├─ __pycache__/    # Python compiled bytecode cache directory
│     │  ├─ main.cpython-314.pyc # Compiled main application
│     │  └─ schemas.cpython-314.pyc # Compiled schema definitions
│     ├─ main.py         # FastAPI application entrypoint and server setup
│     ├─ schemas.py      # Pydantic models for request/response validation
│     ├─ models/         # Machine learning model definitions and implementations
│     │  ├─ __pycache__/ # Model bytecode cache
│     │  │  └─ loan_risk_model.cpython-314.pyc # Compiled loan risk model
│     │  └─ loan_risk_model.py # Loan risk assessment ML model
│     └─ services/       # Business logic for AI scoring, prediction, and data processing
│        ├─ __pycache__/ # Service bytecode cache
│        │  ├─ economic_forecast.cpython-314.pyc # Compiled economic forecast service
│        │  └─ risk_scoring.cpython-314.pyc # Compiled risk scoring service
│        ├─ economic_forecast.py # Economic forecasting service
│        └─ risk_scoring.py # Risk scoring and evaluation service
├─ backend/              # Node.js backend API server and core business logic
│  ├─ .env               # Backend-specific environment variables
│  ├─ .env.example       # Template for backend environment configuration
│  ├─ app/               # Python backend services for additional functionality
│  │  ├─ __init__.py     # Python package initialization
│  │  ├─ main.py         # Python backend application entrypoint
│  │  ├─ api/            # API endpoints and route definitions
│  │  │  ├─ __init__.py  # API package initialization
│  │  │  └─ auth.py      # Authentication API endpoints
│  │  ├─ core/           # Core application utilities and configurations
│  │  │  ├─ __init__.py  # Core package initialization
│  │  │  ├─ config.py    # Application configuration settings
│  │  │  └─ security.py  # Security utilities and helpers
│  │  ├─ db/             # Database connection and management utilities
│  │  │  ├─ __init__.py  # Database package initialization
│  │  │  └─ database.py  # Database connection and operations
│  │  ├─ ml_engine/      # Machine learning integration services
│  │  │  ├─ __init__.py  # ML engine package initialization
│  │  │  ├─ data_gen.py  # Data generation utilities for ML
│  │  │  └─ train.py     # ML model training scripts
│  │  ├─ models/         # Data models and database schemas
│  │  │  ├─ __init__.py  # Models package initialization
│  │  │  └─ user.py      # User data model and schema
│  │  └─ services/       # Business logic and service implementations
│  │     ├─ __init__.py  # Services package initialization
│  │     └─ risk_service.py # Risk assessment business logic
│  ├─ cleanup.js         # Script for backend cleanup and maintenance tasks
│  ├─ jest.config.js     # Jest testing framework configuration
│  ├─ package.json       # Backend Node.js dependencies and npm scripts
│  ├─ package-lock.json  # Locked dependency versions for reproducible builds
│  ├─ requirements.txt   # Python dependencies for backend services
│  ├─ src/               # Main backend source code directory
│  │  ├─ server.js       # Express server setup and configuration
│  │  ├─ config/         # Backend configuration files and settings
│  │  │  ├─ database.js  # Database connection configuration
│  │  │  ├─ env.js       # Environment variable configuration
│  │  │  ├─ passport.js  # Authentication strategy configuration
│  │  │  └─ swagger.js   # API documentation configuration
│  │  ├─ controllers/    # API controllers handling request/response logic
│  │  │  ├─ auth.controller.js     # Authentication endpoint handlers
│  │  │  ├─ loan.controller.js     # Loan application and management
│  │  │  ├─ otp.controller.js      # One-time password handling
│  │  │  ├─ payment.controller.js  # Payment processing endpoints
│  │  │  ├─ profile.controller.js  # User profile management
│  │  │  ├─ public.controller.js   # Public API endpoints
│  │  │  ├─ security.controller.js # Security settings management
│  │  │  └─ transaction.controller.js # Transaction processing
│  │  ├─ middleware/     # Express middleware for request processing
│  │  │  ├─ auth.js       # Authentication and authorization middleware
│  │  │  ├─ auth.middleware.js # Enhanced authentication middleware
│  │  │  └─ role.middleware.js # Role-based access control
│  │  ├─ models/         # Database models and schema definitions
│  │  │  ├─ Account.js   # Account data model and schema
│  │  │  ├─ AIDecision.js # AI decision tracking model
│  │  │  ├─ Loan.js      # Loan application and data model
│  │  │  ├─ Transaction.js # Transaction data model
│  │  │  └─ User.js      # User data model and schema
│  │  ├─ routes/         # API route definitions and endpoint mappings
│  │  │  ├─ auth.routes.js       # Authentication routes
│  │  │  ├─ loan.routes.js       # Loan-related endpoints
│  │  │  ├─ oauth.routes.js      # OAuth authentication routes
│  │  │  ├─ otp.routes.js        # One-time password routes
│  │  │  ├─ payment.routes.js    # Payment processing endpoints
│  │  │  ├─ profile.routes.js    # User profile endpoints
│  │  │  ├─ public.routes.js     # Public API routes
│  │  │  ├─ security.routes.js   # Security management routes
│  │  │  └─ transaction.routes.js # Transaction endpoints
│  │  ├─ services/       # Business logic and helper services
│  │  │  └─ ai.service.js # AI service integration
│  │  ├─ seeders/        # Database seeding scripts for initial data
│  │  │  └─ demo-data.js # Demo data seeding script
│  │  └─ migrations/     # Database migration scripts
│  │     └─ mysql-migration.sql # MySQL database migration
│  └─ tests/             # Backend test suites and test utilities
│     └─ payment-transaction.test.js # Payment transaction tests
├─ web/                  # React TypeScript web frontend application
│  ├─ build/             # Compiled production build output
│  ├─ build-temp/        # Temporary build files and cache
│  ├─ craco-deps.json    # CRACO (Create React App Configuration Override) dependencies
│  ├─ craco.config.js    # CRACO configuration for custom webpack setup
│  ├─ package.json       # Web frontend dependencies and scripts
│  ├─ package-lock.json  # Locked dependency versions for web frontend
│  ├─ postcss.config.js  # PostCSS configuration for CSS processing
│  ├─ public/            # Static assets and HTML template
│  │  └─ index.html      # Main HTML template for the web app
│  ├─ src/               # Web application source code
│  │  ├─ App.tsx         # Main React application component
│  │  ├─ index.tsx       # React application entry point
│  │  ├─ index.css       # Global CSS styles and resets
│  │  ├─ react-app-env.d.ts # TypeScript declarations for Create React App
│  │  ├─ cards.css       # Custom card component styles
│  │  ├─ imigongo.css    # Custom styling for specific components
│  │  ├─ i18n.ts         # Internationalization setup and configuration
│  │  ├─ components/     # Reusable React UI components
│  │  │  ├─ AIChatbot.tsx # AI-powered chatbot component
│  │  │  ├─ AIFinancialAdvisor.tsx # AI financial advisor interface
│  │  │  ├─ AppShell.module.css # App shell component styles
│  │  │  ├─ AppShell.tsx # Main application shell layout
│  │  │  ├─ Button.tsx   # Custom button component
│  │  │  ├─ Footer.tsx   # Application footer component
│  │  │  ├─ IncomePattern.tsx # Income pattern visualization
│  │  │  ├─ InvestmentIdeas.tsx # Investment suggestions component
│  │  │  ├─ LandingScrollNav.module.css # Landing navigation styles
│  │  │  ├─ LandingScrollNav.tsx # Landing page scroll navigation
│  │  │  ├─ LanguageToggle.tsx # Language switcher component
│  │  │  ├─ LoadingButton.tsx # Loading state button component
│  │  │  ├─ LoanEligibility.tsx # Loan eligibility checker
│  │  │  ├─ MarketInsights.tsx # Market insights display
│  │  │  ├─ Modal.tsx    # Modal dialog component
│  │  │  ├─ Navbar.tsx   # Navigation bar component
│  │  │  ├─ NotificationDropdown.tsx # Notification dropdown menu
│  │  │  ├─ PageLayout.tsx # Page layout wrapper component
│  │  │  ├─ PaymentDashboard.tsx # Payment dashboard interface
│  │  │  ├─ QuickActions.tsx # Quick action buttons component
│  │  │  ├─ RiskAlerts.tsx # Risk alerts display
│  │  │  ├─ RouteGuard.tsx # Route protection component
│  │  │  ├─ SavingsGoalModal.tsx # Savings goal modal
│  │  │  ├─ SectionCard.tsx # Section card wrapper
│  │  │  ├─ SmartAlertBanner.tsx # Smart alert banner
│  │  │  ├─ SpendingAnalytics.tsx # Spending analytics visualization
│  │  │  └─ VideoBackground.tsx # Video background component
│  │  ├─ context/        # React context providers for state management
│  │  │  ├─ LanguageContext.tsx # Language preference context
│  │  │  ├─ NotificationContext.tsx # Notification management context
│  │  │  └─ ThemeContext.tsx # Theme management context
│  │  ├─ data/           # Static data and mock data files
│  │  │  └─ mockData.ts  # Mock data for development and testing
│  │  ├─ i18n/           # Internationalization configuration and translations
│  │  │  ├─ mappers.ts   # Translation mapping utilities
│  │  │  ├─ translations.ts # Translation definitions
│  │  │  └─ useT.ts      # Translation hook
│  │  ├─ pages/          # Page-level React components
│  │  │  ├─ About.tsx    # About page component
│  │  │  ├─ Accounts.tsx # Accounts management page
│  │  │  ├─ AdminDashboard.tsx # Admin dashboard interface
│  │  │  ├─ AIInsights.tsx # AI insights and analytics page
│  │  │  ├─ ApiDocs.tsx  # API documentation page
│  │  │  ├─ Auth.module.css # Authentication page styles
│  │  │  ├─ AuthSuccess.tsx # Authentication success page
│  │  │  ├─ BusinessBanking.tsx # Business banking services page
│  │  │  ├─ Careers.tsx  # Careers and job opportunities page
│  │  │  ├─ CompleteProfile.tsx # Profile completion page
│  │  │  ├─ CreditCards.tsx # Credit cards management page
│  │  │  ├─ Dashboard.tsx # Main user dashboard
│  │  │  ├─ Features.tsx # Platform features showcase page
│  │  │  ├─ Insurance.tsx # Insurance services page
│  │  │  ├─ Investments.tsx # Investment management page
│  │  │  ├─ Landing.tsx  # Landing page component
│  │  │  ├─ Landing.module.css # Landing page styles
│  │  │  ├─ LoanApplication.tsx # Loan application form page
│  │  │  ├─ LoanStatus.tsx # Loan application status page
│  │  │  ├─ Loans.tsx    # Loans management page
│  │  │  ├─ Login.tsx    # User login page
│  │  │  ├─ Payments.tsx # Payment processing page
│  │  │  ├─ PersonalBanking.tsx # Personal banking services page
│  │  │  ├─ Pricing.tsx  # Pricing and plans page
│  │  │  ├─ Profile.tsx  # User profile management page
│  │  │  ├─ Register.tsx # User registration page
│  │  │  ├─ Reports.tsx  # Reports and analytics page
│  │  │  ├─ RiskResult.tsx # Risk assessment results page
│  │  │  ├─ Savings.tsx  # Savings management page
│  │  │  ├─ Security.tsx # Security settings page
│  │  │  ├─ SetSecurity.tsx # Security configuration page
│  │  │  ├─ Settings.tsx # Application settings page
│  │  │  ├─ Transactions.tsx # Transaction history page
│  │  │  └─ VerifyOTP.tsx # OTP verification page
│  │  ├─ services/       # API service functions and HTTP clients
│  │  │  ├─ api.ts       # Main API service client
│  │  │  ├─ otpService.ts # OTP service functions
│  │  │  └─ publicService.ts # Public API service functions
│  │  └─ utils/          # Utility functions and helpers
│  │     └─ preferences.ts # User preference utilities
│  ├─ tailwind.config.js # Tailwind CSS configuration
│  └─ tsconfig.json      # TypeScript configuration for the web app
├─ mobile/               # React Native mobile application
│  ├─ .eslintrc.js       # ESLint configuration for mobile code quality
│  ├─ .gitignore         # Git ignore patterns for mobile project
│  ├─ .prettierrc.js     # Prettier code formatting configuration
│  ├─ App.tsx            # Main mobile application entry component
│  ├─ app.json           # React Native app configuration and metadata
│  ├─ babel.config.js    # Babel configuration for JavaScript transformation
│  ├─ index.js           # React Native application bootstrap
│  ├─ jest.config.js     # Jest testing configuration for mobile
│  ├─ metro.config.js    # Metro bundler configuration for React Native
│  ├─ package.json       # Mobile app dependencies and scripts
│  ├─ package-lock.json # Locked dependency versions for mobile
│  ├─ tsconfig.json      # TypeScript configuration for mobile app
│  ├─ yarn.lock          # Yarn package manager lock file
│  ├─ android/           # Android native project files and configuration
│  ├─ ios/               # iOS native project files and configuration
│  └─ src/               # Mobile application source code
│     ├─ App.tsx         # Mobile app main component
│     ├─ api/            # Mobile API service functions
│     │  └─ client.ts    # API client for mobile
│     ├─ screens/        # Mobile screen components
│     │  ├─ ApplyLoanScreen.tsx # Loan application screen
│     │  ├─ HomeScreen.tsx # Home dashboard screen
│     │  ├─ LoanResultScreen.tsx # Loan results screen
│     │  └─ LoginScreen.tsx # Login authentication screen
│     ├─ services/       # Mobile-specific business logic services
│     │  └─ api.ts       # Mobile API service
│     └─ store/          # State management for mobile app
│        └─ authStore.ts # Authentication state store
├─ package.json          # Root workspace dependencies and scripts
├─ package-lock.json     # Root workspace locked dependency versions
├─ README.md             # Project documentation and overview
├─ SETUP_GUIDE.md        # Detailed setup instructions and environment guide
└─ UPGRADE_SUMMARY.md    # Version changelog and upgrade notes
```

## Admin Access

### Admin Dashboard Credentials
- **URL**: `http://localhost:5001/admin/login`
- **Email**: `smartbankingpoweredbyai@gmail.com`
- **Password**: `irene12003`
- **Role**: `super_admin`

### Setup Admin Account
Run the migration to create the admin tables and seed the admin user:
```bash
cd backend
node run-migrations.js
```

Or manually update/create the admin:
```bash
cd backend
node scripts/update-admin-password.js
```

## How to Run

### 1. Backend API
```bash
cd backend
npm install
npm start
```

### 2. AI Engine
```bash
cd ai-engine
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### 3. Web Application
```bash
cd web
npm install
npm start
```

### 4. Mobile Application
```bash
cd mobile
npm install
npx react-native run-android # or run-ios
```

## How AI Loan Approval Works
The AI Engine evaluates loan applications based on:
1. **Credit History**: Past repayment behavior.
2. **Financial Ratios**: Debt-to-income and savings-to-loan ratios.
3. **Economic Forecast**: Integration of macro-economic indicators to assess external risk factors.

The model returns a **Risk Score (0-100)** and a status (**APPROVED**, **REVIEW**, or **REJECTED**) with a human-readable explanation.

## Academic & Economic Benefits
- **Banks**: Reduced default rates through data-driven decisions and operational efficiency.
- **Economy**: Improved financial inclusion by providing transparent, fast credit access to SMEs and individuals.
- **Academic**: Demonstrates practical integration of ML in distributed enterprise systems.
"# smart-banking-powered-by-ai" 

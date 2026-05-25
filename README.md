# 🛡️ Sentinel AI — Anti-Theft Mobile Application

AI-Powered Anti-Theft Security Suite with React Native, Node.js, and AI Engine.

## Architecture

```
sentinel-ai/
├── packages/
│   ├── mobile/          # React Native Expo app
│   ├── backend/         # Node.js + Express + Socket.IO API
│   ├── admin/           # Next.js admin dashboard
│   └── ai-engine/       # AI behavior analysis engine
├── docker/              # Docker Compose deployment
└── package.json         # Monorepo workspace root
```

## Quick Start

### Prerequisites
- Node.js 20+
- MySQL 8.0+ or TiDB
- Expo CLI (`npm install -g expo-cli`)

### Environment Setup

```bash
# Copy environment files
cp packages/backend/.env.example packages/backend/.env
cp docker/.env.example docker/.env

# Edit .env files with your configuration
```

### Development

```bash
# Install all dependencies
npm install

# Start backend (port 4000)
npm run backend

# Start mobile app
npm run mobile

# Start admin dashboard (port 3000)
npm run admin
```

### Database

```bash
# Create database and run schema
mysql -u root -p < packages/backend/database/schema.sql

# Or run migrations
npm run db:migrate
```

### Docker Production

```bash
# Start all services
cd docker
docker-compose --env-file .env up -d

# Stop all services
docker-compose down
```

## API Documentation

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/verify-otp` | Verify email OTP |
| POST | `/api/auth/refresh` | Refresh JWT token |
| GET | `/api/auth/profile` | Get user profile |
| POST | `/api/devices/register` | Register device |
| GET | `/api/devices` | List user devices |
| PUT | `/api/devices/:id` | Update device settings |
| POST | `/api/devices/:id/command` | Send remote command |
| GET | `/api/locations/:deviceId` | Get location history |
| GET | `/api/alerts/device/:deviceId` | Get device alerts |
| PUT | `/api/alerts/:id/resolve` | Resolve alert |

### Socket.IO Events
- `location:update` — Send GPS coordinates
- `alert:trigger` — Generate security alert
- `tracking:subscribe` — Subscribe to device tracking

## Tech Stack

- **Mobile**: React Native, Expo, NativeWind, Socket.IO Client
- **Backend**: Node.js, Express, Socket.IO, Sequelize
- **Database**: MySQL / TiDB
- **Admin**: Next.js 15, Tailwind CSS, Recharts, Framer Motion
- **AI**: OpenAI GPT-4o, Behavior Analysis Engine
- **Cloud**: Firebase (Push), Cloudinary (Media)
- **Auth**: JWT, OTP Email, Biometric
- **Deploy**: Docker, Docker Compose

## License

Proprietary - All Rights Reserved

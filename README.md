# Healthcare MVP - AI-Powered Healthcare Prototype

⚠️ **CRITICAL WARNING: DO NOT USE REAL PHI - PROTOTYPE ONLY** ⚠️

This is a prototype healthcare application for demonstration purposes only. It is NOT intended for use with real patient data, protected health information (PHI), or in clinical settings. All data should be synthetic and for testing purposes only.

## Features

- **AI-Powered Triage**: Symptom assessment with safety-first recommendations
- **Televisit Scheduling**: Meeting management with AI-generated SOAP notes
- **Real-time Chat**: Secure 1:1 messaging between patients and clinicians
- **Remote Patient Monitoring**: Vitals ingestion with automated alerting
- **Governance (FR-30, FR-31)**: Clinician feedback analytics (accept/override rates) and governance dashboards (model performance, fairness, compliance, blockchain audit)
- **Care Timeline**: Encounters, vitals, notes, medications, labs, and alerts in a filterable timeline; medications & allergies and lab results panels
- **Patient Lookup**: Searchable, sortable patient table; filter by alerts or recent encounters; clinical summary slide-over (demographics, meds, allergies, labs, vitals, quick actions)
- **Dashboard Analytics**: Triage disposition chart, vitals sparkline, encounters-by-day (expandable); KPI trend indicators; expandable recent activity
- **Configurable Alert Thresholds (FR-1)**: RPM threshold configuration UI for heart rate, SpO₂, BP, temperature, glucose (clinician/admin; demo only)
- **Wallet Connection & Subscription**: Multi-wallet support with custom SVG logos (MetaMask, Phantom, Rabby, Coinbase, Trust, TronLink); crypto subscriptions with blockchain simulation; subscription management in Settings
- **Profile Avatars**: Upload, preview, and update profile pictures with automatic display in header and settings
- **Comprehensive Reporting**: Generate patient summaries, clinical encounter reports, analytics, governance reports (FR-30, FR-31), and subscription reports; CSV export; scheduled reports; audit logging
- **Role-Based Access**: Patient/Clinician/Admin roles with appropriate permissions
- **Consent Management**: Explicit consent required for transcript persistence

## Requirements

- Node.js 18 or 20
- npm
## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment:**
   ```bash
   cp .env.example .env
   # Edit .env and add your OPENAI_API_KEY
   ```

3. **Run database migrations:**
   ```bash
   npm run migrate         # Base tables
   npm run migrate:wallet  # Wallet authentication support
   npm run migrate:reports # Reporting system
   npm run seed           # Optional: seed data
   ```

4. **Start the application:**
   ```bash
   npm run dev
   ```

The application will be available at http://localhost:5173 (frontend) and http://localhost:3000 (API).

## Authentication

### Wallet-Only Authentication (Web3)

IntelliHealth uses **wallet-based authentication only** - no email or password required.

**How it works**:
1. Visit the app → **Connect Wallet** screen appears
2. Click "Choose wallet" → select your wallet provider
3. Approve connection in your wallet extension
4. Click "Continue" → you're logged in!

**Supported Wallets** (with custom SVG logos):
- **EVM chains**: MetaMask, Rabby, Coinbase Wallet, Trust Wallet
- **Solana**: Phantom
- **Tron**: TronLink

**Benefits**:
- ✓ No email or password to remember
- ✓ Your data stays private and secure
- ✓ Blockchain-verified consent management (FR-8, FR-9, FR-10)
- ✓ Decentralized authentication
- ✓ Cryptographic provenance (FR-26)

## Subscription Plans

Subscribe with crypto - no credit card required.

| Tier | Price | Features |
|------|-------|----------|
| **Free** | Free | Basic triage (5/month), view care timeline, messaging, up to 2 appointments |
| **Basic** | 0.01 ETH/mo (~$29) | Unlimited triage, priority messaging, unlimited appointments, RPM (1 device) |
| **Premium** | 0.03 ETH/mo (~$79) | All Basic + AI SOAP notes, multi-device RPM, labs & meds tracking, consent management, priority support |
| **Enterprise** | Custom | All Premium + governance dashboard, custom integrations (FHIR, HL7), dedicated support, SLA, on-premise option |

To subscribe:

1. Connect your wallet
2. Click **View Plans** tab
3. Select a plan → approve transaction
4. Subscription activated instantly

View your current subscription in **Settings → Subscription**.

## Wallet Connection

**Supported Wallets**:

| Wallet | Logo | Blockchain | Install |
|--------|------|-----------|---------|
| MetaMask | Custom SVG (Orange gradient) | EVM (Ethereum, Polygon, BSC, etc.) | [metamask.io](https://metamask.io/download/) |
| Phantom | Custom SVG (Purple gradient) | Solana | [phantom.app](https://phantom.app/download) |
| Rabby | Custom SVG (Blue gradient) | EVM (Multi-chain) | [rabby.io](https://rabby.io/) |
| Coinbase Wallet | Custom SVG (Blue gradient) | EVM | [coinbase.com/wallet](https://www.coinbase.com/wallet) |
| Trust Wallet | Custom SVG (Shield design) | EVM | [trustwallet.com](https://trustwallet.com/download) |
| TronLink | Custom SVG (Red gradient) | Tron | [tronlink.org](https://www.tronlink.org/) |

**Features**:
- **Multi-chain support**: Automatic detection of EVM chains, Solana, and Tron
- **Wallet icons**: Each provider displays its unique icon
- **Chain switching**: Detects when you switch networks in your wallet
- **Account changes**: Updates automatically when you change accounts
- **Persistent connection**: Reconnects on page reload if wallet is unlocked

**Where to connect**:
1. **Header**: Click **Connect wallet** → select your provider → approve connection
2. **Settings → Wallet**: Same connection interface with blockchain info
3. **Login screen**: Wallet login tab for authentication

Connection state is cached in `localStorage` and restored on reload. For blockchain features (consent signing, audit logs), a connected wallet is required.

## API Endpoints

### Authentication (Wallet-Based)
- `POST /api/auth/wallet/login` - Authenticate with wallet address
- `POST /api/auth/wallet/verify` - Verify wallet signature (optional)
- `POST /api/auth/wallet/subscribe` - Update subscription tier
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/me` - Update user profile (name, avatar)

### Clinical Features
- `POST /api/triage` - AI-powered symptom triage
- `POST /api/meetings` - Schedule televisits
- `POST /api/meetings/:id/transcript` - Upload meeting transcripts
- `POST /api/meetings/:id/summary` - Generate AI summaries
- `POST /api/rpm` - Ingest RPM data with alerting
- `POST /api/chat/channels` - Create chat channels
- `POST /api/ai/decision` - Log AI decision confirmations
- `GET /api/ai/stats` - Clinician feedback stats (admin)
- `GET /api/ai/decisions` - AI decision audit log (admin / own)
- `POST /api/reports/patient-summary` - Generate patient health summary
- `POST /api/reports/clinical-encounter` - Generate encounter report
- `POST /api/reports/analytics` - Generate analytics report
- `POST /api/reports/governance` - Generate governance report (admin)
- `GET /api/reports` - List all reports
- `GET /api/reports/:id/export/csv` - Export report to CSV

## Testing

```bash
npm test
```

## Compliance TODOs for Production

❌ **This prototype is NOT production-ready. Required for compliance:**

1. **HIPAA Compliance**: Business Associate Agreement (BAA) with all vendors
2. **Data Security**: Encryption at rest and in transit
3. **Audit Logging**: Comprehensive access and modification logs
4. **STT Provider**: HIPAA-compliant speech-to-text service
5. **Clinical Validation**: Medical review of all AI outputs
6. **Access Controls**: Multi-factor authentication, role permissions
7. **Data Retention**: Compliant data lifecycle management
8. **Incident Response**: Security breach procedures
9. **Backup & Recovery**: HIPAA-compliant data backup
10. **Penetration Testing**: Security vulnerability assessments

## Governance (FR-30, FR-31)

**Governance** is available in the app for **Admin** and **Clinician** roles:

- **Sidebar**: "Governance" nav item (between RPM Monitor and Settings).
- **Dashboard**: "Governance" quick action (clinician/admin).
- **Tabs**: *Clinician Feedback* (accept/override stats, decision audit table) and *Governance Dashboards* (model performance, fairness, compliance, blockchain placeholders).

Use **Admin** (`admin@example.com` / `password123`) or **Clinician** (`doc1@example.com` / `password123`) to access. The Governance UI calls `GET /api/ai/stats` and `GET /api/ai/decisions` when authenticated; it falls back to mock data otherwise.

## Requirements & Traceability

Functional requirements (FR-1–FR-31) for CDS, blockchain consent, model lifecycle, and regulatory readiness:

- **[FR Specification](docs/requirements/FR-SPECIFICATION.md)** — Canonical list of all 31 functional requirements.
- **[Requirements Traceability Matrix](docs/requirements/REQUIREMENTS-TRACEABILITY-MATRIX.md)** — Mapping of each FR to implementation status, artifacts, gaps, and recommended implementation order.

## Architecture

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: SQLite with Knex.js migrations
- **Real-time**: Socket.io
- **AI**: OpenAI-compatible client wrapper

## Development Commands

- `npm run dev` - Start development servers
- `npm run migrate` - Run database migrations
- `npm run seed` - Seed database with test data
- `npm test` - Run test suite
- `npm run lint` - Run ESLint

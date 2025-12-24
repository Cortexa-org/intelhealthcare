# Server Code Updates - Wallet Authentication

## Overview
Updated backend server to support wallet-based authentication, removing traditional email/password login.

## 🔧 Updated Files

### 1. `server/routes/auth.js` (Complete Rewrite)

**Removed**:
- ❌ `POST /login` - Email/password authentication
- ❌ `POST /register` - Email/password registration
- ❌ bcrypt password hashing

**Added**:
- ✅ `POST /auth/wallet/login` - Wallet address authentication
- ✅ `POST /auth/wallet/verify` - Signature verification (optional enhanced security)
- ✅ `POST /auth/wallet/subscribe` - Update subscription tier
- ✅ `PUT /auth/me` - Update user profile (name, avatar)
- ✅ Enhanced `GET /auth/me` - Returns wallet info and subscription

### 2. `scripts/migrate-wallet.js` (New Migration)

**Database Schema Changes**:
```sql
ALTER TABLE users ADD COLUMN wallet_address TEXT UNIQUE;
ALTER TABLE users ADD COLUMN wallet_provider TEXT;
ALTER TABLE users ADD COLUMN wallet_blockchain TEXT;
ALTER TABLE users ADD COLUMN avatar TEXT;
ALTER TABLE users ADD COLUMN last_login TIMESTAMP;

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  tier TEXT NOT NULL DEFAULT 'free',
  status TEXT NOT NULL DEFAULT 'active',
  start_date TIMESTAMP NOT NULL,
  expiry_date TIMESTAMP,
  auto_renew BOOLEAN DEFAULT FALSE,
  transaction_hash TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### 3. `package.json`

**New Script**:
```json
"migrate:wallet": "node scripts/migrate-wallet.js"
```

## 📋 API Endpoints

### Wallet Authentication

#### POST `/api/auth/wallet/login`
**Purpose**: Authenticate user with wallet address

**Request Body**:
```json
{
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "provider": "metamask",
  "blockchain": "evm",
  "signature": "0x...",  // Optional for enhanced security
  "message": "Login to IntelliHealth"  // Optional
}
```

**Response**:
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "uuid",
    "name": "User abc123",
    "role": "patient",
    "walletAddress": "0x742d35Cc...",
    "walletProvider": "metamask",
    "walletBlockchain": "evm",
    "avatar": null,
    "subscription": {
      "tier": "free",
      "status": "active",
      "startDate": "2024-01-01T00:00:00.000Z",
      "expiryDate": null,
      "autoRenew": false
    }
  }
}
```

**Behavior**:
- Creates new user if wallet address doesn't exist
- Auto-creates patient record
- Auto-creates free tier subscription
- Returns JWT token (7 day expiry)
- Updates last_login timestamp

#### POST `/api/auth/wallet/verify`
**Purpose**: Verify wallet signature ownership (optional)

**Request Body**:
```json
{
  "walletAddress": "0x742d35Cc...",
  "signature": "0x...",
  "message": "Verify ownership"
}
```

**Response**:
```json
{
  "valid": true,
  "recoveredAddress": "0x742d35Cc..."
}
```

#### POST `/api/auth/wallet/subscribe`
**Purpose**: Update user subscription tier

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "tier": "premium",
  "transactionHash": "0x..."
}
```

**Response**:
```json
{
  "subscription": {
    "tier": "premium",
    "status": "active",
    "startDate": "2024-01-01T00:00:00.000Z",
    "expiryDate": null,
    "autoRenew": false
  }
}
```

#### PUT `/api/auth/me`
**Purpose**: Update user profile

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "name": "John Doe",
  "avatar": "data:image/png;base64,..."
}
```

## 🗄️ Database Schema

### Users Table (Updated)
```
- id (UUID, PRIMARY KEY)
- email (TEXT) - Placeholder for wallet users
- password_hash (TEXT) - Empty for wallet users
- first_name (TEXT)
- last_name (TEXT)
- role (TEXT) - patient, clinician, admin
- wallet_address (TEXT, UNIQUE) ← NEW
- wallet_provider (TEXT) ← NEW
- wallet_blockchain (TEXT) ← NEW
- avatar (TEXT) ← NEW
- last_login (TIMESTAMP) ← NEW
- profile (JSON)
- active (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Subscriptions Table (New)
```
- id (UUID, PRIMARY KEY)
- user_id (UUID, FOREIGN KEY → users.id)
- tier (TEXT) - free, basic, premium, enterprise
- status (TEXT) - active, expired, cancelled
- start_date (TIMESTAMP)
- expiry_date (TIMESTAMP, NULLABLE)
- auto_renew (BOOLEAN)
- transaction_hash (TEXT) - Blockchain transaction
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

## 🔐 Security Features

1. **JWT Tokens**: 7-day expiry for wallet users
2. **Signature Verification**: Optional enhanced security via ethers.js
3. **Wallet Address Normalization**: Lowercase storage
4. **Role-Based Access**: Maintained via JWT claims
5. **Token Middleware**: Unchanged - still uses `authenticateToken`

## 🚀 Migration Steps

```bash
# 1. Run base migration (if not already done)
npm run migrate

# 2. Run wallet authentication migration
npm run migrate:wallet

# 3. Start server
npm run dev
```

## 📝 Frontend Integration

The frontend already uses `loginWithWallet()` which should call:

```javascript
const response = await fetch('/api/auth/wallet/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    walletAddress: address,
    provider: 'metamask',
    blockchain: 'evm'
  })
});

const { token, user } = await response.json();
localStorage.setItem('token', token);
```

## ✅ Testing

Test wallet login:
```bash
curl -X POST http://localhost:3000/api/auth/wallet/login \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "provider": "metamask",
    "blockchain": "evm"
  }'
```

## 🎯 Functional Requirements Coverage

- **FR-8**: Consent representation (wallet address as identity)
- **FR-9**: Consent enforcement (token-based access)
- **FR-10**: No PHI on-chain (only wallet address stored)
- **FR-24**: Permissioned access (JWT-based authentication)
- **FR-26**: Cryptographic provenance (wallet signatures)

## 📦 Dependencies

All required packages already installed:
- `jsonwebtoken` - JWT token generation
- `ethers` - Wallet signature verification
- `uuid` - User/subscription ID generation

No additional npm packages needed!

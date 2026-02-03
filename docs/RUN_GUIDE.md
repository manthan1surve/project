# 🚀 Project Deployment & Run Guide

> **University NFT Certificate System (DCIVS)**  
> Complete setup and deployment instructions

---

## 📋 Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | v18+ | Runtime |
| npm | v9+ | Package manager |
| Git | Any | Version control |

**No PostgreSQL needed** - Uses Supabase (cloud database)  
**No Ethereum wallet needed** - Uses local Hardhat blockchain

---

## ⚡ Quick Start (One Command)

```bash
# From project root directory
npm run start-all
# OR
.\run_app.bat
```

This launches **4 terminal windows**:
1. 🔗 Hardhat blockchain node
2. 📜 Contract deployment terminal
3. 🖥️ Backend server (port 3001)
4. 🌐 Frontend (port 5173)

---

## 🛠️ Manual Setup

### Step 1: Install Dependencies

```bash
# Root dependencies
npm install

# Backend
cd backend && npm install && cd ..

# Frontend
cd Frontend/nft-viewer && npm install && cd ../..

# Blockchain
cd my-hardhat-project && npm install && cd ..
```

### Step 2: Configure Environment

Copy the example env file:
```bash
copy backend\.env.example backend\.env
```

Required variables in `backend/.env`:
```env
# Pinata (IPFS) - Get from pinata.cloud
PINATA_API_KEY=your_key
PINATA_API_SECRET=your_secret

# Supabase - Get from supabase.com
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_anon_key

# JWT Secret (any random string)
JWT_SECRET=your_random_secret_string

# Hardhat (local blockchain) - DO NOT CHANGE
ADMIN_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
NFT_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
RPC_URL=http://127.0.0.1:8545

# Email (Optional - for notifications)
GMAIL_USER=your@gmail.com
GMAIL_APP_PASSWORD=your_app_password
```

### Step 3: Start Services

**Terminal 1 - Blockchain:**
```bash
cd my-hardhat-project
npx hardhat node
```

**Terminal 2 - Deploy Contract:**
```bash
cd my-hardhat-project
npx hardhat run scripts/deploy-nft.js --network localhost
```

**Terminal 3 - Backend:**
```bash
cd backend
npm start
```

**Terminal 4 - Frontend:**
```bash
cd Frontend/nft-viewer
npm run dev
```

---

## 🌐 Access Points

| Service | URL | Credentials |
|---------|-----|-------------|
| Frontend | http://localhost:5173 | Register new account |
| Backend API | http://localhost:3001 | - |
| Blockchain | http://localhost:8545 | - |
| Admin Login | http://localhost:5173/admin-login | `backup_admin@test.com` / `admin_backup_123` |

---

## 📱 Application Flow

### Student Flow
1. **Register** → `/register` - Create student account
2. **Create Wallet** → `/wallet` - Generate encrypted wallet
3. **View Certificates** → `/student-dashboard` - See issued NFTs

### Admin Flow
1. **Login** → `/admin-login` - Admin authentication
2. **Dashboard** → `/admin-dashboard` - Overview tab
3. **Issue Certificate** → Click "Issue Certificate" tab
4. **Batch Operations** → Click "Batch Operations" tab (CSV upload)

### Verification Flow
1. **Public Verify** → `/verify/:tokenId` - Anyone can verify
2. **QR Code** → Scan QR from certificate

---

## 🧪 Testing

```bash
cd backend

# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test
npm test -- email.test.js
```

---

## 📁 Project Structure

```
Project/
├── backend/           # Express.js API
│   ├── controllers/   # Business logic
│   ├── routes/        # API endpoints
│   ├── services/      # Email, blockchain
│   ├── tests/         # Jest tests
│   └── server.js      # Entry point
├── Frontend/
│   └── nft-viewer/    # Vue.js app
├── my-hardhat-project/# Blockchain
│   ├── contracts/     # Solidity
│   └── scripts/       # Deploy scripts
├── docs/              # Documentation
└── run_app.bat        # Quick start
```

---

## ❗ Troubleshooting

### "EADDRINUSE: address already in use"
```bash
# Kill process on port 3001
netstat -ano | findstr :3001
taskkill /PID <pid> /F
```

### "Blockchain not connected"
1. Check Hardhat node is running on port 8545
2. Verify `RPC_URL` in `.env` is `http://127.0.0.1:8545`

### "Contract not deployed"
```bash
cd my-hardhat-project
npx hardhat run scripts/deploy-nft.js --network localhost
```
Copy the output address to `NFT_CONTRACT_ADDRESS` in `.env`

### "Stale certificates after restart"
When Hardhat restarts, blockchain resets. Certificates minted before restart won't exist. This is expected for development.

---

## 🔒 Admin Credentials

**Backup Admin** (always works):
- Email: `backup_admin@test.com`
- Password: `admin_backup_123`

**Database Admin** (requires Supabase setup):
- Create in `admins` table with bcrypt-hashed password

---

## 💰 Cost Breakdown

| Service | Cost |
|---------|------|
| Hardhat (blockchain) | **FREE** - Local |
| Supabase (database) | **FREE** - 500MB tier |
| Pinata (IPFS) | **FREE** - 1GB tier |
| Gmail SMTP | **FREE** - 500/day |
| **Total** | **$0** |

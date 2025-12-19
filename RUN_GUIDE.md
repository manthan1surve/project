# Project Execution Guide

This document explains how to set up and run the different components of the project.

## 📋 Prerequisites
- **Node.js**: v18 or higher recommended.
- **PostgreSQL**: Ensure the database is running and configured in `backend/.env`.

---

## 1. 📂 Backend Server
The main backend handles authentication, database connections, and IPFS uploads.

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies (if not already done):
   ```bash
   npm install
   ```
3. Run the server:
   ```bash
   node server.js
   ```
   - **Port**: `3001`
   - **Endpoint**: `http://localhost:3001`

---

## 2. 🎨 Frontend Application
The Vue.js application provides the user interface for the NFT viewer and wallet dashboard.

1. Navigate to the frontend directory:
   ```bash
   cd Frontend/nft-viewer
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   - **URL**: Check the terminal output (usually `http://localhost:5173`)

---

## 3. ⛓️ Blockchain (Hardhat)
This section contains the smart contracts and local blockchain environment.

### Run Local Node
1. Navigate to the hardhat directory:
   ```bash
   cd my-hardhat-project
   ```
2. Start the local Hardhat node:
   ```bash
   npx hardhat node
   ```
   - **RPC URL**: `http://127.0.0.1:8545`

### Deploy Contracts
1. In a new terminal (while the node is running):
   ```bash
   cd my-hardhat-project
   npx hardhat run scripts/deploy-nft.js --network localhost
   ```
   - *Note: Ensure the deployed contract address is updated in `Frontend/nft-viewer/src/config.js`.*

### Secondary/Legacy Server (Optional)
This is a utility server for standalone IPFS testing.
1. In the `my-hardhat-project` directory:
   ```bash
   node server.js
   ```
   - **Port**: `3002` (Updated to avoid conflict)

---

## 🚀 Quick Start (One Command)
You can run the frontend development server directly from the root using npm workspaces:
```bash
npm run dev
```

## 🛠️ Debugging
- If you see `EADDRINUSE: address already in use :::3001`, check if another instance of the backend is running.
---

## 🌐 Navigation Guide (Pages)
The frontend application runs on `http://localhost:5173`.

| Page | URL Path | Description |
| :--- | :--- | :--- |
| **Registration** | `/register` | Default landing page. Register as a new student. |
| **Wallet Dashboard** | `/wallet` | Manage your encrypted wallet (Create/Unlock). |
| **Student Dashboard** | `/student-dashboard` | View your personal academic profile. |
| **Public Gallery Search** | `/login` | Search for NFTs belonging to any wallet address. |
| **NFT Gallery** | `/gallery` | The visual results page for NFT searches. |
| **Admin Login** | `/admin-login` | Authorized access for university administrators. |
| **Admin Dashboard** | `/admin-dashboard` | Manage students and issue certificates. |
| **3D Viewer** | `/babylon` | Experimental 3D visualization of NFT assets. |

---

## 🧪 How to Test Functionalities

### 1. Student Registration & Login
1. Go to `/register`.
2. Fill in the full name, email, password (min 6 chars), and student details.
3. Submit the form. On success, you will be redirected to the **Wallet Dashboard**.
4. *Verification*: Check the `students` table in your PostgreSQL database to see the new entry.

### 2. Wallet Creation & Encryption
1. After registration, stay on `/wallet`.
2. Enter a **Wallet Password** (this is different from your login password).
3. Click **Create My Wallet**.
4. *Verification*: The backend generates a random private key, encrypts it with your password, and saves the **Public Address** and **Encrypted JSON** to the database.

### 3. Unlocking and Viewing Assets
1. Once a wallet exists, go to `/wallet`. You will see it is "Locked".
2. Enter the wallet password you set earlier and click **Unlock**.
3. *Verification*: The frontend decrypts the wallet locally using `ethers.js`. If valid, it will fetch and display "My Certificates".

### 4. Admin Management & Certificate Issuance
1. Go to `/admin-login`.
2. Use the credentials:
   - **Email**: `admin@example.com`
   - **Password**: `admin123`
3. Navigate to **Issue Certificate** section inside the Admin Dashboard.
4. **The Flow**:
   - Select a student from the dropdown (these are real students fetched from your DB).
   - Enter a **Title** for the certificate (e.g., "B.Sc Graduation").
   - Choose a **File** (image/PDF) to be the certificate.
   - Click **Mint & Transfer NFT**.
5. **Backend Action**:
   - The server uploads the file to **Pinata (IPFS)**.
   - It creates a metadata JSON and pins it as well.
   - It **automatically signs** the transaction using the `ADMIN_PRIVATE_KEY` (No MetaMask popup needed!).
   - The NFT is minted directly to the student's Ethereum address stored in the DB.

### 5. Automated Asset Tracking
1. After the Admin Successful Minting message appears, log in as the **Student**.
2. Go to the **Wallet Dashboard** and **Unlock** the wallet.
3. Your new certificate will automatically appear under "My Certificates".
4. *Verification*: The asset is loaded from the backend `nfts` table (for speed) and verified against the blockchain.

### 6. Public NFT Verification
1. Go to `/login` (Public Search).
2. Paste the student's wallet address.
3. Click **View Gallery**.
4. *Verification*: The app displays all NFTs minted to that address directly from the blockchain node.

## 🗄️ Database Schema (Reference)
The system uses a normalized PostgreSQL schema. If debugging query issues, refer to this structure:

### 1. `students` (User Accounts)
- `id`: Primary Key
- `full_name`: Student Name
- `email`: Login Email
- `ethereum_address`: The custodial wallet address

### 2. `wallets` (Keystore Storage)
- `user_id`: Link to `students.id`
- `encrypted_json`: The scrypt-encrypted private key string
- `public_address`: Redundant lookup field

### 3. `certificates` (The "Linker" Table)
- `id`: Primary Key
- `recipient_id`: Link to `students.id` (This connects an asset to a user)

### 4. `nfts` (Blockchain Registry)
- `token_id`: On-chain ID (BigInt)
- `ipfs_cid`: The hash of the metadata/image (Source of Truth for "Token URI")
- `transaction_hash`: Blockchain proof
- `certificate_id`: Link to `certificates.id` (NOT student_id directly)




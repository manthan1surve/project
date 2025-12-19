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

### 4. Admin Management
1. Go to `/admin-login`.
2. Use the default credentials:
   - **Email**: `admin@example.com`
   - **Password**: `admin123`
3. Click **Admin Dashboard** to view the management interface.

### 5. Public NFT Verification
1. Go to `/login` (Public Search).
2. Paste a valid wallet address (you can copy yours from the Wallet Dashboard).
3. Click **View Gallery**.
4. *Verification*: The app displays all NFTs minted to that specific address on the blockchain.


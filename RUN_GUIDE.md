# Project Execution Guide

This document explains how to set up and run the different components of the project.

## 📋 Prerequisites
- **Node.js**: v18 or higher recommended.
- **PostgreSQL**: Ensure the database is running and configured in `backend/.env`.

---

## 🕹️ Command Center (IDE Workflow)

This project has been optimized for **VS Code** (or any IDE with terminal tabs). You can run the entire stack using simple `npm run` commands from the **root directory**.

### 1. Setup (First Run Only)
Installs dependencies for all 4 project components (Root, Backend, Frontend, Hardhat).
```bash
npm run setup
```

### 2. Launch the System
Open **4 Terminal Tabs** in your IDE and run one command in each:

| Terminal Tab | Command | Description | Port |
| :--- | :--- | :--- | :--- |
| **1. Blockchain** | `npm run chain` | Starts the local Hardhat Node. | `8545` |
| **2. Operations** | `npm run ops-deploy` | Deploys contracts to the local node. | - |
| **3. Backend** | `npm run backend` | Starts the API Server. | `3001` |
| **4. Frontend** | `npm run frontend` | Starts the Vue Client. | `5173` |

> **Note:** Always start the **Chain** before deploying contracts or running the backend.

---

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




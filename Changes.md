# Project Audit & Migration Log

This file tracks the changes made during the audit and migration process to a custodial wallet system.

## Phase 1: Audit of Custodial Wallet System

### Prompt 1: System Visibility & Consolidation
- **Action**: Performed a system-wide scan of Blockchain, Backend, and Frontend.
- **Why**: To verify visibility and identify critical conflicts (Port 3001 collision, broken imports).
- **Result**: Successfully consolidated servers and fixed frontend routing.

### Prompt 2: Frontend Build Repair
- **Action**: Fixed CSS import errors, Tailwind warnings, and missing component imports.
- **Why**: To ensure the frontend application actually builds and runs.

### Prompt 3: Network & CORS Fix
- **Action**: Configured Backend CORS for `localhost:5173` and updated hardcoded `localhost:3000` references to `3001`.
- **Why**: To allow the frontend to communicate with the backend.

### Prompt 4: Audit & Migration (Current)
- **Action**: Auditing `walletService.js`, `authController.js`, and `WalletDashboard.vue`.
- **Goal**: Verify if the encryption-at-rest system is complete and ready for the migration of minting logic.
- **Result**: Audit passed. Modularized the codebase to support scalable feature migration.

### Prompt 5: Blockchain Service & Minting Flow
- **Action**: Created `services/blockchainService.js` and `controllers/nftController.js` in the backend.
- **Why**: To centralize blockchain interaction and eliminate dependency on `window.ethereum` for minting. All transactions are now signed by the Backend Admin account.
- **Result**: Successfully migrated the NFT issuance logic.

### Prompt 6: Database Integration
- **Action**: Created the `nfts` table in PostgreSQL.
- **Why**: To maintain a fast-fetching registry of issued certificates without scanning the entire blockchain for every request.

### Prompt 7: Frontend Dashboards Refresh
- **Action**: Updated `AdminDashboard.vue` (via `CertificateIssuance.vue`) and `StudentDashboard.vue` (via `assets` API).
- **Why**: To connect the user interface to the new real-time blockchain-backend system.

### Prompt 8 & 9: Database Logic Repair (Critical Fix)
- **Action**: Implemented SQL JOIN logic (`nfts` -> `certificates` -> `students`) in `server.js`.
- **Why**: Fixed "student_id column not found" crash. The system now respects the normalized database schema where NFTs belong to Certificates, which belong to Students.
- **Action**: Updated `nftController.js` to perform a multi-step insert (Create Certificate -> Create NFT).

### Prompt 10: NFT Issuance Flow Repair
- **Problem**: Crash due to missing `title` column and incorrect data structure in request.
- **Action**: Added `title`, `description`, `department` to `certificates` table.
- **Action**: Rewrote `nftController.js` to correctly extract fields and insert into `certificates` first.
- **Action**: Rewrote `CertificateIssuance.vue` to use `FormData` for correct file/field transmission.

### Prompt 11: Live Data & Navigation
- **Frontend Action**: Wired `StudentDashboard.vue` and `AdminDashboard.vue` to real backend APIs.
- **Frontend Action**: Rewrote `LoginPage.vue` (Email/Pass Login) and `RegistrationPage.vue` redirects.
- **Backend Action**: Added `/api/auth/me` and `/api/certificates` endpoints.

### Prompt 12: Emergency Fixes
- **Backend**: Moved `/api/auth/me` to correct location in `server.js` to fix 404.
- **Frontend**: Force-rewrote `LoginPage.vue` and `StudentDashboard.vue` to fix HTML syntax errors (missing end tags).

### Prompt 13: Admin Access
- **Backend**: Hardcoded Admin credentials in `authController.js` to bypass DB check (Temporary Fix).
- **Backend**: Restarted server to apply auth changes.
- **System**: Restarted Frontend and Backend services to ensure clean state.











# Project Structure & Explanation

## 📂 Project Root
- **`Changes.md`**: A running log of all major changes, bug fixes, and feature implementations.
- **`README.md`**: The main entry point for the project, describing the purpose, tech stack, and quick start instructions.
- **`RUN_GUIDE.md`**: A step-by-step technical guide to running all components of the system (Blockchain, Backend, Frontend).
- **`explanation.md`**: This file. A map of the codebase.

---

## 📂 my-hardhat-project (Blockchain Layer)
This folder contains the Smart Contract logic and the Hardhat development environment.
- **`contracts/`**: Soidity source files.
    - **`NFT.sol`**: The ERC-721 Smart Contract defining our "Academic Certificate" NFT.
    - **`Lock.sol`**: A default sample contract (unused).
- **`scripts/`**: Scripts to deploy and interact with the blockchain.
    - **`deploy-nft.js`**: The script used to deploy `NFT.sol` to the local Hardhat network.
- **`test/`**: Unit tests for the smart contracts.
- **`hardhat.config.js`**: Configuration for the Hardhat network, including Solidity version and network settings.

---

## 📂 backend (API Layer)
This folder contains the Node.js/Express server that acts as the bridge between the Frontend, the Database, and the Blockchain.
- **`server.js`**: The entry point. Sets up the Express app, connects dependencies, and defines API routes (`/api/auth`, `/api/wallet`, `/api/certificates`).
- **`db.js`**: Connection pool logic for the PostgreSQL database.
- **`walletService.js`**: Handles the creation and encryption of custodial wallets for students.
- **`seed-admin.js`**: A utility script to seed the initial Admin user into the database.
- **`middleware/`**:
    - **`authMiddleware.js`**: Verifies JWT tokens to protect private routes.
- **`controllers/`**: Business logic for the API routes.
    - **`authController.js`**: Handles user registration and login (Student & Admin).
    - **`nftController.js`**: Manages the complex flow of issuing a certificate: uploading to IPFS, minting on-chain, and saving to DB.
- **`routes/`**: Route definitions.
    - **`nftRoutes.js`**: Defines the endpoints for NFT operations.
- **`services/`**: External integrations.
    - **`blockchainService.js`**: Uses `ethers.js` to talk to the local blockchain (minting tokens).
- **`utils/`**: Helper functions.
    - **`pinataHelpers.js`**: Handles uploading images and metadata to Pinata (IPFS).

---

## 📂 Frontend/nft-viewer (UI Layer)
This folder contains the Vue.js + Vite application for the user interface.
- **`src/`**: Source code.
    - **`App.vue`**: The root component.
    - **`main.js`**: The JavaScript entry point, mounting the Vue app.
    - **`router.js`**: Defines the navigation URLs (e.g., `/login`, `/student-dashboard`, `/wallet`).
    - **`assets/`**: Static assets like CSS and images.
    - **`components/`**: Reusable UI blocks.
        - **`LoginPage.vue`**: The student login form.
        - **`StudentDashboard.vue`**: The main hub for students to view their profile.
        - **`WalletDashboard.vue`**: The custodial wallet interface where students view their NFTs.
        - **`AdminDashboard.vue`**: The main hub for admins to view lists and issue certificates.
        - **`admincomponents/`**: Components specific to the Admin view.
            - **`CertificateIssuance.vue`**: The form for creating and minting a new certificate.
    - **`views/`**: Full page views.
        - **`AdminLogin.vue`**: The admin login page.
        - **`RegistrationPage.vue`**: The student registration page.
        - **`PublicGallerySearch.vue`**: A public page to verify certificates.

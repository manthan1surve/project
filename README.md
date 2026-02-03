# University NFT Management System 🎓

A comprehensive full-stack dApp that allows universities to issue tamper-proof academic certificates as NFTs. It features a custodial wallet system for students to securely receive and manage their credentials without needing prior blockchain knowledge.

## ✨ Key Features

-   **Frontend (Vue.js + Vite):** A modern, responsive dashboard for Students and Admins.
-   **Backend (Node.js + Express):** Handles authentication, IPFS pinning/uploads, and secure wallet management.
-   **Blockchain (Hardhat + Solidity):** An ERC-721 Smart Contract for minting and verifying certificates.
-   **Custodial Wallets:** Automatically generates encrypted Ethereum wallets for students upon registration.
-   **Admin Dashboard:** Interfaces for issuing certificates directly to students' wallets.

---

## 🚀 Getting Started

Follow these steps to set up the environment.

### Prerequisites

-   **Node.js**: v18 or higher.
-   **PostgreSQL**: A running instance with database `university_db`.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/harshwar/Project.git
    cd Project
    ```


2.  **One-Click Setup:**
    The project includes a unified setup script to install dependencies for the Backend, Frontend, OCR, and Hardhat environments automatically.
    ```bash
    npm run setup
    ```


3.  **Environment Setup:**
    Create a `.env` file in the `backend/` directory (see `RUN_GUIDE.md` for details).

---

## 🏃‍♂️ Running the System

Please refer to **[RUN_GUIDE.md](./RUN_GUIDE.md)** for detailed step-by-step instructions on starting the components:

1.  **Backend API**
2.  **Frontend Application**
3.  **Local Blockchain Node**

For a deep dive into the code structure, check **[explanation.md](./explanation.md)**.



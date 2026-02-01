# SWOT Analysis: University NFT Management System

> **Project**: Decentralized Certificate Issuance & Verification System  
> **Date**: January 31, 2026

---

## 📊 Executive Summary

This dApp enables universities to issue tamper-proof academic credentials as ERC-721 NFTs. Students receive certificates in **custodial wallets** (no MetaMask required), making blockchain accessible to non-crypto-native users.

---

## ✅ Strengths

| Area | Details |
|------|---------|
| **Custodial Wallet System** | Students don't need MetaMask. Wallets are auto-created during registration with encrypted keystores stored server-side. |
| **Modern Tech Stack** | Vue 3 + Vite (fast dev), Express 5 (latest), Supabase (managed DB), Hardhat (Ethereum dev). |
| **Full Automation** | Admin minting is fully automated via backend signing - no browser wallet popups. |
| **IPFS Integration** | Uses Pinata for reliable decentralized storage with multi-gateway fallback proxy. |
| **Strong Documentation** | Existing `RUN_GUIDE.md`, `explanation.md`, `Changes.md` provide good onboarding. |
| **Modular Architecture** | Clear separation: controllers, services, utils, routes pattern in backend. |
| **OCR Prototype** | Innovative batch certificate processing using Tesseract.js with fuzzy matching. |
| **3D Visualization** | BabylonJS integration for experimental 3D NFT viewing. |

---

## ⚠️ Weaknesses

| Area | Details | Severity |
|------|---------|----------|
| **Hardcoded Credentials** | Backup admin (`backup_admin@test.com`) with plain password in `authController.js` | 🔴 High |
| **No Rate Limiting** | API endpoints lack request throttling - vulnerable to brute force/DDoS | 🔴 High |
| **Local Blockchain Only** | Hardhat config only supports localhost:8545 - no testnet/mainnet deployment | 🟡 Medium |
| **No Input Sanitization** | Limited validation before database writes | 🟡 Medium |
| **No Unit Tests** | Backend has no test suite (`"test": "echo \"Error: no test specified\""`) | 🟡 Medium |
| **Contract Address Hardcoded** | `config.js` has static contract address - must manually update after deploy | 🟡 Medium |
| **Legacy pg Package** | `pg` package installed but Supabase client is used - dead dependency | 🟢 Low |
| **Large ABI in Frontend** | Full 570-line ABI embedded in `config.js` - could be optimized | 🟢 Low |

---

## 🚀 Opportunities

| Opportunity | Potential Impact |
|-------------|------------------|
| **Testnet Deployment** | Deploy to Sepolia/Mumbai for real-world testing without costs |
| **QR Code Verification** | Add QR codes to certificates linking to public verification page |
| **Mobile App** | Vue-based PWA or React Native app for credential wallet |
| **Multi-University Federation** | Allow multiple institutions to issue under shared contract |
| **Credential Standards** | Implement W3C Verifiable Credentials format alongside NFT |
| **OCR Integration** | Connect OCR prototype to main system for bulk import workflows |
| **Analytics Dashboard** | Admin statistics: certificates issued, blockchain gas costs, etc. |
| **Email Notifications** | Nodemailer integration to notify students of new certificates |

---

## 🛑 Threats

| Threat | Risk Mitigation |
|--------|-----------------|
| **Private Key Exposure** | `ADMIN_PRIVATE_KEY` in `.env` could be compromised if server is breached. Consider HSM or cloud KMS. |
| **IPFS Gateway Downtime** | Certificates may fail to display if all 4 gateways are down. Add local caching. |
| **Supabase Vendor Lock-in** | Heavy reliance on Supabase client. Abstract DB layer for portability. |
| **Gas Cost Volatility** | Eth mainnet deployment would be expensive. Consider L2 (Polygon, Arbitrum). |
| **Regulatory Compliance** | Storing encrypted private keys may have GDPR implications. |
| **Smart Contract Bugs** | No formal audit of `AdminNFT.sol`. Recommend OpenZeppelin Defender review. |

---

## 📈 SWOT Matrix

```
                    HELPFUL                         HARMFUL
           ┌────────────────────────┬────────────────────────┐
           │                        │                        │
 INTERNAL  │  ✅ STRENGTHS          │  ⚠️ WEAKNESSES         │
           │  • Custodial wallets   │  • Hardcoded creds     │
           │  • Modern stack        │  • No rate limiting    │
           │  • Full automation     │  • No tests            │
           │  • Good docs           │  • Local-only chain    │
           │                        │                        │
           ├────────────────────────┼────────────────────────┤
           │                        │                        │
 EXTERNAL  │  🚀 OPPORTUNITIES      │  🛑 THREATS            │
           │  • Testnet deploy      │  • Key exposure        │
           │  • QR verification     │  • IPFS downtime       │
           │  • Mobile app          │  • Gas volatility      │
           │  • Multi-institution   │  • No contract audit   │
           │                        │                        │
           └────────────────────────┴────────────────────────┘
```

---

## 🎯 Priority Recommendations

1. **Security First**: Remove hardcoded admin credentials, add rate limiting
2. **Testing**: Implement Jest test suite for API endpoints
3. **Deployment**: Add Sepolia testnet config to `hardhat.config.js`
4. **Automation**: Create script to auto-update `config.js` contract address on deploy
5. **UX**: Integrate OCR prototype into admin dashboard for bulk certificate import

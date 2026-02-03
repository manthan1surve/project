# 🚀 Zero-Cost Deployment Guide

> **University NFT Certificate System**  
> **Strategy:** Local Hosting + Internet Tunneling
> **Cost:** $0.00 forever

Since you require **Hardhat Only** (no real blockchain) and **Zero Cost**, the best deployment strategy is to run everything on your own machine and "tunnel" it to the internet if you need to share it.

---

## 📍 Why Local Hosting?

| Hosting Type | Hardhat Support | Cost | Verdict |
|--------------|-----------------|------|---------|
| **Cloud (Vercel/Render)** | ❌ Hardhat node resets on every deploy/sleep | Free | **Not Viable** (Data loss) |
| **VPS (AWS/DigitalOcean)** | ✅ Persistent Node | ~$5-10/mo | **Not Free** |
| **Testnet (Sepolia)** | ✅ Persistent | Free | **Violated "Hardhat Only" rule** |
| **Local + Tunnel** | ✅ Persistent & Controlled | **Free** | **✅ BEST OPTION** |

---

## 🔧 Option 1: Local Network Deployment (Best for Demo)

This runs the app on your machine. Anyone on your **Same WiFi** can access it.

### Step 1: Find your Local IP
- Open Terminal -> Type `ipconfig` (Windows)
- Look for `IPv4 Address`. Example: `192.168.1.15`

### Step 2: Update Configuration
Update `backend/.env`:
```env
# Change from localhost to 0.0.0.0 to listen on all interfaces
FRONTEND_URL=http://192.168.1.15:5173
```

Update `Frontend/nft-viewer/vite.config.js` (if strictly needed, though `npm run dev -- --host` works too):
```javascript
export default defineConfig({
  server: {
    host: '0.0.0.0', // Listen on all IPs
    port: 5173
  },
  // ... rest of config
})
```

### Step 3: Run the App
```bash
.\run_app.bat
```

### Step 4: Access from other devices
- **Phone/Laptop on same WiFi**: Open browser to `http://192.168.1.15:5173`
- **You**: Can still use `http://localhost:5173`

---

## 🌍 Option 2: Internet Deployment (Ngrok Tunnel)

This gives you a public URL (like `https://myapp.ngrok-free.app`) that anyone in the world can visit, while the app actually runs on your laptop.

### Step 1: Install Ngrok
1. Go to [ngrok.com](https://ngrok.com) and sign up (Free).
2. Download and install Ngrok.
3. **Authenticate:**
   ```bash
   ngrok config add-authtoken <YOUR_TOKEN_FROM_DASHBOARD>
   ```

### Step 2: Start Your App
Run the standard launcher:
```bash
.\run_app.bat
```

### Step 3: Start Tunnels for All Services
You need to open **3 separate terminals** (keep the `run_app.bat` terminals open).

**Terminal A (Frontend Tunnel):**
```bash
ngrok http 5173
# Copy the URL -> e.g., https://front-xyz.ngrok-free.app
```

**Terminal B (Backend Tunnel):**
```bash
ngrok http 3001
# Copy the URL -> e.g., https://api-xyz.ngrok-free.app
```

**Terminal C (Blockchain Tunnel):**
```bash
ngrok http 8545
# Copy the URL -> e.g., https://chain-xyz.ngrok-free.app
```

### Step 4: Update Configuration (Critical)
Now you must tell your running app to use these new public URLs.

**1. Update Backend:**
Edit `backend/.env`:
```env
FRONTEND_URL=https://front-xyz.ngrok-free.app
```
*Restart the backend server (Ctrl+C, then `npm start`).*

**2. Update Frontend API:**
Edit `Frontend/nft-viewer/src/config.js` (or wherever your API base URL is, likely `config.js` or `.env`):
```javascript
// src/config.js
export const API_BASE_URL = "https://api-xyz.ngrok-free.app/api";
```

**3. Update Frontend Blockchain:**
Edit `backend/services/blockchainService.js` AND Frontend contract logic:
```javascript
// Change RPC URL
const RPC_URL = "https://chain-xyz.ngrok-free.app";
```

### Step 5: Share
Send the **Frontend URL** (`https://front-xyz.ngrok-free.app`) to your users.

---

## 📝 Summary Checklist

| Action | Command |
|--------|---------|
| **Start System** | `.\run_app.bat` |
| **Verify Backend** | Visit `http://localhost:3001` |
| **Verify Frontend** | Visit `http://localhost:5173` |
| **Reset Chain** | Restart `run_app.bat` (wipes all data) |

### Recommended "Deployment"
Just use **Option 1 (Localhost)**. It is the most stable, zero-config way to demonstrate a "Hardhat Only" project.

1. **Keep it simple**: Run on your machine.
2. **Present**: Share your screen or record a video.
3. **Github**: Push code to GitHub so others can download and run `run_app.bat` themselves.

This fits "Zero Cost" and "hardly any setup" perfectly.

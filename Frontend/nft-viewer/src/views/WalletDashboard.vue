<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { isDark, toggleTheme } from '../services/theme';
import ThemeToggle from '../components/ThemeToggle.vue';
import { Wallet } from 'ethers'; // Ethers.js for local wallet management
import AudioService from '../services/audio';

const router = useRouter();

// --- Configuration ---
const API_BASE_URL = 'http://localhost:3001'; // Backend API URL

// --- State Variables ---
const status = ref('loading'); // Current State: 'loading' | 'no-wallet' | 'locked' | 'unlocked' | 'unauthorized'
const isBusy = ref(false); // UI blocker for async operations (loading spinners)
const error = ref(''); // Stores error messages

// Form Inputs
const password = ref('');
const walletAddress = ref('');
const encryptedJson = ref(''); // The encrypted keystore string fetched from DB

// Data Display
const assets = ref([]); // Stores the list of NFTs owned by the user

// --- Auth Utilities ---
const token = computed(() => localStorage.getItem('token') || ''); // Get JWT from local storage

// Computes headers for authenticated requests
const apiHeaders = computed(() => {
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token.value) {
    headers['Authorization'] = `Bearer ${token.value}`;
  }
  return headers;
});

// --- Lifecycle Actions ---

/**
 * onMounted:
 * Automatically runs when the component loads.
 * Attempts to fetch the user's wallet from the backend.
 */
onMounted(() => {
  loadWallet();
});

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  router.push('/login');
}

// --- Wallet Management Functions ---

/**
 * 1. Load User's Wallet
 * Checks if the user already has a wallet stored in the DB.
 */
async function loadWallet() {
  if (!token.value) {
    status.value = 'unauthorized';
    return;
  }

  status.value = 'loading';
  error.value = '';
  // Reset fields
  password.value = '';
  walletAddress.value = '';
  encryptedJson.value = '';
  assets.value = [];

  try {
    const res = await fetch(`${API_BASE_URL}/api/wallet/me`, {
      method: 'GET',
      headers: apiHeaders.value,
    });

    // 401 = Not Logged In
    if (res.status === 401 || res.status === 403) {
      status.value = 'unauthorized';
      return;
    }

    // 404 = No Wallet Created Yet
    if (res.status === 404) {
      status.value = 'no-wallet';
      return;
    }

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Failed to load wallet.');
    }

    // Success: We retrieved the Encrypted JSON
    const data = await res.json();
    encryptedJson.value = data.encrypted_json;
    walletAddress.value = data.public_address;
    status.value = 'locked'; // Default to locked state for security
  } catch (err) {
    console.error('Error loading wallet:', err);
    error.value = err.message;
    status.value = 'no-wallet'; // Fallback
  }
}

/**
 * 2. Create New Wallet
 * Generates a key pair server-side (or client-side logic handled by backend service in this architecture)
 * and saves it.
 */
async function createWallet() {
  if (!password.value) {
    error.value = 'Please enter a password.';
    return;
  }

  if (!token.value) {
    error.value = 'You must be logged in.';
    return;
  }

  isBusy.value = true;
  error.value = '';

  try {
    const res = await fetch(`${API_BASE_URL}/api/wallet/create`, {
      method: 'POST',
      headers: apiHeaders.value,
      body: JSON.stringify({ password: password.value }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Failed to create wallet.');
    }

    // Reload the wallet to switch state to 'locked'
    await loadWallet();
  } catch (err) {
    console.error('Error creating wallet:', err);
    error.value = err.message;
  } finally {
    isBusy.value = false;
  }
}

/**
 * 3. Unlock Wallet
 * Uses Ethers.js to decrypt the JSON with the user's password.
 * This happens entirely in the browser (Client-Side Decryption).
 */
async function unlockWallet() {
  if (!password.value) {
    error.value = 'Please enter your wallet password.';
    return;
  }

  if (!encryptedJson.value) {
    error.value = 'No encrypted wallet found.';
    return;
  }

  isBusy.value = true;
  error.value = '';

  try {
    // heavy computation: Decrypts the wallet
    const wallet = await Wallet.fromEncryptedJson(encryptedJson.value, password.value);

    walletAddress.value = wallet.address;
    status.value = 'unlocked'; // State change to show assets

    // Now fetch the NFTs
    await loadAssets();
  } catch (err) {
    console.error('Error unlocking wallet:', err);
    error.value = 'Incorrect password or corrupted wallet.';
  } finally {
    isBusy.value = false;
  }
}

/**
 * 4. Load Assets (NFTs)
 * Fetches the list of NFTs from the backend, then fetches their Metadata from IPFS.
 */
async function loadAssets() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/wallet/assets`, {
      method: 'GET',
      headers: apiHeaders.value,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Failed to load assets.');
    }

    const rawAssets = data.assets || [];
    
    // --- Metadata Resolution Strategy ---
    // The DB gives us the 'ipfsCid' (metadata file).
    // We need to fetch that file to get the real 'image' URL.
    assets.value = await Promise.all(rawAssets.map(async (asset) => {
       let resolvedImage = null;
       
       // Check if we have a CID to resolve
       if (asset.ipfsCid) { 
          try {
             // A. Construct Gateway URL for Metadata
             const metadataUrl = getIpfsUrl(asset.ipfsCid);
             
             // B. Fetch the JSON file
             const metaRes = await fetch(metadataUrl);
             const metaJson = await metaRes.json();
             
             // C. Extract the 'image' field from JSON
             if (metaJson.image) {
                resolvedImage = getIpfsUrl(metaJson.image);
             }
          } catch (e) {
             console.error("Failed to resolve metadata for token " + asset.tokenId, e);
          }
       }
       
       // Return asset with the 'imageUrl' property correctly populated
       return {
          ...asset,
          imageUrl: resolvedImage || getIpfsUrl(asset.imageUrl || asset.ipfsCid),
          isMetadataResolved: !!resolvedImage 
       };
    }));

  } catch (err) {
    console.error('Error loading assets:', err);
    error.value = err.message;
  }
}

// --- Helpers ---

function copyAddress() {
  if (!walletAddress.value) return;
  navigator.clipboard.writeText(walletAddress.value).catch(() => {});
}

// Format address (0x1234...5678)
const shortAddress = computed(() => {
  if (!walletAddress.value) return '';
  const addr = walletAddress.value;
  return addr.length > 10 ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : addr;
});

// --- Modal Logic ---
const selectedAsset = ref(null);

function openModal(asset) {
  AudioService.playClick();
  selectedAsset.value = asset;
}

function closeModal() {
  selectedAsset.value = null;
}

// --- Wallet Backup & Recovery (Idea 4) ---
const showBackup = ref(false);
const revealMnemonic = ref(false);
const backupPhrase = ref('');
const recoveryMode = ref(false);
const recoveryPhrase = ref('');

async function startBackup() {
  if (!password.value) {
    alert("Please enter your password in the unlock field first (or we would typically prompt again here).");
    return;
  }
  isBusy.value = true;
  try {
    const wallet = await Wallet.fromEncryptedJson(encryptedJson.value, password.value);
    // In ethers v6, mnemonic is an object or null
    backupPhrase.value = wallet.mnemonic?.phrase || "No mnemonic found for this wallet (Legacy).";
    showBackup.value = true;
  } catch (err) {
    alert("Error revealing phrase: " + err.message);
  } finally {
    isBusy.value = false;
  }
}

async function handleRecovery() {
  if (!recoveryPhrase.value || !password.value) {
    error.value = "Recovery phrase and a new password are required.";
    return;
  }
  
  isBusy.value = true;
  error.value = '';
  try {
    // 1. Recreate wallet from phrase
    const wallet = Wallet.fromPhrase(recoveryPhrase.value.trim());
    
    // 2. Encrypt with new password
    const newEncryptedJson = await wallet.encrypt(password.value);
    
    // 3. Save to backend (upsert) using our new import endpoint
    const res = await fetch(`${API_BASE_URL}/api/wallet/import`, {
      method: 'POST',
      headers: apiHeaders.value,
      body: JSON.stringify({ 
        address: wallet.address,
        encryptedJson: newEncryptedJson
      }),
    });
    
    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to import wallet.");
    }

    alert("Wallet recovered successfully! Please log in with your new password.");
    recoveryMode.value = false;
    recoveryPhrase.value = '';
    await loadWallet();

  } catch (err) {
    error.value = "Recovery failed: " + err.message;
  } finally {
    isBusy.value = false;
  }
}

function openVerification(hash) {
  if (!hash) return;
  // Opens the Etherscan transaction page
  window.open(`https://sepolia.etherscan.io/tx/${hash}`, '_blank');
}

// --- QR Code Modal ---
const qrModal = reactive({
  show: false,
  loading: false,
  qrCode: null,
  tokenId: null
});

async function showQRCode(asset) {
  qrModal.show = true;
  qrModal.loading = true;
  qrModal.tokenId = asset.tokenId;
  
  try {
    const res = await fetch(`${API_BASE_URL}/api/verify/qr/${asset.tokenId}`);
    if (res.ok) {
      const data = await res.json();
      qrModal.qrCode = data.qrCode;
    } else {
      throw new Error('Failed to generate QR');
    }
  } catch (err) {
    console.error('QR error:', err);
    alert('Failed to generate QR code');
    qrModal.show = false;
  } finally {
    qrModal.loading = false;
  }
}

async function copyVerificationLink(tokenId) {
  const link = `${window.location.origin}/verify/${tokenId}`;
  try {
    await navigator.clipboard.writeText(link);
    alert('Inspection link copied!');
  } catch {
    prompt('Copy this link:', link);
  }
}

// --- IPFS Helper ---
/**
 * Converts an 'ipfs://' URI to a HTTP Gateway URL.
 * Using Backend Proxy to bypass CORS.
 */
function getIpfsUrl(cid) {
  if (!cid) return '';
  // If it's already a http link, return it
  if (cid.startsWith('http')) return cid;
  
  // Strip 'ipfs://' protocol if present
  const clean = cid.replace('ipfs://', '');
  return `${API_BASE_URL}/api/ipfs/${clean}`;
}
</script>

<template>
  <div class="h-full flex flex-col">
      <!-- Top Bar -->
      <header class="flex items-center justify-between px-8 py-5 border-b border-transparent glass-header transition-colors duration-300">
        <h2 class="text-xl font-bold text-gray-800 dark:text-white transition-colors">Wallet Dashboard</h2>
        <div class="flex items-center gap-4">
          <ThemeToggle />
          <div class="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-md"></div>
        </div>
      </header>

      <div class="p-8 mx-auto w-full flex-1">
          <div
            v-if="error"
            class="mb-4 rounded-lg border border-red-200 dark:border-red-500 bg-red-50 dark:bg-red-900/30 px-4 py-2 text-red-600 dark:text-red-300 text-sm max-w-2xl mx-auto transition-colors"
          >
            {{ error }}
          </div>

          <div v-if="status === 'unauthorized'" class="text-center text-gray-500 dark:text-gray-300 transition-colors">
            Please log in to access your wallet.
          </div>

          <div v-else-if="status === 'no-wallet' && !recoveryMode" class="max-w-2xl mx-auto glass-panel rounded-2xl p-8 shadow-xl transition-all duration-300">
            <h2 class="text-gray-900 dark:text-white tracking-tight text-3xl font-bold text-center mb-4 transition-colors">
              Secure Your Digital Identity
            </h2>
            <p class="text-gray-500 dark:text-gray-400 text-center mb-6 transition-colors">
              Create an encrypted blockchain wallet to safely store your achievement records. Your
              private key never leaves your device.
            </p>

            <label class="flex flex-col w-full mb-4">
              <span class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 transition-colors">Wallet Password</span>
              <input
                v-model="password"
                type="password"
                placeholder="Enter a strong password"
                class="flex w-full rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500 border border-gray-300 dark:border-[#3b4754] bg-gray-50 dark:bg-transparent h-12 placeholder:text-gray-400 dark:placeholder:text-gray-500 px-4 text-base font-normal transition-all"
              />
            </label>

            <button
              @click="createWallet"
              :disabled="isBusy"
              class="flex w-full cursor-pointer items-center justify-center rounded-xl h-12 px-6 bg-sky-600 hover:bg-sky-700 text-white text-base font-bold transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-sky-500/30"
            >
              <span v-if="!isBusy">Create My Wallet</span>
              <span v-else>Creating...</span>
            </button>
          </div>

          <div v-else-if="status === 'locked' && !recoveryMode" class="max-w-md mx-auto glass-panel rounded-2xl p-8 mt-10 shadow-xl transition-all duration-300">
            <h2 class="text-gray-900 dark:text-white tracking-tight text-3xl font-bold text-center mb-4 transition-colors">
              Welcome Back
            </h2>
            <p class="text-gray-500 dark:text-gray-400 text-center mb-6 transition-colors">
              Enter your wallet password to unlock your achievements.
            </p>

            <div class="mb-4 text-center text-sm text-gray-500 dark:text-gray-400 transition-colors">
              Linked Address:
              <span class="font-mono text-gray-700 dark:text-gray-200">{{ shortAddress }}</span>
            </div>

            <label class="flex flex-col w-full mb-4">
              <span class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 transition-colors">Wallet Password</span>
              <input
                v-model="password"
                type="password"
                placeholder="Enter your password"
                class="flex w-full rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500 border border-gray-300 dark:border-[#3b4754] bg-gray-50 dark:bg-transparent h-12 placeholder:text-gray-400 dark:placeholder:text-gray-500 px-4 text-base font-normal transition-all"
              />
            </label>

            <button
              @click="unlockWallet"
              :disabled="isBusy"
              class="flex w-full cursor-pointer items-center justify-center rounded-xl h-12 px-6 bg-sky-600 hover:bg-sky-700 text-white text-base font-bold transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-sky-500/30 mb-4"
            >
              <span v-if="!isBusy">Unlock</span>
              <span v-else>Unlocking...</span>
            </button>

            <div class="text-center">
              <button @click="recoveryMode = true" class="text-sky-600 hover:underline text-sm font-medium">Lost password? Recover with Seed Phrase</button>
            </div>
          </div>

          <!-- RECOVERY MODE UI -->
          <div v-else-if="recoveryMode" class="max-w-md mx-auto glass-panel rounded-2xl p-8 mt-10 shadow-xl transition-all duration-300 animate-fadeIn">
            <h2 class="text-gray-900 dark:text-white tracking-tight text-3xl font-bold text-center mb-4 transition-colors">
              Recover Wallet
            </h2>
            <p class="text-gray-500 dark:text-gray-400 text-center mb-6 transition-colors">
              Enter your 12-word recovery phrase and a new password to restore your digital identity.
            </p>

            <label class="flex flex-col w-full mb-4">
              <span class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 transition-colors">Recovery Phrase (12 Words)</span>
              <textarea
                v-model="recoveryPhrase"
                placeholder="word1 word2 ... word12"
                class="flex w-full rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500 border border-gray-300 dark:border-[#3b4754] bg-gray-50 dark:bg-transparent h-24 placeholder:text-gray-400 dark:placeholder:text-gray-500 px-4 py-2 text-base font-normal transition-all"
              ></textarea>
            </label>

            <label class="flex flex-col w-full mb-4">
              <span class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 transition-colors">New Wallet Password</span>
              <input
                v-model="password"
                type="password"
                placeholder="Enter new password"
                class="flex w-full rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500 border border-gray-300 dark:border-[#3b4754] bg-gray-50 dark:bg-transparent h-12 placeholder:text-gray-400 dark:placeholder:text-gray-500 px-4 text-base font-normal transition-all"
              />
            </label>

            <button
              @click="handleRecovery"
              :disabled="isBusy"
              class="flex w-full cursor-pointer items-center justify-center rounded-xl h-12 px-6 bg-sky-600 hover:bg-sky-700 text-white text-base font-bold transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-sky-500/30 mb-4"
            >
              <span v-if="!isBusy">Restore Wallet</span>
              <span v-else>Restoring...</span>
            </button>

            <div class="text-center">
              <button @click="recoveryMode = false" class="text-gray-500 hover:underline text-sm font-medium">Back to Login</button>
            </div>
          </div>

          <div v-else-if="status === 'unlocked'" class="max-w-7xl mx-auto">
            <div class="flex items-center justify-between mb-6 glass-panel p-4 rounded-xl shadow-sm dark:shadow-none transition-all duration-300">
              <div>
                <h2 class="text-gray-900 dark:text-white text-xl font-bold transition-colors">My Wallet</h2>
                <p class="text-gray-500 dark:text-gray-400 text-sm transition-colors">
                  Manage your achievement records.
                </p>
              </div>
              <div class="flex items-center gap-2">
                <span
                  class="font-mono text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-transparent border border-gray-200 dark:border-[#3b4754] rounded-lg px-3 py-1 transition-colors"
                >
                  {{ shortAddress }}
                </span>
                <button
                  @click="copyAddress"
                  class="p-2 rounded-lg bg-gray-100 dark:bg-[#283039] hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-200 transition-colors"
                  title="Copy address"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1.5"
                      d="M9 5H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2M9 5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v6M9 5h6a2 2 0 0 1 2 2v6"
                    />
                  </svg>
                </button>
                <button
                  @click="startBackup"
                  class="px-3 py-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-bold border border-amber-200 dark:border-amber-700/50 hover:bg-amber-200 transition-colors flex items-center gap-2"
                >
                  <span>🛡️</span> Backup
                </button>
              </div>
            </div>

            <div>
              <h3 class="text-gray-900 dark:text-white text-lg font-semibold mb-3 transition-colors">My Achievements</h3>

              <div v-if="assets.length === 0" class="text-gray-500 dark:text-gray-400 text-sm transition-colors">
                No achievements found yet. Once your institution anchors records to this wallet, they
                will appear here.
              </div>

            <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div
                  v-for="asset in assets"
                  :key="asset.tokenId"
                  @click="openModal(asset)"
                  class="glass-card rounded-xl overflow-hidden shadow-lg cursor-pointer transition-all duration-300 group"
                >
                  <div class="relative">
                    <img
                      v-if="asset.imageUrl"
                      :src="asset.imageUrl"
                      :alt="asset.title"
                      class="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div class="absolute inset-0 bg-black/5 dark:bg-black/20 group-hover:bg-black/0 transition-colors"></div>
                  </div>
                  
                  <div class="p-4">
                    <h4 class="text-gray-900 dark:text-white font-bold mb-1 truncate text-lg transition-colors">
                      {{ asset.title }}
                    </h4>
                    <p class="text-gray-500 dark:text-gray-400 text-xs mb-2 transition-colors">
                      Issued: {{ asset.issueDate ? new Date(asset.issueDate).toLocaleDateString() : 'N/A' }}
                    </p>
                    <div class="flex items-center gap-2 mt-3">
                         <span class="text-[10px] bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-700/50 px-2 py-0.5 rounded uppercase font-bold tracking-wider transition-colors">
                            Verified
                         </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
      </div>



    <!-- MODAL OVERLAY -->
    <div v-if="selectedAsset" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm" @click.self="closeModal">
      <div class="bg-white dark:bg-[#1b2127] border border-gray-200 dark:border-[#3b4754] w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl relative animate-fadeIn transition-colors duration-300">
        
        <!-- Close Button -->
        <button @click="closeModal" class="absolute top-4 right-4 text-white hover:text-red-400 z-10 p-2 bg-black/20 hover:bg-black/40 rounded-full backdrop-blur-md transition-colors">
           <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
           </svg>
        </button>

        <!-- Certificate Image -->
        <div class="w-full h-64 bg-gray-100 dark:bg-black flex items-center justify-center relative">
           <img 
              :src="selectedAsset.imageUrl" 
              class="w-full h-full object-contain"
           />
        </div>

        <!-- Content -->
        <div class="p-6">
           <div class="mb-4">
              <p class="text-sky-600 dark:text-sky-400 text-xs font-bold uppercase tracking-wider mb-1 transition-colors">{{ selectedAsset.department || 'University Achievement' }}</p>
              <h2 class="text-gray-900 dark:text-white text-2xl font-bold leading-tight transition-colors">{{ selectedAsset.title }}</h2>
              <p class="text-gray-500 dark:text-gray-400 text-sm mt-1 transition-colors">Issued to You on {{ selectedAsset.issueDate ? new Date(selectedAsset.issueDate).toLocaleDateString() : 'Unknown Date' }}</p>
           </div>
           
           <div class="bg-gray-50 dark:bg-[#111418] rounded-xl p-4 mb-6 border border-gray-200 dark:border-[#283039] transition-colors">
              <h4 class="text-gray-700 dark:text-gray-300 text-sm font-semibold mb-2 transition-colors">Description</h4>
              <p class="text-gray-600 dark:text-gray-400 text-sm leading-relaxed transition-colors">
                 {{ selectedAsset.description || 'No description provided for this certificate.' }}
              </p>
           </div>

           <!-- Action Buttons -->
           <div class="space-y-3">
             <!-- Share QR Button -->
             <button 
               @click="showQRCode(selectedAsset)"
               class="w-full bg-purple-600 hover:bg-purple-700 dark:hover:bg-purple-500 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-purple-500/30"
             >
               <span>📱</span>
               Share QR Code
             </button>

             <!-- Inspect on Blockchain Button -->
             <button 
               @click="openVerification(selectedAsset.transactionHash)"
               class="w-full bg-white dark:bg-white text-slate-900 font-bold py-3 rounded-xl border border-gray-200 dark:border-transparent hover:bg-gray-50 dark:hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
             >
               <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
               </svg>
               Inspect on Blockchain
             </button>
           </div>
        </div>

      </div>
    </div>

    <!-- QR Code Modal -->
    <div v-if="qrModal.show" class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 dark:bg-black/90 backdrop-blur-sm" @click.self="qrModal.show = false">
      <div class="bg-white dark:bg-[#1b2127] w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl border border-gray-200 dark:border-[#3b4754] p-6 transition-colors duration-300">
        <h3 class="text-gray-900 dark:text-white text-lg font-bold mb-4 text-center transition-colors">Share Access</h3>
        
        <div v-if="qrModal.loading" class="text-center py-8">
          <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-500 mx-auto"></div>
          <p class="text-gray-500 dark:text-gray-400 mt-3 text-sm transition-colors">Generating QR...</p>
        </div>
        
        <div v-else>
          <!-- Tap QR to open link -->
          <a 
            :href="`/verify/${qrModal.tokenId}`" 
            target="_blank"
            class="block cursor-pointer"
          >
            <img v-if="qrModal.qrCode" :src="qrModal.qrCode" alt="QR Code" class="mx-auto rounded-lg mb-2 border border-gray-200 dark:border-gray-700 hover:border-sky-500 transition-colors" />
          </a>
          <p class="text-gray-500 text-xs text-center mb-4">
            Tap QR to open inspection page
          </p>
          <div class="space-y-2">
            <!-- Open Link Button (for mobile) -->
            <a 
              :href="`/verify/${qrModal.tokenId}`"
              target="_blank"
              class="w-full px-4 py-3 bg-green-600 hover:bg-green-700 dark:hover:bg-green-500 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 shadow-md"
            >
              🔗 Open Inspection Page
            </a>
            <button 
              @click="copyVerificationLink(qrModal.tokenId)"
              class="w-full px-4 py-3 bg-sky-600 hover:bg-sky-700 dark:hover:bg-sky-500 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 shadow-md"
            >
              📋 Copy Link
            </button>
            <button 
              @click="qrModal.show = false"
              class="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-white rounded-xl text-sm transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
    <!-- WALLET BACKUP MODAL -->
    <div v-if="showBackup" class="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" @click.self="showBackup = false">
      <div class="bg-white dark:bg-[#1b2127] w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border border-amber-200 dark:border-amber-900/30 p-8 transition-colors">
        <h3 class="text-amber-600 dark:text-amber-400 text-xl font-bold mb-2 flex items-center gap-2">
          <span>🛡️</span> Secret Recovery Phrase
        </h3>
        <p class="text-gray-500 dark:text-gray-400 text-sm mb-6 uppercase tracking-widest font-bold">
          Store this securely. Never share it.
        </p>

        <div v-if="!revealMnemonic" class="bg-gray-100 dark:bg-black rounded-xl p-8 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-800">
           <p class="text-gray-400 text-xs text-center mb-4 italic">Pressing this will reveal your 12-word recovery phrase. Ensure no one is watching.</p>
           <button @click="revealMnemonic = true" class="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition-transform hover:scale-105">
             Reveal Phrase
           </button>
        </div>

        <div v-else class="animate-fadeIn">
           <div class="grid grid-cols-3 gap-2 mb-6">
              <div v-for="(word, i) in backupPhrase.split(' ')" :key="i" class="bg-gray-50 dark:bg-[#111418] p-2 rounded-lg border border-gray-200 dark:border-[#283039] text-center">
                 <span class="text-[10px] text-gray-400 block">{{ i + 1 }}</span>
                 <span class="font-mono text-sm text-gray-900 dark:text-white font-bold">{{ word }}</span>
              </div>
           </div>
           
           <div class="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-900/30 mb-6">
              <p class="text-red-600 dark:text-red-400 text-xs leading-relaxed">
                <strong>WARNING:</strong> Anyone with these words can steal your entire wallet. Write them down on paper and hide them. Do not save them on your computer or phone.
              </p>
           </div>
        </div>

        <button 
          @click="showBackup = false; revealMnemonic = false" 
          class="w-full py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-xl transition-colors mt-2"
        >
          Finished & Secured
        </button>
      </div>
    </div>
  </div>
</template>



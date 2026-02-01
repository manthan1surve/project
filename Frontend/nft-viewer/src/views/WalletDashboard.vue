<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { Wallet } from 'ethers'; // Ethers.js for local wallet management

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
  selectedAsset.value = asset;
}

function closeModal() {
  selectedAsset.value = null;
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
    alert('Verification link copied!');
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
  <div
    class="relative flex size-full min-h-screen flex-col w-full bg-transparent"
    style='font-family: "Spline Sans", "Noto Sans", sans-serif; width: 100vw;'
  >
    <div class="layout-container flex h-full grow flex-col w-full">
      <header
        class="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#283039] px-10 py-3"
      >
        <div class="flex items-center gap-4 text-white">
          <div class="size-4">
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M39.475 21.6262C40.358 21.4363 40.6863 21.5589 40.7581 21.5934C40.7876 21.655 40.8547 21.857 40.8082 22.3336C40.7408 23.0255 40.4502 24.0046 39.8572 25.2301C38.6799 27.6631 36.5085 30.6631 33.5858 33.5858C30.6631 36.5085 27.6632 38.6799 25.2301 39.8572C24.0046 40.4502 23.0255 40.7407 22.3336 40.8082C21.8571 40.8547 21.6551 40.7875 21.5934 40.7581C21.5589 40.6863 21.4363 40.358 21.6262 39.475C21.8562 38.4054 22.4689 36.9657 23.5038 35.2817C24.7575 33.2417 26.5497 30.9744 28.7621 28.762C30.9744 26.5497 33.2417 24.7574 35.2817 23.5037C36.9657 22.4689 38.4054 21.8562 39.475 21.6262ZM4.41189 29.2403L18.7597 43.5881C19.8813 44.7097 21.4027 44.9179 22.7217 44.7893C24.0585 44.659 25.5148 44.1631 26.9723 43.4579C29.9052 42.0387 33.2618 39.5667 36.4142 36.4142C39.5667 33.2618 42.0387 29.9052 43.4579 26.9723C44.1631 25.5148 44.659 24.0585 44.7893 22.7217C44.9179 21.4027 44.7097 19.8813 43.5881 18.7597L29.2403 4.41187C27.8527 3.02428 25.8765 3.02573 24.2861 3.36776C22.6081 3.72863 20.7334 4.58419 18.8396 5.74801C16.4978 7.18716 13.9881 9.18353 11.5858 11.5858C9.18354 13.988 7.18717 16.4978 5.74802 18.8396C4.58421 20.7334 3.72865 22.6081 3.36778 24.2861C3.02574 25.8765 3.02429 27.8527 4.41189 29.2403Z"
                fill="currentColor"
              ></path>
            </svg>
          </div>
          <h2 class="text-white text-lg font-bold leading-tight tracking-[-0.015em]">
            Wallet Dashboard
          </h2>
        </div>
      </header>

      <div class="px-4 sm:px-6 lg:px-8 flex flex-1 justify-center items-center py-5">
        <div
          class="layout-content-container flex flex-col w-full max-w-2xl bg-[#1b2127] border border-[#3b4754] rounded-2xl shadow-2xl p-8"
        >
          <div
            v-if="error"
            class="mb-4 rounded-lg border border-red-500 bg-red-900/30 px-4 py-2 text-red-300 text-sm"
          >
            {{ error }}
          </div>

          <div v-if="status === 'unauthorized'" class="text-center text-gray-300">
            Please log in to access your wallet. You can log in from the main login page.
          </div>

          <div v-else-if="status === 'no-wallet'">
            <h2 class="text-white tracking-tight text-3xl font-bold text-center mb-4">
              Secure Your Digital Identity
            </h2>
            <p class="text-gray-400 text-center mb-6">
              Create an encrypted blockchain wallet to safely store your certificate NFTs. Your
              private key never leaves your device.
            </p>

            <label class="flex flex-col w-full mb-4">
              <span class="text-sm font-medium text-gray-400 mb-2">Wallet Password</span>
              <input
                v-model="password"
                type="password"
                placeholder="Enter a strong password"
                class="flex w-full rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-sky-500 border border-[#3b4754] bg-transparent h-12 placeholder:text-gray-500 px-4 text-base font-normal"
              />
            </label>

            <button
              @click="createWallet"
              :disabled="isBusy"
              class="flex w-full cursor-pointer items-center justify-center rounded-xl h-12 px-6 bg-sky-600 hover:bg-sky-700 text-white text-base font-bold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span v-if="!isBusy">Create My Wallet</span>
              <span v-else>Creating...</span>
            </button>
          </div>

          <div v-else-if="status === 'locked'">
            <h2 class="text-white tracking-tight text-3xl font-bold text-center mb-4">
              Welcome Back
            </h2>
            <p class="text-gray-400 text-center mb-6">
              Enter your wallet password to unlock your certificates.
            </p>

            <div class="mb-4 text-center text-sm text-gray-400">
              Linked Address:
              <span class="font-mono text-gray-200">{{ shortAddress }}</span>
            </div>

            <label class="flex flex-col w-full mb-4">
              <span class="text-sm font-medium text-gray-400 mb-2">Wallet Password</span>
              <input
                v-model="password"
                type="password"
                placeholder="Enter your password"
                class="flex w-full rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-sky-500 border border-[#3b4754] bg-transparent h-12 placeholder:text-gray-500 px-4 text-base font-normal"
              />
            </label>

            <button
              @click="unlockWallet"
              :disabled="isBusy"
              class="flex w-full cursor-pointer items-center justify-center rounded-xl h-12 px-6 bg-sky-600 hover:bg-sky-700 text-white text-base font-bold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span v-if="!isBusy">Unlock</span>
              <span v-else>Unlocking...</span>
            </button>
          </div>

          <div v-else-if="status === 'unlocked'">
            <div class="flex items-center justify-between mb-6">
              <div>
                <h2 class="text-white text-2xl font-bold">My Wallet</h2>
                <p class="text-gray-400 text-sm">
                  Manage your certificate NFTs issued by the institution.
                </p>
              </div>
              <div class="flex items-center gap-2">
                <span
                  class="font-mono text-sm text-gray-300 bg-transparent border border-[#3b4754] rounded-lg px-3 py-1"
                >
                  {{ shortAddress }}
                </span>
                <button
                  @click="copyAddress"
                  class="p-2 rounded-lg bg-[#283039] hover:bg-gray-700 text-gray-200 transition-colors"
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
              </div>
            </div>

            <div>
              <h3 class="text-white text-lg font-semibold mb-3">My Certificates</h3>

              <div v-if="assets.length === 0" class="text-gray-400 text-sm">
                No certificates found yet. Once your institution issues NFTs to this wallet, they
                will appear here.
              </div>

            <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  v-for="asset in assets"
                  :key="asset.tokenId"
                  @click="openModal(asset)"
                  class="bg-transparent border border-[#283039] rounded-xl overflow-hidden shadow-lg cursor-pointer hover:border-sky-500 transition-colors group"
                >
                  <div class="relative">
                    <img
                      v-if="asset.imageUrl"
                      :src="asset.imageUrl"
                      :alt="asset.title"
                      class="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div class="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors"></div>
                  </div>
                  
                  <div class="p-4">
                    <h4 class="text-white font-bold mb-1 truncate text-lg">
                      {{ asset.title }}
                    </h4>
                    <p class="text-gray-400 text-xs mb-2">
                      Issued: {{ asset.issueDate ? new Date(asset.issueDate).toLocaleDateString() : 'N/A' }}
                    </p>
                    <div class="flex items-center gap-2 mt-3">
                         <span class="text-[10px] bg-sky-900/40 text-sky-300 border border-sky-700/50 px-2 py-0.5 rounded uppercase font-bold tracking-wider">
                            Verified
                         </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="text-center text-gray-400">
            Loading wallet...
          </div>
        </div>
      </div>

    <!-- MODAL OVERLAY -->
    <div v-if="selectedAsset" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" @click.self="closeModal">
      <div class="bg-transparent border border-[#3b4754] w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl relative animate-fadeIn">
        
        <!-- Close Button -->
        <button @click="closeModal" class="absolute top-4 right-4 text-white hover:text-red-400 z-10 p-2 bg-transparent rounded-full">
           <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
           </svg>
        </button>

        <!-- Certificate Image -->
        <div class="w-full h-64 bg-black flex items-center justify-center relative">
           <img 
              :src="selectedAsset.imageUrl" 
              class="w-full h-full object-contain"
           />
        </div>

        <!-- Content -->
        <div class="p-6">
           <div class="mb-4">
              <p class="text-sky-400 text-xs font-bold uppercase tracking-wider mb-1">{{ selectedAsset.department || 'University Certificate' }}</p>
              <h2 class="text-white text-2xl font-bold leading-tight">{{ selectedAsset.title }}</h2>
              <p class="text-gray-400 text-sm mt-1">Issued to You on {{ selectedAsset.issueDate ? new Date(selectedAsset.issueDate).toLocaleDateString() : 'Unknown Date' }}</p>
           </div>
           
           <div class="bg-[#111418] rounded-xl p-4 mb-6 border border-[#283039]">
              <h4 class="text-gray-300 text-sm font-semibold mb-2">Description</h4>
              <p class="text-gray-400 text-sm leading-relaxed">
                 {{ selectedAsset.description || 'No description provided for this certificate.' }}
              </p>
           </div>

           <!-- Action Buttons -->
           <div class="space-y-3">
             <!-- Share QR Button -->
             <button 
               @click="showQRCode(selectedAsset)"
               class="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
             >
               <span>📱</span>
               Share QR Code
             </button>

             <!-- Verify on Blockchain Button -->
             <button 
               @click="openVerification(selectedAsset.transactionHash)"
               class="w-full bg-white text-slate-900 font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
             >
               <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
               </svg>
               Verify on Blockchain
             </button>
           </div>
        </div>

      </div>
    </div>

    <!-- QR Code Modal -->
    <div v-if="qrModal.show" class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90" @click.self="qrModal.show = false">
      <div class="bg-[#1b2127] w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl border border-[#3b4754] p-6">
        <h3 class="text-white text-lg font-bold mb-4 text-center">Share Certificate</h3>
        
        <div v-if="qrModal.loading" class="text-center py-8">
          <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-500 mx-auto"></div>
          <p class="text-gray-400 mt-3 text-sm">Generating QR...</p>
        </div>
        
        <div v-else>
          <!-- Tap QR to open link -->
          <a 
            :href="`/verify/${qrModal.tokenId}`" 
            target="_blank"
            class="block cursor-pointer"
          >
            <img v-if="qrModal.qrCode" :src="qrModal.qrCode" alt="QR Code" class="mx-auto rounded-lg mb-2 border border-gray-700 hover:border-sky-500 transition-colors" />
          </a>
          <p class="text-gray-500 text-xs text-center mb-4">
            Tap QR to open verification page
          </p>
          <div class="space-y-2">
            <!-- Open Link Button (for mobile) -->
            <a 
              :href="`/verify/${qrModal.tokenId}`"
              target="_blank"
              class="w-full px-4 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
            >
              🔗 Open Verification Page
            </a>
            <button 
              @click="copyVerificationLink(qrModal.tokenId)"
              class="w-full px-4 py-3 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
            >
              📋 Copy Link
            </button>
            <button 
              @click="qrModal.show = false"
              class="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-xl text-sm transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>

    </div>
  </div>
</template>

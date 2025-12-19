<template>
  <div class="app-container">
    <BabylonScene :imageUrl="nftImageUrl" />

    <div class="ui-overlay">
      <div v-if="loading" class="text-white text-center">Loading NFTs...</div>
      <div v-else-if="error" class="text-red-500 text-center">{{ error }}</div>
      <div v-else>
        <h1 class="text-white">NFT Certificates for {{ userAddress }}</h1>
        <div class="nft-grid">
          <div v-for="nft in nfts" :key="nft.tokenId" class="nft-card" @click="selectNftForScene(nft)">
            <img :src="nft.imageUrl" :alt="nft.name" class="nft-image" />
            <p class="nft-title">{{ nft.name }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ethers } from 'ethers';
import { useRoute } from 'vue-router';
import BabylonScene from './BabylonScene.vue'; // Updated path is relative in same folder
import { contractAddress, contractABI, rpcUrl } from '../config';

// --- Constants ---
const IPFS_GATEWAY = "https://ipfs.io/ipfs/";

// --- Component State ---
const route = useRoute();
const userAddress = ref('');
const nfts = ref([]);
const nftImageUrl = ref(''); // The URL for the 3D scene
const loading = ref(true);
const error = ref('');

// --- Functions ---

// NEW function to update the 3D scene when an NFT is clicked
function selectNftForScene(nft) {
  nftImageUrl.value = nft.imageUrl;
}

// Main function to handle the entire process
const fetchNfts = async () => {
  const address = route.query.address;
  if (!address) {
    error.value = "No wallet address provided.";
    loading.value = false;
    return;
  }
  userAddress.value = address;

  try {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const contract = new ethers.Contract(contractAddress, contractABI, provider);

    const certificateTokenIds = await getCertificateTokenIds(contract, address);

    if (certificateTokenIds.length > 0) {
      const fetchedNfts = await Promise.all(
        certificateTokenIds.map(tokenId => displayCertificate(contract, tokenId))
      );
      nfts.value = fetchedNfts;

      // Display the first NFT in the scene by default
      if (fetchedNfts.length > 0) {
        nftImageUrl.value = fetchedNfts[0].imageUrl;
      }
    } else {
      error.value = "This address does not own any certificates.";
    }
  } catch (err) {
    console.error("Error fetching certificates:", err);
    error.value = "Could not fetch certificates. See console for details.";
  } finally {
    loading.value = false;
  }
};

// Function to find all certificate IDs for an address
async function getCertificateTokenIds(contract, address) {
  const filter = contract.filters.Transfer(null, address);
  const events = await contract.queryFilter(filter);
  return events.map(event => event.args.tokenId);
}

// Function to fetch and display the NFT image
async function displayCertificate(contract, tokenId) {
  const tokenURI = await contract.tokenURI(tokenId);
  const metadataURL = tokenURI.replace("ipfs://", IPFS_GATEWAY);

  const response = await fetch(metadataURL);
  if (!response.ok) {
    throw new Error("Could not fetch metadata from IPFS.");
  }

  const metadata = await response.json();
  const imageUrl = metadata.image.replace("ipfs://", IPFS_GATEWAY);

  return {
    tokenId: tokenId.toString(),
    name: metadata.name,
    imageUrl: imageUrl
  };
}

// --- Lifecycle Hook ---
onMounted(() => {
  fetchNfts();
});
</script>

<style scoped>
/* Scoped styles from your original file */
.app-container {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}
.ui-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  padding: 2rem;
  overflow-y: auto;
  z-index: 10;
}
.nft-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 2rem;
}
.nft-card {
  background-color: rgba(40, 48, 57, 0.8);
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
  cursor: pointer;
  transition: transform 0.2s ease-in-out;
}
.nft-card:hover {
  transform: scale(1.05);
}
.nft-image {
  width: 100%;
  height: auto;
  border-radius: 4px;
}
.nft-title {
  color: white;
  margin-top: 0.5rem;
  font-weight: bold;
}
</style>

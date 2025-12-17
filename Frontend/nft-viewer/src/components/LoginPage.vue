  <script setup>
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { isAddress } from 'ethers'; // The ethers library you're already using

  const router = useRouter();
  const userAddress = ref('');
  const error = ref('');

  function goToGallery() {
    if (!userAddress.value.trim()) {
      error.value = 'Please enter a wallet address.';
      return;
    }

    // Use the ethers utility to validate the address format
    if (!isAddress(userAddress.value)) {
      error.value = 'Invalid wallet address format. Please check and try again.';
      return;
    }

    error.value = '';
    router.push({ name: 'Gallery', query: { address: userAddress.value } });
  }
  </script>

  <template>
  <div class="relative flex size-full min-h-screen flex-col w-full bg-[#111418] ... " style='font-family: "Spline Sans", "Noto Sans", sans-serif; width: 100vw;'>
      <div class="layout-container flex h-full grow flex-col w-full">

        <header class="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#283039] px-10 py-3">
          <div class="flex items-center gap-4 text-white">
            <div class="size-4">
              <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M39.475 21.6262C40.358 21.4363 40.6863 21.5589 40.7581 21.5934C40.7876 21.655 40.8547 21.857 40.8082 22.3336C40.7408 23.0255 40.4502 24.0046 39.8572 25.2301C38.6799 27.6631 36.5085 30.6631 33.5858 33.5858C30.6631 36.5085 27.6632 38.6799 25.2301 39.8572C24.0046 40.4502 23.0255 40.7407 22.3336 40.8082C21.8571 40.8547 21.6551 40.7875 21.5934 40.7581C21.5589 40.6863 21.4363 40.358 21.6262 39.475C21.8562 38.4054 22.4689 36.9657 23.5038 35.2817C24.7575 33.2417 26.5497 30.9744 28.7621 28.762C30.9744 26.5497 33.2417 24.7574 35.2817 23.5037C36.9657 22.4689 38.4054 21.8562 39.475 21.6262ZM4.41189 29.2403L18.7597 43.5881C19.8813 44.7097 21.4027 44.9179 22.7217 44.7893C24.0585 44.659 25.5148 44.1631 26.9723 43.4579C29.9052 42.0387 33.2618 39.5667 36.4142 36.4142C39.5667 33.2618 42.0387 29.9052 43.4579 26.9723C44.1631 25.5148 44.659 24.0585 44.7893 22.7217C44.9179 21.4027 44.7097 19.8813 43.5881 18.7597L29.2403 4.41187C27.8527 3.02428 25.8765 3.02573 24.2861 3.36776C22.6081 3.72863 20.7334 4.58419 18.8396 5.74801C16.4978 7.18716 13.9881 9.18353 11.5858 11.5858C9.18354 13.988 7.18717 16.4978 5.74802 18.8396C4.58421 20.7334 3.72865 22.6081 3.36778 24.2861C3.02574 25.8765 3.02429 27.8527 4.41189 29.2403Z" fill="currentColor"></path></svg>
            </div>
            <h2 class="text-white text-lg font-bold leading-tight tracking-[-0.015em]">Art Gallery</h2>
          </div>
          <div class="flex flex-1 justify-end gap-8">
            <div class="flex items-center gap-9">
              <a class="text-white text-sm font-medium leading-normal transition-colors hover:text-sky-400" href="#">Explore</a>
              <a class="text-white text-sm font-medium leading-normal transition-colors hover:text-sky-400" href="#">Create</a>
              <a class="text-white text-sm font-medium leading-normal transition-colors hover:text-sky-400" href="#">My NFTs</a>
            </div>
            <button class="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 bg-[#283039] text-white gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-2.5 transition-colors hover:bg-gray-700">
              <div class="text-white" data-icon="Bell" data-size="20px" data-weight="regular">
                <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256"><path d="M221.8,175.94C216.25,166.38,208,139.33,208,104a80,80,0,1,0-160,0c0,35.34-8.26,62.38-13.81,71.94A16,16,0,0,0,48,200H88.81a40,40,0,0,0,78.38,0H208a16,16,0,0,0,13.8-24.06ZM128,216a24,24,0,0,1-22.62-16h45.24A24,24,0,0,1,128,216ZM48,184c7.7-13.24,16-43.92,16-80a64,64,0,1,1,128,0c0,36.05,8.28,66.73,16,80Z"></path></svg>
              </div>
            </button>
            <div class="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 cursor-pointer transition-all hover:ring-2 hover:ring-sky-400" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuDu-9WPzdh_PURHXvaiRGHR30XcALmXA56E8vPYxdr-Kj6zISE--KQq7qfzHUmo9nlKHTvd2jD9qWsq1khAEz7Chnw-Lp7qDX5zlmqNAfO6hqvFklTGLyNHJMVCpfB-oH0wuhdG9_W81T_f_O1Hgr_Y3KY1fRVn7KnEfFjzu-OjfjLq66eWXyG6F5U6WGd_Wfz-NujD8TYdsvnkzSISecMEFnDjRiVXH0_gDDHtThZnMbozFmTQ3b0Kk9mZiOnPtdQ1G0ywSDSk_Es");'></div>
          </div>
        </header>
          <div class="px-4 sm:px-6 lg:px-8 flex flex-1 justify-center items-center py-5">
            <div class="layout-content-container flex flex-col w-full max-w-xl bg-[#1b2127] border border-[#3b4754] rounded-2xl shadow-2xl p-8">
            <h2 class="text-white tracking-tight text-3xl font-bold text-center mb-6">
              View Your NFT Gallery
            </h2>
            <label class="flex flex-col w-full">
              <span class="text-sm font-medium text-gray-400 mb-2">Wallet Address</span>
              <input
                v-model="userAddress"
                placeholder="0xAbC...123"
                class="form-input flex w-full resize-none rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-sky-500 border border-[#3b4754] bg-[#111418] h-14 placeholder:text-gray-500 p-4 text-base font-normal"
              />
            </label>
            <div v-if="error" class="px-1 py-2 text-red-400 text-sm text-center">
              {{ error }}
            </div>
            <div class="flex mt-6 justify-center">
              <button
                @click="goToGallery"
                class="flex w-full max-w-xs cursor-pointer items-center justify-center rounded-xl h-12 px-6 bg-sky-600 hover:bg-sky-700 text-white text-base font-bold transition-colors"
              >
                <span class="truncate">View Gallery</span>
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  </template>

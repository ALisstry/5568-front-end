<template>
  <div class="wallet-panel">
    <div class="wallet-head">
      <span class="wallet-title">Wallet</span>
      <span class="status-pill" :class="{ connected: !!address }">
        {{ address ? shortAddress : "Not Connected" }}
      </span>
    </div>

    <el-button
      :disabled="loading"
      @click="login"
      plain
      class="login-button"
      size="default"
    >
      {{ loading ? "Connecting..." : "Connect MetaMask" }}
    </el-button>
    <span v-if="error" class="error-line" :title="error"
      >Connection failed</span
    >
  </div>
</template>

<script>
import MetaMaskSDK from "@metamask/sdk";

export default {
  name: "MetaMaskLogin",
  data() {
    return {
      loading: false,
      address: "",
      error: "",
      provider: null,
      handleAccountsChanged: null,
    };
  },
  mounted() {
    const MMSDK = new MetaMaskSDK({
      dappMetadata: {
        name: "My Vue Dapp",
        url: window.location.href,
      },
      // infuraAPIKey: import.meta.env.VITE_INFURA_API_KEY,
    });

    this.provider = MMSDK.getProvider() || window.ethereum || null;

    this.handleAccountsChanged = (accounts) => {
      this.address = accounts?.[0] || "";
    };

    this.provider?.on?.("accountsChanged", this.handleAccountsChanged);
  },
  beforeUnmount() {
    this.provider?.removeListener?.(
      "accountsChanged",
      this.handleAccountsChanged,
    );
  },
  computed: {
    shortAddress() {
      if (!this.address) return "";
      return `${this.address.slice(0, 6)}...${this.address.slice(-4)}`;
    },
  },
  methods: {
    async login() {
      this.error = "";
      this.loading = true;

      try {
        if (!this.provider) {
          throw new Error(
            "MetaMask was not detected. Please install the MetaMask browser extension, or use a mobile environment that supports deeplinks and try again.",
          );
        }

        const accounts = await this.provider.request({
          method: "eth_requestAccounts",
        });

        this.address = accounts?.[0] || "";

        if (!this.address) {
          throw new Error(
            "Connected successfully, but no account was returned.",
          );
        }
      } catch (e) {
        if (e?.code === 4001)
          this.error = "You canceled the authorization request.";
        else if (e?.code === -32002)
          this.error =
            "A MetaMask authorization request is already in progress. Please complete it first.";
        else this.error = e?.message || "Connection failed.";
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.wallet-panel {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  max-width: 100%;
  padding: 0;
  border: none;
  background: transparent;
  backdrop-filter: none;
}

.wallet-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
}

.wallet-title {
  font-size: 20px;
  font-weight: 600;
  letter-spacing: 0.2px;
  color: #ffffff;
}

.status-pill {
  font-size: 15px;
  line-height: 1;
  padding: 5px 9px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.16);
  color: rgba(255, 255, 255, 0.92);
  white-space: nowrap;
}

.status-pill.connected {
  background: rgba(72, 187, 120, 0.28);
  color: #d9ffe8;
}

.login-button {
  height: 30px;
  padding: 0 12px;
  font-size: 14px;
  color: #ffffff !important;
  border-color: rgba(255, 255, 255, 0.8) !important;
  background: rgba(255, 255, 255, 0.08) !important;
  backdrop-filter: blur(10px);
}

.login-button:hover {
  border-color: #ffffff !important;
  background: rgba(255, 255, 255, 0.18) !important;
}

.error-line {
  font-size: 13px;
  color: #ffd1d1;
  white-space: nowrap;
  opacity: 0.92;
}
</style>

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
import { connect } from "@/contracts/login";

export default {
  name: "MetaMaskLogin",
  data() {
    return {
      loading: false,
      address: "",
      error: "",
      provider: null,
      chainId: "",
    };
  },
  computed: {
    shortAddress() {
      if (!this.address) return "";
      return `${this.address.substring(0, 6)}...${this.address.substring(this.address.length - 4)}`;
    },
  },
  mounted() {
    // 自动登录
    this.login();

    // 监听账户变化
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length === 0) {
          this.address = "";
        } else {
          this.address = accounts[0];
        }
      });

      // 监听链变化
      window.ethereum.on("chainChanged", (newChainId) => {
        this.chainId = parseInt(newChainId).toString(16);
      });
    }
  },
  beforeUnmount() {
    // 移除监听器
    if (window.ethereum) {
      window.ethereum.removeAllListeners("accountsChanged");
      window.ethereum.removeAllListeners("chainChanged");
    }
  },
  methods: {
    async login() {
      if (this.loading) {
        return;
      }

      try {
        this.loading = true;
        this.error = "";

        const result = await connect();
        this.address = result.address;
        this.chainId = result.chainId;
      } catch (err) {
        this.error = err.message || "Connection failed";
        console.error("MetaMask connection error:", err);
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

<template>
  <el-button
    type="primary"
    :disabled="loading"
    @click="login"
    plain
    class="LoginButton"
  >
    {{ loading ? "Connecting..." : "Login via MetaMask" }}
  </el-button>

  <p v-if="address">Address: {{ address }}</p>
  <p v-if="error" style="color: red">{{ error }}</p>
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

<style>
.LoginButton {
  background-color: transparent !important;
  backdrop-filter: blur(10px) !important;
  color: white !important;
  border-color: white !important;
}
</style>

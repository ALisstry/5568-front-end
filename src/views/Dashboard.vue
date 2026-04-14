<script>
import CardItem from "@/components/CardItem.vue";
import lendingPoolAbi from "@/ABI/LendingPool.json" with { type: "json" };
import erc20Abi from "@/ABI/AliceToken.json" with { type: "json" };
import addressJson from "@/contracts/address.json" with { type: "json" };
import {
  getConnectedAccounts,
  provider,
  WALLET_CONNECTED_EVENT,
  web3,
} from "@/contracts/wallet";

const ORACLE_ABI = [
  {
    inputs: [{ internalType: "address", name: "asset", type: "address" }],
    name: "getPrice",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
];

const ONE_ETHER_STR = "1000000000000000000";

export default {
  name: "Dashboard",
  components: {
    CardItem,
  },
  data() {
    return {
      loading: false,
      error: "",
      account: "",
      lastUpdated: "",

      healthFactorPercent: 200,
      totalDepositValueWei: "0",
      totalBorrowValueWei: "0",

      aliceBalanceRaw: "0",
      bobBalanceRaw: "0",
      aliceDecimals: 18,
      bobDecimals: 18,

      depositRows: [],
      borrowRows: [],
      debtVaults: [],
      reserveStatusRows: [],

      poolOracle: "",
      poolLiquidationBonusBps: "0",
      poolNextDebtVaultId: "0",

      tokenMetaByAddress: {},

      onAccountsChanged: null,
      onChainChanged: null,
      onWalletConnected: null,
    };
  },
  computed: {
    displayHealthFactor() {
      const value = Number(this.healthFactorPercent);
      if (Number.isNaN(value)) return 0;
      return Math.max(0, Math.round(value));
    },
    fillPercent() {
      return Math.min(this.displayHealthFactor, 100);
    },
    overflowPercent() {
      return Math.max(this.displayHealthFactor - 100, 0);
    },
    statusText() {
      if (this.displayHealthFactor < 100) return "At Risk";
      if (this.displayHealthFactor < 130) return "Caution";
      return "Healthy";
    },
    statusColor() {
      if (this.displayHealthFactor < 100) return "#d9534f";
      if (this.displayHealthFactor < 130) return "#f0ad4e";
      return "#5cb85c";
    },
  },
  mounted() {
    this.refreshDashboard();

    this.onAccountsChanged = () => {
      this.refreshDashboard();
    };
    this.onChainChanged = () => {
      this.refreshDashboard();
    };
    this.onWalletConnected = () => {
      this.refreshDashboard();
    };

    if (typeof provider?.on === "function") {
      provider.on("accountsChanged", this.onAccountsChanged);
      provider.on("chainChanged", this.onChainChanged);
    }

    window.addEventListener(WALLET_CONNECTED_EVENT, this.onWalletConnected);
  },
  beforeUnmount() {
    if (typeof provider?.removeListener === "function") {
      if (this.onAccountsChanged) {
        provider.removeListener("accountsChanged", this.onAccountsChanged);
      }
      if (this.onChainChanged) {
        provider.removeListener("chainChanged", this.onChainChanged);
      }
    }

    if (this.onWalletConnected) {
      window.removeEventListener(
        WALLET_CONNECTED_EVENT,
        this.onWalletConnected,
      );
    }
  },
  methods: {
    shortAddress(address) {
      if (!address) return "";
      return `${address.slice(0, 6)}...${address.slice(-4)}`;
    },

    getErrorMessage(err) {
      return (
        err?.cause?.message ||
        err?.data?.message ||
        err?.message ||
        String(err) ||
        "Failed to load dashboard"
      );
    },

    formatUnits(valueRaw, decimals = 18, fractionDigits = 4) {
      let value;
      try {
        value = BigInt(String(valueRaw ?? "0"));
      } catch {
        return "0";
      }

      const safeDecimals = Number.isFinite(Number(decimals))
        ? Number(decimals)
        : 18;
      const base = 10n ** BigInt(safeDecimals);
      const whole = value / base;
      const fraction = value % base;
      const fractionText = fraction
        .toString()
        .padStart(safeDecimals, "0")
        .slice(0, fractionDigits)
        .replace(/0+$/, "");

      if (!fractionText) {
        return whole.toString();
      }

      return `${whole.toString()}.${fractionText}`;
    },

    formatRayPercent(rayValue, fractionDigits = 2) {
      try {
        const value = BigInt(String(rayValue ?? "0"));
        if (value <= 0n) return "0";

        const digits = Math.max(0, Number(fractionDigits) || 0);
        const scale = 10n ** BigInt(digits);
        const scaledPercent =
          (value * 100n * scale) / 1_000_000_000_000_000_000n;
        const whole = scaledPercent / scale;
        const fraction = scaledPercent % scale;
        const fractionText = digits
          ? fraction.toString().padStart(digits, "0").replace(/0+$/, "")
          : "";

        return fractionText
          ? `${whole.toString()}.${fractionText}`
          : whole.toString();
      } catch {
        return "0";
      }
    },

    formatBpsPercent(bpsValue) {
      const value = Number(bpsValue ?? 0);
      if (!Number.isFinite(value) || value <= 0) return "0";
      return (value / 100).toFixed(2).replace(/\.?0+$/, "");
    },
    toPercentFromRay(rayValue) {
      try {
        const value = BigInt(String(rayValue ?? "0"));
        if (value <= 0n) return 0;

        const percent = value / 10_000_000_000_000_000n;
        if (percent > 9_999n) return 9_999;
        return Number(percent);
      } catch {
        return 0;
      }
    },

    valueInWei(amountRaw, priceRay, decimals = 18) {
      const amount = BigInt(String(amountRaw ?? "0"));
      const price = BigInt(String(priceRay ?? "0"));
      const base = 10n ** BigInt(decimals);
      return (amount * price) / base;
    },

    toAssetLabel(assetAddress) {
      if (!assetAddress) return "-";
      const key = assetAddress.toLowerCase();
      const meta = this.tokenMetaByAddress[key];
      if (meta?.symbol) return meta.symbol;
      return this.shortAddress(assetAddress);
    },

    async readTokenMeta(assetAddress) {
      const token = new web3.eth.Contract(erc20Abi, assetAddress);

      try {
        const [symbol, decimals] = await Promise.all([
          token.methods.symbol().call(),
          token.methods.decimals().call(),
        ]);
        return {
          symbol,
          decimals: Number(decimals),
        };
      } catch {
        return {
          symbol: this.shortAddress(assetAddress),
          decimals: 18,
        };
      }
    },

    async safeGetPrice(oracle, assetAddress) {
      try {
        const result = await oracle.methods.getPrice(assetAddress).call();
        return String(result || ONE_ETHER_STR);
      } catch {
        return ONE_ETHER_STR;
      }
    },

    async refreshDashboard() {
      if (this.loading) {
        return;
      }

      this.loading = true;
      this.error = "";

      try {
        const accounts = await getConnectedAccounts();
        if (!accounts || accounts.length === 0) {
          this.account = "";
          this.totalDepositValueWei = "0";
          this.totalBorrowValueWei = "0";
          this.depositRows = [];
          this.borrowRows = [];
          this.debtVaults = [];
          this.reserveStatusRows = [];
          this.healthFactorPercent = 200;
          this.poolOracle = "";
          this.poolLiquidationBonusBps = "0";
          this.poolNextDebtVaultId = "0";
          this.error = "Please connect MetaMask first";
          return;
        }

        this.account = accounts[0];

        const lendingPool = new web3.eth.Contract(
          lendingPoolAbi,
          addressJson.LendingPool,
        );

        const aliceToken = new web3.eth.Contract(
          erc20Abi,
          addressJson.AliceToken,
        );
        const bobToken = new web3.eth.Contract(erc20Abi, addressJson.BobToken);
        const [aliceBalanceRaw, bobBalanceRaw, aliceMeta, bobMeta] =
          await Promise.all([
            aliceToken.methods.balanceOf(this.account).call(),
            bobToken.methods.balanceOf(this.account).call(),
            this.readTokenMeta(addressJson.AliceToken),
            this.readTokenMeta(addressJson.BobToken),
          ]);

        this.aliceBalanceRaw = String(aliceBalanceRaw);
        this.bobBalanceRaw = String(bobBalanceRaw);
        this.aliceDecimals = Number(aliceMeta.decimals || 18);
        this.bobDecimals = Number(bobMeta.decimals || 18);

        const metaByAddress = {
          [addressJson.AliceToken.toLowerCase()]: aliceMeta,
          [addressJson.BobToken.toLowerCase()]: bobMeta,
        };

        const reserveAssets = await lendingPool.methods
          .getReserveAssets()
          .call();
        const [poolOracle, liquidationBonusBps, nextDebtVaultId] =
          await Promise.all([
            lendingPool.methods.oracle().call(),
            lendingPool.methods.liquidationBonus().call(),
            lendingPool.methods.nextDebtVaultId().call(),
          ]);

        this.poolOracle = String(poolOracle || "");
        this.poolLiquidationBonusBps = String(liquidationBonusBps || "0");
        this.poolNextDebtVaultId = String(nextDebtVaultId || "0");

        const oracle = new web3.eth.Contract(
          ORACLE_ABI,
          poolOracle || addressJson.Oracle,
        );

        const debtVaultIds = await lendingPool.methods
          .getOwnerDebtVaultIds(this.account)
          .call();

        const unknownReserveAssets = reserveAssets.filter(
          (asset) => !metaByAddress[asset.toLowerCase()],
        );

        if (unknownReserveAssets.length > 0) {
          const unknownMetas = await Promise.all(
            unknownReserveAssets.map((asset) => this.readTokenMeta(asset)),
          );
          unknownReserveAssets.forEach((asset, idx) => {
            metaByAddress[asset.toLowerCase()] = unknownMetas[idx];
          });
        }

        this.tokenMetaByAddress = metaByAddress;

        this.reserveStatusRows = await Promise.all(
          reserveAssets.map(async (assetAddress) => {
            const [utilizationRaw, aTokenAddress] = await Promise.all([
              lendingPool.methods.getReserveUtilization(assetAddress).call(),
              lendingPool.methods.getReserveAToken(assetAddress).call(),
            ]);
            const meta = metaByAddress[assetAddress.toLowerCase()] || {
              symbol: this.shortAddress(assetAddress),
            };

            return {
              assetAddress,
              symbol: meta.symbol,
              utilizationRaw: String(utilizationRaw || "0"),
              aTokenAddress: String(aTokenAddress || ""),
            };
          }),
        );

        const reserveRows = await Promise.all(
          reserveAssets.map(async (assetAddress) => {
            const key = assetAddress.toLowerCase();
            const meta = metaByAddress[key] || {
              symbol: this.shortAddress(assetAddress),
              decimals: 18,
            };

            const [custodiedRaw, debtRaw, priceRay] = await Promise.all([
              lendingPool.methods
                .getUserCustodiedShares(this.account, assetAddress)
                .call(),
              lendingPool.methods
                .getUserDebtBalance(this.account, assetAddress)
                .call(),
              this.safeGetPrice(oracle, assetAddress),
            ]);

            const depositValueWei = this.valueInWei(
              custodiedRaw,
              priceRay,
              meta.decimals,
            );
            const debtValueWei = this.valueInWei(
              debtRaw,
              priceRay,
              meta.decimals,
            );

            return {
              assetAddress,
              symbol: meta.symbol,
              decimals: meta.decimals,
              depositRaw: String(custodiedRaw),
              debtRaw: String(debtRaw),
              depositValueWei: depositValueWei.toString(),
              debtValueWei: debtValueWei.toString(),
            };
          }),
        );

        this.depositRows = reserveRows.filter(
          (row) => BigInt(row.depositRaw) > 0n,
        );
        this.borrowRows = reserveRows.filter((row) => BigInt(row.debtRaw) > 0n);

        this.totalDepositValueWei = reserveRows
          .reduce((sum, row) => sum + BigInt(row.depositValueWei), 0n)
          .toString();
        this.totalBorrowValueWei = reserveRows
          .reduce((sum, row) => sum + BigInt(row.debtValueWei), 0n)
          .toString();

        const debtVaults = await Promise.all(
          debtVaultIds.map(async (id) => {
            const [summary, borrowedAssets] = await Promise.all([
              lendingPool.methods.getDebtVaultSummary(id).call(),
              lendingPool.methods.getDebtVaultBorrowedAssets(id).call(),
            ]);

            return {
              id: String(id),
              hfPercent: this.toPercentFromRay(summary.hf),
              collateralValueWei: String(summary.liquidationThresholdValue),
              debtValueWei: String(summary.debtValue),
              maxBorrowableWei: String(summary.maxBorrowableValue),
              borrowedLabels: borrowedAssets.map((asset) =>
                this.toAssetLabel(asset),
              ),
            };
          }),
        );

        this.debtVaults = debtVaults;
        this.healthFactorPercent = debtVaults.length
          ? Math.min(...debtVaults.map((vault) => vault.hfPercent))
          : 200;

        this.lastUpdated = new Date().toLocaleString();
      } catch (err) {
        this.error = this.getErrorMessage(err);
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<template>
  <div class="dashboard">
    <section class="top-section">
      <CardItem class="overview-card">
        <div class="card-head">
          <h3 class="card-title">Overview</h3>
          <el-button
            class="refresh-btn"
            plain
            size="small"
            :loading="loading"
            @click="refreshDashboard"
            >Refresh</el-button
          >
        </div>

        <div class="metrics-grid">
          <div class="metric-item metric-item--full">
            <span class="metric-label">Account</span>
            <span class="metric-value">{{
              account ? shortAddress(account) : "-"
            }}</span>
          </div>
          <div class="metric-item metric-item--full">
            <span class="metric-label">Last Updated</span>
            <span class="metric-value">{{ lastUpdated || "-" }}</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">Alice Balance</span>
            <span class="metric-value"
              >${{ formatUnits(aliceBalanceRaw, aliceDecimals) }}</span
            >
          </div>
          <div class="metric-item">
            <span class="metric-label">Bob Balance</span>
            <span class="metric-value"
              >${{ formatUnits(bobBalanceRaw, bobDecimals) }}</span
            >
          </div>
          <div class="metric-item">
            <span class="metric-label">Total Deposits Value</span>
            <span class="metric-value"
              >${{ formatUnits(totalDepositValueWei) }}</span
            >
          </div>
          <div class="metric-item">
            <span class="metric-label">Total Borrowed Value</span>
            <span class="metric-value"
              >${{ formatUnits(totalBorrowValueWei) }}</span
            >
          </div>
        </div>

        <p v-if="loading" class="loading-line">Loading dashboard...</p>
        <p v-if="error" class="error-line">{{ error }}</p>
      </CardItem>
    </section>

    <section class="main-content">
      <div class="assets-section">
        <CardItem class="list-card pool-card">
          <h3 class="card-title">Lending Pool</h3>
          <div class="metrics-grid pool-metrics-grid">
            <div class="metric-item">
              <span class="metric-label">Reserves</span>
              <span class="metric-value">{{ reserveStatusRows.length }}</span>
            </div>
            <div class="metric-item">
              <span class="metric-label">Next DebtVault ID</span>
              <span class="metric-value">{{ poolNextDebtVaultId || "-" }}</span>
            </div>
            <div class="metric-item">
              <span class="metric-label">Liquidation Bonus</span>
              <span class="metric-value"
                >{{ formatBpsPercent(poolLiquidationBonusBps) }}%</span
              >
            </div>
            <div class="metric-item">
              <span class="metric-label">Oracle</span>
              <span class="metric-value">{{
                poolOracle ? shortAddress(poolOracle) : "-"
              }}</span>
            </div>
          </div>

          <p v-if="!reserveStatusRows.length" class="line">No reserve assets</p>
          <div
            v-for="row in reserveStatusRows"
            :key="row.assetAddress"
            class="asset-row"
          >
            <p class="line">
              {{ row.symbol }}: {{ formatRayPercent(row.utilizationRaw) }}%
            </p>
            <p class="sub-line">
              aToken:
              {{ row.aTokenAddress ? shortAddress(row.aTokenAddress) : "-" }}
            </p>
          </div>
        </CardItem>
        <CardItem class="list-card">
          <h3 class="card-title">Deposits</h3>
          <p v-if="!depositRows.length" class="line">No deposited assets</p>
          <div
            v-for="row in depositRows"
            :key="row.assetAddress"
            class="asset-row"
          >
            <p class="line">
              {{ row.symbol }}: {{ formatUnits(row.depositRaw, row.decimals) }}
            </p>
            <p class="sub-line">
              Value: {{ formatUnits(row.depositValueWei) }}
            </p>
          </div>
        </CardItem>

        <CardItem class="list-card">
          <h3 class="card-title">Borrows</h3>
          <p v-if="!borrowRows.length" class="line">No borrowed assets</p>
          <div
            v-for="row in borrowRows"
            :key="row.assetAddress"
            class="asset-row"
          >
            <p class="line">
              {{ row.symbol }}: {{ formatUnits(row.debtRaw, row.decimals) }}
            </p>
            <p class="sub-line">Value: {{ formatUnits(row.debtValueWei) }}</p>
          </div>
        </CardItem>
      </div>

      <CardItem class="vault-card">
        <div class="vault-head">
          <h3 class="card-title">Debt Vaults</h3>
          <div class="hf-display" v-if="debtVaults.length">
            <span class="hf-label">Health Factor</span>
            <span class="hf-value" :style="{ color: statusColor }"
              >{{ displayHealthFactor }}%</span
            >
          </div>
        </div>

        <div v-if="debtVaults.length" class="hf-meter-wrap">
          <div class="hf-meter">
            <div
              class="hf-fill"
              :style="{
                width: fillPercent + '%',
                backgroundColor: statusColor,
              }"
            ></div>
          </div>
          <div class="hf-scale">
            <span>0%</span>
            <span>100%</span>
          </div>
          <p v-if="overflowPercent > 0" class="hf-overflow">
            +{{ overflowPercent }}% above liquidation threshold
          </p>
          <p class="hf-status" :style="{ color: statusColor }">
            {{ statusText }}
          </p>
        </div>

        <p v-if="!debtVaults.length" class="line">No DebtVault</p>
        <div v-for="vault in debtVaults" :key="vault.id" class="vault-row">
          <div class="vault-header">
            <p class="vault-id">#{{ vault.id }}</p>
            <span
              class="vault-hf"
              :style="{
                color:
                  vault.hfPercent < 100
                    ? '#d9534f'
                    : vault.hfPercent < 130
                      ? '#f0ad4e'
                      : '#5cb85c',
                borderColor:
                  vault.hfPercent < 100
                    ? '#d9534f'
                    : vault.hfPercent < 130
                      ? '#f0ad4e'
                      : '#5cb85c',
                boxShadow:
                  vault.hfPercent >= 100
                    ? `0 0 8px ${vault.hfPercent < 100 ? '#d9534f' : vault.hfPercent < 130 ? '#f0ad4e' : '#5cb85c'}`
                    : 'none',
              }"
              :class="`vault-hf-border-${vault.hfPercent < 100 ? 'danger' : vault.hfPercent < 130 ? 'warning' : 'safe'}`"
            >
              {{ Math.max(0, Math.round(vault.hfPercent)) }}%
            </span>
          </div>
          <div class="vault-details">
            <p class="sub-line">
              Collateral Value: {{ formatUnits(vault.collateralValueWei) }}
            </p>
            <p class="sub-line">
              Debt Value: {{ formatUnits(vault.debtValueWei) }}
            </p>
            <p class="sub-line">
              Max Borrowable: {{ formatUnits(vault.maxBorrowableWei) }}
            </p>
            <p class="sub-line sub-line--full">
              Borrowed Assets:
              {{
                vault.borrowedLabels.length
                  ? vault.borrowedLabels.join(", ")
                  : "-"
              }}
            </p>
          </div>
        </div>
      </CardItem>
    </section>
  </div>
</template>

<style scoped>
.dashboard {
  width: 100%;
  padding: 16px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.top-section {
  display: grid;
  grid-template-columns: minmax(320px, 1fr);
  gap: 16px;
  align-items: stretch;
}

.main-content {
  margin-top: 20px;
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  align-items: start;
}

.assets-section {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.top-section :deep(.card-item),
.assets-section :deep(.card-item) {
  margin: 0;
}

.top-section :deep(.card-item) {
  height: 100%;
}

.assets-section :deep(.card-item) {
  height: auto;
}

.overview-card,
.list-card,
.vault-card {
  min-width: 0;
  margin: 0;
  margin-top: 0px;
}

.pool-card {
  grid-column: 1 / -1;
}

.pool-metrics-grid {
  margin-bottom: 8px;
}

.card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.vault-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.hf-display {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.card-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: rgb(30, 30, 30);
}

.hf-label {
  display: block;
  font-size: 12px;
  color: rgb(90, 90, 90);
}

.hf-value {
  display: block;
  font-size: 20px;
  font-weight: 700;
  line-height: 1;
}

.hf-meter-wrap {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-bottom: 12px;
  margin-bottom: 16px;
  border-bottom: 1px solid rgb(235, 235, 235);
}

.hf-meter {
  width: 100%;
  height: 12px;
  border: 1px solid rgb(210, 210, 210);
  background-color: rgb(245, 245, 245);
}

.hf-fill {
  height: 100%;
  transition: width 0.35s ease;
}

.hf-scale {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: rgb(100, 100, 100);
}

.hf-overflow {
  margin: 6px 0 0;
  font-size: 12px;
  color: rgb(80, 80, 80);
}

.hf-status {
  margin: 8px 0 0;
  font-size: 13px;
  font-weight: 600;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.metric-item {
  border: 1px solid rgb(235, 235, 235);
  padding: 10px;
  /* background: rgb(250, 250, 250); */
}

.metric-item--full {
  grid-column: 1 / -1;
}

.metric-label {
  display: block;
  font-size: 12px;
  color: rgb(90, 90, 90);
  margin-bottom: 4px;
}

.metric-value {
  display: block;
  color: rgb(30, 30, 30);
  word-break: break-word;
}

.refresh-btn {
  background-color: transparent;
  color: black;
  border-color: rgb(200, 200, 200);
}

.refresh-btn:hover {
  background-color: transparent;
  border-color: black;
  color: black;
}

.line {
  margin: 6px 0;
  color: rgb(30, 30, 30);
  word-break: break-word;
  line-height: 1.5;
}

.sub-line {
  margin: 0;
  color: rgb(90, 90, 90);
  font-size: 13px;
  line-height: 1.4;
}

.sub-line--full {
  grid-column: 1 / -1;
  margin-top: 4px;
  padding-top: 4px;
  border-top: 1px solid rgb(243, 243, 243);
}

.asset-row {
  padding: 10px 0;
  border-bottom: 1px solid rgb(235, 235, 235);
}

.asset-row:first-of-type {
  padding-top: 0;
}

.asset-row:last-of-type {
  border-bottom: none;
}

.vault-row {
  padding: 12px 0;
  border-bottom: 1px solid rgb(235, 235, 235);
}

.vault-row:first-of-type {
  padding-top: 6px;
}

.vault-row:last-of-type {
  border-bottom: none;
  padding-bottom: 0;
}

.vault-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 6px;
}

.vault-id {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: rgb(30, 30, 30);
  flex-shrink: 0;
  line-height: 1.4;
}

.vault-hf {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 600;
  position: relative;
  border: 2px solid;
  transition: all 0.3s ease;
}

.vault-hf::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: inherit;
  pointer-events: none;
  z-index: -1;
  transition: all 0.3s ease;
}

.vault-hf-border-danger {
  border-color: #d9534f;
}

.vault-hf-border-warning {
  border-color: #f0ad4e;
}

.vault-hf-border-safe {
  border-color: #5cb85c;
  box-shadow: 0 0 8px #5cb85c;
}

.vault-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 12px;
  margin-top: 6px;
  max-width: 100%;
  overflow-x: auto;
}

.vault-row :deep(.hf-card) {
  width: 100%;
  max-width: 150px;
}

.loading-line {
  margin-top: 10px;
  color: rgb(80, 80, 80);
}

.error-line {
  margin-top: 10px;
  color: #d9534f;
  word-break: break-word;
}

@media (max-width: 1200px) {
  .main-content {
    grid-template-columns: 1fr;
  }

  .assets-section {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 900px) {
  .dashboard {
    padding: 12px;
    gap: 16px;
  }

  .metrics-grid {
    grid-template-columns: 1fr;
  }

  .vault-head {
    flex-direction: column;
    gap: 8px;
  }

  .hf-display {
    align-items: flex-start;
  }

  .card-title {
    font-size: 16px;
  }

  .vault-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .vault-details {
    grid-template-columns: 1fr;
    gap: 6px;
  }

  .sub-line--full {
    margin-top: 4px;
  }

  .vault-row :deep(.hf-card) {
    max-width: 200px;
  }
}

@media (max-width: 480px) {
  .dashboard {
    padding: 8px;
    gap: 12px;
  }

  .top-section {
    gap: 12px;
  }

  .assets-section {
    gap: 12px;
  }

  .metrics-grid {
    gap: 8px;
  }

  .metric-item {
    padding: 8px;
  }

  .metric-label {
    font-size: 11px;
  }

  .line {
    margin: 6px 0;
    font-size: 14px;
  }

  .sub-line {
    margin: 3px 0;
    font-size: 12px;
  }

  .asset-row {
    padding: 8px 0;
    margin-bottom: 2px;
  }

  .vault-row {
    padding: 12px 0;
    margin-bottom: 4px;
  }

  .vault-id {
    font-size: 13px;
  }

  .hf-label {
    font-size: 11px;
  }

  .hf-value {
    font-size: 18px;
  }

  .vault-details {
    grid-template-columns: 1fr;
    gap: 6px;
    max-width: 100%;
  }

  .vault-row :deep(.hf-card) {
    max-width: 120px;
  }
}
</style>

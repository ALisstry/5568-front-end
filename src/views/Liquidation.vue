<template>
  <div class="container">
    <CardItem class="liquidation-card">
      <div class="card-header">
        <h3 class="card-title">Liquidatable DebtVaults</h3>
        <el-button plain class="mini-btn" :loading="loading" @click="refreshTables">
          Refresh
        </el-button>
      </div>

      <p v-if="error" class="error-line">{{ error }}</p>
      <p v-if="!loading && !liquidationTables.length" class="empty-line">
        No liquidatable DebtVaults found.
      </p>

      <div
        v-for="row in liquidationTables"
        :key="row.debtVaultId"
        class="table-row"
      >
        <div class="row-main">
          <p class="row-title">#{{ row.debtVaultId }}</p>
          <p class="row-sub">Borrower: {{ shortAddress(row.borrower) }}</p>
          <p class="row-sub">Health Factor: {{ row.healthFactor }}</p>
          <p class="row-sub">Debt Value: {{ row.debtValue }}</p>
          <p class="row-sub">Collateral Value: {{ row.collateralValue }}</p>
        </div>
        <el-button plain class="mini-btn" @click="openLiquidationDialog(row)">
          Liquidate
        </el-button>
      </div>
    </CardItem>

    <el-dialog
      v-model="dialog.visible"
      width="760px"
      :title="`Liquidate DebtVault #${dialog.debtVaultId || '-'}`"
      destroy-on-close
    >
      <div class="dialog-grid">
        <div class="dialog-info">
          <p class="info-line">
            <span class="info-label">Borrower</span>
            <span class="info-value">{{ shortAddress(dialog.borrower) }}</span>
          </p>
          <p class="info-line">
            <span class="info-label">Health Factor</span>
            <span class="info-value">{{ dialog.healthFactor || "-" }}</span>
          </p>
          <p class="info-line">
            <span class="info-label">Debt Value</span>
            <span class="info-value">{{ dialog.debtValue || "-" }}</span>
          </p>
          <p class="info-line">
            <span class="info-label">Collateral Value</span>
            <span class="info-value">{{ dialog.collateralValue || "-" }}</span>
          </p>
        </div>

        <el-tabs v-model="tabMode" class="mode-tabs">
          <el-tab-pane label="Direct Liquidation" name="direct">
            <el-form class="action-form" label-position="right" label-width="130px">
              <el-form-item label="Debt Asset">
                <el-select
                  v-model="direct.debtAsset"
                  class="full-width"
                  style="
                    --el-color-primary: black;
                    --el-border-color-hover: gray;
                    --el-text-color-primary: black;
                  "
                  popper-class="selectStyle"
                >
                  <el-option label="Alice" value="Alice"></el-option>
                  <el-option label="Bob" value="Bob"></el-option>
                </el-select>
              </el-form-item>

              <el-form-item label="Collateral Asset">
                <el-select
                  v-model="direct.collateralAsset"
                  class="full-width"
                  style="
                    --el-color-primary: black;
                    --el-border-color-hover: gray;
                    --el-text-color-primary: black;
                  "
                  popper-class="selectStyle"
                >
                  <el-option label="Alice" value="Alice"></el-option>
                  <el-option label="Bob" value="Bob"></el-option>
                </el-select>
              </el-form-item>

              <el-form-item label="Repay Amount">
                <el-row style="width: 100%" :gutter="8">
                  <el-col :span="15">
                    <el-input
                      v-model="direct.amount"
                      placeholder="Token amount"
                      clearable
                      style="
                        --el-color-primary: black;
                        --el-border-color-hover: gray;
                      "
                    ></el-input>
                  </el-col>
                  <el-col :span="9">
                    <el-select
                      v-model="direct.unit"
                      class="full-width"
                      style="
                        --el-color-primary: black;
                        --el-border-color-hover: gray;
                        --el-text-color-primary: black;
                      "
                      popper-class="selectStyle"
                    >
                      <el-option label="Ether" value="ether"></el-option>
                      <el-option label="Finney" value="finney"></el-option>
                      <el-option label="Szabo" value="szabo"></el-option>
                      <el-option label="Gwei" value="gwei"></el-option>
                      <el-option label="Wei" value="wei"></el-option>
                    </el-select>
                  </el-col>
                </el-row>
              </el-form-item>

              <el-form-item>
                <el-button
                  type="primary"
                  class="submit-btn"
                  :loading="direct.submitting"
                  @click="onDirectLiquidate"
                >
                  Execute Direct Liquidation
                </el-button>
              </el-form-item>
            </el-form>
          </el-tab-pane>

          <el-tab-pane label="Flash Liquidation" name="flash">
            <el-form class="action-form" label-position="right" label-width="130px">
              <el-form-item label="Debt Asset">
                <el-select
                  v-model="flash.debtAsset"
                  class="full-width"
                  style="
                    --el-color-primary: black;
                    --el-border-color-hover: gray;
                    --el-text-color-primary: black;
                  "
                  popper-class="selectStyle"
                >
                  <el-option label="Alice" value="Alice"></el-option>
                  <el-option label="Bob" value="Bob"></el-option>
                </el-select>
              </el-form-item>

              <el-form-item label="Collateral Asset">
                <el-select
                  v-model="flash.collateralAsset"
                  class="full-width"
                  style="
                    --el-color-primary: black;
                    --el-border-color-hover: gray;
                    --el-text-color-primary: black;
                  "
                  popper-class="selectStyle"
                >
                  <el-option label="Alice" value="Alice"></el-option>
                  <el-option label="Bob" value="Bob"></el-option>
                </el-select>
              </el-form-item>

              <el-form-item label="Borrow Amount">
                <el-row style="width: 100%" :gutter="8">
                  <el-col :span="15">
                    <el-input
                      v-model="flash.amount"
                      placeholder="Token amount"
                      clearable
                      style="
                        --el-color-primary: black;
                        --el-border-color-hover: gray;
                      "
                    ></el-input>
                  </el-col>
                  <el-col :span="9">
                    <el-select
                      v-model="flash.unit"
                      class="full-width"
                      style="
                        --el-color-primary: black;
                        --el-border-color-hover: gray;
                        --el-text-color-primary: black;
                      "
                      popper-class="selectStyle"
                    >
                      <el-option label="Ether" value="ether"></el-option>
                      <el-option label="Finney" value="finney"></el-option>
                      <el-option label="Szabo" value="szabo"></el-option>
                      <el-option label="Gwei" value="gwei"></el-option>
                      <el-option label="Wei" value="wei"></el-option>
                    </el-select>
                  </el-col>
                </el-row>
              </el-form-item>

              <el-form-item>
                <el-button
                  type="primary"
                  class="submit-btn"
                  :loading="flash.submitting"
                  @click="onFlashLiquidate"
                >
                  Execute Flash Liquidation
                </el-button>
              </el-form-item>
            </el-form>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { ElMessage } from "element-plus";
import CardItem from "@/components/CardItem.vue";
import lendingPoolAbi from "@/ABI/LendingPool.json" with { type: "json" };
import addressJson from "@/contracts/address.json" with { type: "json" };
import { web3 } from "@/contracts/wallet";
import { liquidate } from "@/contracts/lendingPool";
import { flashLiquidate } from "@/contracts/flashLoanBot";

export default {
  name: "Liquidation",
  components: {
    CardItem,
  },
  data() {
    return {
      loading: false,
      error: "",
      liquidationTables: [],
      tabMode: "direct",
      dialog: {
        visible: false,
        debtVaultId: "",
        borrower: "",
        healthFactor: "",
        debtValue: "",
        collateralValue: "",
      },
      direct: {
        debtAsset: "Alice",
        collateralAsset: "Bob",
        amount: "",
        unit: "ether",
        submitting: false,
      },
      flash: {
        debtAsset: "Alice",
        collateralAsset: "Bob",
        amount: "",
        unit: "ether",
        submitting: false,
      },
    };
  },
  async mounted() {
    await this.refreshTables();
  },
  methods: {
    shortAddress(address) {
      if (!address) return "-";
      return `${address.slice(0, 6)}...${address.slice(-4)}`;
    },

    formatWei(value) {
      try {
        return web3.utils.fromWei(String(value || "0"), "ether");
      } catch {
        return "0";
      }
    },

    async refreshTables() {
      this.loading = true;
      this.error = "";
      try {
        const lendingPool = new web3.eth.Contract(
          lendingPoolAbi,
          addressJson.LendingPool,
        );
        const rows = await lendingPool.methods.getLiquidationTables().call();
        this.liquidationTables = (rows || []).map((item) => ({
          debtVaultId: String(item.debtVaultId || ""),
          borrower: String(item.borrower || ""),
          healthFactor: this.formatWei(item.healthFactor),
          debtValue: this.formatWei(item.debtValue),
          collateralValue: this.formatWei(item.collateralValue),
        }));
      } catch (err) {
        this.error = this.getErrorMessage(err);
      } finally {
        this.loading = false;
      }
    },

    openLiquidationDialog(row) {
      this.dialog = {
        visible: true,
        debtVaultId: row.debtVaultId,
        borrower: row.borrower,
        healthFactor: row.healthFactor,
        debtValue: row.debtValue,
        collateralValue: row.collateralValue,
      };
      this.tabMode = "direct";
      this.direct.amount = "";
      this.flash.amount = "";
    },

    async onDirectLiquidate() {
      if (this.direct.submitting) return;
      if (!this.dialog.debtVaultId) {
        ElMessage.warning("Please select a liquidatable DebtVault first.");
        return;
      }
      if (!this.direct.amount || Number(this.direct.amount) <= 0) {
        ElMessage.warning("Amount must be greater than 0");
        return;
      }

      this.direct.submitting = true;
      try {
        const result = await liquidate({
          debtVaultId: this.dialog.debtVaultId,
          debtAsset: this.direct.debtAsset,
          collateralAsset: this.direct.collateralAsset,
          amount: this.direct.amount,
          unit: this.direct.unit,
        });
        ElMessage.success(`Direct liquidation success. Tx: ${result.txHash}`);
        this.dialog.visible = false;
        await this.refreshTables();
      } catch (err) {
        ElMessage.error(this.getErrorMessage(err));
      } finally {
        this.direct.submitting = false;
      }
    },

    async onFlashLiquidate() {
      if (this.flash.submitting) return;
      if (!this.dialog.debtVaultId) {
        ElMessage.warning("Please select a liquidatable DebtVault first.");
        return;
      }
      if (!this.flash.amount || Number(this.flash.amount) <= 0) {
        ElMessage.warning("Amount must be greater than 0");
        return;
      }

      this.flash.submitting = true;
      try {
        const result = await flashLiquidate({
          debtVaultId: this.dialog.debtVaultId,
          debtAsset: this.flash.debtAsset,
          collateralAsset: this.flash.collateralAsset,
          amount: this.flash.amount,
          unit: this.flash.unit,
        });
        ElMessage.success(`Flash liquidation success. Tx: ${result.txHash}`);
        this.dialog.visible = false;
        await this.refreshTables();
      } catch (err) {
        ElMessage.error(this.getErrorMessage(err));
      } finally {
        this.flash.submitting = false;
      }
    },

    getErrorMessage(err) {
      const message =
        err?.cause?.message ||
        err?.data?.message ||
        err?.message ||
        String(err) ||
        "Transaction failed";

      if (message.includes("insufficient balance")) {
        return "❌ Insufficient balance.";
      }
      if (message.includes("approval")) {
        return "❌ Approval required.";
      }
      if (message.includes("Invalid flash bot address")) {
        return "❌ Flash bot contract address is invalid.";
      }
      return message;
    },
  },
};
</script>

<style scoped>
.container {
  margin: 10px auto;
  padding: 0 10px;
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
  max-width: calc(100% - 20px);
  box-sizing: border-box;
}

.liquidation-card {
  width: 100%;
  box-sizing: border-box;
}

.card-header {
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: rgb(30, 30, 30);
}

.error-line {
  margin: 0 0 12px 0;
  color: #d9534f;
}

.empty-line {
  margin: 0;
  color: rgb(90, 90, 90);
}

.table-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 12px 0;
  border-top: 1px solid rgb(235, 235, 235);
  gap: 12px;
}

.row-main {
  min-width: 0;
}

.row-title {
  margin: 0 0 6px 0;
  font-size: 16px;
  font-weight: 600;
  color: rgb(30, 30, 30);
}

.row-sub {
  margin: 0 0 4px 0;
  color: rgb(80, 80, 80);
}

.dialog-grid {
  display: grid;
  gap: 16px;
}

.dialog-info {
  border: 1px solid rgb(235, 235, 235);
  padding: 12px;
}

.info-line {
  margin: 0 0 8px 0;
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.info-label {
  color: rgb(90, 90, 90);
}

.info-value {
  color: rgb(30, 30, 30);
  font-weight: 600;
}

.mode-tabs {
  width: 100%;
}

.action-form {
  width: 100%;
}

.full-width {
  width: 100%;
}

.submit-btn,
.mini-btn {
  background-color: transparent;
  color: black;
  border-color: rgb(200, 200, 200);
}

.submit-btn:hover,
.mini-btn:hover {
  background-color: transparent;
  border-color: black;
  color: black;
}

.submit-btn:active,
.mini-btn:active {
  background-color: rgb(200, 200, 200);
}

:deep(.el-select-dropdown__item.is-selected) {
  color: black !important;
}

:deep(.el-select-dropdown__item.is-selected span) {
  color: black !important;
}

@media (max-width: 768px) {
  .table-row {
    flex-direction: column;
  }
}
</style>

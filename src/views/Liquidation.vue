<template>
  <div class="container">
    <CardItem class="liquidation-card">
      <div class="card-header">
        <h3 class="card-title">Direct Liquidation</h3>
      </div>

      <el-form class="action-form" label-position="right" label-width="120px">
        <el-form-item label="DebtVault">
          <el-row style="width: 100%" :gutter="8">
            <el-col :span="14">
              <el-select
                v-model="direct.debtVaultId"
                filterable
                allow-create
                default-first-option
                class="full-width"
                placeholder="Select or input DebtVault ID"
                style="
                  --el-color-primary: black;
                  --el-border-color-hover: gray;
                  --el-text-color-primary: black;
                "
                popper-class="selectStyle"
              >
                <el-option
                  v-for="id in debtVaultIds"
                  :key="id"
                  :label="`#${id}`"
                  :value="String(id)"
                ></el-option>
              </el-select>
            </el-col>
            <el-col :span="10" style="display: flex; gap: 8px">
              <el-button plain class="mini-btn" @click="refreshDebtVaultIds"
                >Refresh</el-button
              >
              <el-button
                plain
                class="mini-btn"
                :loading="direct.submitting"
                @click="loadSelectedVaultData('direct')"
                >Load</el-button
              >
            </el-col>
          </el-row>
        </el-form-item>

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
                style="--el-color-primary: black; --el-border-color-hover: gray"
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
            Liquidate
          </el-button>
        </el-form-item>
      </el-form>

      <div class="data-section" v-if="directVaultData">
        <p class="data-label">Health Factor</p>
        <p class="data-value">{{ directVaultData.hf }}</p>
        <p class="data-label">Total Debt Value</p>
        <p class="data-value">{{ directVaultData.debtValue }}</p>
        <p class="data-label">Collateral Alice</p>
        <p class="data-value">{{ directVaultData.collateralAlice }}</p>
        <p class="data-label">Collateral Bob</p>
        <p class="data-value">{{ directVaultData.collateralBob }}</p>
      </div>
    </CardItem>

    <CardItem class="liquidation-card">
      <div class="card-header">
        <h3 class="card-title">Flash Liquidation</h3>
      </div>

      <el-form class="action-form" label-position="right" label-width="120px">
        <el-form-item label="DebtVault">
          <el-row style="width: 100%" :gutter="8">
            <el-col :span="14">
              <el-select
                v-model="flash.debtVaultId"
                filterable
                allow-create
                default-first-option
                class="full-width"
                placeholder="Select or input DebtVault ID"
                style="
                  --el-color-primary: black;
                  --el-border-color-hover: gray;
                  --el-text-color-primary: black;
                "
                popper-class="selectStyle"
              >
                <el-option
                  v-for="id in debtVaultIds"
                  :key="id"
                  :label="`#${id}`"
                  :value="String(id)"
                ></el-option>
              </el-select>
            </el-col>
            <el-col :span="10" style="display: flex; gap: 8px">
              <el-button plain class="mini-btn" @click="refreshDebtVaultIds"
                >Refresh</el-button
              >
              <el-button
                plain
                class="mini-btn"
                :loading="flash.submitting"
                @click="loadSelectedVaultData('flash')"
                >Load</el-button
              >
            </el-col>
          </el-row>
        </el-form-item>

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
                style="--el-color-primary: black; --el-border-color-hover: gray"
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
            Flash Liquidate
          </el-button>
        </el-form-item>
      </el-form>

      <div class="data-section" v-if="flashVaultData">
        <p class="data-label">Health Factor</p>
        <p class="data-value">{{ flashVaultData.hf }}</p>
        <p class="data-label">Total Debt Value</p>
        <p class="data-value">{{ flashVaultData.debtValue }}</p>
        <p class="data-label">Collateral Alice</p>
        <p class="data-value">{{ flashVaultData.collateralAlice }}</p>
        <p class="data-label">Collateral Bob</p>
        <p class="data-value">{{ flashVaultData.collateralBob }}</p>
      </div>
    </CardItem>
  </div>
</template>

<script>
import { ElMessage } from "element-plus";
import CardItem from "@/components/CardItem.vue";
import lendingPoolAbi from "@/ABI/LendingPool.json" with { type: "json" };
import addressJson from "@/contracts/address.json" with { type: "json" };
import { web3 } from "@/contracts/wallet";
import { getOwnerDebtVaultIds, liquidate } from "@/contracts/lendingPool";
import { flashLiquidate } from "@/contracts/flashLoanBot";

export default {
  name: "Liquidation",
  components: {
    CardItem,
  },
  data() {
    return {
      direct: {
        debtVaultId: "",
        debtAsset: "Alice",
        collateralAsset: "Bob",
        amount: "",
        unit: "ether",
        submitting: false,
      },
      flash: {
        debtVaultId: "",
        debtAsset: "Alice",
        collateralAsset: "Bob",
        amount: "",
        unit: "ether",
        submitting: false,
      },
      debtVaultIds: [],
      vaultDataCache: {},
    };
  },
  computed: {
    directVaultData() {
      return this.vaultDataCache[this.direct.debtVaultId] || null;
    },
    flashVaultData() {
      return this.vaultDataCache[this.flash.debtVaultId] || null;
    },
  },
  async mounted() {
    await this.refreshDebtVaultIds();
  },
  methods: {
    async refreshDebtVaultIds() {
      try {
        const ids = await getOwnerDebtVaultIds();
        this.debtVaultIds = ids.map((id) => String(id));

        if (!this.direct.debtVaultId && this.debtVaultIds.length) {
          this.direct.debtVaultId = this.debtVaultIds[0];
        }
        if (!this.flash.debtVaultId && this.debtVaultIds.length) {
          this.flash.debtVaultId = this.debtVaultIds[0];
        }
      } catch (err) {
        ElMessage.error(this.getErrorMessage(err));
      }
    },

    async loadSelectedVaultData(section) {
      const debtVaultId =
        section === "direct" ? this.direct.debtVaultId : this.flash.debtVaultId;
      if (!debtVaultId) {
        ElMessage.warning("Please select a DebtVault ID first.");
        return;
      }
      await this.loadVaultData(debtVaultId);
    },

    async loadVaultData(debtVaultId) {
      try {
        const lendingPool = new web3.eth.Contract(
          lendingPoolAbi,
          addressJson.LendingPool,
        );
        const aliceAddr = addressJson.AliceToken;
        const bobAddr = addressJson.BobToken;

        const [summary, aliceCollateral, bobCollateral] = await Promise.all([
          lendingPool.methods.getDebtVaultSummary(debtVaultId).call(),
          lendingPool.methods
            .getDebtVaultCollateralAssetAmount(debtVaultId, aliceAddr)
            .call(),
          lendingPool.methods
            .getDebtVaultCollateralAssetAmount(debtVaultId, bobAddr)
            .call(),
        ]);

        this.vaultDataCache = {
          ...this.vaultDataCache,
          [debtVaultId]: {
            hf: web3.utils.fromWei(
              summary.hf || summary.healthFactor || "0",
              "ether",
            ),
            debtValue: web3.utils.fromWei(summary.debtValue || "0", "ether"),
            maxBorrowable: web3.utils.fromWei(
              summary.maxBorrowableValue || "0",
              "ether",
            ),
            collateralAlice: web3.utils.fromWei(
              aliceCollateral || "0",
              "ether",
            ),
            collateralBob: web3.utils.fromWei(bobCollateral || "0", "ether"),
          },
        };
      } catch (err) {
        console.error("Failed to load vault data:", err);
        ElMessage.error(this.getErrorMessage(err));
      }
    },

    async onDirectLiquidate() {
      if (this.direct.submitting) return;
      if (!this.direct.debtVaultId) {
        ElMessage.warning("DebtVault ID is required");
        return;
      }
      if (!this.direct.amount || Number(this.direct.amount) <= 0) {
        ElMessage.warning("Amount must be greater than 0");
        return;
      }

      this.direct.submitting = true;
      try {
        const result = await liquidate({
          debtVaultId: this.direct.debtVaultId,
          debtAsset: this.direct.debtAsset,
          collateralAsset: this.direct.collateralAsset,
          amount: this.direct.amount,
          unit: this.direct.unit,
        });

        ElMessage.success(`Direct liquidation success. Tx: ${result.txHash}`);
        await this.loadVaultData(this.direct.debtVaultId);
      } catch (err) {
        ElMessage.error(this.getErrorMessage(err));
      } finally {
        this.direct.submitting = false;
      }
    },

    async onFlashLiquidate() {
      if (this.flash.submitting) return;
      if (!this.flash.debtVaultId) {
        ElMessage.warning("DebtVault ID is required");
        return;
      }
      if (!this.flash.amount || Number(this.flash.amount) <= 0) {
        ElMessage.warning("Amount must be greater than 0");
        return;
      }

      this.flash.submitting = true;
      try {
        const result = await flashLiquidate({
          debtVaultId: this.flash.debtVaultId,
          debtAsset: this.flash.debtAsset,
          collateralAsset: this.flash.collateralAsset,
          amount: this.flash.amount,
          unit: this.flash.unit,
        });

        ElMessage.success(`Flash liquidation success. Tx: ${result.txHash}`);
        await this.loadVaultData(this.flash.debtVaultId);
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

      if (message.includes("insufficient collateral")) {
        return "❌ Insufficient collateral. Please deposit and collateralize first.";
      }
      if (message.includes("collateral disabled")) {
        return "❌ Asset not configured as collateral. Check contract settings.";
      }
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
}

.card-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: rgb(30, 30, 30);
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

.data-section {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid rgb(235, 235, 235);
}

.data-label {
  margin: 0 0 6px 0;
  font-size: 12px;
  color: rgb(90, 90, 90);
  font-weight: 500;
}

.data-value {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: rgb(30, 30, 30);
}

:deep(.el-select-dropdown__item.is-selected) {
  color: black !important;
}

:deep(.el-select-dropdown__item.is-selected span) {
  color: black !important;
}
</style>

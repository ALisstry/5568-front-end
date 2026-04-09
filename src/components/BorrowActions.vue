<template>
  <CardItem class="borrow-card">
    <div class="card-header">
      <h3 class="card-title">Borrowing Actions</h3>
    </div>

    <el-form class="action-form" label-position="right" label-width="120px">
      <el-form-item label="Action">
        <el-select
          v-model="action"
          class="full-width"
          style="
            --el-color-primary: black;
            --el-border-color-hover: gray;
            --el-text-color-primary: black;
          "
          popper-class="selectStyle"
        >
          <el-option
            label="Deposit Collateral"
            value="depositCollateral"
          ></el-option>
          <el-option label="Borrow" value="borrow"></el-option>
          <el-option label="Repay" value="repay"></el-option>
          <el-option
            label="Withdraw Collateral"
            value="withdrawCollateral"
          ></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="Coin">
        <el-select
          v-model="coin"
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

      <el-form-item label="DebtVault">
        <el-row style="width: 100%" :gutter="8">
          <el-col :span="14">
            <el-select
              v-model="debtVaultId"
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
              :loading="creatingVault"
              @click="createDebtVault"
              >Open</el-button
            >
          </el-col>
        </el-row>
      </el-form-item>

      <el-form-item label="Amount">
        <el-row style="width: 100%" :gutter="8">
          <el-col :span="15">
            <el-input
              v-model="value"
              placeholder="Input token amount"
              clearable
              style="--el-color-primary: black; --el-border-color-hover: gray"
            ></el-input>
          </el-col>
          <el-col :span="9">
            <el-select
              v-model="unit"
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
          :loading="submitting"
          @click="onSubmit"
          >{{ submitLabel }}</el-button
        >
      </el-form-item>
    </el-form>

    <!-- Data Display Section -->
    <div v-if="action === 'depositCollateral'" class="data-section">
      <p class="data-label">Available to Collateralize</p>
      <p class="data-value">{{ custodiedAmount }} {{ coin }}</p>
    </div>

    <div v-if="action === 'borrow' && selectedVaultData" class="data-section">
      <p class="data-label">Max Borrowable ({{ coin }})</p>
      <p class="data-value">{{ selectedVaultData.maxBorrowable }}</p>
    </div>

    <div v-if="action === 'repay' && selectedVaultData" class="data-section">
      <p class="data-label">Current Debt ({{ coin }})</p>
      <p class="data-value">{{ selectedVaultData.debt }}</p>
    </div>
  </CardItem>
</template>

<script>
import { ElMessage } from "element-plus";
import CardItem from "@/components/CardItem.vue";
import {
  borrow,
  depositCollateral,
  getOwnerDebtVaultIds,
  getUserCustodiedShares,
  openDebtVault,
  repay,
  withdrawCollateral,
} from "@/contracts/lendingPool";
import { resolveAssetAddress } from "@/contracts/erc20";
import { web3 } from "@/contracts/wallet";

export default {
  name: "BorrowActions",
  components: {
    CardItem,
  },
  data() {
    return {
      action: "depositCollateral",
      coin: "Alice",
      value: "",
      unit: "ether",
      debtVaultId: "",
      debtVaultIds: [],
      submitting: false,
      creatingVault: false,
      custodiedAlice: "0",
      custodiedBob: "0",
      vaultDataCache: {},
    };
  },
  computed: {
    submitLabel() {
      if (this.action === "depositCollateral") return "Deposit Collateral";
      if (this.action === "borrow") return "Borrow";
      if (this.action === "repay") return "Repay";
      return "Withdraw Collateral";
    },
    custodiedAmount() {
      const raw =
        this.coin === "Alice" ? this.custodiedAlice : this.custodiedBob;
      try {
        return web3.utils.fromWei(raw, "ether");
      } catch {
        return "0";
      }
    },
    selectedVaultData() {
      return this.vaultDataCache[this.debtVaultId];
    },
  },
  watch: {
    action() {
      // Refresh data when action changes
      if (this.debtVaultId) {
        this.loadVaultData();
      }
    },
    debtVaultId() {
      if (
        this.action === "borrow" ||
        this.action === "repay" ||
        this.action === "withdrawCollateral"
      ) {
        this.loadVaultData();
      }
    },
  },
  async mounted() {
    await this.refreshDebtVaultIds();
    await this.refreshCustodiedShares();
  },
  methods: {
    async refreshDebtVaultIds() {
      try {
        const ids = await getOwnerDebtVaultIds();
        this.debtVaultIds = ids.map((id) => String(id));

        if (!this.debtVaultId && this.debtVaultIds.length) {
          this.debtVaultId = this.debtVaultIds[0];
        }
      } catch (err) {
        ElMessage.error(this.getErrorMessage(err));
      }
    },

    async refreshCustodiedShares() {
      try {
        const aliceAddr = resolveAssetAddress("Alice");
        const bobAddr = resolveAssetAddress("Bob");

        const [aliceShares, bobShares] = await Promise.all([
          getUserCustodiedShares(undefined, aliceAddr),
          getUserCustodiedShares(undefined, bobAddr),
        ]);

        this.custodiedAlice = aliceShares;
        this.custodiedBob = bobShares;
      } catch (err) {
        console.error("Failed to refresh custodied shares:", err);
      }
    },

    async loadVaultData() {
      // This is a placeholder - in real implementation,
      // you'd fetch actual vault data from contract
      // For now, cache is empty but structure is ready
    },

    async createDebtVault() {
      this.creatingVault = true;
      try {
        const result = await openDebtVault();
        await this.refreshDebtVaultIds();
        this.debtVaultId = String(result.debtVaultId);
        ElMessage.success(`DebtVault #${result.debtVaultId} created`);
      } catch (err) {
        ElMessage.error(this.getErrorMessage(err));
      } finally {
        this.creatingVault = false;
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
      return message;
    },

    amountToWei(amount, unit) {
      try {
        return web3.utils.toWei(String(amount), unit);
      } catch {
        return "0";
      }
    },

    async onSubmit() {
      if (this.submitting) {
        return;
      }

      if (!this.value || Number(this.value) <= 0) {
        ElMessage.warning("Amount must be greater than 0");
        return;
      }

      if (!/^\d+$/.test(String(this.debtVaultId || "").trim())) {
        ElMessage.warning("DebtVault ID is required");
        return;
      }

      if (this.action === "depositCollateral") {
        const available =
          this.coin === "Alice" ? this.custodiedAlice : this.custodiedBob;
        const availableBigInt = BigInt(available || "0");
        const requestedWei = this.amountToWei(this.value, this.unit);
        const requestedBigInt = BigInt(requestedWei);

        if (requestedBigInt > availableBigInt) {
          ElMessage.warning(
            `Insufficient available assets. Requested: ${this.value} ${this.unit}, Available: ${available} wei`,
          );
          return;
        }
      }

      this.submitting = true;
      try {
        const payload = {
          asset: this.coin,
          amount: this.value,
          unit: this.unit,
          debtVaultId: this.debtVaultId,
        };

        let result;
        if (this.action === "depositCollateral") {
          result = await depositCollateral(payload);
        } else if (this.action === "borrow") {
          result = await borrow(payload);
        } else if (this.action === "repay") {
          result = await repay(payload);
        } else {
          result = await withdrawCollateral(payload);
        }

        const tip = result.approveTxHash
          ? `Approve: ${result.approveTxHash} | Tx: ${result.txHash}`
          : `Tx: ${result.txHash}`;

        ElMessage.success(`${this.submitLabel} success. ${tip}`);

        if (
          this.action === "depositCollateral" ||
          this.action === "withdrawCollateral"
        ) {
          await this.refreshCustodiedShares();
        }
      } catch (err) {
        ElMessage.error(this.getErrorMessage(err));
      } finally {
        this.submitting = false;
      }
    },
  },
};
</script>

<style scoped>
.borrow-card {
  width: 100%;
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

.operation-tip {
  margin-top: 12px;
  padding: 8px 10px;
  background: rgb(230, 245, 255);
  border-left: 3px solid rgb(66, 133, 244);
  border-radius: 2px;
  font-size: 12px;
  color: rgb(30, 80, 140);
  line-height: 1.4;
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
  margin: 0;
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

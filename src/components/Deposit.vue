<template>
  <div>
    <h3 class="title">Lending Actions</h3>

    <el-form class="action-form" label-position="right" label-width="90px">
      <el-form-item label="Action">
        <el-select
          v-model="action"
          class="full-width"
          style="--el-color-primary: black; --el-border-color-hover: gray"
        >
          <el-option label="Deposit" value="deposit"></el-option>
          <el-option label="Withdraw" value="withdraw"></el-option>
          <el-option label="Borrow" value="borrow"></el-option>
          <el-option label="Repay" value="repay"></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="Coin">
        <el-select
          v-model="coin"
          class="full-width"
          style="--el-color-primary: black; --el-border-color-hover: gray"
        >
          <el-option label="Alice" value="Alice"></el-option>
          <el-option label="Bob" value="Bob"></el-option>
        </el-select>
      </el-form-item>

      <el-form-item v-if="needsDebtVault" label="DebtVault">
        <el-row style="width: 100%" :gutter="8">
          <el-col :span="14">
            <el-select
              v-model="debtVaultId"
              filterable
              allow-create
              default-first-option
              class="full-width"
              placeholder="Select or input DebtVault ID"
              style="--el-color-primary: black; --el-border-color-hover: gray"
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
              style="--el-color-primary: black; --el-border-color-hover: gray"
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
  </div>
</template>

<script>
import { ElMessage } from "element-plus";
import {
  borrow,
  deposit,
  getOwnerDebtVaultIds,
  openDebtVault,
  repay,
  withdraw,
} from "@/contracts/lendingPool";

export default {
  name: "Deposit",
  data() {
    return {
      action: "deposit",
      coin: "Alice",
      value: "",
      unit: "ether",
      debtVaultId: "",
      debtVaultIds: [],
      submitting: false,
      creatingVault: false,
    };
  },
  computed: {
    needsDebtVault() {
      return this.action === "borrow" || this.action === "repay";
    },
    submitLabel() {
      if (this.action === "deposit") return "Deposit";
      if (this.action === "withdraw") return "Withdraw";
      if (this.action === "borrow") return "Borrow";
      return "Repay";
    },
  },
  watch: {
    action() {
      if (!this.needsDebtVault) {
        this.debtVaultId = "";
      } else if (!this.debtVaultId && this.debtVaultIds.length) {
        this.debtVaultId = String(this.debtVaultIds[0]);
      }
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

        if (this.needsDebtVault && !this.debtVaultId && this.debtVaultIds.length) {
          this.debtVaultId = this.debtVaultIds[0];
        }
      } catch (err) {
        ElMessage.error(this.getErrorMessage(err));
      }
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
      return (
        err?.cause?.message ||
        err?.data?.message ||
        err?.message ||
        String(err) ||
        "Transaction failed"
      );
    },

    async onSubmit() {
      if (this.submitting) {
        return;
      }

      if (!this.value || Number(this.value) <= 0) {
        ElMessage.warning("Amount must be greater than 0");
        return;
      }

      if (this.needsDebtVault && !/^\d+$/.test(String(this.debtVaultId || "").trim())) {
        ElMessage.warning("DebtVault ID is required");
        return;
      }

      this.submitting = true;
      try {
        const payload = {
          asset: this.coin,
          amount: this.value,
          unit: this.unit,
        };

        let result;
        if (this.action === "deposit") {
          result = await deposit(payload);
        } else if (this.action === "withdraw") {
          result = await withdraw(payload);
        } else if (this.action === "borrow") {
          result = await borrow({
            ...payload,
            debtVaultId: this.debtVaultId,
          });
        } else {
          result = await repay({
            ...payload,
            debtVaultId: this.debtVaultId,
          });
        }

        const tip = result.approveTxHash
          ? `Approve: ${result.approveTxHash} | Tx: ${result.txHash}`
          : `Tx: ${result.txHash}`;

        ElMessage.success(`${this.submitLabel} success. ${tip}`);
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
.title {
  display: inline-block;
  border-bottom: 1px solid gray;
  margin-bottom: 10px;
}

.action-form {
  width: min(620px, 100%);
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
</style>

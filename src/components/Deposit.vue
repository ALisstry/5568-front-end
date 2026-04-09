<template>
  <CardItem class="deposit-card">
    <div class="card-header">
      <h3 class="card-title">Deposit & Withdraw</h3>
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
          <el-option label="Deposit" value="deposit"></el-option>
          <el-option label="Withdraw" value="withdraw"></el-option>
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
    <div v-if="action === 'withdraw'" class="data-section">
      <p class="data-label">Available (Pool Custody)</p>
      <p class="data-value">{{ custodiedAmount }} {{ coin }}</p>
    </div>
  </CardItem>
</template>

<script>
import { ElMessage } from "element-plus";
import CardItem from "@/components/CardItem.vue";
import {
  deposit,
  getUserCustodiedShares,
  withdraw,
} from "@/contracts/lendingPool";
import { resolveAssetAddress } from "@/contracts/erc20";
import { web3 } from "@/contracts/wallet";

export default {
  name: "DepositActions",
  components: {
    CardItem,
  },
  data() {
    return {
      action: "deposit",
      coin: "Alice",
      value: "",
      unit: "ether",
      submitting: false,
      custodiedAlice: "0",
      custodiedBob: "0",
    };
  },
  computed: {
    submitLabel() {
      return this.action === "deposit" ? "Deposit" : "Withdraw";
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
  },
  watch: {
    action() {
      // No debtVault needed for simple deposit/withdraw
    },
  },
  async mounted() {
    await this.refreshCustodiedShares();
  },
  methods: {
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

    amountToWei(amount, unit) {
      try {
        return web3.utils.toWei(String(amount), unit);
      } catch {
        return "0";
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
      return message;
    },

    async onSubmit() {
      if (this.submitting) {
        return;
      }

      if (!this.value || Number(this.value) <= 0) {
        ElMessage.warning("Amount must be greater than 0");
        return;
      }

      if (this.action === "withdraw") {
        const available =
          this.coin === "Alice" ? this.custodiedAlice : this.custodiedBob;
        const availableBigInt = BigInt(available || "0");
        const requestedWei = this.amountToWei(this.value, this.unit);
        const requestedBigInt = BigInt(requestedWei);

        if (requestedBigInt > availableBigInt) {
          ElMessage.warning(
            `Insufficient available assets. Requested: ${this.value} ${this.unit}, Available: ${this.custodiedAmount} ${this.coin}`,
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
        };

        let result;
        if (this.action === "deposit") {
          result = await deposit(payload);
        } else {
          result = await withdraw(payload);
        }

        const tip = result.approveTxHash
          ? `Approve: ${result.approveTxHash} | Tx: ${result.txHash}`
          : `Tx: ${result.txHash}`;

        ElMessage.success(`${this.submitLabel} success. ${tip}`);

        await this.refreshCustodiedShares();
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
.deposit-card {
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
</style>

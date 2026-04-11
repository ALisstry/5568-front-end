<template>
  <div class="actions-grid">
    <CardItem class="action-card">
      <div class="card-header">
        <h3 class="card-title">Deposit</h3>
      </div>

      <el-form class="action-form" label-position="right" label-width="120px">
        <el-form-item label="Coin">
          <el-select
            v-model="depositForm.coin"
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
                v-model="depositForm.value"
                placeholder="Input token amount"
                clearable
                style="--el-color-primary: black; --el-border-color-hover: gray"
              ></el-input>
            </el-col>
            <el-col :span="9">
              <el-select
                v-model="depositForm.unit"
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
            :loading="depositForm.submitting"
            @click="onDeposit"
            >Deposit</el-button
          >
        </el-form-item>
      </el-form>

      <div class="data-section">
        <p class="data-label">Balance Available</p>
        <p class="data-value">{{ selectedBalance(depositForm.coin) }} {{ depositForm.coin }}</p>
      </div>
    </CardItem>

    <CardItem class="action-card">
      <div class="card-header">
        <h3 class="card-title">Withdraw</h3>
      </div>

      <el-form class="action-form" label-position="right" label-width="120px">
        <el-form-item label="Coin">
          <el-select
            v-model="withdrawForm.coin"
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
                v-model="withdrawForm.value"
                placeholder="Input token amount"
                clearable
                style="--el-color-primary: black; --el-border-color-hover: gray"
              ></el-input>
            </el-col>
            <el-col :span="9">
              <el-select
                v-model="withdrawForm.unit"
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
            :loading="withdrawForm.submitting"
            @click="onWithdraw"
            >Withdraw</el-button
          >
        </el-form-item>
      </el-form>

      <div class="data-section">
        <p class="data-label">Available (Pool Custody)</p>
        <p class="data-value">
          {{ selectedCustodied(withdrawForm.coin) }} {{ withdrawForm.coin }}
        </p>
      </div>
    </CardItem>
  </div>
</template>

<script>
import { ElMessage } from "element-plus";
import CardItem from "@/components/CardItem.vue";
import erc20Abi from "../ABI/AliceToken.json" with { type: "json" };
import addressJson from "@/contracts/address.json" with { type: "json" };
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
      depositForm: {
        coin: "Alice",
        value: "",
        unit: "ether",
        submitting: false,
      },
      withdrawForm: {
        coin: "Alice",
        value: "",
        unit: "ether",
        submitting: false,
      },
      custodiedAlice: "0",
      custodiedBob: "0",
      balanceAlice: "0",
      balanceBob: "0",
    };
  },
  async mounted() {
    await this.refreshCustodiedShares();
    await this.refreshBalance();
  },
  methods: {
    selectedCustodied(coin) {
      const raw = coin === "Alice" ? this.custodiedAlice : this.custodiedBob;
      try {
        return web3.utils.fromWei(raw, "ether");
      } catch {
        return "0";
      }
    },

    selectedBalance(coin) {
      const raw = coin === "Alice" ? this.balanceAlice : this.balanceBob;
      try {
        return web3.utils.fromWei(raw, "ether");
      } catch {
        return "0";
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

    async refreshBalance() {
      try {
        const accounts = await web3.eth.getAccounts();
        if (!accounts || accounts.length === 0) return;

        const aliceToken = new web3.eth.Contract(
          erc20Abi,
          addressJson.AliceToken
        );
        const bobToken = new web3.eth.Contract(
          erc20Abi,
          addressJson.BobToken
        );

        const [aliceBalance, bobBalance] = await Promise.all([
          aliceToken.methods.balanceOf(accounts[0]).call(),
          bobToken.methods.balanceOf(accounts[0]).call(),
        ]);

        this.balanceAlice = String(aliceBalance);
        this.balanceBob = String(bobBalance);
      } catch (err) {
        console.error("Failed to refresh balance:", err);
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

    async onDeposit() {
      const form = this.depositForm;
      if (form.submitting) {
        return;
      }

      if (!form.value || Number(form.value) <= 0) {
        ElMessage.warning("Amount must be greater than 0");
        return;
      }

      form.submitting = true;
      try {
        const result = await deposit({
          asset: form.coin,
          amount: form.value,
          unit: form.unit,
        });

        const tip = result.approveTxHash
          ? `Approve: ${result.approveTxHash} | Tx: ${result.txHash}`
          : `Tx: ${result.txHash}`;

        ElMessage.success(`Deposit success. ${tip}`);

        await this.refreshCustodiedShares();
        await this.refreshBalance();
      } catch (err) {
        ElMessage.error(this.getErrorMessage(err));
      } finally {
        form.submitting = false;
      }
    },

    async onWithdraw() {
      const form = this.withdrawForm;
      if (form.submitting) {
        return;
      }

      if (!form.value || Number(form.value) <= 0) {
        ElMessage.warning("Amount must be greater than 0");
        return;
      }

      const available =
        form.coin === "Alice" ? this.custodiedAlice : this.custodiedBob;
      const requestedWei = this.amountToWei(form.value, form.unit);
      if (BigInt(requestedWei) > BigInt(available || "0")) {
        ElMessage.warning(
          `Insufficient available assets. Available: ${this.selectedCustodied(form.coin)} ${form.coin}`,
        );
        return;
      }

      form.submitting = true;
      try {
        const result = await withdraw({
          asset: form.coin,
          amount: form.value,
          unit: form.unit,
        });

        ElMessage.success(`Withdraw success. Tx: ${result.txHash}`);

        await this.refreshCustodiedShares();
        await this.refreshBalance();
      } catch (err) {
        ElMessage.error(this.getErrorMessage(err));
      } finally {
        form.submitting = false;
      }
    },
  },
};
</script>

<style scoped>
.actions-grid {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 20px;
}

.action-card {
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

.submit-btn {
  background-color: transparent;
  color: black;
  border-color: rgb(200, 200, 200);
}

.submit-btn:hover {
  background-color: transparent;
  border-color: black;
  color: black;
}

.submit-btn:active {
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
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: rgb(30, 30, 30);
}
</style>

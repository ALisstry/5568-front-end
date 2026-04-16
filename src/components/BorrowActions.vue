<template>
  <CardItem class="vault-card">
    <div class="card-header">
      <h3 class="card-title">DebtVault</h3>
    </div>

    <el-form class="action-form" label-position="right" label-width="120px">
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
    </el-form>

    <div class="vault-info-section" v-if="selectedVaultData">
      <div class="vault-summary">
        <div class="summary-item">
          <p class="summary-label">Max Borrowable</p>
          <p class="summary-value">${{ remainingBorrowable() }}</p>
        </div>
        <div class="summary-item">
          <p class="summary-label">Debt Value</p>
          <p class="summary-value">
            ${{ formatWei(selectedVaultData.debtValueRaw) }}
          </p>
        </div>
      </div>

      <div class="assets-container">
        <div class="assets-column collateral-column">
          <h4 class="column-title">Collateral</h4>
          <div
            v-if="
              selectedVaultData.collateralAssets &&
              selectedVaultData.collateralAssets.length > 0
            "
            class="assets-list"
          >
            <div
              v-for="asset in selectedVaultData.collateralAssets"
              :key="asset.address"
              class="asset-row"
            >
              <div class="asset-name">{{ asset.name }}</div>
              <div class="asset-amount">{{ asset.formattedAmount }}</div>
              <div class="asset-value">${{ asset.formattedValue }}</div>
            </div>
          </div>
          <div v-else class="no-assets">No collateral</div>
        </div>

        <div class="assets-column borrowed-column">
          <h4 class="column-title">Borrowed</h4>
          <div
            v-if="
              selectedVaultData.borrowedAssets &&
              selectedVaultData.borrowedAssets.length > 0
            "
            class="assets-list"
          >
            <div
              v-for="asset in selectedVaultData.borrowedAssets"
              :key="asset.address"
              class="asset-row"
            >
              <div class="asset-name">{{ asset.name }}</div>
              <div class="asset-amount">{{ asset.formattedAmount }}</div>
              <div class="asset-value">${{ asset.formattedValue }}</div>
            </div>
          </div>
          <div v-else class="no-assets">No borrowing</div>
        </div>
      </div>
    </div>
  </CardItem>
  <div class="actions-grid">
    <CardItem class="action-card">
      <div class="card-header">
        <h3 class="card-title">Deposit Collateral</h3>
      </div>

      <el-form class="action-form" label-position="right" label-width="120px">
        <el-form-item label="Coin">
          <el-select
            v-model="depositCollateralForm.coin"
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
                v-model="depositCollateralForm.value"
                placeholder="Input token amount"
                clearable
                style="--el-color-primary: black; --el-border-color-hover: gray"
              ></el-input>
            </el-col>
            <el-col :span="9">
              <el-select
                v-model="depositCollateralForm.unit"
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
            :loading="depositCollateralForm.submitting"
            @click="onDepositCollateral"
            >Deposit Collateral</el-button
          >
        </el-form-item>
      </el-form>

      <div class="data-section">
        <p class="data-label">Available to Collateralize</p>
        <p class="data-value">
          {{ selectedCustodied(depositCollateralForm.coin) }}
          {{ depositCollateralForm.coin }}
        </p>
      </div>
    </CardItem>

    <CardItem class="action-card">
      <div class="card-header">
        <h3 class="card-title">Borrow</h3>
      </div>

      <el-form class="action-form" label-position="right" label-width="120px">
        <el-form-item label="Coin">
          <el-select
            v-model="borrowForm.coin"
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
                v-model="borrowForm.value"
                placeholder="Input token amount"
                clearable
                style="--el-color-primary: black; --el-border-color-hover: gray"
              ></el-input>
            </el-col>
            <el-col :span="9">
              <el-select
                v-model="borrowForm.unit"
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
            :loading="borrowForm.submitting"
            @click="onBorrow"
            >Borrow</el-button
          >
        </el-form-item>
      </el-form>

      <div class="data-section">
        <p class="data-label">Max Borrowable</p>
        <p class="data-value">{{ remainingBorrowable() }}</p>
      </div>
    </CardItem>

    <CardItem class="action-card">
      <div class="card-header">
        <h3 class="card-title">Repay</h3>
      </div>

      <el-form class="action-form" label-position="right" label-width="120px">
        <el-form-item label="Coin">
          <el-select
            v-model="repayForm.coin"
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
                v-model="repayForm.value"
                placeholder="Input token amount"
                clearable
                style="--el-color-primary: black; --el-border-color-hover: gray"
              ></el-input>
            </el-col>
            <el-col :span="9">
              <el-select
                v-model="repayForm.unit"
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
            :loading="repayForm.submitting"
            @click="onRepay"
            >Repay</el-button
          >
        </el-form-item>
      </el-form>

      <div class="data-section">
        <p class="data-label">Current Debt ({{ repayForm.coin }})</p>
        <p class="data-value">
          {{ selectedDebt(repayForm.coin) }} {{ repayForm.coin }}
        </p>
      </div>
    </CardItem>

    <CardItem class="action-card">
      <div class="card-header">
        <h3 class="card-title">Withdraw Collateral</h3>
      </div>

      <el-form class="action-form" label-position="right" label-width="120px">
        <el-form-item label="Coin">
          <el-select
            v-model="withdrawCollateralForm.coin"
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
                v-model="withdrawCollateralForm.value"
                placeholder="Input token amount"
                clearable
                style="--el-color-primary: black; --el-border-color-hover: gray"
              ></el-input>
            </el-col>
            <el-col :span="9">
              <el-select
                v-model="withdrawCollateralForm.unit"
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
            :loading="withdrawCollateralForm.submitting"
            @click="onWithdrawCollateral"
            >Withdraw Collateral</el-button
          >
        </el-form-item>
      </el-form>

      <div class="data-section">
        <p class="data-label">Available to Withdraw</p>
        <p class="data-value">
          {{ selectedVaultCollateral(withdrawCollateralForm.coin) }}
          {{ withdrawCollateralForm.coin }}
        </p>
      </div>
    </CardItem>
  </div>
</template>

<script>
import { ElMessage } from "element-plus";
import CardItem from "@/components/CardItem.vue";
import lendingPoolAbi from "../ABI/LendingPool.json" with { type: "json" };
import oracleAbi from "../ABI/SimpleOracle.json" with { type: "json" };
import addressJson from "@/contracts/address.json" with { type: "json" };
import {
  borrow,
  depositCollateral,
  getUserCustodiedAssetAmount,
  getOwnerDebtVaultIds,
  getUserDebtBalance,
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
      debtVaultId: "",
      debtVaultIds: [],
      creatingVault: false,
      depositCollateralForm: {
        coin: "Alice",
        value: "",
        unit: "ether",
        submitting: false,
      },
      borrowForm: {
        coin: "Alice",
        value: "",
        unit: "ether",
        submitting: false,
      },
      repayForm: {
        coin: "Alice",
        value: "",
        unit: "ether",
        submitting: false,
      },
      withdrawCollateralForm: {
        coin: "Alice",
        value: "",
        unit: "ether",
        submitting: false,
      },
      custodiedAlice: "0",
      custodiedBob: "0",
      debtAlice: "0",
      debtBob: "0",
      vaultDataCache: {},
      assetNameMap: {},
      oracleAddress: "",
    };
  },
  computed: {
    selectedVaultData() {
      return this.vaultDataCache[this.debtVaultId] || null;
    },
  },
  watch: {
    debtVaultId() {
      if (this.debtVaultId) {
        this.loadVaultData();
      }
    },
  },
  async mounted() {
    await this.refreshDebtVaultIds();
    await this.refreshCustodiedShares();
    await this.refreshDebtBalance();
  },
  methods: {
    getAssetName(address) {
      if (!address) return "Unknown";
      const lowerAddr = address.toLowerCase();
      if (lowerAddr === addressJson.AliceToken.toLowerCase()) return "Alice";
      if (lowerAddr === addressJson.BobToken.toLowerCase()) return "Bob";
      return "Unknown";
    },

    formatWei(raw) {
      try {
        const num = parseFloat(web3.utils.fromWei(String(raw || "0"), "ether"));
        return num.toFixed(2); // 修改value显示为两位小数
      } catch {
        return "0.00";
      }
    },

    // 添加缺失的 formatWeiWithDecimals 方法
    formatWeiWithDecimals(raw, decimals) {
      try {
        const num = parseFloat(web3.utils.fromWei(String(raw || "0"), "ether"));
        return num.toFixed(decimals);
      } catch {
        return "0.000";
      }
    },

    selectedCustodied(coin) {
      const raw = coin === "Alice" ? this.custodiedAlice : this.custodiedBob;
      return this.formatWei(raw);
    },

    remainingBorrowableRaw() {
      if (!this.selectedVaultData) return "0";
      try {
        const max = BigInt(this.selectedVaultData.maxBorrowableRaw || "0");
        const debt = BigInt(this.selectedVaultData.debtValueRaw || "0");
        if (max <= debt) return "0";
        return (max - debt).toString();
      } catch {
        return "0";
      }
    },

    remainingBorrowable() {
      return this.formatWei(this.remainingBorrowableRaw());
    },

    selectedDebt(coin) {
      const raw = coin === "Alice" ? this.debtAlice : this.debtBob;
      return this.formatWei(raw);
    },

    selectedVaultCollateralRaw(coin) {
      if (!this.selectedVaultData) return "0";
      return coin === "Alice"
        ? this.selectedVaultData.collateralAliceRaw
        : this.selectedVaultData.collateralBobRaw;
    },

    selectedVaultCollateral(coin) {
      return this.formatWei(this.selectedVaultCollateralRaw(coin));
    },

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
          getUserCustodiedAssetAmount(undefined, aliceAddr),
          getUserCustodiedAssetAmount(undefined, bobAddr),
        ]);

        this.custodiedAlice = aliceShares;
        this.custodiedBob = bobShares;
      } catch (err) {
        console.error("Failed to refresh custodied shares:", err);
      }
    },

    async refreshDebtBalance() {
      try {
        const aliceAddr = resolveAssetAddress("Alice");
        const bobAddr = resolveAssetAddress("Bob");

        const [aliceDebt, bobDebt] = await Promise.all([
          getUserDebtBalance(undefined, aliceAddr),
          getUserDebtBalance(undefined, bobAddr),
        ]);

        this.debtAlice = aliceDebt;
        this.debtBob = bobDebt;
      } catch (err) {
        console.error("Failed to refresh debt balance:", err);
      }
    },

    async loadVaultData() {
      if (!this.debtVaultId) return;

      try {
        const lendingPool = new web3.eth.Contract(
          lendingPoolAbi,
          addressJson.LendingPool,
        );

        const [
          summary,
          collateralAssetAddresses,
          borrowedAssetAddresses,
          oracleAddr,
        ] = await Promise.all([
          lendingPool.methods.getDebtVaultSummary(this.debtVaultId).call(),
          lendingPool.methods
            .getDebtVaultCollateralAssets(this.debtVaultId)
            .call(),
          lendingPool.methods
            .getDebtVaultBorrowedAssets(this.debtVaultId)
            .call(),
          lendingPool.methods.oracle().call(),
        ]);

        this.oracleAddress = oracleAddr;

        // 获取 collateral 资产信息
        const collateralAssets = [];
        for (const assetAddr of collateralAssetAddresses) {
          try {
            const amount = await lendingPool.methods
              .getDebtVaultCollateralAssetAmount(this.debtVaultId, assetAddr)
              .call();

            const oracle = new web3.eth.Contract(oracleAbi, oracleAddr);
            const price = await oracle.methods.getPrice(assetAddr).call();

            collateralAssets.push({
              address: assetAddr,
              name: this.getAssetName(assetAddr),
              rawAmount: String(amount || "0"),
              formattedAmount: this.formatWei(String(amount || "0")),
              rawPrice: String(price || "0"),
              formattedPrice: this.formatWei(String(price || "0")),
              rawValue: String(
                (BigInt(amount || "0") * BigInt(price || "0")) /
                  BigInt(10 ** 18),
              ),
              formattedValue: this.formatWei(
                String(
                  (BigInt(amount || "0") * BigInt(price || "0")) /
                    BigInt(10 ** 18),
                ),
              ),
            });
          } catch (err) {
            console.error("Failed to load collateral asset info:", err);
          }
        }

        // 获取 borrowed 资产信息
        const borrowedAssets = [];
        for (const assetAddr of borrowedAssetAddresses) {
          try {
            const amount = await lendingPool.methods
              .getDebtVaultDebtAmount(this.debtVaultId, assetAddr)
              .call();

            const oracle = new web3.eth.Contract(oracleAbi, oracleAddr);
            const price = await oracle.methods.getPrice(assetAddr).call();

            borrowedAssets.push({
              address: assetAddr,
              name: this.getAssetName(assetAddr),
              rawAmount: String(amount || "0"),
              formattedAmount: this.formatWei(String(amount || "0")),
              rawPrice: String(price || "0"),
              formattedPrice: this.formatWei(String(price || "0")),
              rawValue: String(
                (BigInt(amount || "0") * BigInt(price || "0")) /
                  BigInt(10 ** 18),
              ),
              formattedValue: this.formatWei(
                String(
                  (BigInt(amount || "0") * BigInt(price || "0")) /
                    BigInt(10 ** 18),
                ),
              ),
            });
          } catch (err) {
            console.error("Failed to load borrowed asset info:", err);
          }
        }

        this.vaultDataCache[this.debtVaultId] = {
          maxBorrowableRaw: String(summary.maxBorrowableValue || "0"),
          debtValueRaw: String(summary.debtValue || "0"),
          collateralAliceRaw: "0",
          collateralBobRaw: "0",
          collateralAssets,
          borrowedAssets,
        };
      } catch (err) {
        console.error("Failed to load vault data:", err);
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

    validateCommonForm(form) {
      if (!/^\d+$/.test(String(this.debtVaultId || "").trim())) {
        ElMessage.warning("DebtVault ID is required");
        return false;
      }

      if (!form.value || Number(form.value) <= 0) {
        ElMessage.warning("Amount must be greater than 0");
        return false;
      }

      return true;
    },

    async onDepositCollateral() {
      const form = this.depositCollateralForm;
      if (form.submitting || !this.validateCommonForm(form)) {
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
        const result = await depositCollateral({
          debtVaultId: this.debtVaultId,
          asset: form.coin,
          amount: form.value,
          unit: form.unit,
        });

        ElMessage.success(`Deposit Collateral success. Tx: ${result.txHash}`);
        await this.refreshCustodiedShares();
        await this.loadVaultData();
      } catch (err) {
        ElMessage.error(this.getErrorMessage(err));
      } finally {
        form.submitting = false;
      }
    },

    async onBorrow() {
      const form = this.borrowForm;
      if (form.submitting || !this.validateCommonForm(form)) {
        return;
      }

      const requestedWei = this.amountToWei(form.value, form.unit);
      const availableBorrowable = this.remainingBorrowableRaw();
      if (BigInt(requestedWei) > BigInt(availableBorrowable || "0")) {
        ElMessage.warning(
          `Borrow amount exceeds remaining borrowable. Remaining: ${this.remainingBorrowable()}`,
        );
        return;
      }

      form.submitting = true;
      try {
        const result = await borrow({
          debtVaultId: this.debtVaultId,
          asset: form.coin,
          amount: form.value,
          unit: form.unit,
        });

        ElMessage.success(`Borrow success. Tx: ${result.txHash}`);
        await this.refreshDebtBalance();
        await this.loadVaultData();
      } catch (err) {
        ElMessage.error(this.getErrorMessage(err));
      } finally {
        form.submitting = false;
      }
    },

    async onRepay() {
      const form = this.repayForm;
      if (form.submitting || !this.validateCommonForm(form)) {
        return;
      }

      const currentDebtRaw =
        form.coin === "Alice" ? this.debtAlice : this.debtBob;
      const requestedWei = this.amountToWei(form.value, form.unit);
      if (
        BigInt(currentDebtRaw || "0") > 0n &&
        BigInt(requestedWei) > BigInt(currentDebtRaw)
      ) {
        ElMessage.warning(
          `Repay amount exceeds current debt. Current debt: ${this.selectedDebt(form.coin)} ${form.coin}`,
        );
        return;
      }

      form.submitting = true;
      try {
        const result = await repay({
          debtVaultId: this.debtVaultId,
          asset: form.coin,
          amount: form.value,
          unit: form.unit,
        });

        const tip = result.approveTxHash
          ? `Approve: ${result.approveTxHash} | Tx: ${result.txHash}`
          : `Tx: ${result.txHash}`;

        ElMessage.success(`Repay success. ${tip}`);
        await this.refreshDebtBalance();
        await this.loadVaultData();
      } catch (err) {
        ElMessage.error(this.getErrorMessage(err));
      } finally {
        form.submitting = false;
      }
    },

    async onWithdrawCollateral() {
      const form = this.withdrawCollateralForm;
      if (form.submitting || !this.validateCommonForm(form)) {
        return;
      }

      const availableRaw = this.selectedVaultCollateralRaw(form.coin);
      const requestedWei = this.amountToWei(form.value, form.unit);
      if (BigInt(requestedWei) > BigInt(availableRaw || "0")) {
        ElMessage.warning(
          `Insufficient collateral. Available: ${this.selectedVaultCollateral(form.coin)} ${form.coin}`,
        );
        return;
      }

      form.submitting = true;
      try {
        const result = await withdrawCollateral({
          debtVaultId: this.debtVaultId,
          asset: form.coin,
          amount: form.value,
          unit: form.unit,
        });

        ElMessage.success(`Withdraw Collateral success. Tx: ${result.txHash}`);
        await this.refreshCustodiedShares();
        await this.loadVaultData();
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
  gap: 30px;
  margin-top: 10px;
}

.vault-card,
.action-card {
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
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 16px;
}

.data-item {
  display: flex;
  flex-direction: column;
}

.vault-info-section {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid rgb(235, 235, 235);
}

.vault-summary {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

.summary-item {
  display: flex;
  flex-direction: column;
}

.summary-label {
  margin: 0 0 6px 0;
  font-size: 12px;
  color: rgb(90, 90, 90);
  font-weight: 500;
}

.summary-value {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: rgb(30, 30, 30);
}

.assets-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-top: 16px;
}

.assets-column {
  display: flex;
  flex-direction: column;
}

.column-title {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: rgb(30, 30, 30);
  padding-bottom: 8px;
  border-bottom: 2px solid rgb(235, 235, 235);
}

.assets-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.asset-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
  padding: 8px;
  background-color: rgb(250, 250, 250);
  border-radius: 4px;
  align-items: center;
}

.asset-name {
  font-size: 13px;
  font-weight: 600;
  color: rgb(30, 30, 30);
}

.asset-amount {
  font-size: 12px;
  color: rgb(60, 60, 60);
  text-align: center;
}

.asset-value {
  font-size: 12px;
  color: rgb(90, 90, 90);
  text-align: right;
}

.no-assets {
  font-size: 12px;
  color: rgb(150, 150, 150);
  padding: 12px;
  text-align: center;
  background-color: rgb(250, 250, 250);
  border-radius: 4px;
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

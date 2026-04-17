<template>
  <p>{{ balance }}</p>
  <el-button @click="getBalance1">getBalance</el-button>
  <el-button @click="transferTest1">transferTest</el-button>
  <el-button @click="getAccountInfo1">getAccountInfo</el-button>
  <el-button @click="deposit1">deposit</el-button>
  <CardItem>
    <el-form
      style="display: flex; justify-content: space-between; align-items: center"
    >
      <el-input
        v-model="aliceApproveAmount"
        style="flex: 1; margin-right: 10px"
      ></el-input>
      <el-button @click="aliceApprove1">aliceApprove</el-button>
    </el-form>
  </CardItem>

  <el-button @click="alicebalanceOf1">alicebalanceOf</el-button>
  <el-button @click="aliceAllowance">aliceAllowance</el-button>
  <el-divider />
  <el-button @click="withdraw_T">withdraw</el-button>
  <el-divider />
  <CardItem>
    <div style="display: grid; gap: 12px">
      <div style="display: flex; gap: 8px; align-items: center">
        <el-input
          v-model="alicePrice"
          placeholder="Alice price"
          style="flex: 1"
        />
        <el-select
          v-model="alicePriceUnit"
          placeholder="Unit"
          style="width: 110px"
        >
          <el-option label="Ether" value="ether" />
          <el-option label="Finney" value="finney" />
          <el-option label="Szabo" value="szabo" />
          <el-option label="Gwei" value="gwei" />
          <el-option label="Wei" value="wei" />
        </el-select>
        <el-button type="primary" @click="setAlicePrice1">Set Alice</el-button>
      </div>
      <div style="display: flex; gap: 8px; align-items: center">
        <el-input v-model="bobPrice" placeholder="Bob price" style="flex: 1" />
        <el-select
          v-model="bobPriceUnit"
          placeholder="Unit"
          style="width: 110px"
        >
          <el-option label="Ether" value="ether" />
          <el-option label="Finney" value="finney" />
          <el-option label="Szabo" value="szabo" />
          <el-option label="Gwei" value="gwei" />
          <el-option label="Wei" value="wei" />
        </el-select>
        <el-button type="primary" @click="setBobPrice1">Set Bob</el-button>
      </div>
    </div>
  </CardItem>
  <el-divider />
  <el-button @click="getAlicePrice1">getAlicePrice</el-button>
  <el-divider />
  <el-button @click="getBobPrice1">getBobPrice</el-button>
  <el-divider />
  <el-button @click="getHealthFactor1">getHealthFactor</el-button>
  <el-divider />
  <el-button @click="getDebtVaultCollateralAssets1"
    >getDebtVaultCollateralAssets</el-button
  >
  <el-divider />
  <el-button @click="getPoolCoinbalance1">getPoolCoinbalance</el-button>
  <el-button @click="getUnclaimedRewards1">getUnclaimedRewards</el-button>
  <el-button @click="claimPoolCoin1">claimPoolCoin</el-button>
  <el-button @click="getFlashLoanAsset1">getFlashLoanAsset</el-button>
</template>

<script>
import {
  transferTest,
  getBalance,
  getAccountInfo,
  deposit,
  withdraw,
  getHealthFactor,
  getDebtVaultCollateralAssets,
} from "@/contracts/lendingPool";

import {
  approve as alice_Approve,
  balanceOf as alice_balanceOf,
  allowance as alice_allowance,
} from "@/contracts/aliceToken";
import Web3 from "web3";
import { ElMessage } from "element-plus";
import { getBobPrice, getAlicePrice, setPrice } from "@/contracts/oracle";
import { getPoolCoinbalance } from "@/contracts/poolCoin";
import {
  claimPoolCoin,
  getUnclaimedRewards,
} from "@/contracts/poolIncentivesController";

import { getBalance as getFlashLoanAsset } from "@/contracts/flashLoanPool";

import CardItem from "@/components/CardItem.vue";
export default {
  name: "Test",
  data() {
    return {
      balance: 0,
      aliceApproveAmount: 0,
      alicePrice: "1",
      bobPrice: "1",
      alicePriceUnit: "ether",
      bobPriceUnit: "ether",
    };
  },
  methods: {
    async transferTest1() {
      try {
        await transferTest();
        console.log("Transfer completed successfully");
      } catch (error) {
        console.error("Transfer failed:", error);
      }
    },
    async getBalance1() {
      this.balance = await getBalance();
    },
    async getAccountInfo1() {
      await getAccountInfo();
    },
    async deposit1() {
      await deposit({ asset: "Alice", amount: "1000", unit: "ether" });
    },

    async aliceApprove1() {
      await alice_Approve(String(this.aliceApproveAmount));
    },
    async alicebalanceOf1() {
      await alice_balanceOf();
    },
    async aliceAllowance() {
      await alice_allowance();
    },
    async setAlicePrice1() {
      try {
        const result = await setPrice({
          asset: "Alice",
          amount: this.alicePrice,
          unit: this.alicePriceUnit,
        });
        ElMessage.success(`Alice price updated: ${result.txHash}`);
      } catch (err) {
        console.error(err);
        alert(`Alice price update failed: ${err?.message || err}`);
      }
    },
    async setBobPrice1() {
      try {
        const result = await setPrice({
          asset: "Bob",
          amount: this.bobPrice,
          unit: this.bobPriceUnit,
        });
        ElMessage.success(`Bob price updated: ${result.txHash}`);
      } catch (err) {
        console.error(err);
        alert(`Bob price update failed: ${err?.message || err}`);
      }
    },
    async withdraw_T() {
      let result;
      try {
        result = await withdraw({
          asset: "0x94099942864EA81cCF197E9D71ac53310b1468D8",
          amount: "1",
        });
        alert(result);
      } catch (err) {
        alert("Error:" + err);
      }
    },
    async getBobPrice1() {
      alert(Web3.utils.fromWei(await getBobPrice(), "ether"));
    },
    async getAlicePrice1() {
      alert(Web3.utils.fromWei(await getAlicePrice(), "ether"));
    },

    async getHealthFactor1() {
      alert(Web3.utils.fromWei(await getHealthFactor(4), "ether"));
    },

    async getDebtVaultCollateralAssets1() {
      alert(await getDebtVaultCollateralAssets(3));
    },

    async getPoolCoinbalance1() {
      alert(await getPoolCoinbalance());
    },
    async getUnclaimedRewards1() {
      alert(await getUnclaimedRewards());
    },
    async claimPoolCoin1() {
      alert(await claimPoolCoin());
    },

    async getFlashLoanAsset1() {
      alert(await getFlashLoanAsset());
    },
  },
  components: {
    CardItem,
  },
};
</script>

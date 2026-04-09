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
</template>

<script>
import {
  transferTest,
  getBalance,
  getAccountInfo,
  deposit,
} from "@/contracts/lendingPool";

import {
  approve as alice_Approve,
  balanceOf as alice_balanceOf,
  allowance as alice_allowance,
} from "@/contracts/aliceToken";

import CardItem from "@/components/CardItem.vue";
export default {
  name: "Test",
  data() {
    return {
      balance: 0,
      aliceApproveAmount: 0,
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
      await deposit("1000400000000000000000");
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
  },
  components: {
    CardItem,
  },
};
</script>

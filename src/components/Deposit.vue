<template>
  <h3 class="title">Deposit</h3>
  <el-form class="deposit-form" label-position="right" label-width="auto">
    <el-form-item label="Coin">
      <el-select
        v-model="coin"
        class="selectCoin"
        popper-class="coin-select-popper"
        style="
          --el-color-primary: black;
          --el-border-color-hover: gray;
          --el-text-color-regular: black;
        "
      >
        <el-option label="Alice" value="Alice"></el-option>
        <el-option label="Bob" value="Bob"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="Value">
      <el-col :span="16">
        <el-input
          v-model="value"
          class="value-input"
          placeholder="Input the value to deposit"
          clearable
          style="
            --el-color-primary: black;
            --el-border-color-hover: gray;
            --el-text-color-regular: black;
            width: 100%;
          "
        ></el-input>
      </el-col>
      <el-col :span="2">
        <span
          style="width: 100%; text-align: right; display: block; color: gray"
          >Unit</span
        >
      </el-col>
      <el-col :span="6" style="padding-left: 12px">
        <el-select
          v-model="unit"
          class="unit"
          popper-class="coin-select-popper"
          style="
            width: 100%;
            --el-color-primary: black;
            --el-border-color-hover: gray;
            --el-text-color-regular: black;
          "
        >
          <el-option label="Ether" value="ether"></el-option>
          <el-option label="Finney" value="finney"></el-option>
          <el-option label="Szabo" value="szabo"></el-option>
          <el-option label="Gwei" value="gwei"></el-option>
          <el-option label="Wei" value="wei"></el-option>
        </el-select>
      </el-col>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="onSubmit" class="depostButton"
        >Deposit</el-button
      >
    </el-form-item>
  </el-form>
</template>
<script>
import { Web3 } from "web3";
export default {
  name: "Deposit",
  data() {
    return {
      coin: "",
      value: "0",
      unit: "ether",
    };
  },
  computed: {
    totalValue() {
      if (!this.value || isNaN(Number(this.value))) return "0";
      try {
        const web3 = new Web3();
        // 直接转 wei，处理溢出和精度问题
        const weiValue = web3.utils.toWei(this.value, this.unit);
        return weiValue; // wei 格式字符串
      } catch (e) {
        console.error("Value conversion error:", e);
        return "0";
      }
    },
  },
  methods: {
    async onSubmit() {
      // 发送到链时用这个
      const weiValue = this.totalValue;
      console.log("Depositing:", weiValue, "wei");
      // 调用合约...
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
.depostButton {
  background-color: transparent;
  color: black;
  border-color: rgb(200, 200, 200);
}
.depostButton:hover {
  background-color: transparent;
  border-color: black;
  color: black;
}
.depostButton:active {
  background-color: rgb(200, 200, 200);
}
.unit {
  width: 100px;
}
</style>

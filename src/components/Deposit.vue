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
          <el-option label="1e18" value="1e18"></el-option>
          <el-option label="1e15" value="1e15"></el-option>
          <el-option label="1e12" value="1e12"></el-option>
          <el-option label="1e9" value="1e9"></el-option>
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
export default {
  name: "Deposit",
  data() {
    return {
      coin: "",
      value: 0,
      unit: "1e18",
    };
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
  background-color: white;
  color: black;
  border-color: rgb(200, 200, 200);
}
.depostButton:hover {
  background-color: white;
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

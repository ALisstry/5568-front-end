<script setup>
import CardItem from "@/components/CardItem.vue";
import HealthFactor from "@/components/HealthFactor.vue";
</script>
<!-- 
TODO:
Dashboard：
1. 用户代币数量
2. 用户总存款（代币*市价）
3. Health Factor
Loan：
3. 用户借款
4. 
-->
<template>
  <div class="container">
    <HealthFactor factorPercent="150"></HealthFactor>
    <CardItem>
      <h2>card1</h2>
      <p>11111111111111111111111111111111111111</p>
    </CardItem>
    <CardItem>
      <h2>card2</h2>
      <p>56484186464864684</p>
    </CardItem>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  width: 100%;
  flex-wrap: wrap;
}
</style>

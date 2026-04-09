<script>
import Deposit from "@/components/Deposit.vue";
import BorrowActions from "@/components/BorrowActions.vue";

export default {
  name: "Interact",
  components: { Deposit, BorrowActions },
};
</script>

<template>
  <div class="interact-container">
    <Deposit />
    <BorrowActions />
  </div>
</template>

<style scoped>
.interact-container {
  max-width: 100%;
  display: grid;
  /* 修改: 将最小宽度从450px调整为更小值，防止溢出 */
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 40px;
  padding: 30px;
  /* margin: 10px; */
  box-sizing: border-box;
}

/* 添加以下样式以确保卡片内容正确应用右边距 */
.interact-container > * {
  margin-right: 0;
  /* 修改: 确保卡片不会超出容器 */
  max-width: 100%;
  overflow-x: hidden;
}

@media (max-width: 960px) {
  .interact-container {
    grid-template-columns: 1fr;
  }
}
</style>

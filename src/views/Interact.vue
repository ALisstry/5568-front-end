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
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
  gap: 40px;
  padding: 16px;
  margin: 10px;
  box-sizing: border-box;
}

@media (max-width: 960px) {
  .interact-container {
    grid-template-columns: 1fr;
  }
}
</style>

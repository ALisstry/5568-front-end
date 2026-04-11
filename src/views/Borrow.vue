<script>
import BorrowActions from "@/components/BorrowActions.vue";

export default {
  name: "Borrow",
  components: { BorrowActions },
};
</script>

<template>
  <div class="borrow-container">
    <BorrowActions />
  </div>
</template>

<style scoped>
.borrow-container {
  max-width: 100%;
  padding: 30px;
  box-sizing: border-box;
}

.borrow-container > * {
  max-width: 100%;
  overflow-x: hidden;
}
</style>

<script>
import Deposit from "@/components/Deposit.vue";

export default {
  name: "Interact",
  components: { Deposit },
};
</script>

<template>
  <div class="interact-container">
    <Deposit />
  </div>
</template>

<style scoped>
.interact-container {
  max-width: 100%;
  padding: 30px;
  box-sizing: border-box;
}

.interact-container > * {
  max-width: 100%;
  overflow-x: hidden;
}
</style>

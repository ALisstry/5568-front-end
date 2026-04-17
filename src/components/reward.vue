<template>
  <div class="colored-card"></div>
</template>

<style scoped>
.colored-card {
}
</style>

<script>
import { getPoolCoinbalance } from "@/contracts/poolCoin";
import {
  getUnclaimedRewards,
  claimPoolCoin,
} from "@/contracts/poolIncentivesController";
</script>

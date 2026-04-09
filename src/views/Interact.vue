<script>
import CardItem from "@/components/CardItem.vue";
import Deposit from "@/components/Deposit.vue";

export default {
  name: "Interact",
  components: { CardItem, Deposit },
};
</script>

<template>
  <CardItem>
    <Deposit />
  </CardItem>
</template>

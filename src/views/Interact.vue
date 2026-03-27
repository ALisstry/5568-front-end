<script>
import CardItem from "@/components/CardItem.vue";
import Deposit from "@/components/Deposit.vue";

export default {
  name: "Interact",
  components: { CardItem, Deposit },
  data() {
    return {};
  },
};
</script>

<template>
  <CardItem
    ><h2><Deposit /></h2
  ></CardItem>
</template>

<template>
  <div class="card-item">
    <slot />
  </div>
</template>

<script>
export default {
  name: "CardItem",
  props: {
    borderColor: { type: String, default: "rgb(200,200,200)" },
    hoverColor: { type: String, default: "rgb(240,240,240)" },
  },
};
</script>

<style scoped>
.card-item {
  margin: 10px;
  border: 1px solid var(--border-color, rgb(200, 200, 200));
  padding: 10px;
  transition:
    border-color 0.2s,
    background-color 0.2s;
}
.card-item:hover {
  border-color: gray;
  background-color: var(--hover-color, rgb(250, 250, 250));
}
</style>

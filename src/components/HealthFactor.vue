<template>
  <CardItem class="hf-card">
    <div class="hf-head">
      <h3 class="hf-title">Health Factor</h3>
      <span class="hf-percent" :style="{ color: statusColor }">
        {{ displayPercent }}%
      </span>
    </div>

    <div class="hf-meter-wrap">
      <div class="hf-meter">
        <div
          class="hf-fill"
          :style="{ width: fillPercent + '%', backgroundColor: statusColor }"
        ></div>
      </div>
      <div class="hf-scale">
        <span>0%</span>
        <span>100%</span>
      </div>
    </div>

    <p v-if="overflowPercent > 0" class="hf-overflow">
      +{{ overflowPercent }}% above liquidation threshold
    </p>

    <p class="hf-status" :style="{ color: statusColor }">{{ statusText }}</p>
  </CardItem>
</template>

<script>
import CardItem from "@/components/CardItem.vue";

export default {
  name: "HealthFactor",
  components: {
    CardItem,
  },
  props: {
    factorPercent: {
      type: Number,
      default: 100,
    },
  },
  computed: {
    displayPercent() {
      const value = Number(this.factorPercent);
      if (Number.isNaN(value)) return 0;
      return Math.max(0, Math.round(value));
    },
    fillPercent() {
      return Math.min(this.displayPercent, 100);
    },
    overflowPercent() {
      return Math.max(this.displayPercent - 100, 0);
    },
    statusText() {
      if (this.displayPercent < 100) return "At Risk";
      if (this.displayPercent < 130) return "Caution";
      return "Healthy";
    },
    statusColor() {
      if (this.displayPercent < 100) return "#d9534f";
      if (this.displayPercent < 130) return "#f0ad4e";
      return "#5cb85c";
    },
  },
};
</script>

<style scoped>
.hf-card {
  width: 220px;
  user-select: none;
}

.hf-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.hf-title {
  margin: 0;
  font-size: 16px;
  color: rgb(40, 40, 40);
}

.hf-percent {
  font-size: 22px;
  font-weight: 700;
  line-height: 1;
}

.hf-meter-wrap {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.hf-meter {
  width: 100%;
  height: 12px;
  border: 1px solid rgb(210, 210, 210);
  background-color: rgb(245, 245, 245);
}

.hf-fill {
  height: 100%;
  transition: width 0.35s ease;
}

.hf-scale {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: rgb(100, 100, 100);
}

.hf-overflow {
  margin: 6px 0 0;
  font-size: 12px;
  color: rgb(80, 80, 80);
}

.hf-status {
  margin: 8px 0 0;
  font-size: 13px;
  font-weight: 600;
}
</style>

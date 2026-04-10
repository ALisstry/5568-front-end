import Dashboard from "@/views/Dashboard.vue";
import Interact from "@/views/Interact.vue";
import Test from "@/views/Test.vue";
import Liquidation from "@/views/Liquidation.vue";
import { createRouter, createWebHistory } from "vue-router";
import { pa } from "element-plus/es/locale/index.mjs";

const routes = [
  {
    path: "/",
    name: "dashboard",
    component: Dashboard,
  },
  {
    path: "/interact",
    name: "interact",
    component: Interact,
  },
  {
    path: "/liquidation",
    name: "liquidiation",
    component: Liquidation,
  },
  {
    path: "/test",
    name: "test",
    component: Test,
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;

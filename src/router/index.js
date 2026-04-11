import Dashboard from "@/views/Dashboard.vue";
import Interact from "@/views/Interact.vue";
import Borrow from "@/views/Borrow.vue";
import Test from "@/views/Test.vue";
import Liquidation from "@/views/Liquidation.vue";
import { createRouter, createWebHistory } from "vue-router";

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
    path: "/borrow",
    name: "borrow",
    component: Borrow,
  },
  {
    path: "/liquidation",
    name: "liquidation",
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

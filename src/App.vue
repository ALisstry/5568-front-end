<script>
import MetaMaskLogin from "./components/MetaMaskLogin.vue";
export default {
  name: "App",
  components: {
    MetaMaskLogin,
  },
  data() {
    return {
      isAsideCollapsed: false,
    };
  },
  methods: {
    toggleAside() {
      this.isAsideCollapsed = !this.isAsideCollapsed;
    },
  },
};
</script>

<template>
  <div class="layout" :class="{ 'aside-collapsed': isAsideCollapsed }">
    <header class="header">
      <div class="banner">
        <img
          class="title"
          src="./assets/img/5568Project_ba-style@nulla.top.png"
        ></img>
        <div class="Login-wrap"><MetaMaskLogin /></div>
      </div>
    </header>
    <aside class="aside">
      <button class="aside-toggle" @click="toggleAside">
        {{ isAsideCollapsed ? ">" : "<" }}
      </button>
      <nav style="width: 100%">
        <RouterLink
          class="classify"
          to="/"
          :title="isAsideCollapsed ? 'Dashboard' : ''"
        >
          Dashboard
        </RouterLink>
        <RouterLink
          class="classify"
          to="/Interact"
          :title="isAsideCollapsed ? 'Interact' : ''"
        >
          Deposit & Withdraw
        </RouterLink>
        <RouterLink
          class="classify"
          to="/borrow"
          :title="isAsideCollapsed ? 'Borrow' : ''"
        >
          Borrow & Repay
        </RouterLink>
        <RouterLink
          class="classify"
          to="/liquidation"
          :title="isAsideCollapsed ? 'Liquidation' : ''"
        >
          Liquidation
        </RouterLink>
        <RouterLink
          class="classify"
          to="/Test"
          :title="isAsideCollapsed ? 'Test' : ''"
        >
          Test
        </RouterLink>
      </nav>
    </aside>
    <main class="main">
      <RouterView />
    </main>
    <footer class="footer"></footer>
  </div>
</template>

<style scoped>
.wallpaper {
  position: absolute;
}
.layout {
  display: grid;
  grid-template-columns: 200px 1fr;
  grid-template-rows: auto 1fr auto;
  grid-template-areas:
    "header header"
    "aside main"
    "footer footer";
  height: 100vh;

  transition: grid-template-columns 0.25s ease;
}

.layout.aside-collapsed {
  grid-template-columns: 0 1fr;
}

header {
  position: relative;
  grid-area: header;
  height: 10vh;
  background-image: url("./assets/img/a8dcb9d05c22e7e5cfb1bbd0d97092f4edd357ef.png@3840w_360h_1c.webp");
  background-position: -45px;
  color: white;
}

.banner {
  height: 10vh;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  box-sizing: border-box;
}
.title {
  margin: 0;
  user-select: none;
  -webkit-user-drag: none;
  height: 100%;
  flex-shrink: 0;
}
.settings {
  margin: 0;
  font-size: large;
  font-weight: bold;
  flex-shrink: 0;
}

aside {
  grid-area: aside;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-right: solid rgb(200, 200, 200) 1px;
  position: relative;
  transition: width 0.25s ease;
  overflow: visible;
}

.aside-toggle {
  position: absolute;
  top: 50%;
  right: -24px;
  transform: translateY(-50%);
  width: 24px;
  height: 48px;
  border: 1px solid rgb(200, 200, 200);
  background: white;
  color: rgb(90, 90, 90);
  border-radius: 3px;
  cursor: pointer;
  line-height: 1;
  z-index: 20;
}

.aside-toggle:hover {
  background: rgb(240, 240, 240);
}

.layout.aside-collapsed .aside {
  border-right: none;
}

.layout.aside-collapsed .aside nav {
  display: none;
}

.classify {
  height: 60px;
  width: 100%;
  border-bottom: solid rgb(200, 200, 200) 1px;
  display: flex;
  justify-content: center;
  align-items: center;
  text-decoration: none;
  color: inherit;
  position: relative;
  transition: background-color 0.2s;
  -webkit-user-drag: none;
}

.classify::before {
  content: "";
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 6px;
  height: 60px;
  background-color: transparent;
  transition: background-color 0.2s;
}

.classify:hover {
  background-color: rgb(200, 200, 200);
}

.classify.router-link-active {
  background-color: rgb(240, 240, 240);
}

.classify.router-link-active::before {
  background-color: gray;
}

.classify:visited {
  color: inherit;
  text-decoration: none;
}

main {
  grid-area: main;
  overflow-y: auto;
  overflow-x: hidden;
  max-height: calc(87vh-1px);
}

footer {
  grid-area: footer;
  height: 3vh;
  display: flex;
  justify-content: center;
  align-items: center;
  border-top: solid rgb(200, 200, 200) 1px;
  background: white;
}

@media (max-width: 768px) {
  .layout {
    grid-template-rows: 8vh 1fr 3vh;
  }

  header {
    height: 8vh;
  }

  .banner {
    padding: 0 10px;
  }

  aside {
    border-right: none;
  }

  .aside-toggle {
    display: none;
  }
}

.Login-wrap {
  margin: 0;
  flex-shrink: 0;
}
</style>

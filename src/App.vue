<script setup>
import { onMounted } from "vue";
import MetaMaskLogin from "./components/MetaMaskLogin.vue";
import Deposit from "./components/Deposit.vue";

onMounted(() => {
  const scriptId = "jinrishici-sdk";

  if (document.getElementById(scriptId)) return;

  const script = document.createElement("script");
  script.id = scriptId;
  script.src = "https://sdk.jinrishici.com/v2/browser/jinrishici.js";
  script.charset = "utf-8";
  document.body.appendChild(script);
});
</script>
<template>
  <div class="layout">
    <header class="header">
      <div class="banner">
        <h1 class="title">5568 Project</h1>
        <div class="Login-wrap"><MetaMaskLogin /></div>
      </div>
    </header>
    <aside class="aside">
      <div class="classify">Dashboard</div>
    </aside>
    <main class="main">
      <div class="card"><Deposit /></div>
    </main>
    <footer class="footer">
      <!-- <span id="jinrishici-sentence">正在加载今日诗词....</span> -->
    </footer>
  </div>
</template>

<style scoped>
.wallpaper {
  position: absolute;
}
.layout {
  display: grid;
  grid-template-columns: 240px 1fr;
  grid-template-rows: auto 1fr auto;
  grid-template-areas:
    "header header"
    "aside main"
    "footer footer";
  min-height: 100vh;
  /* gap: 16px; */
}

header {
  position: relative;
  grid-area: header;
  /* background-color: #ccff99; */
  height: 10vh;
  /* border-bottom: solid gray 1px; */

  /* align-items: center; */
  background-image: url("./assets/img/a8dcb9d05c22e7e5cfb1bbd0d97092f4edd357ef.png@3840w_360h_1c.webp");
  color: white;
}

.banner {
  /* position: absolute; */
  height: 10vh;
  width: 100%;
  display: flex;
  justify-content: right;
  align-items: center;
  /* backdrop-filter: blur(10px); */
  /* background: linear-gradient(to top, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.8)); */
}
.title {
  /* border: solid 1px white;
  border-radius: 5px;
  padding: 20px;
  backdrop-filter: blur(10px); */
  margin: auto auto auto 20px;
  user-select: none;
}
.settings {
  margin: auto 20px auto 0px;
  font-size: large;
  font-weight: bold;
}

aside {
  grid-area: aside;
  /* background-color: #99ccff; */
  display: flex;
  flex-direction: column;
  align-items: center;
  border-right: solid rgb(200, 200, 200) 1px;
}

.classify {
  height: 5vh;
  width: 100%;
  /* background-color: gray; */
  border-bottom: solid rgb(200, 200, 200) 1px;
  display: flex;
  justify-content: center;
  align-items: center;
}
main {
  grid-area: main;
}

footer {
  grid-area: footer;
  height: 3vh;
  display: flex;
  justify-content: center;
  align-items: center;
  border-top: solid rgb(200, 200, 200) 1px;
}

.Login-wrap {
  margin-right: 30px;
}

.card {
  margin: 10px;
  border: solid rgb(200, 200, 200) 1px;
  padding: 10px;
}
.card:hover {
  border-color: gray;
}
</style>

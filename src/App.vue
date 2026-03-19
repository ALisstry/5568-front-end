<script setup>
import { onMounted } from "vue";

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
  <!-- <span class="wallpaper">
    <img
      src="./assets/img/a8dcb9d05c22e7e5cfb1bbd0d97092f4edd357ef.png@3840w_360h_1c.webp"
    />
  </span> -->
  <div class="layout">
    <header class="header">
      <div class="banner">
        <h1 class="title">5568 Project</h1>
        <span class="settings">111</span>
        <span class="settings">222</span>
      </div>
    </header>
    <aside class="aside">
      <div class="classify">项目1</div>
    </aside>
    <main class="main">主体</main>
    <footer class="footer">
      <span id="jinrishici-sentence">正在加载今日诗词....</span>
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
  grid-area: header;
  /* background-color: #ccff99; */
  height: 15vh;
  border-bottom: solid gray 1px;

  /* align-items: center; */
  background-image: url("./assets/img/a8dcb9d05c22e7e5cfb1bbd0d97092f4edd357ef.png@3840w_360h_1c.webp");
  color: white;
}

.banner {
  height: 10vh;
  display: flex;
  justify-content: right;
  align-items: center;
  /* backdrop-filter: blur(50px); */
}
.title {
  margin: auto auto auto 20px;
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
  border-right: solid gray 1px;
}

.classify {
  height: 5vh;
  width: 100%;
  background-color: gray;
  display: flex;
  justify-content: center;
  align-items: center;
}
main {
  grid-area: main;
}
footer {
  grid-area: footer;
  height: 5vh;
  display: flex;
  justify-content: center;
  align-items: center;
  border-top: solid gray 1px;
}
</style>

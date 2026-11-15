import { createApp, type Component } from "vue";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import "@vue-flow/core/dist/style.css";
import "@vue-flow/core/dist/theme-default.css";
import App from "./App.vue";
async function mountStudio() {
  let root: Component = App;
  const mode = new URLSearchParams(window.location.search).get("designPreview");
  if (import.meta.env.DEV && (mode === "A" || mode === "B")) {
    root = (await import("./designPreview/designPreview.vue")).default;
  }
  createApp(root).use(ElementPlus).mount("#app");
}
void mountStudio();

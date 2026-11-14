import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  server: {
    host: "127.0.0.1",
    port: Number(process.env.AC_WEB_PORT ?? 5173),
    strictPort: true,
    proxy: { "/api": { target: `http://127.0.0.1:${process.env.AC_PORT ?? "3101"}`, changeOrigin: false } },
  },
});

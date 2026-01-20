import { defineConfig } from "vite";
import packageJson from "./package.json";

const buildTimestamp = new Date()
  .toISOString()
  .replace(/\.\d+Z$/, "")
  .replace(/[-:]/g, "")
  .replace("T", "-");

export default defineConfig({
  root: "src",
  build: {
    outDir: "../dist",
    emptyOutDir: true
  },
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      "/api": "http://localhost:8788"
    }
  },
  define: {
    "import.meta.env.VITE_APP_VERSION": JSON.stringify(packageJson.version),
    "import.meta.env.VITE_BUILD_TIMESTAMP": JSON.stringify(buildTimestamp)
  }
});

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
  },
  server: {
    proxy: {
      "/api/analyze": {
        target: "https://radai-analyzer-1064982089951.us-central1.run.app", // Correct URL with HTTPS
        changeOrigin: true,
        secure: true, // Ensure that the connection is secure
      },
    },
  },
});

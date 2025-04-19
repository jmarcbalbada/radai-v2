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
        target: "https://jmradai.pythonanywhere.com", // Correct URL with HTTPS
        changeOrigin: true,
        secure: true, // Ensure that the connection is secure
      },
    },
  },
});

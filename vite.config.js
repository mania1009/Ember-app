import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icons/icon-192.png", "icons/icon-512.png"],
      manifest: {
        name: "Ember & Co",
        short_name: "Ember & Co",
        description: "Voice-powered food delivery — for customers and restaurant owners.",
        theme_color: "#1B2E22",
        background_color: "#FFF4DE",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        icons: [
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" },
        ],
      },
    }),
  ],
  server: {
    // Lets `npm run dev` proxy /api calls to the local backend server (see /server)
    proxy: {
      "/api": "http://localhost:3001",
    },
  },
});

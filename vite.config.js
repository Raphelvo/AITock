import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: "dist",
    emptyOutDir: true,
    lib: {
      entry: "src/main.ts",
      formats: ["iife"], // Format global compatible Foundry
      name: "AITock",
      fileName: () => "main.js"
    },
    rollupOptions: {
      // Exclut les dépendances externes si besoin (ici, tout est inclus par défaut)
    }
  }
});
import { openConfig } from "./config.js";

export function registerMenu() {
  Hooks.on("getSceneControlButtons", controls => {
    controls.push({
      name: "tock-tools",
      title: "Outils Tock",
      icon: "fas fa-chess-board",
      layer: null, // <-- INDISPENSABLE pour ne pas provoquer d'erreur
      activeTool: "tock-config", // Optionnel : le bouton qui sera actif par défaut
      visible: true,
      tools: [
        {
          name: "tock-config",
          title: "Configurer la partie Tock",
          icon: "fas fa-cog",
          onClick: openConfig,
          button: true
        }
      ]
    });
  });
}
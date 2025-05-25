import { openConfig } from "./config.js";

export function registerMenu() {
  Hooks.on("getSceneControlButtons", controls => {
    controls.push({
      name: "tock-tools",
      title: "Outils Tock",
      icon: "fas fa-chess-board",
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
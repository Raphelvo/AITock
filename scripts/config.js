import { createBoardSceneAndTokens } from "./board.js";
import { resetHandsForSlots } from "./hands.js";

class TockConfigApp extends FormApplication {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      id: "tock-config",
      title: "Configuration Tock",
      template: "modules/AITock/templates/tock-config.html",
      width: 400
    });
  }

  getData() {
    // Valeurs par défaut, à étendre si tu ajoutes plus d'options
    return {
      playerCount: game.settings.get("AITock", "playerCount") ?? 4,
      teamMode: game.settings.get("AITock", "teamMode") ?? false,
      teamSize: game.settings.get("AITock", "teamSize") ?? 2
    };
  }

  async _updateObject(event, formData) {
    await game.settings.set("AITock", "playerCount", Number(formData.playerCount));
    await game.settings.set("AITock", "teamMode", !!formData.teamMode);
    await game.settings.set("AITock", "teamSize", Number(formData.teamSize));

    await createBoardSceneAndTokens();
    await resetHandsForSlots(Number(formData.playerCount));

    ui.notifications.info("Configuration Tock appliquée !");
  }
}

export function openConfig() {
  new TockConfigApp().render(true);
}
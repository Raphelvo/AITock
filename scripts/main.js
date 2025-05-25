import { createBoardSceneAndTokens } from "./board.js";
import { updateTokenColorsOnUserChange } from "./tokens.js";
import { registerMenu } from "./menu.js";
import { resetHandsForSlots, updateHandsAndPawnsOnUserChange } from "./hands.js";

// Enregistre le menu custom
registerMenu();

Hooks.once("ready", async () => {
  // Par défaut, partie 4 joueurs. Pour 6 : modifie dans la config.
  await createBoardSceneAndTokens();
  await resetHandsForSlots(4); // Tu peux passer 6 si partie à 6
});

Hooks.on("updateUser", updateTokenColorsOnUserChange);
Hooks.on("updateUser", updateHandsAndPawnsOnUserChange);
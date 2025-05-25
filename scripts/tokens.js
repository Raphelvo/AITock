import { MODULE_NAME, CASE_SIZE } from "./colors.js";

/**
 * Crée les jetons pour un joueur sur la scène passée.
 */
export async function createTokensForColor(scene, playerName, color, colorIndex, baseAngle, radiusBase) {
  const TOKEN_SIZE = CASE_SIZE * 0.8;
  const tokens = [];
  for (let i = 0; i < 4; i++) {
    const angle = baseAngle + (Math.PI / 8) * (i - 1.5);
    const x = scene.width / 2 + radiusBase * Math.cos(angle) - TOKEN_SIZE / 2;
    const y = scene.height / 2 + radiusBase * Math.sin(angle) - TOKEN_SIZE / 2;
    tokens.push({
      name: `${playerName} Pion ${i + 1}`,
      x, y,
      width: 1,
      height: 1,
      scale: TOKEN_SIZE / scene.grid,
      img: "icons/svg/chess-pawn.svg",
      vision: false,
      actorLink: false,
      displayName: 20,
      alpha: 0.9,
      flags: { [MODULE_NAME]: { colorIndex } }
    });
  }
  await scene.createEmbeddedDocuments("Token", tokens);
}

/**
 * Met à jour la couleur des tokens si les joueurs changent.
 */
export function updateTokenColorsOnUserChange(user, changes, options, userId) {
  // À compléter selon la logique de gestion de couleurs/joueurs
  // Ici, tu pourrais relancer la génération ou ajuster dynamiquement les pions.
}
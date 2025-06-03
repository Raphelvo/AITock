import { MODULE_NAME } from "./colors.js";

/**
 * Crée les jetons (pions) pour un joueur, couleur dynamique via colorHex.
 * @param {Scene} scene - La scène où placer les pions
 * @param {string} playerName - Nom du joueur (ex: "Rouge")
 * @param {string} colorHex - Couleur hexadécimale (ex: "#e74c3c")
 * @param {number} colorIndex - Index du joueur
 * @param {number} angle - Angle de base sur le cercle pour la couleur
 * @param {number} radius - Rayon de la base pour placer les pions
 */
export async function createTokensForColor(scene, playerName, colorHex, colorIndex, angle, radius) {
  // 4 pions par joueur, disposés autour de la base
  const TOKEN_SIZE = 60;
  const tokens = [];
  for (let i = 0; i < 4; i++) {
    const subAngle = angle + (Math.PI / 8) * (i - 1.5);
    const x = scene.width / 2 + (radius + 55) * Math.cos(subAngle) - TOKEN_SIZE / 2;
    const y = scene.height / 2 + (radius + 55) * Math.sin(subAngle) - TOKEN_SIZE / 2;

    tokens.push({
      x, y,
      width: TOKEN_SIZE,
      height: TOKEN_SIZE,
      name: `${playerName} ${i + 1}`,
      img: "", // Ajoute une image si besoin
      vision: false,
      displayName: 20,
      displayBars: 20,
      actorLink: false,
      tint: colorHex,
      flags: { [MODULE_NAME]: { colorIndex, playerName, slot: i } }
    });
  }
  await scene.createEmbeddedDocuments("Token", tokens);
}

/**
 * Met à jour la couleur (tint) de tous les jetons d'un joueur lorsqu'on change la couleur du joueur.
 * @param {Scene} scene - La scène où chercher les tokens
 * @param {number} colorIndex - Index du joueur concerné
 * @param {string} newHexColor - Nouvelle couleur hexadécimale
 */
export async function updateTokenColorsOnUserChange(scene, colorIndex, newHexColor) {
  // Filtre tous les tokens du joueur concerné par leur flag colorIndex
  const tokensToUpdate = scene.tokens.filter(
    t => t.flags?.[MODULE_NAME]?.colorIndex === colorIndex
  );
  if (!tokensToUpdate.length) return;

  const updates = tokensToUpdate.map(token => ({
    _id: token.id,
    tint: newHexColor
  }));

  await scene.updateEmbeddedDocuments("Token", updates);
}
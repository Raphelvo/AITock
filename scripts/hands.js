import { getPlayerColors, PLAYER_DEFAULT_NAMES } from "./colors.js";

/**
 * Crée une main pour chaque slot de joueur, même sans user connecté.
 * Nomme la main "main [nom joueur] tock" et l'associe à l'owner si connecté.
 */
export async function resetHandsForSlots(playerCount = 4) {
  // Supprimer toutes les anciennes mains "main ... tock"
  const toDelete = canvas.scene.cards.filter(
    c => c.type === "hand" && c.name?.trim().toLowerCase().endsWith("tock")
  ).map(c => c.id);
  if (toDelete.length > 0) {
    await canvas.scene.deleteEmbeddedDocuments("CardStack", toDelete);
  }

  // Users joueurs connectés (hors GM), triés
  const users = game.users.filter(u => u.active && !u.isGM);

  const playerColors = getPlayerColors();
  for (let i = 0; i < playerCount; i++) {
    const user = users[i] || null;
    const name = user?.name || PLAYER_DEFAULT_NAMES[i] || `Joueur ${i+1}`;
    const color = playerColors[i % playerColors.length];

    const handData = {
      name: `main ${name} tock`,
      type: "hand",
      owner: user?.id ?? null,
      flags: {
        AITock: {
          color,
          userName: name,
          slot: i
        }
      }
    };
    await canvas.scene.createEmbeddedDocuments("CardStack", [handData]);
  }
}

/**
 * Met à jour le nom/couleur de la main et des pions si un joueur rejoint/prend une place.
 */
export async function updateHandsAndPawnsOnUserChange(user, changes, options, userId) {
  if (user.isGM) return;

  const playerCount = 4; // Ou depuis config/settings
  const users = game.users.filter(u => u.active && !u.isGM);

  // Slot du joueur dans la liste
  let slotIndex = users.findIndex(u => u.id === user.id);

  // Si le user n'a pas de main, prend le premier slot libre (main owner:null)
  if (slotIndex === -1) {
    const emptyHand = canvas.scene.cards.find(
      c => c.type === "hand" && c.name?.trim().toLowerCase().endsWith("tock") && !c.owner
    );
    if (emptyHand) {
      slotIndex = emptyHand.flags?.AITock?.slot ?? -1;
    }
  }
  if (slotIndex === -1) return;

  // Récupère la main de ce slot
  const hand = canvas.scene.cards.find(
    c => c.type === "hand" && c.flags?.AITock?.slot === slotIndex
  );
  if (!hand) return;

  const playerColors = getPlayerColors();
  const color = playerColors[slotIndex % playerColors.length];
  const name = user.name || PLAYER_DEFAULT_NAMES[slotIndex] || `Joueur ${slotIndex + 1}`;

  // Met à jour la main (nom, owner, couleur)
  await canvas.scene.updateEmbeddedDocuments("CardStack", [{
    _id: hand.id,
    name: `main ${name} tock`,
    owner: user.id,
    "flags.AITock.color": color,
    "flags.AITock.userName": name
  }]);

  // Mettre à jour la couleur/nom des pions de ce slot si besoin (à compléter)
  /*
  const pawns = canvas.scene.tokens.filter(t => t.flags?.AITock?.slot === slotIndex);
  for (let pawn of pawns) {
    await canvas.scene.updateEmbeddedDocuments("Token", [{
      _id: pawn.id,
      name: `Pion ${name}`,
      "flags.AITock.color": color
    }]);
  }
  */
}
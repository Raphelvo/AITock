const TOCK_MODULE = "AITock";
const TOCK_SCENE_NAME = "Plateau Tock";
const TOCK_PLAYER_COUNT = 6; // Mets 4 ou 6 ici !
const GRID_SIZE = 100;
const SCENE_SIZE = 2000;
const CENTER = SCENE_SIZE / 2;
const CASE_SIZE = 80;
const CASES_PER_COLOR = 18;
const BASES_PER_COLOR = 4;
const HOMES_PER_COLOR = 4;

// Couleurs par défaut pour 6 joueurs (rouge, bleu, vert, jaune, violet, orange)
const PLAYER_DEFAULT_COLORS = [
  "#d32f2f", "#1976d2", "#388e3c", "#fbc02d", "#8e24aa", "#f57c00"
];

Hooks.once("ready", async () => {
  await createTockBoardSceneAndTokensRound();
});

async function createTockBoardSceneAndTokensRound() {
  let scene = game.scenes.find(s => s.name === TOCK_SCENE_NAME);

  // Crée la scène si elle n'existe pas
  if (!scene) {
    scene = await Scene.create({
      name: TOCK_SCENE_NAME,
      width: SCENE_SIZE,
      height: SCENE_SIZE,
      grid: GRID_SIZE,
      gridType: 1,
      padding: 0,
      img: ""
    });
    ui.notifications.info("Plateau Tock rond créé !");
  }

  // Active la scène si besoin
  if (!scene.active) await scene.activate();

  // Suppression anciens dessins et jetons du module
  const oldDrawings = scene.drawings.filter(d => d.flags?.[TOCK_MODULE]);
  if (oldDrawings.length) {
    await scene.deleteEmbeddedDocuments("Drawing", oldDrawings.map(d => d.id));
  }
  const oldTokens = scene.tokens.filter(t => t.flags?.[TOCK_MODULE]);
  if (oldTokens.length > 0) {
    await scene.deleteEmbeddedDocuments("Token", oldTokens.map(t => t.id));
  }

  // Récupère la couleur de chaque joueur, ou défaut
  const players = game.users.players.filter(u => u.active);
  let colors = [];
  for (let i = 0; i < TOCK_PLAYER_COUNT; i++) {
    colors.push(players[i]?.color || PLAYER_DEFAULT_COLORS[i]);
  }

  // Rayons adaptés pour 4 ou 6 joueurs
  const RADIUS_PATH = 800;
  const RADIUS_BASE = 950;
  const RADIUS_HOME_START = 650;
  const RADIUS_HOME_END = 500;

  // Pour chaque joueur/couleur
  for (let c = 0; c < TOCK_PLAYER_COUNT; c++) {
    // Angle de départ pour chaque joueur
    const baseAngle = (2 * Math.PI * c) / TOCK_PLAYER_COUNT;

    // 1. Cases de parcours (18 cases par joueur, sur le cercle)
    for (let i = 0; i < CASES_PER_COLOR; i++) {
      const angle = baseAngle + (2 * Math.PI * i) / (CASES_PER_COLOR * TOCK_PLAYER_COUNT);
      const x = CENTER + RADIUS_PATH * Math.cos(angle) - CASE_SIZE/2;
      const y = CENTER + RADIUS_PATH * Math.sin(angle) - CASE_SIZE/2;
      await scene.createEmbeddedDocuments("Drawing", [{
        type: CONST.DRAWING_TYPES.ELLIPSE,
        x, y,
        width: CASE_SIZE,
        height: CASE_SIZE,
        fillColor: colors[c],
        fillAlpha: 0.25,
        strokeColor: colors[c],
        strokeWidth: 3,
        flags: { [TOCK_MODULE]: { type: "path", color: colors[c], index: c, order: i } }
      }]);
    }

    // 2. Bases (4 par joueur, vers l'extérieur)
    for (let i = 0; i < BASES_PER_COLOR; i++) {
      const angle = baseAngle + (Math.PI / (TOCK_PLAYER_COUNT * 2)) * (i - 1.5);
      const x = CENTER + RADIUS_BASE * Math.cos(angle) - CASE_SIZE/2;
      const y = CENTER + RADIUS_BASE * Math.sin(angle) - CASE_SIZE/2;
      await scene.createEmbeddedDocuments("Drawing", [{
        type: CONST.DRAWING_TYPES.ELLIPSE,
        x, y,
        width: CASE_SIZE,
        height: CASE_SIZE,
        fillColor: colors[c],
        fillAlpha: 0.85,
        strokeColor: "#222",
        strokeWidth: 4,
        flags: { [TOCK_MODULE]: { type: "base", color: colors[c], index: c, order: i } }
      }]);
    }

    // 3. Maison (4 cases alignées vers le centre)
    for (let i = 0; i < HOMES_PER_COLOR; i++) {
      const homeRadius = RADIUS_HOME_START - (i * ((RADIUS_HOME_START - RADIUS_HOME_END)/(HOMES_PER_COLOR-1)));
      const angle = baseAngle;
      const x = CENTER + homeRadius * Math.cos(angle) - CASE_SIZE/2;
      const y = CENTER + homeRadius * Math.sin(angle) - CASE_SIZE/2;
      await scene.createEmbeddedDocuments("Drawing", [{
        type: CONST.DRAWING_TYPES.ELLIPSE,
        x, y,
        width: CASE_SIZE,
        height: CASE_SIZE,
        fillColor: colors[c],
        fillAlpha: 0.5,
        strokeColor: "#222",
        strokeWidth: 4,
        flags: { [TOCK_MODULE]: { type: "home", color: colors[c], index: c, order: i } }
      }]);
    }

    // 4. Jetons de départ (si joueur connecté)
    const user = players[c];
    if (user) {
      for (let i = 0; i < BASES_PER_COLOR; i++) {
        const angle = baseAngle + (Math.PI / (TOCK_PLAYER_COUNT * 2)) * (i - 1.5);
        const x = CENTER + RADIUS_BASE * Math.cos(angle) - CASE_SIZE/2;
        const y = CENTER + RADIUS_BASE * Math.sin(angle) - CASE_SIZE/2;
        await scene.createEmbeddedDocuments("Token", [{
          name: `${user.name} - Pion ${i + 1}`,
          x, y,
          img: `icons/svg/pawn.svg`,
          tint: colors[c],
          width: 1,
          height: 1,
          vision: false,
          actorLink: false,
          displayName: CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER,
          flags: {
            [TOCK_MODULE]: {
              playerId: user.id,
              color: colors[c],
              index: i
            }
          },
          permission: { [user.id]: CONST.ENTITY_PERMISSIONS.OWNER }
        }]);
      }
    }
  }

  ui.notifications.info(`Plateau Tock rond ${TOCK_PLAYER_COUNT} joueurs généré !`);
}

// Mise à jour dynamique des couleurs des jetons si un joueur modifie la sienne
Hooks.on("updateUser", async (user, data) => {
  if (!("color" in data)) return;
  const scene = game.scenes.find(s => s.name === TOCK_SCENE_NAME);
  if (!scene) return;
  const tokensToUpdate = scene.tokens.filter(t => t.flags?.[TOCK_MODULE]?.playerId === user.id);
  if (tokensToUpdate.length === 0) return;
  const updates = tokensToUpdate.map(token => ({
    _id: token.id,
    tint: data.color
  }));
  await scene.updateEmbeddedDocuments("Token", updates);
});
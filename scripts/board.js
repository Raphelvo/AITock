import {
  getPlayerColors,
  MODULE_NAME,
  SCENE_NAME,
  PLAYER_COUNT,
  GRID_SIZE,
  SCENE_SIZE,
  CENTER,
  CASE_SIZE,
  CASES_PER_COLOR,
  BASES_PER_COLOR,
  HOMES_PER_COLOR,
  PLAYER_DEFAULT_NAMES
} from "./colors.js";
import { createTokensForColor } from "./tokens.js";

export async function createBoardSceneAndTokens() {
  let scene = game.scenes.find(s => s.name === SCENE_NAME);
  if (!scene) {
    scene = await Scene.create({
      name: SCENE_NAME,
      width: SCENE_SIZE,
      height: SCENE_SIZE,
      grid: GRID_SIZE,
      gridType: 1,
      padding: 0,
      img: ""
    });
    ui.notifications.info("Plateau Tock créé !");
  }

  if (!scene.active) await scene.activate();
  await new Promise(resolve => {
    if (canvas.ready && canvas.scene.id === scene.id) return resolve();
    Hooks.once("canvasReady", () => resolve());
  });

  // Suppression anciens dessins et pions
  const oldDrawings = canvas.scene.drawings.filter(d => d.flags?.[MODULE_NAME]);
  if (oldDrawings.length) await canvas.scene.deleteEmbeddedDocuments("Drawing", oldDrawings.map(d => d.id));
  const oldTokens = canvas.scene.tokens.filter(t => t.flags?.[MODULE_NAME]);
  if (oldTokens.length > 0) await canvas.scene.deleteEmbeddedDocuments("Token", oldTokens.map(t => t.id));

  const colors = getPlayerColors();
  const RADIUS_PATH = 800;
  const RADIUS_BASE = 950;
  const RADIUS_HOME_START = 650;
  const RADIUS_HOME_END = 500;

  for (let c = 0; c < PLAYER_COUNT; c++) {
    const baseAngle = (2 * Math.PI * c) / PLAYER_COUNT;

    // Cases de parcours
    for (let i = 0; i < CASES_PER_COLOR; i++) {
      const angle = baseAngle + (2 * Math.PI * i) / (CASES_PER_COLOR * PLAYER_COUNT);
      const x = CENTER + RADIUS_PATH * Math.cos(angle) - CASE_SIZE / 2;
      const y = CENTER + RADIUS_PATH * Math.sin(angle) - CASE_SIZE / 2;
      await canvas.scene.createEmbeddedDocuments("Drawing", [{
        type: "ellipse",
        x, y,
        width: CASE_SIZE,
        height: CASE_SIZE,
        fillColor: colors[c],
        fillAlpha: 0.25,
        strokeColor: colors[c],
        strokeWidth: 3,
        flags: { [MODULE_NAME]: { type: "path", color: colors[c], index: c, order: i } }
      }]);
    }
    // Bases
    for (let i = 0; i < BASES_PER_COLOR; i++) {
      const angle = baseAngle + (Math.PI / (PLAYER_COUNT * 2)) * (i - 1.5);
      const x = CENTER + RADIUS_BASE * Math.cos(angle) - CASE_SIZE / 2;
      const y = CENTER + RADIUS_BASE * Math.sin(angle) - CASE_SIZE / 2;
      await canvas.scene.createEmbeddedDocuments("Drawing", [{
        type: "ellipse",
        x, y,
        width: CASE_SIZE,
        height: CASE_SIZE,
        fillColor: colors[c],
        fillAlpha: 0.85,
        strokeColor: "#222",
        strokeWidth: 4,
        flags: { [MODULE_NAME]: { type: "base", color: colors[c], index: c, order: i } }
      }]);
    }
    // Maisons
    for (let i = 0; i < HOMES_PER_COLOR; i++) {
      const homeRadius = RADIUS_HOME_START - (i * ((RADIUS_HOME_START - RADIUS_HOME_END) / (HOMES_PER_COLOR - 1)));
      const angle = baseAngle;
      const x = CENTER + homeRadius * Math.cos(angle) - CASE_SIZE / 2;
      const y = CENTER + homeRadius * Math.sin(angle) - CASE_SIZE / 2;
      await canvas.scene.createEmbeddedDocuments("Drawing", [{
        type: "ellipse",
        x, y,
        width: CASE_SIZE,
        height: CASE_SIZE,
        fillColor: colors[c],
        fillAlpha: 0.5,
        strokeColor: "#222",
        strokeWidth: 4,
        flags: { [MODULE_NAME]: { type: "home", color: colors[c], index: c, order: i } }
      }]);
    }
    // Jetons de départ
    await createTokensForColor(canvas.scene, PLAYER_DEFAULT_NAMES[c], colors[c], c, baseAngle, RADIUS_BASE);
  }

  ui.notifications.info(`[AITock] Plateau Tock ${PLAYER_COUNT} joueurs généré !`);
}
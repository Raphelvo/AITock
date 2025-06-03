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
  const TOTAL_CASES = CASES_PER_COLOR * PLAYER_COUNT;
  const RADIUS_PATH = (TOTAL_CASES * CASE_SIZE * 1.05) / (2 * Math.PI);
  const RADIUS_BASE = RADIUS_PATH + 150;
  const RADIUS_HOME_START = RADIUS_PATH - 150;
  const RADIUS_HOME_END = RADIUS_PATH - 300;

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

  for (let c = 0; c < PLAYER_COUNT; c++) {
    // Cases de parcours (fond blanc + rond couleur + numéro)
    for (let i = 0; i < CASES_PER_COLOR; i++) {
      const globalIndex = c * CASES_PER_COLOR + i;
      const angle = (2 * Math.PI * globalIndex) / TOTAL_CASES;
      const x = CENTER + RADIUS_PATH * Math.cos(angle) - CASE_SIZE / 2;
      const y = CENTER + RADIUS_PATH * Math.sin(angle) - CASE_SIZE / 2;

      // Fond blanc
      const bgData = {
        type: "e",
        x: x - CASE_SIZE*0.05,
        y: y - CASE_SIZE*0.05,
        fillColor: "#fff",
        fillAlpha: 1,
        strokeColor: "#ddd",
        strokeWidth: 2,
        width: CASE_SIZE*1.1,
        height: CASE_SIZE*1.1,
        flags: { [MODULE_NAME]: { type: "path-bg", color: colors[c].h, index: c, order: i } }
      };
      await canvas.scene.createEmbeddedDocuments("Drawing", [bgData]);

      // Rond couleur
      const drawingData = {
        type: "e",
        x, y,
        fillColor: colors[c].h,
        fillAlpha: 0.25,
        strokeColor: colors[c].h,
        strokeWidth: 3,
        width: CASE_SIZE,
        height: CASE_SIZE,
        flags: { [MODULE_NAME]: { type: "path", color: colors[c].h, index: c, order: i } }
      };
      await canvas.scene.createEmbeddedDocuments("Drawing", [drawingData]);

      // Numéro centré (type: "t", pas de shape)
      const textData = {
        type: "t",
        x: x + CASE_SIZE / 2,
        y: y + CASE_SIZE / 2,
        text: {
          text: String(i + 1),
          fontSize: Math.round(CASE_SIZE / 2.2),
          color: "#222",
          align: 1,
          stroke: "#fff",
          strokeThickness: 2
        },
        fillAlpha: 1,
        flags: { [MODULE_NAME]: { type: "case-number", color: colors[c].h, index: c, order: i } }
      };
      await canvas.scene.createEmbeddedDocuments("Drawing", [textData]);
    }

    // Bases (ellipse)
    for (let i = 0; i < BASES_PER_COLOR; i++) {
      const angle = (2 * Math.PI * c) / PLAYER_COUNT + (Math.PI / (PLAYER_COUNT * 2)) * (i - 1.5);
      const x = CENTER + RADIUS_BASE * Math.cos(angle) - CASE_SIZE / 2;
      const y = CENTER + RADIUS_BASE * Math.sin(angle) - CASE_SIZE / 2;
      const drawingData = {
        type: "e",
        x, y,
        fillColor: colors[c].h,
        fillAlpha: 0.85,
        strokeColor: "#222",
        strokeWidth: 4,
        width: CASE_SIZE,
        height: CASE_SIZE,
        flags: { [MODULE_NAME]: { type: "base", color: colors[c].h, index: c, order: i } }
      };
      await canvas.scene.createEmbeddedDocuments("Drawing", [drawingData]);
    }

    // Maisons (ellipse)
    for (let i = 0; i < HOMES_PER_COLOR; i++) {
      const homeRadius = RADIUS_HOME_START - (i * ((RADIUS_HOME_START - RADIUS_HOME_END) / (HOMES_PER_COLOR - 1)));
      const angle = (2 * Math.PI * c) / PLAYER_COUNT;
      const x = CENTER + homeRadius * Math.cos(angle) - CASE_SIZE / 2;
      const y = CENTER + homeRadius * Math.sin(angle) - CASE_SIZE / 2;
      const drawingData = {
        type: "e",
        x, y,
        fillColor: colors[c].h,
        fillAlpha: 0.5,
        strokeColor: "#222",
        strokeWidth: 4,
        width: CASE_SIZE,
        height: CASE_SIZE,
        flags: { [MODULE_NAME]: { type: "home", color: colors[c].h, index: c, order: i } }
      };
      await canvas.scene.createEmbeddedDocuments("Drawing", [drawingData]);
    }

    // Jetons de départ
    await createTokensForColor(canvas.scene, PLAYER_DEFAULT_NAMES[c], colors[c].h, c, (2 * Math.PI * c) / PLAYER_COUNT, RADIUS_BASE);
  }

  ui.notifications.info(`[AITock] Plateau Tock ${PLAYER_COUNT} joueurs généré !`);
}
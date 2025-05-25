export const MODULE_NAME = "AITock";
export const SCENE_NAME = "Plateau Tock";
export const PLAYER_COUNT = 4; // Change à 6 pour 6 joueurs
export const GRID_SIZE = 100;
export const SCENE_SIZE = 2000;
export const CENTER = SCENE_SIZE / 2;
export const CASE_SIZE = 80;
export const CASES_PER_COLOR = 12;
export const BASES_PER_COLOR = 4;
export const HOMES_PER_COLOR = 4;

export const PLAYER_DEFAULT_NAMES = [
  "Rouge",
  "Bleu",
  "Vert",
  "Jaune",
  "Violet",
  "Orange"
];

export function getPlayerColors() {
  return [
    "#e53935", // Rouge
    "#1e88e5", // Bleu
    "#43a047", // Vert
    "#fbc02d", // Jaune
    "#8e24aa", // Violet (pour 6 joueurs)
    "#fb8c00"  // Orange (pour 6 joueurs)
  ].slice(0, PLAYER_COUNT);
}
// Couleurs par défaut, modifiables dynamiquement si besoin
const PLAYER_COLORS = [
  { h: "#e74c3c", name: "Rouge" },
  { h: "#3498db", name: "Bleu" },
  { h: "#27ae60", name: "Vert" },
  { h: "#f1c40f", name: "Jaune" }
  // Ajoute ici d'autres couleurs pour plus de joueurs
];

/** Retourne la liste des couleurs joueurs (objets : {h, name}) */
export function getPlayerColors() {
  return [...PLAYER_COLORS];
}

/** Modifie la couleur hex d'un joueur (index) */
export function setPlayerColor(index, hex) {
  if (PLAYER_COLORS[index]) {
    PLAYER_COLORS[index].h = hex;
  }
  // Ajoute ici persistance si besoin (settings, flags, etc)
}

// Paramètres plateau
export const MODULE_NAME = "AITock";
export const SCENE_NAME = "Plateau Tock";
export const PLAYER_COUNT = PLAYER_COLORS.length;
export const GRID_SIZE = 100;
export const SCENE_SIZE = 2200;
export const CENTER = SCENE_SIZE / 2;
export const CASE_SIZE = 85;
export const CASES_PER_COLOR = 18;
export const BASES_PER_COLOR = 4;
export const HOMES_PER_COLOR = 4;
export const PLAYER_DEFAULT_NAMES = PLAYER_COLORS.map(c => c.name);
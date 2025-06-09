import { creerPlateau } from "./init_board";

/**
 * Dessine une case sur la scène active Foundry.
 * @param x Position X du centre de la case
 * @param y Position Y du centre de la case
 * @param rayon Rayon de la case (en pixels)
 * @param couleur Couleur de fond de la case (ex: "#ff0000")
 * @param label Texte à afficher au centre (optionnel)
 */
export const RAYON_CASE = 60;

export async function dessinerCase(x: number, y: number, rayon: number = RAYON_CASE, couleur: string, label?: string) {
    if (!canvas?.scene) {
        ui.notifications?.warn("AITock: Aucune scène active !");
        return;
    }

    // Paramètres de visibilité
    const fillAlpha = 0.7;
    const strokeAlpha = 0.9;
    const strokeWidth = 2;
    const hasText = !!label && label.trim().length > 0;
    const hasFill = couleur && fillAlpha > 0;
    const hasStroke = strokeAlpha > 0 && strokeWidth > 0;

    if (!hasFill && !hasStroke && !hasText) {
        ui.notifications?.warn("AITock: Impossible de dessiner une case invisible !");
        return;
    }

    const drawingData: any = {
        x: x - rayon,
        y: y - rayon,
        fillColor: hasFill ? couleur : null,
        fillAlpha: hasFill ? fillAlpha : 0,
        strokeColor: hasStroke ? "#000000" : null,
        strokeWidth: hasStroke ? strokeWidth : 0,
        strokeAlpha: hasStroke ? strokeAlpha : 0,
        text: hasText ? label : "",
        fontSize: 32,
        textColor: "#0000cc",
        shape: {
            type: "e",
            width: rayon * 2,
            height: rayon * 2
        }
    };

    await canvas.scene.createEmbeddedDocuments("Drawing", [drawingData]);
}

/**
 * Affiche la case 1 du joueur 1 sur la scène définie.
 * @param nbJoueurs Nombre de joueurs
 * @param sceneId   ID de la scène cible (optionnel, sinon scène active)
 */
export async function afficherCase1Joueur1(nbJoueurs: number, sceneId?: string) {
    const plateau = creerPlateau(nbJoueurs, sceneId);
    // Cherche la première case "normale" du joueur 1 (id 1)
    const case1 = plateau.find(c => c.id === 1 && c.type === "normale");
    if (!case1) {
        ui.notifications?.warn("AITock: Impossible de trouver la case 1 du joueur 1 !");
        return;
    }
    // Affiche la case sur la scène active
    await dessinerCase(case1.x, case1.y, 60, "#33ccff", `1`);
}
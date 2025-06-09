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

export async function dessinerCase(
    x: number,
    y: number,
    rayon: number = RAYON_CASE,
    couleur: string,
    label?: string,
    couleurContour?: string,
    caseId?: number // <-- Seul l'id de la case est stocké
) {
    if (!canvas?.scene) {
        ui.notifications?.warn("AITock: Aucune scène active !");
        return;
    }

    // Paramètres de visibilité
    const fillAlpha = 1; // Toujours complètement opaque
    const strokeAlpha = 0.9;
    const strokeWidth = 2;
    const hasText = !!label && label.trim().length > 0;
    const hasFill = couleur && fillAlpha > 0;
    const hasStroke = strokeAlpha > 0 && strokeWidth > 0;

    if (!hasFill && !hasStroke && !hasText) {
        ui.notifications?.warn("AITock: Impossible de dessiner une case invisible !");
        return;
    }

    const strokeColor = couleurContour ?? "#222222"; // couleur du trait

    const drawingData: any = {
        x: x - rayon,
        y: y - rayon,
        fillType: 1, // 0=None, 1=Solid, 2=Pattern
        fillColor: hasFill ? couleur : null,
        fillAlpha: hasFill ? fillAlpha : 0,
        strokeColor: hasStroke ? strokeColor : null,
        strokeWidth: hasStroke ? strokeWidth : 0,
        strokeAlpha: hasStroke ? strokeAlpha : 0,
        text: hasText ? label : "",
        fontSize: 32,
        textColor: "#0000cc",
        shape: {
            type: "e",
            width: rayon * 2,
            height: rayon * 2
        },
        flags: {
            aitock: {
                caseId: caseId ?? null // <-- Uniquement l'id de la case
            }
        }
    };

    await canvas.scene.createEmbeddedDocuments("Drawing", [drawingData]);
}

/**
 * Affiche tout le plateau sur la scène, chaque case sous forme d'ellipse,
 * avec la couleur du joueur Foundry et le numéro de la case en texte.
 * @param nbJoueurs Nombre de joueurs
 * @param sceneId   ID de la scène cible (optionnel, sinon scène active)
 */
export async function afficherPlateau(nbJoueurs: number, sceneId?: string) {
    const plateau = creerPlateau(nbJoueurs, sceneId);
    if (game.user?.isGM) {
        await game.settings.set("aitock", "plateau", plateau);
        console.log("[AITock] Plateau sauvegardé dans les settings du module.");
    }
    const placesTock: string[] = game.settings.get("aitock", "placesTock") ?? [];
    const couleursDefaut = (window as any).COULEURS_JOUEURS;
    for (const c of plateau) {
        let couleur = "#cccccc";
        if (c.joueur && couleursDefaut && c.joueur >= 1 && c.joueur <= couleursDefaut.length) {
            const userId = placesTock[c.joueur - 1];
            if (userId) {
                const user = game.users?.get(userId);
                couleur = user?.color ?? couleursDefaut[c.joueur - 1];
            } else {
                couleur = couleursDefaut[c.joueur - 1];
            }
        }
        const fillColor = c.protegee ? couleur : "#cccccc";
        const label = c.type === "ciel" ? "Ciel" : `${c.numeroCase}`;
        await dessinerCase(c.x, c.y, c.rayon, fillColor, label, couleur, c.id);
    }
}

/**
 * Met à jour la couleur de toutes les cases associées à un joueur donné.
 * @param joueur Le numéro du joueur (1, 2, ...)
 * @param nouvelleCouleur La nouvelle couleur à appliquer (ex: "#ff0000")
 */
export async function mettreAJourCouleurCasesJoueur(joueur: number, nouvelleCouleur: string) {
    const plateau = game.settings.get("aitock", "plateau");
    if (!plateau) {
        console.warn("[AITock] Aucun plateau trouvé dans les flags du world.");
        return;
    }
    // Map caseId -> case pour accès rapide
    const caseMap = new Map(plateau.map((c: any) => [c.id, c]));

    for (const drawing of canvas.drawings.placeables) {
        const caseId = drawing.document.getFlag("aitock", "caseId");
        if (caseId === undefined) continue;
        const c = caseMap.get(caseId);
        if (!c || c.joueur !== joueur) continue;

        // Applique la couleur seulement si la case est protégée, sinon gris
        const fillColor = c.protegee ? nouvelleCouleur : "#cccccc";
        try {
            await drawing.document.update({
                fillColor,
                strokeColor: nouvelleCouleur
            });
        } catch (e) {
            console.error(`[AITock] Erreur lors de la mise à jour du drawing caseId=${caseId}`, e);
        }
    }
}

Hooks.on("updateUser", (user, data) => {
    if (data.color) {
        const placesTock: string[] = game.settings.get("aitock", "placesTock") ?? [];
        const joueur = placesTock.findIndex(uid => uid === user.id) + 1;
        console.log(`[AITock] updateUser: user=${user.id}, joueur=${joueur}, color=${data.color}`);
        if (joueur > 0) {
            mettreAJourCouleurCasesJoueur(joueur, data.color);
        } else {
            console.warn(`[AITock] Aucun joueur associé à l'user.id=${user.id}`);
        }
    }
});
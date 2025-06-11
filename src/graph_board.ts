import { creerPlateau } from "./init_board";
import { creerTokensDepartPourJoueur } from "./graph_board";

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
    // Supprime uniquement les drawings du Tock (ceux avec le flag aitock.caseId défini)
    const drawingsTock = canvas.drawings.placeables.filter(d =>
        d.document.getFlag("aitock", "caseId") !== undefined && d.document.getFlag("aitock", "caseId") !== null
    );
    if (drawingsTock.length > 0) {
        const ids = drawingsTock.map(d => d.id);
        await canvas.scene.deleteEmbeddedDocuments("Drawing", ids);
    }

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

/**
 * Crée 4 tokens sur les zones de depart pour le joueur donné.
 * @param numeroJoueur Le numero du joueur (1, 2, ...)
 * @param actorId L'id de l'acteur du joueur
 */
export async function creerTokensDepartPourJoueur(numeroJoueur: number, actorId: string) {
    const plateau = game.settings.get("aitock", "plateau");
    if (!plateau) {
        console.warn("[AITock] Aucun plateau trouve pour la creation des tokens.");
        return;
    }
    // On cherche les cases de depart du joueur
    const casesDepart = plateau.filter((c: any) => c.joueur === numeroJoueur && c.type === "depart");

    // Récupère la couleur du joueur (depuis l'Actor ou la config)
    let couleur = "#cccccc";
    const actor = game.actors?.get(actorId);
    couleur = actor?.getFlag("aitock", "couleurJoueur") || couleur;

    for (let i = 0; i < casesDepart.length; i++) {
        const c = casesDepart[i];
        // Centre le token sur la case (le token fait 1x1 cases, soit 70x70px par défaut)
        const tokenSize = canvas.grid?.size ?? 70;
        await canvas.scene.createEmbeddedDocuments("Token", [{
            x: c.x - tokenSize / 2,
            y: c.y - tokenSize / 2,
            width: 1,
            height: 1,
            name: `Pion ${i + 1} Joueur ${numeroJoueur}`,
            actorId: actorId,
            flags: {
                aitock: {
                    joueur: numeroJoueur,
                    pion: i + 1,
                    tock: true,
                    caseId: c.id // <-- mémorise l'id de la case d'origine
                }
            },
            texture: {
                tint: couleur
            }
        }]);
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

Hooks.on("updateToken", async (scene, tokenDoc, updateData, options, userId) => {
    if (typeof tokenDoc.getFlag !== "function") return;
    if (!tokenDoc.getFlag("aitock", "tock")) return;
    const caseId = tokenDoc.getFlag("aitock", "caseId");
    if (!caseId) return;

    const plateau = game.settings.get("aitock", "plateau");
    const caseCible = plateau?.find((c: any) => c.id === caseId);
    if (!caseCible) return;

    const tokenSize = canvas.grid?.size ?? 70;
    const xAttendu = caseCible.x - tokenSize / 2;
    const yAttendu = caseCible.y - tokenSize / 2;

    // Récupère le token "placeable" sur la scène (pour avoir la vraie position affichée)
    const placeable = canvas.tokens?.get(tokenDoc.id);
    if (!placeable) return;

    // Si la position réelle a changé, on remet le token à sa place
    if (updateData.x !== undefined || updateData.y !== undefined) {
        if (Math.abs(placeable.x - xAttendu) > 1 || Math.abs(placeable.y - yAttendu) > 1) {
            await tokenDoc.update({ x: xAttendu, y: yAttendu });
            ui.notifications?.info("[AITock] Ce pion doit rester sur sa case de depart !");
        }
    }
});
export type TypeCase = "normale" | "depart" | "arrivee";

export interface CaseTock {
    id: number;
    type: TypeCase;
    joueur: number;         // Numéro du joueur (1 à N)
    numeroCase: number;     // Numéro de la case pour ce joueur (1 à N)
    suivantes: number[];
    precedentes: number[];
    x: number;
    y: number;
    nom: string;
}

/**
 * Génère le plateau de Tock selon les règles (18 cases de parcours, 4 départs, 4 arrivées par joueur).
 * Les connexions spéciales sont respectées.
 * @param nbJoueurs Nombre de joueurs (2 à 6)
 */
export function creerPlateau(nbJoueurs: number, sceneId?: string): CaseTock[] {
    const cases: CaseTock[] = [];
    const casesParJoueur = 18;
    const nbDeparts = 4;
    const nbArrivees = 4;

    // Récupère la scène cible depuis l'ID (ou utilise la scène active si non précisé)
    let scene = sceneId ? game.scenes?.get(sceneId) : canvas?.scene;
    // Valeurs par défaut si la scène n'est pas trouvée
    const width = scene?.width ?? 4000;
    const height = scene?.height ?? 2400;
    const centreX = width / 2;
    const centreY = height / 2;
    const rayonCercle = Math.floor(0.35 * Math.min(width, height));
    const rayonDepart = Math.floor(rayonCercle * 1.15);
    const rayonArriveeMin = Math.floor(rayonCercle * 0.33);
    const rayonArriveeMax = rayonCercle - 60;

    let id = 1;
    const normalesByJoueur: number[][] = Array.from({ length: nbJoueurs }, () => []);
    const departsByJoueur: number[][] = Array.from({ length: nbJoueurs }, () => []);
    const arriveesByJoueur: number[][] = Array.from({ length: nbJoueurs }, () => []);

    // 1. Cases normales (cercle)
    for (let joueur = 1; joueur <= nbJoueurs; joueur++) {
        for (let i = 0; i < casesParJoueur; i++) {
            const globalIndex = (joueur - 1) * casesParJoueur + i;
            const angle = (2 * Math.PI * globalIndex) / (nbJoueurs * casesParJoueur);
            const x = Math.round(centreX + rayonCercle * Math.cos(angle));
            const y = Math.round(centreY + rayonCercle * Math.sin(angle));
            cases.push({
                id,
                type: "normale",
                joueur,
                numeroCase: i + 1,
                suivantes: [],
                precedentes: [],
                x, y,
                nom: `${id}`
            });
            normalesByJoueur[joueur - 1].push(id);
            id++;
        }
    }

    // 2. Cases départ (regroupées à l'extérieur du cercle, par joueur)
    for (let joueur = 1; joueur <= nbJoueurs; joueur++) {
        const baseAngle = (2 * Math.PI * (joueur - 1)) / nbJoueurs;
        for (let d = 0; d < nbDeparts; d++) {
            const angle = baseAngle + ((d - 1.5) * Math.PI) / (nbJoueurs * 3);
            const x = Math.round(centreX + rayonDepart * Math.cos(angle));
            const y = Math.round(centreY + rayonDepart * Math.sin(angle));
            cases.push({
                id,
                type: "depart",
                joueur,
                numeroCase: d + 1,
                suivantes: [],
                precedentes: [],
                x, y,
                nom: `${id}`
            });
            departsByJoueur[joueur - 1].push(id);
            id++;
        }
    }

    // 3. Cases arrivée (ligne vers le centre, la 4 la plus proche du centre)
    for (let joueur = 1; joueur <= nbJoueurs; joueur++) {
        const baseAngle = (2 * Math.PI * (joueur - 1)) / nbJoueurs;
        for (let a = 0; a < nbArrivees; a++) {
            const rayon = rayonArriveeMax - ((rayonArriveeMax - rayonArriveeMin) * a) / (nbArrivees - 1);
            const x = Math.round(centreX + rayon * Math.cos(baseAngle));
            const y = Math.round(centreY + rayon * Math.sin(baseAngle));
            cases.push({
                id,
                type: "arrivee",
                joueur,
                numeroCase: a + 1,
                suivantes: [],
                precedentes: [],
                x, y,
                nom: `${id}`
            });
            arriveesByJoueur[joueur - 1].push(id);
            id++;
        }
    }

    // Connexions suivantes/précédentes
    // Cases normales
    for (let joueur = 0; joueur < nbJoueurs; joueur++) {
        for (let i = 0; i < casesParJoueur; i++) {
            const idx = normalesByJoueur[joueur][i];
            let prevIdx: number;
            if (joueur === 0 && i === 0) {
                // Précédente de la toute première case : dernière case du dernier joueur
                prevIdx = normalesByJoueur[nbJoueurs - 1][casesParJoueur - 1];
            } else if (i === 0) {
                // Précédente de la première case de chaque joueur (sauf joueur 1) : dernière case du joueur précédent
                prevIdx = normalesByJoueur[joueur - 1][casesParJoueur - 1];
            } else {
                // Sinon, précédente normale
                prevIdx = normalesByJoueur[joueur][i - 1];
            }
            const nextIdx = (i === casesParJoueur - 1 && joueur === nbJoueurs - 1)
                ? normalesByJoueur[0][0] // Boucle sur la toute première case
                : (i === casesParJoueur - 1)
                    ? normalesByJoueur[joueur + 1][0]
                    : normalesByJoueur[joueur][i + 1];

            cases[idx - 1].suivantes = [nextIdx];
            cases[idx - 1].precedentes = [prevIdx];
        }
    }
    // Départs → première case normale du joueur
    for (let joueur = 0; joueur < nbJoueurs; joueur++) {
        for (let d = 0; d < nbDeparts; d++) {
            cases[departsByJoueur[joueur][d] - 1].suivantes = [normalesByJoueur[joueur][0]];
        }
    }
    // Arrivées → en ligne
    for (let joueur = 0; joueur < nbJoueurs; joueur++) {
        for (let a = 0; a < nbArrivees; a++) {
            if (a < nbArrivees - 1) {
                cases[arriveesByJoueur[joueur][a] - 1].suivantes = [arriveesByJoueur[joueur][a + 1]];
            }
            if (a > 0) {
                cases[arriveesByJoueur[joueur][a] - 1].precedentes = [arriveesByJoueur[joueur][a - 1]];
            }
        }
    }

    console.log("[AITock] Plateau généré :", cases);
    return cases;
}
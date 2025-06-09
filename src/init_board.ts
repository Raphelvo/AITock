export type TypeCase = "normale" | "depart" | "arrivee" | "ciel";

export interface CaseTock {
    id: number;
    type: TypeCase;
    joueur: number;
    numeroCase: number;
    suivantes: number[];
    precedentes: number[];
    x: number;
    y: number;
    nom: string;
    rayon?: number;
    protegee?: boolean; // <-- Ajout du champ protégé
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

    // Après avoir calculé le rayon idéal pour les cases normales :
    const totalNormales = nbJoueurs * casesParJoueur;
    const diametreCase = 2 * rayonCercle * Math.sin(Math.PI / totalNormales);
    const rayonCaseNormal = diametreCase / 2;

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
                nom: `${id}`,
                rayon: rayonCaseNormal,
                protegee: (i + 1 === 18) // Case 18 protégée
            });
            normalesByJoueur[joueur - 1].push(id);
            id++;
        }
    }

    // 2. Cases départ (toutes symétriques autour de la direction centre → case 18 du joueur précédent)
    for (let joueur = 1; joueur <= nbJoueurs; joueur++) {
        // On veut placer les départs autour de la direction allant du centre vers la case 18 du joueur précédent
        const prevJoueur = (joueur - 2 + nbJoueurs) % nbJoueurs; // joueur précédent (attention à l'indexation)
        const idxCase18 = normalesByJoueur[prevJoueur][casesParJoueur - 1];
        const case18 = cases[idxCase18 - 1];
        const dx = case18.x - centreX;
        const dy = case18.y - centreY;
        const baseAngle = Math.atan2(dy, dx);

        // Angle d'écart EXACTEMENT identique à celui entre 2 cases normales
        const ecart = (2 * Math.PI) / (nbJoueurs * casesParJoueur);

        for (let d = 0; d < nbDeparts; d++) {
            const angle = baseAngle + d * ecart;
            const x = centreX + rayonDepart * Math.cos(angle);
            const y = centreY + rayonDepart * Math.sin(angle);
            cases.push({
                id,
                type: "depart",
                joueur,
                numeroCase: d + 1,
                suivantes: [],
                precedentes: [],
                x, y,
                nom: `${id}`,
                rayon: rayonCaseNormal,
                protegee: true // Départ protégé
            });
            departsByJoueur[joueur - 1].push(id);
            id++;
        }
    }

    // 3. Cases arrivée (alignées entre case 16 et Ciel)
    for (let joueur = 1; joueur <= nbJoueurs; joueur++) {
        const idxCase16 = normalesByJoueur[joueur - 1][15];
        const case16 = cases[idxCase16 - 1];
        for (let a = 0; a < nbArrivees; a++) {
            const t = (a + 1) / (nbArrivees + 1);
            const x = case16.x + t * (centreX - case16.x);
            const y = case16.y + t * (centreY - case16.y);
            cases.push({
                id,
                type: "arrivee",
                joueur,
                numeroCase: a + 1,
                suivantes: [],
                precedentes: [],
                x, y,
                nom: `${id}`,
                rayon: rayonCaseNormal,
                protegee: true // Arrivée protégée
            });
            arriveesByJoueur[joueur - 1].push(id);
            id++;
        }
    }

    // 4. Case centrale "Ciel"
    cases.push({
        id,
        type: "ciel",
        joueur: 0,
        numeroCase: 0,
        suivantes: [],
        precedentes: [],
        x: centreX,
        y: centreY,
        nom: "Ciel",
        rayon: rayonCaseNormal,
        protegee: false
    });

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
    // Départs → case 18 du joueur précédent (ordre circulaire)
    for (let joueur = 0; joueur < nbJoueurs; joueur++) {
        // Le joueur précédent (avec boucle)
        const prevJoueur = (joueur - 1 + nbJoueurs) % nbJoueurs;
        const case18Prev = normalesByJoueur[prevJoueur][casesParJoueur - 1];
        for (let d = 0; d < nbDeparts; d++) {
            cases[departsByJoueur[joueur][d] - 1].suivantes = [case18Prev];
        }
    }

    console.log("[AITock] Plateau généré :", cases);

    return cases;
}
// Déclaration et enregistrement des paramètres configurables du module AITock

declare const game: any;
declare const Hooks: any;

/**
 * Enregistre les paramètres configurables du module AITock dans Foundry VTT.
 * À appeler au chargement du module (dans main.ts).
 */
export function registerAITockSettings() {
    Hooks.once('init', () => {
        console.log("[AITock] Initialisation des paramètres du module...");

        // Nombre de joueurs (2 à 6)
        game.settings.register("aitock", "nombreJoueurs", {
            name: "Nombre de joueurs",
            hint: "Choisissez le nombre de joueurs pour la partie de Tock.",
            scope: "world",
            config: true,
            type: String,
            choices: {
                "2": "2 joueurs",
                "3": "3 joueurs",
                "4": "4 joueurs",
                "5": "5 joueurs",
                "6": "6 joueurs"
            },
            default: "4"
        });
        console.log("[AITock] Paramètre 'nombreJoueurs' enregistré");

        // Mode équipes (oui/non)
        game.settings.register("aitock", "modeEquipes", {
            name: "Mode équipes",
            hint: "Activez ou non le mode équipes.",
            scope: "world",
            config: true,
            type: Boolean,
            default: false
        });
        console.log("[AITock] Paramètre 'modeEquipes' enregistré");

        // Nombre de joueurs par équipe à 6 joueurs (2 ou 3)
        game.settings.register("aitock", "joueursParEquipe6", {
            name: "Joueurs par équipe (à 6 joueurs)",
            hint: "À 6 joueurs, choisissez équipes de 2 ou 3.",
            scope: "world",
            config: true,
            type: String,
            choices: {
                "2": "Équipes de 2",
                "3": "Équipes de 3"
            },
            default: "2"
        });
        console.log("[AITock] Paramètre 'joueursParEquipe6' enregistré");

        // Échange de carte obligatoire en équipe
        game.settings.register("aitock", "echangeCarteObligatoire", {
            name: "Échange de carte obligatoire en équipe",
            hint: "Oblige chaque joueur à donner une carte à son partenaire à gauche.",
            scope: "world",
            config: true,
            type: Boolean,
            default: false
        });
        console.log("[AITock] Paramètre 'echangeCarteObligatoire' enregistré");

        // Roi renvoie à la maison les pions sur son passage
        game.settings.register("aitock", "roiRenvoiePions", {
            name: "Roi renvoie à la maison les pions sur son passage",
            hint: "Si activé, le Roi renvoie à la maison tous les pions sur son passage.",
            scope: "world",
            config: true,
            type: Boolean,
            default: false
        });
        console.log("[AITock] Paramètre 'roiRenvoiePions' enregistré");

        // 7 renvoie à la maison les pions sur son passage
        game.settings.register("aitock", "septRenvoiePions", {
            name: "7 renvoie à la maison les pions sur son passage",
            hint: "Si activé, le 7 renvoie à la maison tous les pions sur son passage.",
            scope: "world",
            config: true,
            type: Boolean,
            default: true
        });
        console.log("[AITock] Paramètre 'septRenvoiePions' enregistré");

        // 5 peut avancer n’importe quel pion
        game.settings.register("aitock", "cinqAvanceNimporteQuelPion", {
            name: "5 peut avancer n’importe quel pion",
            hint: "Si activé, le 5 permet d’avancer n’importe quel pion.",
            scope: "world",
            config: true,
            type: Boolean,
            default: false
        });
        console.log("[AITock] Paramètre 'cinqAvanceNimporteQuelPion' enregistré");

        // Places Tock (caché dans l'UI)
        game.settings.register("aitock", "placesTock", {
            name: "Places Tock",
            scope: "world",
            config: false,
            type: Array,
            default: Array(4).fill(null)
        });
        console.log("[AITock] Paramètre 'placesTock' enregistré");
    });

    // Enregistre le paramètre actorType au hook setup (et pas init)
    Hooks.once('setup', () => {
        let actorTypes: Record<string, string> = {};

        // 1. Structure moderne (DnD5e, PF2e, etc.)
        if (game.system?.model?.Actor) {
            actorTypes = Object.keys(game.system.model.Actor)
                .filter(key => key.toLowerCase() !== "base")
                .reduce((acc, key) => ({ ...acc, [key]: key }), {});
        }

        // 2. Structure via CONFIG.Actor.typeLabels (souvent la plus fiable)
        if (Object.keys(actorTypes).length === 0 && CONFIG?.Actor?.typeLabels) {
            actorTypes = { ...CONFIG.Actor.typeLabels };
            // Supprime "base" et "Base" du menu déroulant si présents
            delete actorTypes["base"];
            delete actorTypes["Base"];
        }

        // 3. Fallback sur les acteurs existants
        if (Object.keys(actorTypes).length === 0 && game.actors?.size > 0) {
            for (let actor of game.actors) {
                actorTypes[actor.type] = actor.type;
            }
        }

        // 4. Si toujours rien, propose character par défaut
        if (Object.keys(actorTypes).length === 0) {
            actorTypes = { character: "character" };
        }

        game.settings.register("aitock", "actorType", {
            name: "Type d'Actor à créer",
            hint: "Type d'Actor utilisé pour les joueurs (ex: Agent, PNJ, Heist...). Dépend du système.",
            scope: "world",
            config: true,
            type: String,
            choices: actorTypes,
            default: Object.keys(actorTypes)[0] ?? "character"
        });
        console.log("[AITock] Paramètre 'actorType' enregistré");
        console.log("[AITock] Types d'Actor détectés :", actorTypes);
    });

    Hooks.once('setup', () => {
        // Récupère la liste des scènes existantes
        const scenes = game.scenes?.reduce((acc: Record<string, string>, scene: any) => {
            acc[scene.id] = scene.name;
            return acc;
        }, {}) || {};

        // Ajoute "Plateau Tock" comme option spéciale si elle n'existe pas déjà
        const defaultName = "Plateau Tock";
        const hasDefault = Object.values(scenes).includes(defaultName);
        if (!hasDefault) {
            scenes["__tock_default__"] = defaultName;
        }

        game.settings.register("aitock", "sceneTockId", {
            name: "Scène du plateau Tock",
            hint: "Choisissez la scène où se jouera le Tock. Si 'Plateau Tock' est choisi et n'existe pas, elle sera créée.",
            scope: "world",
            config: true,
            type: String,
            choices: scenes,
            default: "__tock_default__"
        });
    });
}

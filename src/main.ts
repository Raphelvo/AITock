"use strict";

// Déclarations pour l'API Foundry (évite les erreurs TypeScript)
declare const Hooks: any;
declare const ui: any;

// Import de la fonction de configuration
import { registerAITockSettings } from "./config";

// Importe les fonctions de gestion de partie
import { demarrerPartieTock, participerTock } from "./init_partie";
import { dessinerCase, afficherPlateau} from "./graph_board";
import { creerPlateau } from "./init_board";

// Enregistrement des paramètres du module
registerAITockSettings();

// Fonction principale du module AITock
console.log("BLBLB");

function exampleFunction() {
    console.log("Ceci est une fonction exemple du module AITock.");
}

// Pour accès global éventuel
window.AITock = {
    exampleFunction,
};

// Affiche une notification traduite à l'ouverture du monde
Hooks.once('ready', async () => {
    ui.notifications?.info("Module AITock chargé !");

    // Dessine une case au centre de la scène (test temporaire)
    if (canvas?.scene) {
        const x = canvas.scene.width / 2;
        const y = canvas.scene.height / 2;
        dessinerCase(x, y, 60, "#ff8800", "Test");
    }

    window.AITock = {
        ...window.AITock,
        dessinerCase,
        demarrerPartieTock,
        participerTock,
        afficherPlateau
    };

    // Ajoute un bouton "Tock" dans la barre d'outils à gauche (sous le logo)
    if (game.user?.isGM) {
        const button = document.createElement("button");
        button.innerHTML = `<i class="fas fa-chess-board"></i> Tock`;
        button.style.margin = "8px";
        button.onclick = () => {
            window.AITock?.demarrerPartieTock();
        };

        // Ajoute le bouton dans la barre d'outils principale à gauche
        const controls = document.querySelector("#logo") || document.querySelector("#controls");
        if (controls) {
            controls.parentNode?.insertBefore(button, controls.nextSibling);
        }
    }

    const sceneSetting = game.settings.get("aitock", "sceneTockId");
    let sceneTock = null;

    if (sceneSetting === "__tock_default__") {
        // Cherche une scène nommée "Plateau Tock"
        sceneTock = game.scenes?.find((s: any) => s.name === "Plateau Tock");
        if (!sceneTock) {
            // Crée la scène si elle n'existe pas
            sceneTock = await Scene.create({
                name: "Plateau Tock",
                width: 2000,
                height: 1200,
                grid: 100,
                gridType: 1,
                padding: 0.1,
                shiftX: 0,
                shiftY: 0,
                initial: false
            });
            ui.notifications?.info("AITock: La scène 'Plateau Tock' a été créée.");

            // Appelle la génération du plateau pour cette scène
            const nbJoueurs = parseInt(game.settings.get("aitock", "nombreJoueurs") ?? "4");
            window.AITock.creerPlateau(nbJoueurs, sceneTock.id);
        }
    } else {
        sceneTock = game.scenes?.get(sceneSetting);
    }

});


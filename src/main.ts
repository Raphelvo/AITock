"use strict";

// Déclarations pour l'API Foundry (évite les erreurs TypeScript)
declare const Hooks: any;
declare const ui: any;

// Import de la fonction de configuration
import { registerAITockSettings } from "./config";

// Importe les fonctions de gestion de partie
import { demarrerPartieTock, participerTock } from "./init_partie";

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
Hooks.once('ready', () => {
    ui.notifications?.info("Module AITock chargé !");

    window.AITock = {
        ...window.AITock,
        demarrerPartieTock,
        participerTock
    };

    // Ajoute un bouton "Tock" dans la barre latérale
    if (game.user?.isGM) {
        const button = document.createElement("button");
        button.innerHTML = `<i class="fas fa-chess-board"></i> Tock`;
        button.style.margin = "8px";
        button.onclick = () => {
            window.AITock?.demarrerPartieTock();
        };

        // Ajoute le bouton dans la barre latérale de Foundry (dans la section "navigation")
        const nav = document.querySelector("#sidebar #sidebar-tabs");
        if (nav) {
            nav.appendChild(button);
        }
    }
});


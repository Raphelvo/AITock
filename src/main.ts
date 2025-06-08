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
    demarrerPartieTock,
    participerTock
};

// Affiche une notification traduite à l'ouverture du monde
Hooks.once('ready', () => {
    ui.notifications?.info("YOYOYOYO");
});


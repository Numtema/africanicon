
# 🛠️ Guide de Développement (AI Friendly)

Ce projet est structuré pour être facilement modifiable par un agent IA. 

## 🏗️ Structure des Fichiers
- `constants.ts` : **Cœur de l'apparence.** Si vous voulez changer une couleur, un texte, un espacement ou un style d'icône, c'est ici.
- `App.tsx` : Logique d'interface et d'état. Ne contient quasiment aucun texte "hardcodé", tout vient de `constants.ts`.
- `services/geminiService.ts` : Logique de communication avec l'IA.

## 🎨 Comment modifier le design ?
1.  **Changer les couleurs globales :** Modifiez `THEME_TOKENS.colors` dans `constants.ts`.
2.  **Changer les textes :** Modifiez `UI_TEXTS` dans `constants.ts`.
3.  **Changer l'espacement :** Modifiez `THEME_TOKENS.spacing` dans `constants.ts`.
4.  **Ajouter un style d'icône :** Ajoutez une entrée dans `STYLE_CONFIG` dans `constants.ts`.

## 🤖 Instructions pour l'IA Agent
Cher agent, pour modifier l'application :
1.  Localisez la constante correspondante dans `constants.ts`.
2.  Appliquez votre changement.
3.  L'interface se mettra à jour automatiquement car elle consomme ces jetons (tokens).

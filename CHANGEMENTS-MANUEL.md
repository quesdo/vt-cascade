# Changements - Mode Manuel vs Mode Automatique

## Vue d'ensemble

Le **mode manuel** ([index-manual.html](index-manual.html)) est une version ultra-simplifiée du système de cascade Digital Twin, conçue pour être contrôlée entièrement par des clics, sans aucune fenêtre pop-up ni texte explicatif.

## Comparaison visuelle

### Mode Automatique (index.html)
```
[Clic bouton crise]
    ↓
[Lien arrive sur VT]
    ↓
[Pop-up s'affiche AUTO après 0.5s]
    ↓
[Affiche problème + conséquence]
    ↓
[Attente 6 secondes]
    ↓
[Affiche solution AUTO]
    ↓
[Bouton "Continue" apparaît]
    ↓
[Attente 6 secondes OU clic]
    ↓
[Passe au VT suivant]
```

### Mode Manuel (index-manual.html)
```
[Clic bouton crise]
    ↓
[Lien arrive sur VT → CERCLE ROUGE]
    ↓
[CLIC 1 sur VT → CERCLE VERT]
    ↓
[CLIC 2 sur VT → Lien vers VT suivant]
    ↓
[Répéter pour chaque VT]
```

## Différences techniques

### 1. Structure HTML

**Mode Auto:**
- Contient `<div class="message-popup">` avec contenu détaillé
- Contient `<div class="auto-progress-indicator">` avec compte à rebours
- Bouton "Resolve with Digital Twin ✓"

**Mode Manuel:**
- ❌ Aucune pop-up
- ❌ Aucun indicateur de progression
- ❌ Aucun bouton de résolution
- ✅ Seulement les 3 images VT + boutons de crise + écran de succès

### 2. Logique JavaScript

**Mode Auto (app.js):**
- Fonction `showMessage()` - Affiche la pop-up avec problème/conséquence
- Fonction `showResolution()` - Affiche la solution après 6s
- Fonction `startAutoProgress()` - Gère le compte à rebours automatique
- Fonction `resolveCurrentProblem()` - Résout après clic bouton

**Mode Manuel (app-manual.js):**
- ❌ Aucune fonction de pop-up
- ❌ Aucune fonction de compte à rebours
- ✅ Fonction `handleVTClick()` - Gère les 2 clics sur chaque VT
- ✅ Variable `clickCount` - Suit l'état (0=rouge, 1=vert, 2=cascade)

### 3. Styles CSS

**Mode Auto (styles.css):**
- Styles pour `.message-popup` (200+ lignes)
- Styles pour `.auto-progress-indicator`
- Styles pour `.progress-bar` et `.progress-fill`
- Animation `shimmer` pour la barre de progression

**Mode Manuel (styles-manual.css):**
- ❌ Aucun style de pop-up
- ❌ Aucun style de progression
- ✅ Styles renforcés pour `.vt.clickable` (pulsation)
- ✅ Classes `.has-problem` (rouge) et `.resolved` (vert)

### 4. Données de scénarios

**Mode Auto:**
```javascript
{
    vt: "supply",
    problem: "🔴 IMPACT: US component prices +25%",
    consequence: "Supply costs spike dramatically...",
    solution: "European supplier found...",
    final: "🎯 Crisis resolved..."
}
```

**Mode Manuel:**
```javascript
{
    vt: "supply"
}
```
↳ **Seulement l'ID du VT, aucun texte !**

## Flux d'interaction

### Mode Auto
1. **Clic bouton** → Démarre scénario
2. **Lien arrive** → VT devient rouge (has-problem)
3. **Pop-up auto** → Affiche problème (après 0.5s)
4. **Attente 6s** → Affiche solution automatiquement
5. **Clic bouton OU attente 6s** → Passe au suivant

### Mode Manuel
1. **Clic bouton** → Démarre scénario
2. **Lien arrive** → VT devient rouge (has-problem)
3. **CLIC 1** → VT devient vert (resolved)
4. **CLIC 2** → Lien vers VT suivant

## Indicateurs visuels

| Élément | Mode Auto | Mode Manuel |
|---------|-----------|-------------|
| Badge VT | 🔴 → ⚙️ → ✓ (petit coin) | ❌ Caché |
| Titre principal | "DIGITAL TWIN" visible | ❌ Caché |
| Labels images | "Product Digital Twin" etc. | ❌ Cachés |
| Pop-up | Oui (détaillée) | ❌ Aucune |
| **Cercle coloré** | Non visible | **✅ GRAND cercle rouge/vert** |
| Ligne de connexion | Rouge → Vert | Rouge → Vert |
| Compte à rebours | Oui (5s, 6s...) | ❌ Aucun |

## Avantages du mode manuel

### Pour les démonstrations en public
- ✅ **Pas de lecture** - Tout est visuel
- ✅ **Contrôle total** - Vous dictez le rythme
- ✅ **Pas de timing** - Pas de stress avec les comptes à rebours
- ✅ **Plus simple** - Rouge = problème, Vert = résolu, Clic = suite

### Pour les présentations rapides
- ✅ **Gain de temps** - 2 clics vs attendre 12 secondes
- ✅ **Interaction directe** - Toucher les images plutôt que lire
- ✅ **Visuellement clair** - Cercles colorés évidents
- ✅ **Moins de texte** - Focus sur la cascade elle-même

## Fichiers modifiés

```
vt-cascade/
├── index.html              ← Mode automatique (original)
├── app.js                  ← Logique automatique
├── styles.css              ← Styles automatiques
│
├── index-manual.html       ← Mode manuel (nouveau) ✨
├── app-manual.js           ← Logique manuelle (nouveau) ✨
├── styles-manual.css       ← Styles manuels (nouveau) ✨
│
├── README-MANUAL.md        ← Documentation mode manuel ✨
└── CHANGEMENTS-MANUEL.md   ← Ce fichier ✨
```

## Comment choisir ?

### Utilisez le **mode automatique** si :
- Vous voulez expliquer les détails de chaque problème
- Vous avez besoin que les spectateurs lisent les informations
- Vous voulez une présentation guidée avec timing automatique
- Vous préférez un système "mains libres" après le clic initial

### Utilisez le **mode manuel** si :
- Vous faites une démo rapide devant un public
- Vous voulez interagir directement avec les images
- Vous préférez contrôler le rythme vous-même
- Vous voulez maximiser l'impact visuel (rouge → vert)
- Vous avez peu de temps et voulez aller à l'essentiel

## Tester les deux modes

1. **Mode automatique** : Ouvrez [index.html](index.html)
2. **Mode manuel** : Ouvrez [index-manual.html](index-manual.html)

Les deux modes partagent les mêmes ressources (images, Supabase config, etc.) et peuvent fonctionner en parallèle.

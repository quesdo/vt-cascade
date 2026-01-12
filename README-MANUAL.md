# Digital Twin Cascade - Mode Manuel Simplifié

## Description

Cette version du système de cascade Digital Twin fonctionne en **mode manuel ultra-simplifié** basé uniquement sur les clics, sans aucune fenêtre pop-up.

**Principe :** Cliquez sur les images des Digital Twins pour résoudre les problèmes et faire progresser la cascade.

## Interface épurée

- ❌ **Aucun titre** en haut de l'écran
- ❌ **Aucun label** sous les images
- ✅ **Seulement les 3 images** des Digital Twins
- ✅ **Cercles colorés** géants autour des images (rouge/vert)
- ✅ **Liens animés** entre les éléments

## Fichiers

- **index-manual.html** - Page HTML pour le mode manuel
- **app-manual.js** - Logique JavaScript pour le mode manuel (basée sur les clics)
- **styles-manual.css** - Styles CSS avec cercles rouges/verts

## Comment utiliser

### Flux complet

```
1. Cliquez sur un bouton de crise (ex: "🚨 Increase of Tariffs +25%")
   ↓
2. Un lien rouge animé apparaît vers le premier Digital Twin
   ↓
3. CERCLE ROUGE apparaît autour du Digital Twin
   ↓
4. CLIQUEZ UNE FOIS sur le Digital Twin
   → Le cercle rouge devient VERT
   ↓
5. CLIQUEZ UNE DEUXIÈME FOIS sur le même Digital Twin
   → Un nouveau lien rouge part vers le prochain Digital Twin
   ↓
6. Répétez les étapes 3-5 pour chaque Digital Twin
   ↓
7. Après le dernier Digital Twin : écran de succès
```

## Détails du comportement

### État 1 : Lien arrive → Cercle Rouge
- Un lien rouge animé arrive sur le Digital Twin
- Un **GRAND CERCLE ROUGE** apparaît autour de l'image (pulse/pulsation)
- L'image entière est entourée d'un halo rouge lumineux
- **En attente du 1er clic**

### État 2 : 1er clic → Cercle Vert
- Vous cliquez une première fois sur le Digital Twin
- Le **cercle rouge devient un GRAND CERCLE VERT** instantanément
- L'image entière est entourée d'un halo vert lumineux
- Le lien se colore également en vert
- **En attente du 2ème clic**

### État 3 : 2ème clic → Cascade
- Vous cliquez une deuxième fois sur le même Digital Twin
- Un **nouveau lien rouge** part vers le prochain Digital Twin de la cascade
- Le cycle recommence à l'État 1 pour le prochain twin

## Exemple concret : Scénario "Tariffs +25%"

```
CLIC bouton "Increase of Tariffs +25%"
    ↓
Lien rouge → Supply Chain Digital Twin
    ↓
CERCLE ROUGE sur Supply Chain
    ↓
CLIC 1 sur Supply Chain → CERCLE VERT
    ↓
CLIC 2 sur Supply Chain
    ↓
Lien rouge → Product Digital Twin
    ↓
CERCLE ROUGE sur Product
    ↓
CLIC 1 sur Product → CERCLE VERT
    ↓
CLIC 2 sur Product
    ↓
Lien rouge → Production Systems Digital Twin
    ↓
CERCLE ROUGE sur Production
    ↓
CLIC 1 sur Production → CERCLE VERT
    ↓
CLIC 2 sur Production
    ↓
ÉCRAN DE SUCCÈS 🎯
```

## Scénarios disponibles

Chaque scénario a sa propre cascade :

### 1. Increase of Tariffs +25%
Supply Chain → Product → Production Systems

### 2. Labor Shortage Crisis
Production Systems → Product → Supply Chain

### 3. Material Change Required
Product → Supply Chain → Production Systems

## Différences avec le mode automatique

| Fonctionnalité | Mode Automatique | Mode Manuel Simplifié |
|----------------|------------------|----------------------|
| Pop-ups | Oui (auto) | **Aucune** |
| Messages texte | Oui | **Aucun** |
| Indicateurs visuels | Badges | **Cercles colorés** |
| Interactions | Lecture + clic | **2 clics par étape** |
| Compte à rebours | Oui | **Aucun** |
| Complexité | Moyenne | **Très simple** |

## Avantages de ce mode

✅ **Ultra-simple** - Juste des clics, pas de lecture
✅ **Visuel** - Cercles rouges/verts très clairs
✅ **Rapide** - Pas d'attente, vous contrôlez le rythme
✅ **Intuitif** - Rouge = problème, Vert = résolu, 2ème clic = suivant
✅ **Idéal pour démonstrations** - Facile à présenter en public

## Intégration SDK

Le système envoie toujours les messages au SDK pour :
- Afficher/masquer les acteurs "Issue" (problème)
- Afficher/masquer les acteurs "Working" (résolu)
- Basculer entre "Web Cascade" et "Web Univers" à la fin

## Compatibilité

- Synchronisation Supabase en temps réel
- Mode multi-utilisateur (contrôleur + spectateurs)
- Mêmes ressources que la version automatique

## Ouvrir le mode manuel

Ouvrez simplement **index-manual.html** dans votre navigateur !

# Digital Twin Controller - Page de Contrôle

## Description

Page de contrôle séparée qui permet de lancer les scénarios de cascade à distance. Idéale pour les présentations où le présentateur contrôle la démonstration depuis un appareil (tablette, téléphone) pendant que l'écran principal affiche la visualisation.

## Fichiers

- **[controller.html](controller.html)** - Page HTML de contrôle
- **[controller.css](controller.css)** - Styles de la page de contrôle
- **[controller.js](controller.js)** - Logique JavaScript du contrôleur

## Utilisation

### Configuration à 2 écrans

#### Écran Principal (Projection/TV)
Ouvrez **[index-manual.html](index-manual.html)**
- Affiche les 3 Digital Twins
- Montre les cercles colorés et liens animés
- Réagit aux commandes du contrôleur
- Mode spectateur automatique

#### Appareil de Contrôle (Tablette/Téléphone/PC)
Ouvrez **[controller.html](controller.html)**
- Interface simple avec 3 gros boutons
- Indicateur de statut de connexion
- Bouton Reset pour recommencer
- Instructions intégrées

### Flux de travail

```
PRÉSENTATEUR (Tablette)          ÉCRAN PRINCIPAL (TV)
────────────────────────────────────────────────────

[Ouvre controller.html]          [Ouvre index-manual.html]
    │                                    │
    │                                    │
[Status: Connected 🟢]           [Attente du scénario]
    │                                    │
[Clic "Tariffs +25%"]                   │
    │                                    │
    └────────> Supabase ─────────────>  │
               (scenario_started)        │
                                         │
                                    [Lien rouge apparaît]
                                         │
                                    [Cercle rouge sur Supply]
                                         │
[Status: Controlling 🟠]            [Attente du clic]
    │                                    │
                                    [Présentateur clique Supply]
                                         │
                                    [Cercle vert]
                                         │
                                    [Cascade continue...]
    │                                    │
[Clic "Reset System"]                   │
    │                                    │
    └────────> Supabase ─────────────>  │
               (idle)                    │
                                         │
[Status: Connected 🟢]           [Reset complet]
```

## Interface du Contrôleur

### 1. Titre
```
Digital Twin Controller
```

### 2. Indicateur de Statut
- 🔵 **Waiting for connection...** - Connexion en cours
- 🟢 **Connected** - Connecté, prêt à contrôler
- 🟠 **Controlling** - Contrôle actif d'un scénario

### 3. Boutons de Crise

#### Button 1 : Increase of Tariffs
```
🚨
Increase of Tariffs
+25% on US components
```

#### Button 2 : Labor Shortage Crisis
```
🚨
Labor Shortage Crisis
-30% workforce capacity
```

#### Button 3 : Material Change Required
```
🚨
Material Change Required
Key material discontinued
```

### 4. Bouton Reset
```
↻ Reset System
```

### 5. Panneau d'Instructions
Instructions intégrées pour l'utilisation rapide

## Avantages

### Pour les présentations
✅ **Contrôle à distance** - Pilotez depuis votre tablette/téléphone
✅ **Interface épurée** - Seulement les boutons essentiels
✅ **Gros boutons tactiles** - Faciles à cliquer pendant une présentation
✅ **Indicateur visuel** - Voyez le statut de connexion en temps réel
✅ **Pas de distraction** - L'écran principal reste clean

### Pour les démonstrations
✅ **Setup professionnel** - Écran principal pour l'audience, contrôle pour le présentateur
✅ **Mobilité** - Contrôlez tout en vous déplaçant dans la salle
✅ **Sécurisé** - Un seul contrôleur à la fois
✅ **Synchronisé** - Tous les spectateurs voient la même chose

## Fonctionnalités Techniques

### Synchronisation Supabase
- ✅ Prise de contrôle automatique
- ✅ Protection contre les contrôles simultanés
- ✅ Libération automatique du contrôle
- ✅ Mise à jour temps réel du statut

### États du Contrôleur
| État | Signification | Actions possibles |
|------|---------------|-------------------|
| **Waiting** | Connexion en cours | Attendre |
| **Connected** | Prêt à utiliser | Lancer un scénario |
| **Controlling** | Scénario actif | Attendre la fin ou Reset |

### Protection
- ❌ **Impossible de lancer 2 scénarios** en même temps
- ❌ **Un seul contrôleur** à la fois
- ✅ **Message d'alerte** si quelqu'un contrôle déjà
- ✅ **Réactivation automatique** quand disponible

## Configuration Multi-Écrans

### Option 1 : Présentateur + Écran
```
Présentateur (tablette)  ──┐
                            ├──> Supabase ──> Écran principal (TV)
                            │
Spectateurs (ordinateurs) ──┘
```

### Option 2 : Démo en ligne
```
Contrôleur (PC présentateur) ──┐
                                ├──> Supabase
Spectateur 1 (Remote) ──────────┤
Spectateur 2 (Remote) ──────────┤
Spectateur 3 (Remote) ──────────┘
```

## Styles & Design

### Palette de couleurs
- **Fond** : Dégradé bleu foncé `#1a1a2e` → `#16213e`
- **Titre** : Dégradé bleu clair `#4da6ff` → `#00d4ff`
- **Boutons crise** : Dégradé rouge `#d32f2f` → `#b71c1c`
- **Bouton reset** : Gris foncé `#424242` → `#212121`
- **Status connecté** : Vert `#4caf50`
- **Status contrôle** : Orange `#ff9800`

### Animations
- ✨ Pulse sur le dot de statut
- ✨ Survol des boutons avec élévation
- ✨ Effet de brillance au survol

## Compatibilité

### Appareils supportés
- ✅ Desktop (Windows, Mac, Linux)
- ✅ Tablettes (iPad, Android)
- ✅ Smartphones (iOS, Android)
- ✅ Navigateurs modernes (Chrome, Firefox, Safari, Edge)

### Responsive
- Adapté pour petits écrans (smartphones)
- Boutons tactiles optimisés
- Layout flexible

## Utilisation recommandée

### Pour une présentation
1. **Avant la présentation**
   - Ouvrir [controller.html](controller.html) sur votre tablette
   - Ouvrir [index-manual.html](index-manual.html) sur l'écran de projection
   - Vérifier que les deux affichent "Connected"

2. **Pendant la présentation**
   - Expliquer le scénario
   - Cliquer sur le bouton correspondant sur votre tablette
   - L'écran principal affiche la cascade
   - Cliquer sur les Digital Twins pour progresser
   - Utiliser Reset entre les scénarios

3. **Fin de présentation**
   - Cliquer sur Reset System
   - Fermer les deux pages

## Dépannage

### "Someone else is already controlling"
➡️ Quelqu'un d'autre contrôle déjà. Attendez qu'il termine ou demandez-lui de Reset.

### Le statut reste "Waiting for connection"
➡️ Vérifiez votre connexion internet et la configuration Supabase.

### Les boutons ne répondent pas
➡️ Vérifiez que vous êtes en mode "Connected" (pas "Controlling" d'un ancien scénario).

### L'écran principal ne réagit pas
➡️ Rafraîchissez la page [index-manual.html](index-manual.html) sur l'écran principal.

## Fichiers requis

Le contrôleur partage ces fichiers avec la page principale :
- **supabase-config.js** - Configuration Supabase
- **Images** - Les 3 images des Digital Twins (pour la page principale)
- **Base de données** - Table `cascade_session` Supabase

## Comparaison avec la page principale

| Fonctionnalité | controller.html | index-manual.html |
|----------------|-----------------|-------------------|
| Boutons de crise | ✅ Gros boutons | ✅ Petits boutons |
| Images Digital Twins | ❌ Non | ✅ Oui |
| Cercles colorés | ❌ Non | ✅ Oui |
| Liens animés | ❌ Non | ✅ Oui |
| Clics sur VT | ❌ Non | ✅ Oui |
| Contrôle Supabase | ✅ Oui | ✅ Oui |
| Usage principal | **Contrôler** | **Visualiser** |

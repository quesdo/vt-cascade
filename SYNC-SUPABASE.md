# Synchronisation Supabase - Mode Manuel

## États synchronisés

Le mode manuel synchronise tous les événements via Supabase pour que les spectateurs voient exactement ce que fait le contrôleur.

### 1. **scenario_started** - Démarrage du scénario
**Déclencheur :** Clic sur un bouton de crise

**Contrôleur envoie :**
```javascript
{
    scenario_type: 'tarif' | 'labor' | 'material',
    current_step: 0,
    state: 'scenario_started'
}
```

**Spectateurs reçoivent :**
- Initialisation du même scénario
- Désactivation des boutons
- Préparation de l'interface

---

### 2. **showing_impact** - Lien arrive sur un VT
**Déclencheur :** Lien animé arrive sur un Digital Twin

**Contrôleur envoie :**
```javascript
{
    current_step: 0 | 1 | 2,
    state: 'showing_impact'
}
```

**Spectateurs reçoivent :**
- Animation du lien rouge vers le VT
- Apparition du **cercle rouge** autour du VT
- Badge 🔴 affiché

---

### 3. **circle_resolved** - Premier clic (Rouge → Vert) ✨ NOUVEAU
**Déclencheur :** Premier clic sur le Digital Twin

**Contrôleur envoie :**
```javascript
{
    state: 'circle_resolved',
    current_step: 0 | 1 | 2
}
```

**Spectateurs reçoivent :**
- Le **cercle rouge devient VERT** instantanément
- Le **lien devient vert** également
- Badge passe à ✓ vert
- SDK: Issue cachée, Working affiché

**Fonction synchronisée :**
```javascript
function syncCircleResolved(step) {
    const vtType = currentScenario.chain[currentStep].vt;
    const vtElement = document.getElementById(`vt-${vtType}`);

    if (vtElement) {
        handleFirstClickLocal(vtType, vtElement);
        // → Applique le cercle vert localement
    }
}
```

---

### 4. **circle_removed** - Deuxième clic (Cercle disparaît) ✨ NOUVEAU
**Déclencheur :** Deuxième clic sur le Digital Twin (non dernier)

**Contrôleur envoie :**
```javascript
{
    state: 'circle_removed',
    current_step: 0 | 1 | 2
}
```

**Spectateurs reçoivent :**
- Le **cercle vert disparaît** instantanément
- `clickCount` réinitialisé à 0
- Préparation pour le prochain VT

**Fonction synchronisée :**
```javascript
function syncCircleRemoved(step) {
    const vtType = currentScenario.chain[currentStep].vt;
    const vtElement = document.getElementById(`vt-${vtType}`);

    if (vtElement) {
        handleSecondClickLocal(vtType, vtElement);
        // → Supprime le cercle vert localement
    }
}
```

---

### 5. **showing_impact** - Cascade vers VT suivant
**Déclencheur :** Après suppression du cercle (automatique 0.5s après)

**Contrôleur envoie :**
```javascript
{
    current_step: 1 | 2,  // Incrément
    state: 'showing_impact'
}
```

**Spectateurs reçoivent :**
- Animation du lien rouge vers le VT suivant
- Répétition du cycle

---

### 6. **success** - Écran de succès
**Déclencheur :** Deuxième clic sur le dernier VT

**Contrôleur envoie :**
```javascript
{
    state: 'success'
}
```

**Spectateurs reçoivent :**
- Écran de succès avec message
- SDK: Web Cascade cachée, Web Univers affichée

---

### 7. **idle** - Reset
**Déclencheur :** Clic sur "New Scenario"

**Contrôleur envoie :**
```javascript
{
    controller_id: null,
    state: 'idle',
    scenario_type: null,
    current_step: 0
}
```

**Spectateurs reçoivent :**
- Réinitialisation complète de l'interface
- Réactivation des boutons
- SDK: Tous les VT en mode Working

---

## Flux complet synchronisé

### Exemple : Scénario "Tariffs +25%"

```
CONTRÔLEUR                           SUPABASE                    SPECTATEURS
───────────────────────────────────────────────────────────────────────────────

[Clic "Tariffs +25%"]
    │
    └──> scenario_started ────────────────────────> [Démarre scénario]
         tarif, step 0

[Lien → Supply Chain]
    │
    └──> showing_impact ───────────────────────────> [Lien rouge → Supply]
         step 0                                       [Cercle ROUGE]

[Clic 1 sur Supply]
    │
    └──> circle_resolved ──────────────────────────> [Cercle → VERT] ✨
         step 0                                       [Lien → vert]

[Clic 2 sur Supply]
    │
    └──> circle_removed ───────────────────────────> [Cercle disparaît] ✨
         step 0
    │
    └──> showing_impact ───────────────────────────> [Lien rouge → Product]
         step 1                                       [Cercle ROUGE]

[Clic 1 sur Product]
    │
    └──> circle_resolved ──────────────────────────> [Cercle → VERT] ✨
         step 1                                       [Lien → vert]

[Clic 2 sur Product]
    │
    └──> circle_removed ───────────────────────────> [Cercle disparaît] ✨
         step 1
    │
    └──> showing_impact ───────────────────────────> [Lien rouge → Production]
         step 2                                       [Cercle ROUGE]

[Clic 1 sur Production]
    │
    └──> circle_resolved ──────────────────────────> [Cercle → VERT] ✨
         step 2                                       [Lien → vert]

[Clic 2 sur Production]
    │
    └──> success ──────────────────────────────────> [Écran de succès 🎯]

[Clic "New Scenario"]
    │
    └──> idle ─────────────────────────────────────> [Reset complet]
```

---

## Code clé

### Envoi (Contrôleur)

```javascript
// Premier clic - Cercle devient vert
async function handleFirstClick(vtId, vtElement) {
    if (isController) {
        await updateSession({
            state: 'circle_resolved',
            current_step: currentStep
        });
    }
    handleFirstClickLocal(vtId, vtElement);
}
```

### Réception (Spectateurs)

```javascript
function syncFromSession(data) {
    switch (data.state) {
        case 'circle_resolved':
            syncCircleResolved(data.current_step);
            break;
        // ... autres états
    }
}

function syncCircleResolved(step) {
    const vtType = currentScenario.chain[currentStep].vt;
    const vtElement = document.getElementById(`vt-${vtType}`);

    if (vtElement) {
        handleFirstClickLocal(vtType, vtElement);
    }
}
```

---

## Différence avec le mode automatique

| État | Mode Auto | Mode Manuel |
|------|-----------|-------------|
| Problème détecté | `showing_impact` | `showing_impact` |
| Solution affichée | `showing_solution` | ❌ **circle_resolved** ✨ |
| Progression auto | Oui (6s timers) | ❌ Non |
| Contrôle utilisateur | 1 clic optionnel | **2 clics obligatoires** |

---

## Avantages de cette synchronisation

✅ **Synchronisation parfaite** - Les spectateurs voient exactement ce que fait le contrôleur
✅ **Cercle vert synchronisé** - Le changement rouge→vert est visible par tous
✅ **État du lien synchronisé** - Le lien devient vert pour tous en même temps
✅ **SDK synchronisé** - Les acteurs 3D changent pour tous les utilisateurs
✅ **Pas de désynchronisation** - Chaque action est tracée et répliquée

---

## Base de données Supabase

### Table : `cascade_session`

```sql
CREATE TABLE cascade_session (
    id UUID PRIMARY KEY,
    controller_id TEXT,
    state TEXT,  -- 'idle' | 'scenario_started' | 'showing_impact' | 'circle_resolved' | 'circle_removed' | 'success'
    scenario_type TEXT,  -- 'tarif' | 'labor' | 'material'
    current_step INTEGER,  -- 0 | 1 | 2
    updated_at TIMESTAMP
);
```

### États possibles

- `idle` - Aucun scénario en cours
- `scenario_started` - Scénario démarré
- `showing_impact` - Lien arrive/VT activé (cercle rouge)
- **`circle_resolved`** ✨ - Cercle devient vert (1er clic)
- **`circle_removed`** ✨ - Cercle disparaît (2ème clic)
- `success` - Scénario terminé avec succès

# Flux de Synchronisation - Visual Guide

## Vue d'Ensemble

```
Controller (index-manual.html)     Supabase         Spectateurs (index-manual.html)
         |                            |                         |
         |                            |                         |
```

## Étape 1 : Démarrage du Scénario

```
Controller clique "Tariff Crisis"
         |
         v
    updateSession({
        state: 'scenario_started',
        scenario_type: 'tarif',
        current_step: 0
    })
         |
         v
     Supabase
         |
         +------------------+------------------+
         v                  v                  v
    Controller        Spectateur 1        Spectateur 2
         |                  |                  |
  startScenarioLocal() startScenarioSync() startScenarioSync()
         |                  |                  |
         +------------------+------------------+
                            |
                Tous voient le même scénario démarrer
```

## Étape 2 : Afficher l'Impact (Lien + Cercle Rouge)

```
Controller (auto après start)
         |
         v
    updateSession({
        state: 'showing_impact',
        current_step: 0
    })
         |
         v
     Supabase
         |
         +------------------+------------------+
         v                  v                  v
    Controller        Spectateur 1        Spectateur 2
         |                  |                  |
   triggerStepLocal()  triggerStepSync()  triggerStepSync()
         |                  |                  |
         +------------------+------------------+
                            |
            Tous voient : Lien → Supply Chain
            Tous voient : Cercle ROUGE sur Supply Chain
```

## Étape 3 : Premier Clic (Rouge → Vert)

```
N'importe qui clique sur Supply Chain (cercle rouge)
         |
         v
   Qui que ce soit qui clique
         |
         v
    updateSession({
        state: 'circle_resolved',
        current_step: 0
    })
         |
         v
     Supabase
         |
         +------------------+------------------+
         v                  v                  v
    Controller        Spectateur 1        Spectateur 2
         |                  |                  |
handleFirstClickLocal() syncCircleResolved() syncCircleResolved()
         |                  |                  |
         +------------------+------------------+
                            |
            Tous voient : Cercle VERT sur Supply Chain
            Tous voient : Lien devient VERT
```

## Étape 4 : Deuxième Clic (Vert → Cascade)

```
N'importe qui clique sur Supply Chain (cercle vert)
         |
         v
    updateSession({
        state: 'circle_removed',
        current_step: 0
    })
         |
         v
     Supabase
         |
         +------------------+------------------+
         v                  v                  v
    Controller        Spectateur 1        Spectateur 2
         |                  |                  |
handleSecondClickLocal() syncCircleRemoved() syncCircleRemoved()
         |                  |                  |
         +------------------+------------------+
                            |
            Tous voient : Cercle VERT RESTE sur Supply Chain ✓

                            |
         v
    updateSession({
        state: 'showing_impact',
        current_step: 1
    })
         |
         v
     Supabase
         |
         +------------------+------------------+
         v                  v                  v
    Controller        Spectateur 1        Spectateur 2
         |                  |                  |
   triggerStepLocal()  triggerStepSync()  triggerStepSync()
         |                  |                  |
         +------------------+------------------+
                            |
            Tous voient : Lien → Product
            Tous voient : Cercle ROUGE sur Product
```

## Étape 5-8 : Répétition pour Product et Production

```
Même flux pour chaque Digital Twin :
1. Clic 1 : Rouge → Vert (circle_resolved)
2. Clic 2 : Cascade (circle_removed + showing_impact)

Résultat après Product :
- Supply Chain : Cercle VERT ✓
- Product : Cercle VERT ✓
- Lien vers Production

Résultat après Production (dernier) :
- Supply Chain : Cercle VERT ✓
- Product : Cercle VERT ✓
- Production : Cercle VERT ✓
```

## Étape 9 : Fin du Scénario (Dernier Clic)

```
Clic 2 sur Production (dernier VT)
         |
         v
    updateSession({
        state: 'success'
    })
         |
         v
     Supabase
         |
         +------------------+------------------+
         v                  v                  v
    Controller        Spectateur 1        Spectateur 2
         |                  |                  |
   toggleVisibility()  toggleVisibility()  toggleVisibility()
         |                  |                  |
         +------------------+------------------+
                            |
            Tous voient : Web Cascade CACHÉ
            Tous voient : Web Univers VISIBLE
            Tous voient : 3 Cercles VERTS restent ✓
```

## Étape 10 : Reset

```
Controller clique "Reset System"
         |
         v
    releaseControl()
         |
         v
    updateSession({
        state: 'idle'
    })
         |
         v
     Supabase
         |
         +------------------+------------------+
         v                  v                  v
    Controller        Spectateur 1        Spectateur 2
         |                  |                  |
  resetSystemLocal()  resetSystemLocal()  resetSystemLocal()
         |                  |                  |
         +------------------+------------------+
                            |
            Tous voient : Canvas vide
            Tous voient : Cercles disparus
            Tous voient : Web Cascade VISIBLE
            Tous voient : Web Univers CACHÉ
```

---

## Résumé des États Supabase

| État | Quand | Qui le déclenche | Que voit tout le monde |
|------|-------|------------------|------------------------|
| **idle** | Reset | Controller | Canvas vide, Web Cascade visible |
| **scenario_started** | Clic crise | Controller | Scénario démarre |
| **showing_impact** | Auto après start ou 2ème clic | Controller | Lien + cercle rouge sur VT |
| **circle_resolved** | 1er clic | N'importe qui | Cercle rouge → vert |
| **circle_removed** | 2ème clic | N'importe qui | Cercle RESTE vert, prépare cascade |
| **success** | Dernier 2ème clic | N'importe qui | Web Univers visible, 3 cercles verts |

---

## Garanties de Synchronisation

✅ **Garanties** :
1. Tous les spectateurs voient les MÊMES événements
2. Les événements arrivent dans le MÊME ordre
3. Les cercles verts RESTENT visibles après cascade
4. Les 3 cercles verts sont visibles à la fin
5. Web Univers s'affiche pour tout le monde à la fin
6. Reset remet tout à zéro pour tout le monde

⚡ **Latence** : < 100ms entre controller et spectateurs (Supabase Realtime)

🔒 **Contrôle** : Un seul controller à la fois (session lock)

---

## Diagramme de Flux Complet

```
START
  |
  v
[idle] ────> Clic crise ────> [scenario_started]
                                      |
                                      v
                              [showing_impact] (step 0)
                                      |
                                      v
                          Cercle ROUGE sur VT 1
                                      |
                                      v
                          Clic 1 ────> [circle_resolved]
                                      |
                                      v
                          Cercle VERT sur VT 1
                                      |
                                      v
                          Clic 2 ────> [circle_removed]
                                      |
                                      v
                              [showing_impact] (step 1)
                                      |
                                      v
                          Cercle ROUGE sur VT 2
                          (VT 1 reste VERT ✓)
                                      |
                                      v
                          Clic 1 ────> [circle_resolved]
                                      |
                                      v
                          Cercle VERT sur VT 2
                          (VT 1 reste VERT ✓)
                                      |
                                      v
                          Clic 2 ────> [circle_removed]
                                      |
                                      v
                              [showing_impact] (step 2)
                                      |
                                      v
                          Cercle ROUGE sur VT 3
                          (VT 1,2 restent VERTS ✓)
                                      |
                                      v
                          Clic 1 ────> [circle_resolved]
                                      |
                                      v
                          Cercle VERT sur VT 3
                          (VT 1,2 restent VERTS ✓)
                                      |
                                      v
                          Clic 2 ────> [success]
                                      |
                                      v
                        Web Cascade CACHÉ
                        Web Univers VISIBLE
                        3 Cercles VERTS visibles ✓
                                      |
                                      v
                          Reset ────> [idle]
                                      |
                                      v
                        Canvas vide
                        Web Cascade VISIBLE
```

---

## Code de Synchronisation Clé

### Controller envoie
```javascript
await updateSession({
    state: 'circle_resolved',
    current_step: currentStep
});
```

### Spectateurs reçoivent
```javascript
case 'circle_resolved':
    syncCircleResolved(data.current_step);
    break;
```

### Fonction de sync
```javascript
function syncCircleResolved(step) {
    const vtType = currentScenario.chain[step].vt;
    const vtElement = document.getElementById(`vt-${vtType}`);
    if (vtElement) {
        handleFirstClickLocal(vtType, vtElement); // Applique cercle vert
    }
}
```

---

**Résultat** : Parfaite synchronisation entre controller et tous les spectateurs ! 🎯

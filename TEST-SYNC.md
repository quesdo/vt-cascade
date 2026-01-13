# Test de Synchronisation Multi-Utilisateurs

## Objectif
Vérifier que tous les spectateurs voient exactement les mêmes étapes que le controller.

## Configuration de Test

### Étape 1 : Ouvrir les pages
1. **Appareil 1 (Controller)** : Ouvrir `controller.html`
2. **Appareil 2 (Spectateur)** : Ouvrir `index-manual.html`
3. **Appareil 3 (Spectateur)** : Ouvrir `index-manual.html` (optionnel)

### Étape 2 : Vérifier la connexion
- Tous les appareils doivent afficher "Connected" dans la console
- Le controller doit montrer "Waiting for connection..." ou "Connected"

## Scénarios de Test

### Test 1 : Démarrage du Scénario

**Action (Controller)** : Cliquer sur "Increase of Tariffs"

**Résultat attendu sur TOUS les écrans** :
- ✅ Un lien animé part du centre vers Supply Chain
- ✅ Cercle rouge apparaît autour de Supply Chain
- ✅ Pulse animation sur le cercle rouge

**États Supabase** :
1. `scenario_started` → Démarre le scénario
2. `showing_impact` (step 0) → Affiche l'impact sur Supply Chain

---

### Test 2 : Premier Clic (Rouge → Vert)

**Action (Controller ou n'importe qui)** : Cliquer 1x sur Supply Chain (cercle rouge)

**Résultat attendu sur TOUS les écrans** :
- ✅ Cercle rouge disparaît
- ✅ Cercle vert apparaît autour de Supply Chain
- ✅ Glow animation sur le cercle vert
- ✅ Lien devient vert

**État Supabase** :
- `circle_resolved` (step 0) → Synchronise le cercle vert

---

### Test 3 : Deuxième Clic (Vert → Cascade)

**Action (Controller ou n'importe qui)** : Cliquer 1x sur Supply Chain (cercle vert)

**Résultat attendu sur TOUS les écrans** :
- ✅ Cercle vert RESTE VISIBLE sur Supply Chain
- ✅ Lien animé part de Supply Chain vers Product
- ✅ Cercle rouge apparaît autour de Product

**États Supabase** :
1. `circle_removed` (step 0) → Déclenche la cascade
2. `showing_impact` (step 1) → Affiche l'impact sur Product

---

### Test 4 : Progression Complète

**Répéter pour Product (étape 2)** :
1. **Clic 1** : Cercle rouge → vert sur Product
2. **Clic 2** : Cercle vert reste, lien vers Production

**Répéter pour Production (étape 3 - dernière)** :
1. **Clic 1** : Cercle rouge → vert sur Production
2. **Clic 2** : Cercle vert reste, Web Cascade disparaît, Web Univers apparaît

**Résultat final attendu** :
- ✅ 3 cercles verts visibles (Supply Chain, Product, Production)
- ✅ 3 liens verts visibles
- ✅ Web Cascade caché
- ✅ Web Univers visible

**État Supabase** :
- `success` → Scénario terminé

---

### Test 5 : Reset

**Action (Controller)** : Cliquer sur "Reset System"

**Résultat attendu sur TOUS les écrans** :
- ✅ Tous les cercles verts disparaissent
- ✅ Tous les liens disparaissent
- ✅ Canvas vide
- ✅ Web Cascade redevient visible
- ✅ Web Univers se cache

**État Supabase** :
- `idle` → Reset complet

---

## Liste de Vérification Complète

### Synchronisation des Liens
- [ ] Spectateur voit le lien partir au même moment que le controller
- [ ] Animation du lien identique (vitesse, trajectoire)
- [ ] Lien arrive sur le bon Digital Twin

### Synchronisation des Cercles Rouges
- [ ] Cercle rouge apparaît au même moment pour tous
- [ ] Pulse animation synchronisée
- [ ] Taille et position identiques

### Synchronisation des Cercles Verts
- [ ] Transformation rouge → vert synchronisée
- [ ] Glow animation synchronisée
- [ ] Cercle vert reste visible après 2ème clic

### Synchronisation de la Cascade
- [ ] Deuxième clic déclenche cascade pour tous
- [ ] Nouveau lien part vers le bon Digital Twin
- [ ] Timing identique entre controller et spectateurs

### Synchronisation SDK
- [ ] Web Cascade/Web Univers toggle synchronisé à la fin
- [ ] Reset remet Web Cascade visible pour tous

### Gestion des Conflits
- [ ] Si quelqu'un d'autre contrôle, message d'erreur approprié
- [ ] Un seul controller à la fois
- [ ] Spectateurs peuvent voir mais pas contrôler

---

## États Supabase (Référence Technique)

| État | Déclencheur | Action Synchronisée |
|------|-------------|---------------------|
| `idle` | Reset button | Nettoie tout, remet à zéro |
| `scenario_started` | Crisis button | Démarre le scénario |
| `showing_impact` | 2nd click ou auto | Lien + cercle rouge sur VT |
| `circle_resolved` | 1st click | Cercle rouge → vert |
| `circle_removed` | 2nd click | Déclenche cascade (cercle reste vert) |
| `success` | Dernier 2nd click | Toggle Web Cascade/Univers |

---

## Problèmes Connus et Solutions

### Problème : Spectateur ne voit pas le cercle vert
**Cause** : État `circle_resolved` non synchronisé
**Solution** : Vérifier que la fonction `syncCircleResolved()` est appelée

### Problème : Cercle vert disparaît pour le spectateur au 2ème clic
**Cause** : `handleSecondClickLocal()` retire la classe `resolved`
**Solution** : ✅ CORRIGÉ - La classe `resolved` n'est plus retirée

### Problème : Lien ne part pas pour les spectateurs
**Cause** : État `showing_impact` non synchronisé
**Solution** : Vérifier que `triggerStepSync()` est appelé

### Problème : Web Univers ne s'affiche pas à la fin
**Cause** : État `success` non synchronisé
**Solution** : Vérifier que les toggles SDK sont dans le case 'success'

---

## Résultats Attendus

✅ **PASS** : Tous les utilisateurs voient :
- Les mêmes liens au même moment
- Les mêmes cercles rouges au même moment
- Les mêmes cercles verts au même moment
- Les cercles verts restent visibles après la cascade
- Les 3 cercles verts à la fin du scénario
- Web Univers à la fin

❌ **FAIL** : Un utilisateur voit :
- Des liens différents
- Des cercles dans des états différents
- Des cercles qui disparaissent
- Web Cascade au lieu de Web Univers à la fin

---

## Commandes de Debug

Dans la console du navigateur, taper :

```javascript
// Voir l'état actuel de la session
console.log('Scenario:', currentScenario);
console.log('Step:', currentStep);
console.log('Click count:', clickCount);

// Voir les classes des Digital Twins
document.querySelectorAll('.vt').forEach(vt => {
    console.log(vt.id, vt.classList);
});

// Voir les lignes dessinées
console.log('Drawn lines:', drawnLines);
```

---

## Notes

- Le premier utilisateur à cliquer sur un bouton de crise prend le contrôle
- Les spectateurs voient tout mais ne peuvent pas prendre le contrôle
- Le controller peut relâcher le contrôle avec Reset
- Tous les états sont synchronisés via Supabase Realtime (<100ms de latence)

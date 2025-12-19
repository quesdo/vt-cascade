# Supabase Realtime Setup Guide

## Guide pour éviter les erreurs courantes lors de l'implémentation de Supabase Realtime

### 1. Configuration des variables globales

**PROBLÈME:** Conflit avec le CDN Supabase qui crée déjà un objet `supabase` global.

**SOLUTION:** Utiliser `window.` pour toutes les variables de configuration

```javascript
// ✅ CORRECT - supabase-config.js
window.SUPABASE_URL = 'https://your-project.supabase.co';
window.SUPABASE_ANON_KEY = 'your-anon-key';
window.USER_ID = 'user_' + Math.random().toString(36).substr(2, 9);

// ❌ INCORRECT - Causera "Identifier 'supabase' has already been declared"
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';
```

### 2. Initialisation du client Supabase

**SOLUTION:** Destructurer `createClient` depuis l'objet global `supabase`

```javascript
// ✅ CORRECT
async function initSupabase() {
    const { createClient } = supabase;
    supabaseClient = createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

    // ... rest of initialization
}

// ❌ INCORRECT
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

### 3. Référencer les variables de configuration

**SOLUTION:** Toujours utiliser le préfixe `window.` dans tout le code

```javascript
// ✅ CORRECT
console.log("User ID:", window.USER_ID);
.update({ controller_id: window.USER_ID })

// ❌ INCORRECT
console.log("User ID:", USER_ID); // ReferenceError: USER_ID is not defined
```

### 4. CRITIQUE: Activer Realtime sur la table

**PROBLÈME:** Par défaut, Realtime n'est PAS activé sur les nouvelles tables.

**SOLUTION:** Exécuter cette commande SQL après avoir créé la table

```sql
-- Activer Realtime pour la table
ALTER PUBLICATION supabase_realtime ADD TABLE your_table_name;

-- Vérifier que Realtime est activé
SELECT schemaname, tablename,
       CASE WHEN tablename = ANY(
         SELECT tablename FROM pg_publication_tables WHERE pubname = 'supabase_realtime'
       ) THEN 'enabled' ELSE 'disabled' END as realtime_status
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'your_table_name';
```

### 5. Structure HTML - Ordre des scripts

**SOLUTION:** Charger dans cet ordre exact

```html
<!-- 1. CDN Supabase d'abord -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

<!-- 2. Configuration ensuite -->
<script src="supabase-config.js"></script>

<!-- 3. Code de l'application en dernier -->
<script src="app.js"></script>
```

### 6. Serveur local pour WebSockets

**PROBLÈME:** Le protocole `file://` ne supporte pas les WebSockets

**SOLUTION:** Utiliser un serveur HTTP local

```bash
# Python 3
python -m http.server 8000

# Puis ouvrir: http://localhost:8000
```

### 7. Pattern Controller/Spectateur

**ARCHITECTURE:** Un seul utilisateur contrôle, les autres regardent en sync

```javascript
// Prendre le contrôle avec protection race condition
async function takeControl() {
    const { data } = await supabaseClient
        .from('session_table')
        .select('controller_id')
        .eq('id', sessionId)
        .single();

    if (!data.controller_id) {
        const { error } = await supabaseClient
            .from('session_table')
            .update({ controller_id: window.USER_ID })
            .eq('id', sessionId)
            .eq('controller_id', data.controller_id); // Empêche race condition

        if (!error) {
            isController = true;
            return true;
        }
    }
    return false;
}

// Gérer les mises à jour
function handleSessionUpdate(payload) {
    const newData = payload.new;

    // Si on n'est pas le contrôleur, synchroniser
    if (!isController || newData.controller_id !== window.USER_ID) {
        syncFromSession(newData);
    }
}
```

### 8. Souscrire aux changements Realtime

```javascript
realtimeChannel = supabaseClient
    .channel('unique_channel_name')
    .on(
        'postgres_changes',
        {
            event: 'UPDATE',        // ou 'INSERT', 'DELETE', '*'
            schema: 'public',
            table: 'your_table_name'
        },
        handleSessionUpdate
    )
    .subscribe();
```

### 9. Structure de la table pour synchronisation

```sql
CREATE TABLE session_table (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    controller_id TEXT,              -- ID de l'utilisateur qui contrôle
    state TEXT DEFAULT 'idle',       -- État de la session
    current_step INTEGER DEFAULT 0,  -- Étape actuelle
    scenario_type TEXT,              -- Type de scénario en cours
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Désactiver RLS si c'est pour un usage privé (4 utilisateurs connus)
ALTER TABLE session_table DISABLE ROW LEVEL SECURITY;

-- Activer Realtime (CRITIQUE!)
ALTER PUBLICATION supabase_realtime ADD TABLE session_table;
```

### 10. Checklist finale avant de tester

- [ ] CDN Supabase chargé en premier dans le HTML
- [ ] Variables de config utilisent `window.`
- [ ] Références aux variables utilisent `window.USER_ID`, etc.
- [ ] Table créée dans Supabase
- [ ] **Realtime activé sur la table** (ALTER PUBLICATION)
- [ ] Serveur HTTP local lancé (pas file://)
- [ ] Browser rafraîchi avec Ctrl+Shift+R (vider le cache)
- [ ] Console du navigateur vérifiée (F12)

### 11. Messages de débogage utiles

Ajouter ces logs pour vérifier que tout fonctionne:

```javascript
// À l'initialisation
console.log('Supabase Real-time sync enabled - User ID:', window.USER_ID);
console.log('Connected to session:', sessionId);
console.log('Real-time subscription active');

// Quand on prend le contrôle
console.log('Control acquired:', window.USER_ID);

// Quand on synchronise
console.log('Syncing from session state:', data.state);
```

### Erreurs courantes et solutions

| Erreur | Cause | Solution |
|--------|-------|----------|
| `Identifier 'supabase' has already been declared` | Conflit avec CDN | Utiliser `window.SUPABASE_URL` |
| `SUPABASE_URL is not defined` | Variable non globale | Préfixer toutes les références avec `window.` |
| `createClient is not a function` | Mauvaise destructuration | `const { createClient } = supabase;` |
| Les updates ne se synchronisent pas | Realtime pas activé | `ALTER PUBLICATION supabase_realtime ADD TABLE` |
| WebSocket connection failed | Protocole file:// | Lancer serveur HTTP local |

---

**Date de création:** 2025-12-19
**Testé avec:** Supabase JS v2, Chrome, Python HTTP Server

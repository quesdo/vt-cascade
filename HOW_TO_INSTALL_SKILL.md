# Comment installer le skill Supabase Realtime dans Claude Code

## Option 1: Créer un Plugin Claude Code (Recommandé)

### 1. Structure du plugin

Créez cette structure de dossiers :

```
~/.claude/plugins/supabase-realtime/
├── plugin.json
└── skills/
    └── supabase-realtime-sync.md
```

**Sur Windows :**
```
C:\Users\<VotreNom>\.claude\plugins\supabase-realtime\
```

**Sur Mac/Linux :**
```
~/.claude/plugins/supabase-realtime/
```

### 2. Créer le fichier plugin.json

Créez `plugin.json` dans le dossier `supabase-realtime/` :

```json
{
  "name": "supabase-realtime",
  "version": "1.0.0",
  "description": "Expert implementation of Supabase Realtime synchronization",
  "author": "Your Name",
  "skills": [
    {
      "name": "supabase-realtime-sync",
      "description": "Implement multi-user real-time synchronization with Supabase, avoiding common CDN conflicts and implementing controller/spectator patterns",
      "file": "skills/supabase-realtime-sync.md",
      "triggers": [
        "supabase realtime",
        "real-time sync",
        "multi-user synchronization",
        "collaborative application"
      ]
    }
  ]
}
```

### 3. Copier le fichier de skill

Copiez `supabase-realtime-sync-skill.md` dans :
```
~/.claude/plugins/supabase-realtime/skills/supabase-realtime-sync.md
```

### 4. Redémarrer Claude Code

Fermez et rouvrez Claude Code pour charger le plugin.

### 5. Utiliser le skill

Dans Claude Code, tapez :
```
/supabase-realtime-sync
```

Ou demandez naturellement :
```
"Aide-moi à implémenter Supabase Realtime pour synchroniser mon application"
```

---

## Option 2: Utiliser Claude Projects (Alternative)

Si les plugins ne fonctionnent pas, utilisez Claude Projects :

### 1. Créer un nouveau Project

Dans l'interface Claude (Web ou Desktop) :
- Cliquez sur "Projects"
- Créez un nouveau projet "Supabase Realtime Skills"

### 2. Ajouter le skill comme Custom Instruction

Copiez le contenu de `supabase-realtime-sync-skill.md` dans les "Custom Instructions" ou "Project Knowledge" du projet.

### 3. Utiliser le projet

Ouvrez ce projet quand vous travaillez sur des implémentations Supabase Realtime.

---

## Option 3: Référence locale (Plus simple mais moins intégré)

### 1. Garder le fichier dans votre projet

Gardez `supabase-realtime-sync-skill.md` dans vos projets.

### 2. Référencer le skill

Quand vous avez besoin d'aide, dites à Claude :

```
"Lis le fichier supabase-realtime-sync-skill.md et aide-moi à implémenter
Supabase Realtime pour mon nouveau projet"
```

---

## Vérifier que le skill fonctionne

### Test 1: Invocation directe
```
/supabase-realtime-sync
```

Devrait afficher les instructions du skill.

### Test 2: Détection automatique
```
"Je veux synchroniser mon app en temps réel avec Supabase"
```

Claude devrait reconnaître le besoin et proposer d'utiliser le skill.

### Test 3: Vérifier les plugins chargés
```
/plugins list
```

Devrait montrer "supabase-realtime" dans la liste.

---

## Dépannage

### Le skill n'apparaît pas

1. Vérifiez le chemin du dossier `.claude/plugins/`
2. Vérifiez la syntaxe JSON de `plugin.json`
3. Vérifiez que le fichier `.md` existe bien
4. Redémarrez complètement Claude Code

### Erreur de syntaxe JSON

Validez votre `plugin.json` sur https://jsonlint.com/

### Le skill ne se déclenche pas automatiquement

Ajoutez plus de triggers dans `plugin.json` :
```json
"triggers": [
  "supabase realtime",
  "synchronisation temps réel",
  "collaborative app",
  "multi-user sync",
  "websocket supabase"
]
```

---

## Commandes utiles après installation

```bash
# Lister les plugins installés
/plugins list

# Recharger les plugins
/plugins reload

# Voir les skills disponibles
/skills list

# Utiliser un skill spécifique
/supabase-realtime-sync

# Désactiver temporairement
/plugins disable supabase-realtime

# Réactiver
/plugins enable supabase-realtime
```

---

## Mettre à jour le skill

1. Éditez le fichier `.md` dans `~/.claude/plugins/supabase-realtime/skills/`
2. Rechargez les plugins : `/plugins reload`
3. Ou redémarrez Claude Code

---

## Partager le skill avec votre équipe

### Créer un package

```bash
cd ~/.claude/plugins/
zip -r supabase-realtime-plugin.zip supabase-realtime/
```

### Installation par l'équipe

1. Dézipper dans `~/.claude/plugins/`
2. Redémarrer Claude Code

---

## Documentation officielle

Pour plus d'informations sur la création de plugins Claude Code :
- Tapez `/help plugins` dans Claude Code
- Ou consultez la documentation officielle sur https://github.com/anthropics/claude-code

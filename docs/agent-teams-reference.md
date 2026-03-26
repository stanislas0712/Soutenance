# Équipes d'Agents — Guide de Référence

> **Projet :** BudgetFlow — Gestion Budgétaire
> **Feature flag :** `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` (défini dans `.claude/settings.local.json`)
> **Objectif :** Référence pour concevoir, orchestrer et déboguer des workflows multi-agents dans Claude Code.

---

## Table des Matières

1. Qu'est-ce qu'une Équipe d'Agents ?
2. Concepts Fondamentaux
3. Types d'Agents Disponibles
4. Quand Utiliser les Équipes d'Agents
5. Patterns d'Orchestration
6. Spawner des Agents — Référence API
7. Communication entre Agents
8. Règles de Parallélisme
9. Isolation & Worktrees
10. Prompt Engineering pour les Sous-Agents
11. Anti-Patterns à Éviter
12. Patterns Spécifiques à BudgetFlow
13. Débogage & Observabilité
14. Checklist Avant de Spawner
15. Règles de Conception d'Équipe — À FAIRE / À ÉVITER

---

## 1. Qu'est-ce qu'une Équipe d'Agents ?

Les Équipes d'Agents sont une fonctionnalité de Claude Code qui permet à l'**orchestrateur** (la session Claude principale) de spawner des **sous-agents** — des instances Claude spécialisées qui exécutent des tâches de manière autonome et retournent un résultat.

```
Orchestrateur (thread principal)
├── Sous-agent A  → recherche / exploration
├── Sous-agent B  → génération de code (parallèle)
└── Sous-agent C  → test / validation (séquentiel, après B)
```

Chaque sous-agent :

- Possède sa propre fenêtre de contexte (démarre vide sauf ce qu'on lui fournit)
- Peut utiliser un sous-ensemble ou la totalité des outils
- Retourne **un seul message** à l'orchestrateur
- Peut lui-même spawner des sous-agents (équipes imbriquées)

---

## 2. Concepts Fondamentaux

### Orchestrateur vs Sous-Agent

| Aspect | Orchestrateur | Sous-Agent |
| ------ | ------------- | ---------- |
| Rôle | Décompose les tâches, délègue, synthétise | Exécute une tâche ciblée |
| Contexte | Historique complet de la conversation | Vide — uniquement ce que vous passez dans le prompt |
| Résultat | Intègre les sorties des sous-agents | Message de retour unique |
| Outils | Tous les outils | Configurable par type d'agent |

### La Règle d'Or

> **Un sous-agent ne connaît que ce que vous lui dites.** Il n'a aucune mémoire de la conversation, aucune conscience des autres sous-agents, et aucun accès aux fichiers que vous n'avez pas mentionnés. Rédigez les prompts comme si le sous-agent était un nouveau collaborateur lisant son premier brief.

### Foreground vs Background

- **Foreground** (par défaut) : L'orchestrateur se bloque jusqu'à ce que le sous-agent termine. À utiliser quand vous avez besoin du résultat avant de continuer.
- **Background** (`run_in_background: true`) : L'orchestrateur continue de travailler. Vous êtes notifié à la fin. À utiliser pour les tâches vraiment indépendantes.

---

## 3. Types d'Agents Disponibles

### Agents Spécialisés Natifs

| Type | Idéal Pour | Outils Disponibles |
| ---- | ---------- | ------------------ |
| `general-purpose` | Tâches complexes multi-étapes, recherche ouverte | Tous les outils |
| `Explore` | Exploration de codebase, recherche par mot-clé/fichier, "comment fonctionne X ?" | Tous sauf Agent, ExitPlanMode, Edit, Write, NotebookEdit |
| `Plan` | Architecture, planification d'implémentation, analyse de compromis | Tous sauf Agent, ExitPlanMode, Edit, Write, NotebookEdit |
| `claude-code-guide` | Questions sur Claude Code CLI, API, hooks, MCP | Glob, Grep, Read, WebFetch, WebSearch |
| `statusline-setup` | Configuration de la status line Claude Code | Read, Edit |

### Choisir le Bon Type

```
Besoin de TROUVER quelque chose dans le code ?     → Explore
Besoin de CONCEVOIR une approche ?                 → Plan
Besoin d'EXÉCUTER une tâche complexe multi-étapes ? → general-purpose
Besoin de RÉPONDRE à une question sur Claude Code ? → claude-code-guide
Autre chose ?                                      → general-purpose
```

---

## 4. Quand Utiliser les Équipes d'Agents

### ✅ Bons Cas d'Usage

| Situation | Raison |
|-----------|--------|
| Deux tâches indépendantes qui ne partagent pas de données | Vrai parallélisme — gain de temps |
| Une tâche qui consommerait trop de contexte principal | Déléguer au sous-agent, récupérer un résumé |
| Recherche exploratoire avant d'écrire du code | L'agent Explore lit le code sans polluer le contexte de l'orchestrateur |
| Valider un travail après l'avoir produit | Spawner un regard neuf |
| Tâches où l'isolation est importante (changements risqués) | Utiliser `isolation: "worktree"` |

### ❌ Quand NE PAS Utiliser

| Situation | Raison |
|-----------|--------|
| Tâche simple en une étape (lire un fichier, modifier une ligne) | La surcharge n'en vaut pas la peine — utiliser les outils directement |
| Tâches où la sortie d'un sous-agent alimente immédiatement le suivant | Faire cela séquentiellement dans le thread principal |
| Vous avez déjà l'information dans le contexte | Ne pas dupliquer le travail avec un sous-agent |
| La tâche nécessite des échanges interactifs avec l'utilisateur | Les sous-agents ne peuvent pas poser de questions en cours de tâche |

---

## 5. Patterns d'Orchestration

### Pattern 1 — Scatter/Gather (Recherche Parallèle)

Spawner plusieurs agents Explore simultanément, puis synthétiser les résultats.

```
Orchestrateur
├── [parallèle] Explore : "Trouver tous les endpoints API"
├── [parallèle] Explore : "Trouver tous les modèles"
└── [parallèle] Explore : "Trouver tous les serializers"
          ↓
Synthèse : "Voici la cartographie complète de la couche données..."
```

**Règle :** Lancer toutes les recherches indépendantes dans un seul message (un bloc `<function_calls>` avec plusieurs appels Agent).

### Pattern 2 — Recherche Puis Construction (Séquentiel)

```
Orchestrateur
→ [foreground] Explore : "Comment fonctionne la validation du budget ?"
→ (recevoir le résultat, comprendre l'architecture)
→ [foreground] general-purpose : "Implémenter X en suivant ce pattern"
```

**Règle :** Le second agent a besoin de la sortie du premier — doit être séquentiel.

### Pattern 3 — Construction Puis Vérification

```
Orchestrateur
→ Écrire le code directement
→ [foreground] general-purpose : "Revue ce code pour la correction et la sécurité"
→ Appliquer les corrections basées sur la revue
```

### Pattern 4 — Implémentation Parallèle de Fonctionnalités (Worktrees)

Pour de grandes fonctionnalités indépendantes qui touchent des fichiers différents :

```
Orchestrateur
├── [background, worktree] general-purpose : "Implémenter la fonctionnalité export"
└── [background, worktree] general-purpose : "Implémenter la fonctionnalité notifications"
         ↓
(les deux terminent)
→ Fusionner les résultats
```

### Pattern 5 — Pyramide de Délégation

```
Orchestrateur (plan de haut niveau)
└── general-purpose : "Implémenter le module budget"
    ├── Explore : "Trouver les patterns existants dans le codebase"
    └── Plan : "Concevoir le modèle de données"
```

---

## 6. Spawner des Agents — Référence API

### Spawn de Base

```
Paramètres de l'outil Agent :
- description:       (requis) Résumé en 3-5 mots de ce que fait l'agent
- prompt:            (requis) Description complète de la tâche — le seul briefing de l'agent
- subagent_type:     "general-purpose" | "Explore" | "Plan" | "claude-code-guide" | "statusline-setup"
- run_in_background: true | false (défaut: false)
- isolation:         "worktree" (optionnel — crée un worktree git isolé)
- model:             "sonnet" | "opus" | "haiku" (override optionnel)
```

### Que Mettre dans `prompt`

Un bon prompt de sous-agent comporte ces sections :

```markdown
## Contexte
[Quel projet/codebase, ce qui a été fait jusqu'ici, contraintes pertinentes]

## Tâche
[Exactement ce que l'agent doit faire — soyez précis]

## Ce qu'il Faut Retourner
[Quel format/information l'agent doit inclure dans sa réponse]

## Ce qu'il NE Faut PAS Faire
[Garde-fous importants si nécessaire]
```

### Lancement Parallèle (Message Unique)

Pour lancer des agents en parallèle, mettez plusieurs appels Agent dans la **même réponse** :

```
Message 1 :
  → Agent(Explore, "Trouver tous les modèles Django")      ← ces agents tournent
  → Agent(Explore, "Trouver toutes les vues API")          ← simultanément
  → Agent(Explore, "Trouver tous les patterns d'URL")      ←
```

Si vous les mettez dans des messages séparés, ils tournent séquentiellement.

---

## 7. Communication entre Agents

Les agents **ne peuvent pas communiquer directement** entre eux. Toute coordination passe par l'orchestrateur :

```
Sous-agent A → résultat → Orchestrateur → extrait l'info → transmet au Sous-agent B
```

### Passer du Contexte à un Sous-Agent

Inclure le contexte pertinent explicitement dans le prompt :

```
❌ Mauvais : "Continue le travail sur la fonctionnalité budget."
✅ Bon :     "Le modèle budget possède les champs : montant_alloue, montant_consomme, statut.
              Le serializer est dans backend/budget/serializers.py:45.
              Ajouter un nouveau champ 'taux_execution' qui calcule montant_consomme/montant_alloue."
```

### Ce que le Sous-Agent Retourne

Le sous-agent retourne **un seul message** à la fin. Concevez votre prompt pour que la valeur de retour soit exploitable :

```
❌ Mauvais : "Fais-le."
✅ Bon :     "Retourner : (1) liste des fichiers modifiés, (2) résumé des changements,
              (3) les éventuels problèmes rencontrés."
```

---

## 8. Règles de Parallélisme

### La Règle du Message Unique

> **Tous les agents parallèles doivent être lancés dans un seul bloc `<function_calls>`.**

Si vous écrivez l'appel Agent 1 dans le message 1 et l'appel Agent 2 dans le message 2, ils sont séquentiels.

### Vérification d'Indépendance

Avant de lancer en parallèle, vérifier :

- [ ] La sortie de l'Agent A n'est PAS requise par l'Agent B
- [ ] L'Agent A et l'Agent B n'écrivent pas dans les mêmes fichiers (sauf avec des worktrees)
- [ ] Ils ne dépendent pas d'un état mutable partagé

### Quand le Parallélisme se Retourne Contre Vous

- Des agents qui écrivent dans le même fichier → conflits ou écrasements
- Le résultat d'un agent change ce que l'autre devrait faire → travail gaspillé
- Le débogage est plus difficile quand plusieurs agents échouent simultanément

---

## 9. Isolation & Worktrees

Le paramètre `isolation: "worktree"` crée un **worktree git temporaire** — une copie complète du dépôt sur une nouvelle branche.

### Utiliser les Worktrees Quand

- L'agent effectue des changements **risqués ou expérimentaux**
- On lance **deux agents qui touchent des fichiers qui se chevauchent** en parallèle
- On veut **revoir les changements avant de les fusionner**

### Cycle de Vie d'un Worktree

```
Spawn avec isolation: "worktree"
  → Nouvelle branche créée automatiquement
  → L'agent travaille sur une copie isolée
  → Si AUCUN changement : worktree auto-supprimé
  → Si des changements : chemin du worktree + branche retournés dans le résultat
  → L'orchestrateur revoit, puis fusionne ou abandonne
```

### Sélection du Modèle dans les Worktrees

Utiliser `model: "haiku"` pour les agents worktree exploratoires peu coûteux. Utiliser `model: "opus"` pour la génération de code complexe dans les worktrees.

---

## 10. Prompt Engineering pour les Sous-Agents

### Les 5 Règles des Prompts de Sous-Agents

**Règle 1 — Supposer zéro contexte**
Le sous-agent n'a jamais vu ce projet. Nommer les fichiers par chemin absolu ou relatif au dépôt. Décrire brièvement l'architecture.

**Règle 2 — Être précis sur le format de retour**
"Retourner un objet JSON avec les clés : fichiers_modifiés, résumé, erreurs" vaut mieux que "dis-moi ce que tu as fait."

**Règle 3 — Définir la portée**
"Regarder uniquement les fichiers dans `backend/budget/`" empêche l'agent de s'aventurer dans des zones non pertinentes.

**Règle 4 — Indiquer ce à quoi ressemble le succès**
"La tâche est terminée quand l'endpoint retourne un 200 avec le bon schéma."

**Règle 5 — Dire à l'agent ce qu'il NE doit PAS faire**
"Ne pas modifier les tests existants. Ne pas changer le schéma de base de données."

### Modèle de Prompt

```markdown
## Projet
BudgetFlow — Plateforme de gestion budgétaire Django + React.
Backend : `backend/` (Django 4.2, PostgreSQL)
Frontend : `frontend/src/` (React 18, Tailwind CSS)

## Votre Tâche
[Description spécifique de la tâche]

## Fichiers Pertinents
- `backend/budget/models.py` — modèles Budget, LigneBudgetaire
- `backend/budget/views.py` — vues API
- `frontend/src/pages/gestionnaire/` — pages Gestionnaire

## Contraintes
- Ne pas modifier les fichiers de migration
- Suivre les patterns de code existants
- Tous les montants en FCFA (entiers)

## Format de Retour
Fournir :
1. Résumé des changements effectués (2-3 phrases)
2. Liste des fichiers modifiés avec les numéros de ligne
3. Problèmes ou compromis à signaler
```

---

## 11. Anti-Patterns à Éviter

### ❌ Le Brief Fantôme

```text
prompt: "Corriger le bug sur la page budget"
```

L'agent ne sait pas quel bug, quel fichier, quel est le comportement attendu.

### ❌ La Recherche Dupliquée

Spawner un agent Explore pour trouver quelque chose que vous avez déjà trouvé dans le contexte principal. Gaspille des tokens et du temps.

### ❌ Le Parallélisme Prématuré

Lancer 5 agents en parallèle alors que les agents 2 à 5 ont besoin de la sortie de l'agent 1. Ils tournent tous sur des hypothèses périmées.

### ❌ Le Méga-Agent

Donner à un seul agent une tâche en 10 parties alors qu'elle devrait être 3 agents ciblés. Le principe de responsabilité unique s'applique aussi aux agents.

### ❌ Ignorer la Valeur de Retour

Ne pas spécifier ce que l'agent doit retourner produit un récit non structuré au lieu de données exploitables.

### ❌ Spawner pour des Opérations Simples

```python
# Mauvais : spawner un agent juste pour lire un fichier
Agent(Explore, "Lire le contenu de models.py")

# Bon : utiliser l'outil Read directement
Read("backend/budget/models.py")
```

### ❌ Échec Silencieux en Background

Spawner des agents background en supposant qu'ils ont réussi. Toujours vérifier les résultats des agents background avant d'agir sur leur sortie supposée.

---

## 12. Patterns Spécifiques à BudgetFlow

### Pattern : Implémentation Full-Stack d'une Fonctionnalité

```
1. [parallèle]
   → Explore : "Cartographier l'API backend pour les budgets (endpoints, serializers, modèles)"
   → Explore : "Cartographier les pages frontend budget (composants, appels API, état)"

2. (synthétiser l'architecture)

3. Plan : "Concevoir la nouvelle [fonctionnalité] en suivant les patterns BudgetFlow"

4. [parallèle, worktree]
   → general-purpose : "Implémenter les changements backend selon le plan"
   → general-purpose : "Implémenter les changements frontend selon le plan"

5. general-purpose : "Revoir les deux implémentations pour leur cohérence"
```

### Pattern : Changement de Schéma de Base de Données

```
1. Explore : "Trouver tous les usages de [champ du modèle] dans models, serializers, views, migrations"
2. Plan : "Planifier la migration en toute sécurité"
3. general-purpose (worktree) : "Implémenter la migration + tous les changements dépendants"
4. general-purpose : "Écrire les tests pour la migration"
```

### Pattern : Régénération des Données de Seed

```
1. Explore : "Lire la commande de seed actuelle et les modèles pour comprendre la structure des données"
2. general-purpose : "Réécrire le seed avec de nouvelles données réalistes suivant le domaine BudgetFlow"
```

### Pattern : Refonte d'une Page UI

```
1. Explore : "Lire la page cible et tous les composants importés"
2. Explore : "Lire les design tokens de index.css et les classes de composants"  ← parallèle avec ci-dessus
3. general-purpose : "Refondre la page en suivant le design system"
```

### Fichiers Clés BudgetFlow à Inclure dans les Prompts d'Agents

| Quoi | Chemin |
| ---- | ------ |
| Paramètres Django | `backend/config/settings/__init__.py` |
| Config URL | `backend/config/urls.py` |
| Modèles Budget | `backend/budget/models.py` |
| Vues Budget | `backend/budget/views.py` |
| Serializers Budget | `backend/budget/serializers.py` |
| Modèle Utilisateur | `backend/accounts/models.py` |
| Design system | `frontend/src/index.css` |
| Constantes couleurs/statuts | `frontend/src/utils/constants.js` |
| Layout/sidebar | `frontend/src/components/Layout.jsx` |
| Contexte Auth | `frontend/src/context/AuthContext.jsx` |
| Commande seed | `backend/budget/management/commands/seed_burkina.py` |

---

## 13. Débogage & Observabilité

### Quand un Agent Retourne des Résultats Inattendus

1. **Relire le prompt** — le contexte était-il suffisant ? La tâche était-elle non ambiguë ?
2. **Vérifier la portée** — l'agent avait-il accès aux bons fichiers ?
3. **Vérifier le format de retour** — aviez-vous spécifié ce dont vous aviez besoin ?
4. **Utiliser `model: "opus"`** — modèle plus capable pour les tâches de raisonnement complexe

### Quand un Agent Background Semble Bloqué

- Claude Code vous notifiera à la fin — ne pas surveiller activement
- S'il expire, vérifier si la tâche était trop grande pour une seule session
- La décomposer en agents foreground plus petits

### Journaliser les Décisions des Agents

Demander à l'agent d'expliquer son raisonnement dans le retour :

```
"À la fin de votre réponse, incluez une section ## Raisonnement qui explique
les décisions clés que vous avez prises et pourquoi."
```

### Tester les Prompts d'Agents

Avant de déployer une équipe d'agents complexe :

1. Lancer le sous-agent clé seul avec un prompt de test
2. Vérifier que le format de retour correspond à ce qu'attend l'orchestrateur
3. Vérifier que l'agent reste dans sa portée

---

## 14. Checklist Avant de Spawner

Copier cette checklist avant de concevoir une équipe d'agents :

```
ANALYSE DE LA TÂCHE
[ ] Peut-on faire cela avec des appels d'outils directs ? (Si oui, ne pas spawner)
[ ] Y a-t-il de vraies sous-tâches indépendantes ? (Si non, ne pas paralléliser)
[ ] Cela consommerait-il trop du contexte principal ? (Si oui, utiliser un sous-agent)

QUALITÉ DU PROMPT
[ ] Le prompt inclut-il le contexte projet (stack, chemins pertinents) ?
[ ] La description de tâche est-elle précise et délimitée ?
[ ] Les contraintes sont-elles clairement énoncées (ce qu'il NE faut PAS faire) ?
[ ] Le format de retour est-il spécifié ?
[ ] L'agent sait-il à quoi ressemble "terminé" ?

PARALLÉLISME
[ ] Les agents parallèles sont-ils vraiment indépendants (pas de dépendances de sortie partagées) ?
[ ] Les agents parallèles évitent-ils d'écrire dans les mêmes fichiers ? (ou utiliser worktrees)
[ ] Tous les agents parallèles sont-ils lancés dans un seul message ?

ISOLATION
[ ] L'agent effectue-t-il des changements risqués/expérimentaux ? → utiliser worktree
[ ] Voudra-t-on revoir les changements avant de les appliquer ? → utiliser worktree

TYPE D'AGENT
[ ] Exploration en lecture seule ? → Explore
[ ] Architecture/planification ? → Plan
[ ] Implémentation complète ? → general-purpose
[ ] Questions sur Claude Code ? → claude-code-guide

SÉLECTION DU MODÈLE
[ ] Tâche simple/peu coûteuse ? → haiku
[ ] Tâche standard ? → sonnet (défaut)
[ ] Raisonnement complexe ou sortie critique ? → opus
```

---

## 15. Règles de Conception d'Équipe

> Guide DO / DON'T concis pour structurer une équipe d'agents avant de spawner le moindre agent.

### ✅ À FAIRE — Ce qui Fait Réussir une Équipe

**Posséder des fichiers spécifiques**
Chaque agent doit avoir son propre territoire. L'agent Backend possède `src/api/`, l'agent Frontend possède `src/components/`. Quand la propriété des fichiers est claire, deux agents ne peuvent jamais écraser le travail de l'autre.

**Définir le résultat précisément**
Spécifier exactement ce que l'agent doit produire — pas "faire une app" mais "une API REST qui tourne sur le port 3001 avec des endpoints `/users` et `/posts` retournant du JSON `{ success, data }`." Des objectifs vagues produisent des résultats vagues.

**Nommer les destinataires**
Si la sortie d'un agent alimente un autre agent, le dire explicitement : "Retourner le contrat API pour que le Frontend Dev puisse l'implémenter." Les agents ne supposent pas — ils ont besoin de savoir de qui dépend leur travail.

**Garder l'équipe entre 3 et 5 agents**
Une équipe de 3 à 5 est la zone idéale. Le surcoût de coordination reste faible, la spécialisation reste significative. Deux agents suffisent souvent ; au-delà de cinq, les chemins de communication se multiplient plus vite que les gains de productivité.

**Donner le contexte complet du projet**
Chaque agent doit comprendre l'objectif global, pas seulement sa tranche isolée. Inclure le nom du projet, la stack, et le résultat final vers lequel toute l'équipe travaille. Un agent qui ne voit que sa tâche ne peut pas prendre de bonnes décisions de jugement.

---

### ❌ À ÉVITER — Ce qui Cause des Bugs et des Boucles

**Partager le même fichier entre agents**
Si deux agents écrivent dans le même fichier simultanément, l'un écrasera l'autre. Soit assigner des fichiers non chevauchants, soit utiliser `isolation: "worktree"` pour que chaque agent dispose de sa propre copie.

**Utiliser des livrables vagues**
"Faire un beau frontend" ne donne à l'agent aucun point d'ancrage. Il va deviner et probablement se tromper. Chaque livrable a besoin d'une définition concrète et vérifiable de "terminé".

**Laisser l'agent supposer le plan**
Si vous ne définissez pas les prochaines étapes, l'agent va les inventer. Parfois ça marche ; souvent ça diverge de votre intention. Énoncer le plan explicitement — ne pas laisser de vides que l'agent remplira avec des suppositions.

**Lancer 10+ agents**
Les grandes équipes créent un bruit informationnel. Chaque agent a besoin du contexte global ; plus il y a d'agents, plus il est difficile de maintenir ce contexte cohérent pour tous. Si votre équipe dépasse cinq agents, décomposer le projet en phases séquentielles.

**Omettre l'historique du prompt**
Chaque sous-agent démarre avec une fenêtre de contexte vide. Si un agent précédent a déjà corrigé un bug ou pris une décision clé, le dire explicitement à l'agent suivant. Sans cet historique, il rencontrera les mêmes problèmes et pourra potentiellement réintroduire des erreurs déjà corrigées.

---

## Carte de Référence Rapide

```text
PATTERN DE SPAWN                    CAS D'USAGE
─────────────────────────────────────────────────────────────
Explore (parallèle ×N)              Cartographier le codebase avant de construire
Plan (foreground)                   Concevoir avant d'implémenter
general-purpose (foreground)        Exécuter après planification
general-purpose (background)        Tâche longue indépendante
general-purpose (worktree)          Changements risqués, abandonnables
Explore + general-purpose           Recherche puis construction

RÈGLE DE PARALLÉLISME
→ Même message = parallèle
→ Messages différents = séquentiel

RÈGLE DE CONTEXTE
→ Le sous-agent ne connaît QUE ce que vous écrivez dans `prompt`
→ Inclure : stack, chemins de fichiers, contraintes, format de retour

RÈGLE DE WORKTREE
→ Changements risqués → isolation: "worktree"
→ Écritures parallèles dans les mêmes fichiers → isolation: "worktree"
→ Revoir avant de fusionner → isolation: "worktree"
```

---

Dernière mise à jour : 2026-03-26 | Projet BudgetFlow

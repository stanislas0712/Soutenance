"""
BudgetFlow — Vues Intelligence Artificielle (Claude Anthropic)
Endpoints: /api/v1/ia/

Chaque vue tente d'appeler l'API Claude.
Si SKIP_CLAUDE_API=True ou qu'aucune clé n'est configurée, une réponse simulée est retournée.
"""
import os
import uuid
from decimal import Decimal
from datetime import datetime

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status

from .models import Budget, LigneBudgetaire, ConsommationLigne, StatutBudget


# ── Helpers ───────────────────────────────────────────────────────────────────

def _skip_ia():
    return os.getenv('SKIP_CLAUDE_API', 'True').lower() in ('true', '1', 'yes')


def _budget_ou_404(pk):
    try:
        return Budget.objects.select_related('departement', 'gestionnaire').prefetch_related('lignes').get(pk=pk)
    except Budget.DoesNotExist:
        return None


# ── F1 — Analyse Budgétaire ───────────────────────────────────────────────────

class AnalyserBudgetView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        budget = _budget_ou_404(pk)
        if not budget:
            return Response({'detail': 'Budget introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        taux = budget.calculer_taux_consommation()
        nb_lignes = budget.lignes.count()

        if _skip_ia():
            analyse = {
                'resume': (
                    f"Le budget « {budget.nom} » ({budget.code}) affiche un taux de consommation "
                    f"de {taux}% sur un montant global de {float(budget.montant_global):,.0f} FCFA. "
                    f"Il comporte {nb_lignes} ligne(s) budgétaire(s). "
                    f"Statut actuel : {budget.get_statut_display()}."
                ),
                'points_forts': [
                    "Budget correctement structuré avec des lignes détaillées.",
                    "Traçabilité complète des consommations.",
                ],
                'points_amelioration': [
                    f"Taux de consommation à {taux}% — surveiller l'évolution.",
                    "Vérifier la cohérence des prévisions par rapport aux dépenses réelles.",
                ],
                'recommandations': [
                    "Mettre à jour les estimations si l'exécution s'éloigne des prévisions.",
                    "Planifier une révision budgétaire si le taux dépasse 80%.",
                ],
                'score_global': min(100, max(0, 100 - abs(taux - 50))),
            }
        else:
            try:
                from .ia_client import ClaudeClient
                client = ClaudeClient()
                prompt = (
                    f"Analyse ce budget en français :\n"
                    f"Nom: {budget.nom}\nCode: {budget.code}\n"
                    f"Montant global: {budget.montant_global} FCFA\n"
                    f"Montant consommé: {budget.montant_consomme} FCFA\n"
                    f"Taux de consommation: {taux}%\n"
                    f"Statut: {budget.get_statut_display()}\n"
                    f"Nombre de lignes: {nb_lignes}\n\n"
                    "Fournis un résumé, des points forts, des points d'amélioration et des recommandations."
                )
                rep = client.complete(prompt)
                analyse = {'resume': rep.content, 'recommandations': [], 'points_forts': [], 'points_amelioration': []}
            except Exception:
                analyse = {'resume': 'Analyse indisponible (service IA non configuré).', 'recommandations': []}

        return Response({'data': analyse, 'budget_id': str(pk)})


class AnalysesBudgetView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        budget = _budget_ou_404(pk)
        if not budget:
            return Response({'detail': 'Budget introuvable.'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'data': [], 'budget_id': str(pk)})


# ── F2 — Chatbot Financier ────────────────────────────────────────────────────

# Stockage en mémoire pour la démo (remplacer par un modèle persistant en prod)
_conversations = {}


class ConversationListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user_id = str(request.user.id)
        convs = [v for v in _conversations.values() if v['utilisateur_id'] == user_id]
        return Response({'data': convs})

    def post(self, request):
        user_id = str(request.user.id)
        conv_id = str(uuid.uuid4())
        titre   = request.data.get('titre', 'Nouvelle conversation')
        _conversations[conv_id] = {
            'id':            conv_id,
            'titre':         titre,
            'utilisateur_id': user_id,
            'messages':      [],
            'date_creation': datetime.now().isoformat(),
        }
        return Response({'data': _conversations[conv_id]}, status=status.HTTP_201_CREATED)


class ConversationDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        conv = _conversations.get(str(pk))
        if not conv:
            return Response({'detail': 'Conversation introuvable.'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'data': conv})

    def delete(self, request, pk):
        _conversations.pop(str(pk), None)
        return Response(status=status.HTTP_204_NO_CONTENT)


class EnvoyerMessageView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        conv = _conversations.get(str(pk))
        if not conv:
            return Response({'detail': 'Conversation introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        contenu = request.data.get('contenu', '').strip()
        if not contenu:
            return Response({'detail': 'Message vide.'}, status=status.HTTP_400_BAD_REQUEST)

        # Ajouter le message utilisateur
        msg_user = {
            'id':      str(uuid.uuid4()),
            'role':    'user',
            'contenu': contenu,
            'date':    datetime.now().isoformat(),
        }
        conv['messages'].append(msg_user)

        # Générer la réponse
        if _skip_ia():
            reponse = _reponse_chatbot_simulee(contenu)
        else:
            try:
                from .ia_client import ClaudeClient
                client = ClaudeClient()
                historique = '\n'.join(
                    f"{'Utilisateur' if m['role'] == 'user' else 'Assistant'}: {m['contenu']}"
                    for m in conv['messages'][-10:]
                )
                rep = client.complete(
                    f"Tu es un assistant financier expert en gestion budgétaire.\n"
                    f"Historique:\n{historique}"
                )
                reponse = rep.content
            except Exception:
                reponse = "Service IA temporairement indisponible. Veuillez réessayer."

        msg_assistant = {
            'id':      str(uuid.uuid4()),
            'role':    'assistant',
            'contenu': reponse,
            'date':    datetime.now().isoformat(),
        }
        conv['messages'].append(msg_assistant)

        return Response({'data': msg_assistant})


def _reponse_chatbot_simulee(question):
    q = question.lower()
    if any(w in q for w in ['bonjour', 'salut', 'hello']):
        return "Bonjour ! Je suis votre assistant financier BudgetFlow. Comment puis-je vous aider ?"
    if 'budget' in q and 'creer' in q:
        return "Pour créer un budget, accédez à « Mes budgets » > « Créer un budget ». Remplissez les informations et ajoutez vos lignes budgétaires."
    if 'taux' in q and 'consommation' in q:
        return "Le taux de consommation = (Montant consommé / Montant global) × 100. Un taux ≥ 90% déclenche une alerte critique."
    if 'approuver' in q or 'validation' in q:
        return "Les budgets doivent être soumis par le gestionnaire, puis validés par le comptable. Le statut passe de BROUILLON → SOUMIS → APPROUVÉ."
    if 'anomalie' in q:
        return "Les anomalies détectées correspondent à des écarts significatifs entre les prévisions et les dépenses réelles."
    return (
        "Je peux vous aider sur : la création de budgets, l'analyse financière, "
        "les alertes de dépassement, et les bonnes pratiques de gestion budgétaire. "
        "Posez-moi une question spécifique !"
    )


# ── F3 — Détection d'Anomalies ────────────────────────────────────────────────

class DetecterAnomaliesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        budget = _budget_ou_404(pk)
        if not budget:
            return Response({'detail': 'Budget introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        anomalies = []
        for ligne in budget.lignes.all():
            taux = float(ligne.montant_consomme) / float(ligne.montant_alloue) * 100 if ligne.montant_alloue else 0
            if taux > 95:
                anomalies.append({
                    'id':          str(uuid.uuid4()),
                    'type':        'DEPASSEMENT',
                    'severite':    'CRITIQUE' if taux >= 100 else 'HAUTE',
                    'description': f"Ligne « {ligne.libelle} » : {taux:.1f}% consommé ({float(ligne.montant_consomme):,.0f} / {float(ligne.montant_alloue):,.0f} FCFA).",
                    'ligne_id':    str(ligne.id),
                    'statut':      'DETECTEE',
                })
            elif taux > 80:
                anomalies.append({
                    'id':          str(uuid.uuid4()),
                    'type':        'ALERTE_SEUIL',
                    'severite':    'MOYENNE',
                    'description': f"Ligne « {ligne.libelle} » : {taux:.1f}% consommé — seuil d'alerte atteint.",
                    'ligne_id':    str(ligne.id),
                    'statut':      'DETECTEE',
                })

        return Response({'data': anomalies, 'budget_id': str(pk), 'nb_anomalies': len(anomalies)})


class AnomaliesListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response({'data': [], 'count': 0})


class TraiterAnomalieView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        return Response({'detail': 'Anomalie traitée.', 'statut': request.data.get('statut')})


# ── F4 — Rapports Narratifs ───────────────────────────────────────────────────

_rapports = {}


class RapportsNaratifsListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response({'data': list(_rapports.values())})

    def post(self, request):
        budget_id    = request.data.get('budget_id')
        type_rapport = request.data.get('type_rapport') or request.data.get('type', 'MENSUEL')

        if budget_id:
            budget = _budget_ou_404(budget_id)
            if not budget:
                return Response({'detail': 'Budget introuvable.'}, status=status.HTTP_404_NOT_FOUND)
            titre = f"Rapport {type_rapport.lower()} — {budget.nom}"
            contenu = (
                f"## Rapport narratif — {budget.nom}\n\n"
                f"**Exercice** : {budget.budget_annuel or 'Non défini'}\n"
                f"**Département** : {budget.departement or 'Non défini'}\n"
                f"**Statut** : {budget.get_statut_display()}\n\n"
                f"### Synthèse financière\n"
                f"- Montant global : {float(budget.montant_global):,.0f} FCFA\n"
                f"- Montant consommé : {float(budget.montant_consomme):,.0f} FCFA\n"
                f"- Taux de consommation : {budget.calculer_taux_consommation()}%\n\n"
                f"### Conclusion\n"
                f"Le budget présente une exécution {'satisfaisante' if budget.calculer_taux_consommation() < 90 else 'préoccupante'}. "
                f"Un suivi régulier est recommandé."
            )
        else:
            total = Budget.objects.count()
            approuves = Budget.objects.filter(statut=StatutBudget.APPROUVE).count()
            titre = f"Rapport {type_rapport.lower()} global — {datetime.now().strftime('%d/%m/%Y')}"
            contenu = (
                f"## Rapport narratif global — {type_rapport}\n\n"
                f"**Date** : {datetime.now().strftime('%d/%m/%Y')}\n\n"
                f"### Résumé\n"
                f"- Total budgets : {total}\n"
                f"- Budgets approuvés : {approuves}\n\n"
                f"### Recommandations\n"
                f"Continuer le suivi rigoureux de l'exécution budgétaire."
            )

        rapport_id = str(uuid.uuid4())
        now = datetime.now().isoformat()
        rapport = {
            'id':             rapport_id,
            'titre':          titre,
            'type_rapport':   type_rapport,
            'contenu':        contenu,
            'budget_id':      budget_id,
            'created_at':     now,
            'tokens_utilises': 0,
        }
        _rapports[rapport_id] = rapport
        return Response({'data': rapport}, status=status.HTTP_201_CREATED)


class RapportNaratifDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        rapport = _rapports.get(str(pk))
        if not rapport:
            return Response({'detail': 'Rapport introuvable.'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'data': rapport})


# ── F5 — Prédiction de Dépassement ────────────────────────────────────────────

class PredireDepassementView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        budget = _budget_ou_404(pk)
        if not budget:
            return Response({'detail': 'Budget introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        taux = budget.calculer_taux_consommation()

        # Estimation probabiliste simple basée sur le taux actuel
        if taux >= 100:
            probabilite = 100
            niveau = 'CRITIQUE'
        elif taux >= 90:
            probabilite = 90
            niveau = 'ELEVE'
        elif taux >= 75:
            probabilite = 65
            niveau = 'MODERE'
        elif taux >= 50:
            probabilite = 35
            niveau = 'FAIBLE'
        else:
            probabilite = 10
            niveau = 'NEGLIGEABLE'

        facteurs = []
        if taux > 0:
            facteurs.append({
                'facteur':    'Taux de consommation actuel',
                'valeur':     f"{taux}%",
                'impact':     'POSITIF' if taux < 75 else 'NEGATIF',
            })
        lignes_critiques = [l for l in budget.lignes.all() if l.montant_alloue and float(l.montant_consomme) / float(l.montant_alloue) > 0.9]
        if lignes_critiques:
            facteurs.append({
                'facteur': f"{len(lignes_critiques)} ligne(s) à plus de 90% de consommation",
                'valeur':   str(len(lignes_critiques)),
                'impact':   'NEGATIF',
            })

        return Response({
            'data': {
                'probabilite_depassement': probabilite,
                'niveau_risque':           niveau,
                'taux_actuel':             taux,
                'facteurs':                facteurs,
                'recommandation': (
                    "Surveiller étroitement les lignes à fort taux de consommation."
                    if probabilite > 50 else
                    "Le budget est dans les normes. Maintenir la vigilance."
                ),
            },
            'budget_id': str(pk),
        })


class PredictionsListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response({'data': []})


# ── F6 — Scoring Budgétaire ───────────────────────────────────────────────────

class ScorerBudgetView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        budget = _budget_ou_404(pk)
        if not budget:
            return Response({'detail': 'Budget introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        taux  = budget.calculer_taux_consommation()
        nb_lignes = budget.lignes.count()

        score_execution     = max(0, 100 - abs(taux - 70))  # optimal autour de 70%
        score_completude    = min(100, nb_lignes * 10)       # plus de lignes = plus complet
        score_conformite    = 85 if budget.statut == StatutBudget.APPROUVE else 60
        score_documentation = 90 if budget.piece_justificative else 50

        score_global = round(
            (score_execution * 0.4 + score_completude * 0.2 +
             score_conformite * 0.2 + score_documentation * 0.2),
            1
        )

        return Response({
            'data': {
                'score_global':     score_global,
                'note':             'A' if score_global >= 80 else 'B' if score_global >= 60 else 'C',
                'details': {
                    'execution':     round(score_execution, 1),
                    'completude':    round(score_completude, 1),
                    'conformite':    round(score_conformite, 1),
                    'documentation': round(score_documentation, 1),
                },
                'recommandations': [
                    "Ajouter une pièce justificative si absente.",
                    "Vérifier que toutes les lignes sont correctement renseignées.",
                ] if score_global < 80 else [
                    "Budget bien structuré. Continuer sur cette lancée."
                ],
            },
            'budget_id': str(pk),
        })


class ScoreBudgetDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        budget = _budget_ou_404(pk)
        if not budget:
            return Response({'detail': 'Budget introuvable.'}, status=status.HTTP_404_NOT_FOUND)
        # Recalcul à la volée
        return ScorerBudgetView().post(request, pk)

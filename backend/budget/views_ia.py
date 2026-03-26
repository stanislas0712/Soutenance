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

        # Préparer le contexte commun (lignes détaillées)
        lignes_data = []
        for l in budget.lignes.filter(parent__isnull=True):
            if float(l.montant_alloue or 0) > 0:
                tl = round(float(l.montant_consomme) / float(l.montant_alloue) * 100, 1)
                lignes_data.append({
                    'libelle': l.libelle,
                    'alloue': float(l.montant_alloue),
                    'consomme': float(l.montant_consomme),
                    'disponible': float(l.montant_disponible),
                    'taux': tl,
                })
        nb_depenses = ConsommationLigne.objects.filter(ligne__budget=budget).count()
        lignes_critiques = [l for l in lignes_data if l['taux'] >= 90]
        lignes_sous_utilisees = [l for l in lignes_data if l['taux'] < 20 and l['alloue'] > 0]

        if _skip_ia():
            # Simulated response using real DB data
            if taux >= 90:
                niveau = 'préoccupant'
                points_forts = ["Traçabilité des dépenses assurée."]
                points_amelioration = [
                    f"Taux critique à {taux}% — risque de dépassement imminent.",
                    f"{len(lignes_critiques)} ligne(s) à plus de 90% de consommation.",
                ]
                recommandations = [
                    "Suspendre les dépenses non essentielles immédiatement.",
                    "Initier une demande de révision budgétaire auprès du comptable.",
                    "Réaffecter les crédits disponibles vers les lignes critiques.",
                ]
                score = max(20, 60 - (taux - 90))
            elif taux >= 70:
                niveau = 'satisfaisant'
                points_forts = [
                    f"Exécution avancée à {taux}% — bon niveau de réalisation.",
                    f"{nb_lignes} ligne(s) budgétaire(s) structurées.",
                ]
                points_amelioration = [
                    "Surveiller les lignes approchant leur plafond.",
                    "Vérifier la complétude des pièces justificatives.",
                ]
                recommandations = [
                    "Maintenir le rythme d'exécution actuel.",
                    f"Porter une attention particulière aux {len(lignes_critiques)} ligne(s) à risque.",
                ]
                score = min(85, 70 + (taux - 70) * 0.3)
            elif taux >= 30:
                niveau = 'en cours'
                points_forts = [
                    f"Budget de {float(budget.montant_global):,.0f} FCFA bien dimensionné.",
                    f"{nb_depenses} dépense(s) enregistrée(s) avec traçabilité.",
                ]
                points_amelioration = [
                    "Accélérer l'exécution pour atteindre les objectifs.",
                    f"{len(lignes_sous_utilisees)} ligne(s) sous-utilisée(s) à surveiller.",
                ]
                recommandations = [
                    "Planifier les achats en attente avant la fin de période.",
                    "Vérifier que toutes les lignes sont correctement alimentées.",
                ]
                score = 70
            else:
                niveau = 'démarrant'
                points_forts = [f"Budget structuré avec {nb_lignes} ligne(s)."]
                points_amelioration = [
                    f"Taux très faible ({taux}%) — exécution à initier.",
                    "Risque de sous-consommation en fin de période.",
                ]
                recommandations = [
                    "Engager rapidement les dépenses prévues.",
                    "Vérifier que les fournisseurs sont contactés.",
                ]
                score = max(40, 55 - abs(taux - 50))

            analyse = {
                'resume': (
                    f"Le budget « {budget.nom} » ({budget.code}) présente un niveau d'exécution {niveau} "
                    f"avec un taux de consommation de {taux}% "
                    f"({float(budget.montant_consomme):,.0f} / {float(budget.montant_global):,.0f} FCFA). "
                    f"Il comporte {nb_lignes} ligne(s) et {nb_depenses} dépense(s) enregistrée(s). "
                    f"Statut : {budget.get_statut_display()}."
                ),
                'points_forts': points_forts,
                'points_amelioration': points_amelioration,
                'recommandations': recommandations,
                'score_global': round(score, 1),
            }
        else:
            try:
                from .ia_client import ClaudeClient
                client = ClaudeClient()
                lignes_txt = '\n'.join(
                    f"  - {l['libelle']} : {l['alloue']:,.0f} alloué, {l['consomme']:,.0f} consommé ({l['taux']}%)"
                    for l in lignes_data[:10]
                )
                prompt = (
                    f"Tu es un expert en gestion budgétaire. Analyse ce budget en français et réponds UNIQUEMENT en JSON.\n\n"
                    f"Budget : {budget.nom} ({budget.code})\n"
                    f"Département : {budget.departement or 'Non défini'}\n"
                    f"Montant global : {float(budget.montant_global):,.0f} FCFA\n"
                    f"Montant consommé : {float(budget.montant_consomme):,.0f} FCFA\n"
                    f"Taux de consommation : {taux}%\n"
                    f"Statut : {budget.get_statut_display()}\n"
                    f"Nombre de lignes : {nb_lignes}\n"
                    f"Nombre de dépenses : {nb_depenses}\n"
                    f"Lignes principales :\n{lignes_txt}\n\n"
                    f"Réponds avec ce JSON exact :\n"
                    f'{{"resume": "...", "points_forts": ["..."], "points_amelioration": ["..."], '
                    f'"recommandations": ["..."], "score_global": 75}}'
                )
                import json as _json
                rep = client.complete(prompt)
                try:
                    content = rep.content.strip()
                    if content.startswith('```'):
                        content = content.split('```')[1]
                        if content.startswith('json'):
                            content = content[4:]
                    analyse = _json.loads(content)
                except Exception:
                    analyse = {'resume': rep.content, 'points_forts': [], 'points_amelioration': [], 'recommandations': [], 'score_global': 50}
            except Exception:
                analyse = {'resume': 'Analyse indisponible (service IA non configuré).', 'recommandations': [], 'points_forts': [], 'points_amelioration': [], 'score_global': 0}

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
            reponse = _reponse_chatbot_simulee(contenu, request.user)
        else:
            try:
                from .ia_client import ClaudeClient
                from django.db.models import Sum as _Sum
                client = ClaudeClient()
                # Contexte budgétaire de l'utilisateur
                try:
                    user_budgets = list(Budget.objects.filter(gestionnaire=request.user).order_by('-date_creation')[:5])
                    ctx_budgets = '\n'.join(
                        f"  - {b.nom} ({b.code}): {b.calculer_taux_consommation()}% consommé, statut {b.get_statut_display()}"
                        for b in user_budgets
                    ) if user_budgets else "  Aucun budget pour cet utilisateur."
                except Exception:
                    ctx_budgets = "  Contexte budgétaire indisponible."
                historique = '\n'.join(
                    f"{'Utilisateur' if m['role'] == 'user' else 'Assistant'}: {m['contenu']}"
                    for m in conv['messages'][-10:]
                )
                system_prompt = (
                    f"Tu es BudgetFlow AI, un assistant financier expert en gestion budgétaire pour organisations africaines.\n"
                    f"Réponds toujours en français, de façon concise et utile.\n"
                    f"Contexte des budgets de l'utilisateur :\n{ctx_budgets}\n\n"
                    f"Historique de la conversation :\n{historique}"
                )
                rep = client.complete(system_prompt)
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


def _reponse_chatbot_simulee(question, user=None):
    """
    Simulation intelligente du chatbot avec données réelles de la DB.
    Utilisée quand SKIP_CLAUDE_API=True ou qu'aucune clé API n'est configurée.
    """
    import unicodedata
    from django.db.models import Sum

    def _norm(s):
        """Normalise le texte : minuscules + suppression des accents."""
        return ''.join(
            c for c in unicodedata.normalize('NFD', s.lower())
            if unicodedata.category(c) != 'Mn'
        )

    q = _norm(question)

    # ── Récupérer les budgets de l'utilisateur ─────────────────────────────
    budgets = []
    if user:
        try:
            if user.is_gestionnaire:
                budgets = list(
                    Budget.objects.filter(gestionnaire=user)
                    .select_related('departement')
                    .order_by('-date_creation')
                )
            elif user.is_comptable:
                budgets = list(
                    Budget.objects.exclude(statut='BROUILLON')
                    .select_related('departement', 'gestionnaire')
                    .order_by('-date_creation')
                )
            else:
                budgets = list(Budget.objects.select_related('departement').order_by('-date_creation'))
        except Exception:
            budgets = []

    total_budgets   = len(budgets)
    approuves       = [b for b in budgets if b.statut == 'APPROUVE']
    soumis          = [b for b in budgets if b.statut == 'SOUMIS']
    brouillons      = [b for b in budgets if b.statut == 'BROUILLON']
    rejetes         = [b for b in budgets if b.statut == 'REJETE']
    montant_total   = sum(float(b.montant_global or 0) for b in budgets)
    montant_consomme= sum(float(b.montant_consomme or 0) for b in budgets)
    taux_global     = round(montant_consomme / montant_total * 100, 1) if montant_total > 0 else 0

    # Budgets en alerte (taux >= 75%)
    en_alerte = [b for b in approuves if b.calculer_taux_consommation() >= 75]
    critiques  = [b for b in approuves if b.calculer_taux_consommation() >= 100]

    def _fmt(n):
        return f"{float(n):,.0f}".replace(',', ' ')

    # ── Salutation ─────────────────────────────────────────────────────────
    if any(w in q for w in ['bonjour', 'salut', 'hello', 'bonsoir', 'coucou']):
        prenom = getattr(user, 'prenom', '') or ''
        return (
            f"Bonjour {prenom} ! 👋 Je suis votre assistant financier BudgetFlow, propulsé par Claude IA.\n\n"
            f"Vous avez actuellement **{total_budgets} budget(s)** : "
            f"{len(approuves)} approuvé(s), {len(soumis)} soumis, {len(brouillons)} brouillon(s).\n\n"
            "Comment puis-je vous aider ?"
        )

    # ── Taux d'exécution / consommation ────────────────────────────────────
    if any(w in q for w in ['taux', 'execution', 'consommation', 'consomme', 'utilisation']):
        if not budgets:
            return "Vous n'avez pas encore de budget. Créez votre premier budget depuis « Mes budgets »."
        lignes = []
        for b in approuves[:5]:
            t = b.calculer_taux_consommation()
            emoji = '🔴' if t >= 100 else '🟠' if t >= 90 else '🟡' if t >= 75 else '🟢'
            lignes.append(f"{emoji} **{b.nom}** ({b.code}) : {t}% — {_fmt(b.montant_consomme)} / {_fmt(b.montant_global)} FCFA")
        if not lignes:
            return (
                f"Aucun de vos budgets n'est encore approuvé. "
                f"Taux global (tous budgets) : **{taux_global}%**."
            )
        resume = '\n'.join(lignes)
        return (
            f"📊 **Taux d'exécution de vos budgets approuvés :**\n\n{resume}\n\n"
            f"Taux global consolidé : **{taux_global}%** "
            f"({_fmt(montant_consomme)} / {_fmt(montant_total)} FCFA).\n\n"
            "_Un taux ≥ 90% déclenche une alerte, ≥ 100% = dépassement critique._"
        )

    # ── Alertes / dépassements ─────────────────────────────────────────────
    if any(w in q for w in ['alerte', 'depassement', 'depasse', 'seuil', 'risque', 'critique', 'urgence']):
        if not en_alerte and not critiques:
            return "✅ Aucune alerte détectée. Tous vos budgets approuvés sont dans les seuils normaux (< 75%)."
        lignes = []
        for b in critiques:
            t = b.calculer_taux_consommation()
            lignes.append(f"🔴 **CRITIQUE** — {b.nom} ({b.code}) : {t}% (dépassement de {_fmt(float(b.montant_consomme) - float(b.montant_global))} FCFA)")
        for b in en_alerte:
            if b not in critiques:
                t = b.calculer_taux_consommation()
                lignes.append(f"{'🟠' if t >= 90 else '🟡'} **{'ROUGE' if t >= 90 else 'ORANGE'}** — {b.nom} ({b.code}) : {t}%")
        return (
            f"⚠️ **{len(en_alerte) + len(critiques)} alerte(s) détectée(s) :**\n\n"
            + '\n'.join(lignes) +
            "\n\n_Accédez au détail d'un budget pour voir les lignes concernées._"
        )

    # ── État / résumé des budgets ──────────────────────────────────────────
    if any(w in q for w in ['etat', 'resume', 'situation', 'tableau', 'bord', 'synthese', 'mes budgets', 'liste', 'tous']):
        if not budgets:
            return "Vous n'avez aucun budget pour le moment. Créez votre premier budget depuis le menu « Nouveau budget »."
        return (
            f"📋 **Situation de vos budgets :**\n\n"
            f"• Total : **{total_budgets}** budget(s)\n"
            f"• ✅ Approuvés : **{len(approuves)}**\n"
            f"• ⏳ En validation : **{len(soumis)}**\n"
            f"• ✏️ Brouillons : **{len(brouillons)}**\n"
            f"• ❌ Rejetés : **{len(rejetes)}**\n\n"
            f"💰 Montant total : **{_fmt(montant_total)} FCFA**\n"
            f"📊 Taux d'exécution global : **{taux_global}%**"
        )

    # ── Budget disponible / solde ──────────────────────────────────────────
    if any(w in q for w in ['disponible', 'solde', 'reste', 'restant', 'combien']):
        if not budgets:
            return "Vous n'avez aucun budget. Créez votre premier budget depuis « Nouveau budget »."
        # Icône et libellé par statut
        _statut_info = {
            'APPROUVE':  ('✅', 'Approuvé  — dépensable'),
            'BROUILLON': ('✏️', 'Brouillon — non dépensable'),
            'SOUMIS':    ('⏳', 'En validation — non dépensable'),
            'REJETE':    ('❌', 'Rejeté — non dépensable'),
            'CLOTURE':   ('🔒', 'Clôturé'),
            'ARCHIVE':   ('📦', 'Archivé'),
        }
        lignes = []
        for b in budgets[:8]:
            dispo = float(b.montant_disponible or 0)
            global_m = float(b.montant_global or 0)
            icone, libelle = _statut_info.get(b.statut, ('•', b.statut))
            line = f"{icone} **{b.nom}** ({b.code})"
            if b.statut == 'APPROUVE':
                taux = b.calculer_taux_consommation()
                line += f" : **{_fmt(dispo)} FCFA** disponibles ({taux}% consommé)"
            else:
                line += f" : {_fmt(global_m)} FCFA alloués — _{libelle}_"
            lignes.append(line)
        total_dispo = sum(float(b.montant_disponible or 0) for b in approuves)
        note = (
            f"\n\n💡 _Seuls les budgets **APPROUVÉS** permettent d'enregistrer des dépenses. "
            f"Total dépensable : **{_fmt(total_dispo)} FCFA**_"
            if budgets else ""
        )
        return (
            f"💰 **Vue d'ensemble de vos {total_budgets} budget(s) :**\n\n"
            + '\n'.join(lignes)
            + note
        )

    # ── Créer un budget ────────────────────────────────────────────────────
    if any(w in q for w in ['creer', 'créer', 'nouveau', 'créer', 'ajouter', 'nouveau budget']):
        return (
            "📝 **Comment créer un budget :**\n\n"
            "1. Cliquez sur **« Nouveau budget »** dans le menu\n"
            "2. Sélectionnez l'exercice budgétaire et le département\n"
            "3. Saisissez le nom et les dates\n"
            "4. Après enregistrement, ajoutez vos **lignes budgétaires**\n"
            "5. Soumettez pour validation par le comptable\n\n"
            "_Le statut évoluera : BROUILLON → SOUMIS → APPROUVÉ_"
        )

    # ── Soumettre / validation ─────────────────────────────────────────────
    if any(w in q for w in ['soumettre', 'soumettre', 'valider', 'validation', 'approuver', 'approuve', 'comptable']):
        return (
            "✅ **Workflow de validation :**\n\n"
            "1. **Gestionnaire** : crée le budget (BROUILLON)\n"
            "2. **Gestionnaire** : ajoute les lignes budgétaires\n"
            "3. **Gestionnaire** : soumet le budget (→ SOUMIS)\n"
            "4. **Comptable** : examine et approuve ou rejette\n"
            "5. Si rejeté → le gestionnaire corrige et resoumet\n\n"
            f"Actuellement, vous avez **{len(soumis)}** budget(s) en attente de validation."
        )

    # ── Dépenses / saisir une dépense ─────────────────────────────────────
    if any(w in q for w in ['depense', 'dépense', 'saisir', 'enregistrer', 'payer', 'achat', 'facture', 'piece']):
        return (
            "💳 **Enregistrer une dépense :**\n\n"
            "1. Accédez à un budget **APPROUVÉ** depuis « Mes budgets »\n"
            "2. Cliquez sur **« Enregistrer une dépense »**\n"
            "3. Sélectionnez la **ligne budgétaire** concernée\n"
            "4. Saisissez le montant (≤ disponible sur la ligne)\n"
            "5. Joignez la **pièce justificative** (obligatoire si > 50 000 FCFA)\n\n"
            "_La dépense sera soumise à validation par le comptable._"
        )

    # ── Lignes budgétaires ────────────────────────────────────────────────
    if any(w in q for w in ['ligne', 'poste', 'categorie', 'sous-categorie']):
        return (
            "📑 **Lignes budgétaires :**\n\n"
            "Chaque budget est composé de lignes (postes de dépenses) :\n"
            "• **Libellé** : nom du poste (ex: Serveurs, Formations...)\n"
            "• **Montant alloué** : budget prévu pour ce poste\n"
            "• **Montant consommé** : dépenses réelles enregistrées\n"
            "• **Disponible** : alloué − consommé\n\n"
            "_Chaque dépense doit être liée à une ligne budgétaire spécifique._"
        )

    # ── Anomalie ──────────────────────────────────────────────────────────
    if any(w in q for w in ['anomalie', 'irregularite', 'probleme', 'erreur', 'ecart']):
        return (
            "🔍 **Anomalies budgétaires :**\n\n"
            "L'IA détecte automatiquement :\n"
            "• 🔴 **Dépassements** : montant consommé > montant alloué\n"
            "• 🟠 **Seuils atteints** : consommation ≥ 90% de l'alloué\n"
            "• ⚡ **Sous-utilisation** : < 30% consommé après 80% de la période\n"
            "• 📎 **Pièces manquantes** : dépenses > 50K sans justificatif\n\n"
            "Accédez à **Intelligence IA > Anomalies** pour voir les détails."
        )

    # ── Prédictions ────────────────────────────────────────────────────────
    if any(w in q for w in ['prediction', 'prevision', 'projection', 'futur', 'fin de periode', 'fin periode']):
        if approuves:
            b = approuves[0]
            t = b.calculer_taux_consommation()
            jours = 90
            from django.utils import timezone
            jours_ecoules = max(1, (timezone.now().date() - b.date_debut).days)
            taux_jour = float(b.montant_consomme or 0) / jours_ecoules
            proj = taux_jour * jours
            return (
                f"📈 **Projection pour « {b.nom} » :**\n\n"
                f"• Consommation actuelle : **{_fmt(b.montant_consomme)} FCFA** ({t}%)\n"
                f"• Jours écoulés : {jours_ecoules} / {jours}\n"
                f"• Projection fin période : **{_fmt(proj)} FCFA**\n"
                f"• Budget global : {_fmt(b.montant_global)} FCFA\n\n"
                + (
                    "⚠️ **Risque de dépassement détecté.** Réduisez les dépenses non essentielles."
                    if proj > float(b.montant_global)
                    else "✅ Budget correctement dimensionné selon la tendance actuelle."
                )
            )
        return "Aucun budget approuvé disponible pour calculer une prédiction."

    # ── Aide générale ──────────────────────────────────────────────────────
    if any(w in q for w in ['aide', 'help', 'que peux', 'capacites', 'fonctions', 'quoi']):
        return (
            "🤖 **Je peux vous aider sur :**\n\n"
            "• 📊 **Taux d'exécution** — état de consommation de vos budgets\n"
            "• ⚠️ **Alertes & dépassements** — budgets en risque\n"
            "• 💰 **Fonds disponibles** — solde de chaque budget\n"
            "• 📋 **Résumé budgets** — vue d'ensemble de vos budgets\n"
            "• 📈 **Prédictions** — projection fin de période\n"
            "• 💳 **Saisie dépenses** — comment enregistrer une dépense\n"
            "• ✅ **Workflow validation** — circuit d'approbation\n\n"
            "Posez votre question !"
        )

    # ── Réponse par défaut contextuelle ──────────────────────────────────
    ctx = ""
    if budgets:
        ctx = (
            f"\n\n📊 Votre situation actuelle : {total_budgets} budget(s), "
            f"taux global {taux_global}%, {len(en_alerte)} alerte(s)."
        )
    return (
        "Je n'ai pas bien compris votre question. "
        "Essayez par exemple :\n"
        "• _« Mon taux d'exécution »_\n"
        "• _« Alertes de dépassement »_\n"
        "• _« Fonds disponibles »_\n"
        "• _« Résumé de mes budgets »_"
        + ctx
    )


# ── F3 — Détection d'Anomalies ────────────────────────────────────────────────

class DetecterAnomaliesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        budget = _budget_ou_404(pk)
        if not budget:
            return Response({'detail': 'Budget introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        now = datetime.now().isoformat()
        nouvelles = []
        taux_budget = budget.calculer_taux_consommation()
        nb_lignes   = budget.lignes.count()

        def _ajouter(type_anomalie, niveau, description, confiance):
            a = {
                'id':               str(uuid.uuid4()),
                'type_anomalie':    type_anomalie,
                'niveau':           niveau,
                'description':      description,
                'budget_reference': budget.code,
                'score_confiance':  confiance,
                'statut':           'DETECTEE',
                'created_at':       now,
            }
            _anomalies[a['id']] = a
            nouvelles.append(a)

        # 1. Dépassement global
        if taux_budget >= 100:
            _ajouter('DEPASSEMENT_GLOBAL', 'CRITIQUE',
                f"Budget {budget.code} dépasse son enveloppe ({taux_budget:.1f}% consommé — "
                f"{float(budget.montant_consomme):,.0f} FCFA sur {float(budget.montant_global):,.0f} FCFA).",
                0.98)

        # 2. Seuil d'alerte global
        elif taux_budget >= 85:
            _ajouter('ALERTE_SEUIL', 'ELEVE',
                f"Budget {budget.code} à {taux_budget:.1f}% de consommation — risque de dépassement imminent.",
                0.90)
        elif taux_budget >= 70:
            _ajouter('ALERTE_SEUIL', 'MOYEN',
                f"Budget {budget.code} à {taux_budget:.1f}% — surveillance recommandée.",
                0.75)

        # 3. Sous-utilisation (budget approuvé avec très peu de consommation)
        if budget.statut == StatutBudget.APPROUVE and taux_budget < 5 and float(budget.montant_global) > 0:
            _ajouter('SOUS_UTILISATION', 'FAIBLE',
                f"Budget {budget.code} approuvé mais seulement {taux_budget:.1f}% consommé "
                f"({float(budget.montant_consomme):,.0f} FCFA sur {float(budget.montant_global):,.0f} FCFA). "
                "Risque de sous-exécution budgétaire.",
                0.80)

        # 4. Budget sans lignes
        if nb_lignes == 0:
            _ajouter('STRUCTURE_MANQUANTE', 'MOYEN',
                f"Budget {budget.code} ne contient aucune ligne budgétaire. "
                "Structuration requise avant toute dépense.",
                0.99)

        # 5. Anomalies par ligne (dépassement unitaire)
        for ligne in budget.lignes.filter(parent__isnull=True):
            if not ligne.montant_alloue:
                continue
            taux_ligne = float(ligne.montant_consomme) / float(ligne.montant_alloue) * 100
            if taux_ligne >= 100:
                _ajouter('DEPASSEMENT_LIGNE', 'CRITIQUE',
                    f"Ligne « {ligne.libelle} » ({budget.code}) : {taux_ligne:.1f}% consommé "
                    f"({float(ligne.montant_consomme):,.0f} / {float(ligne.montant_alloue):,.0f} FCFA).",
                    0.95)
            elif taux_ligne >= 80:
                _ajouter('ALERTE_LIGNE', 'ELEVE',
                    f"Ligne « {ligne.libelle} » ({budget.code}) : {taux_ligne:.1f}% consommé — seuil critique.",
                    0.85)

        return Response({'data': nouvelles, 'budget_id': str(pk), 'nb_anomalies': len(nouvelles)})


class AnomaliesListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        statut = request.query_params.get('statut')
        items = list(_anomalies.values())
        if statut:
            items = [a for a in items if a.get('statut') == statut]
        return Response({'data': items, 'count': len(items)})


class TraiterAnomalieView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        anomalie = _anomalies.get(str(pk))
        if not anomalie:
            return Response({'detail': 'Anomalie introuvable.'}, status=status.HTTP_404_NOT_FOUND)
        nouveau_statut = request.data.get('statut')
        if nouveau_statut:
            _anomalies[str(pk)]['statut'] = nouveau_statut
        return Response({'detail': 'Anomalie traitée.', 'statut': nouveau_statut})


# ── F4 — Rapports Narratifs ───────────────────────────────────────────────────

_rapports    = {}
_anomalies   = {}   # id -> anomalie dict
_predictions = {}   # budget_id -> prediction dict


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
            taux = budget.calculer_taux_consommation()
            nb_dep = ConsommationLigne.objects.filter(ligne__budget=budget).count()
            lignes_racines = list(budget.lignes.filter(parent__isnull=True))
            lignes_section = '\n'.join(
                f"| {l.libelle[:30]} | {float(l.montant_alloue):,.0f} | {float(l.montant_consomme):,.0f} | "
                f"{round(float(l.montant_consomme)/float(l.montant_alloue)*100,1) if l.montant_alloue else 0}% |"
                for l in lignes_racines[:10]
            )
            titre = f"Rapport {type_rapport.lower()} — {budget.nom}"
            statut_eval = (
                'CRITIQUE' if taux >= 100 else
                'PRÉOCCUPANT' if taux >= 85 else
                'SATISFAISANT' if taux >= 50 else
                'INSUFFISANT'
            )
            contenu = (
                f"# Rapport {type_rapport} — {budget.nom}\n\n"
                f"**Date d'édition** : {datetime.now().strftime('%d/%m/%Y à %H:%M')}\n\n"
                f"---\n\n"
                f"## 1. Contexte\n\n"
                f"| Champ | Valeur |\n|---|---|\n"
                f"| Code | {budget.code} |\n"
                f"| Département | {budget.departement or 'Non défini'} |\n"
                f"| Exercice | {budget.budget_annuel or 'Non défini'} |\n"
                f"| Statut | {budget.get_statut_display()} |\n"
                f"| Période | {budget.date_debut} → {budget.date_fin} |\n\n"
                f"## 2. Analyse financière\n\n"
                f"| Indicateur | Montant |\n|---|---|\n"
                f"| Montant global alloué | {float(budget.montant_global):,.0f} FCFA |\n"
                f"| Montant consommé | {float(budget.montant_consomme):,.0f} FCFA |\n"
                f"| Montant disponible | {float(budget.montant_disponible):,.0f} FCFA |\n"
                f"| Taux de consommation | **{taux}%** |\n"
                f"| Nombre de dépenses | {nb_dep} |\n\n"
                f"**Évaluation globale : {statut_eval}**\n\n"
                f"## 3. Détail par ligne budgétaire\n\n"
                f"| Désignation | Alloué (FCFA) | Consommé (FCFA) | Taux |\n|---|---|---|---|\n"
                f"{lignes_section}\n\n"
                f"## 4. Recommandations\n\n"
                + (
                    "- ⚠️ **Dépassement critique** — Suspendre les dépenses non essentielles.\n"
                    "- Initier une révision budgétaire d'urgence.\n"
                    "- Identifier les lignes dépassées et les causes.\n"
                    if taux >= 100 else
                    "- Surveiller de près les lignes à fort taux de consommation.\n"
                    "- Planifier les dépenses restantes avant la fin de période.\n"
                    if taux >= 75 else
                    "- Maintenir le rythme d'exécution actuel.\n"
                    "- Vérifier la complétude des pièces justificatives.\n"
                ) +
                f"\n## 5. Conclusion\n\n"
                f"Le budget « {budget.nom} » présente une exécution {statut_eval.lower()} "
                f"avec {taux}% de consommation au {datetime.now().strftime('%d/%m/%Y')}. "
                f"{'Une action corrective est requise.' if taux >= 85 else 'Le suivi régulier est recommandé.'}"
            )
        else:
            from django.db.models import Sum
            total    = Budget.objects.count()
            approuves = Budget.objects.filter(statut=StatutBudget.APPROUVE).count()
            soumis   = Budget.objects.filter(statut=StatutBudget.SOUMIS).count()
            agg      = Budget.objects.aggregate(
                total_alloue=Sum('montant_global'),
                total_consomme=Sum('montant_consomme'),
            )
            montant_alloue   = float(agg['total_alloue'] or 0)
            montant_consomme = float(agg['total_consomme'] or 0)
            taux_global = round(montant_consomme / montant_alloue * 100, 1) if montant_alloue > 0 else 0
            titre = f"Rapport {type_rapport.lower()} global — {datetime.now().strftime('%d/%m/%Y')}"
            contenu = (
                f"# Rapport {type_rapport} global\n\n"
                f"**Date** : {datetime.now().strftime('%d/%m/%Y à %H:%M')}\n\n"
                f"---\n\n"
                f"## 1. Vue d'ensemble\n\n"
                f"| Indicateur | Valeur |\n|---|---|\n"
                f"| Total budgets | {total} |\n"
                f"| Budgets approuvés | {approuves} |\n"
                f"| Budgets en validation | {soumis} |\n"
                f"| Montant global alloué | {montant_alloue:,.0f} FCFA |\n"
                f"| Montant consommé | {montant_consomme:,.0f} FCFA |\n"
                f"| Taux d'exécution global | **{taux_global}%** |\n\n"
                f"## 2. Recommandations\n\n"
                f"- Continuer le suivi rigoureux de l'exécution budgétaire.\n"
                f"- {'Traiter en priorité les ' + str(soumis) + ' budget(s) en attente de validation.' if soumis > 0 else 'Aucun budget en attente — situation à jour.'}\n"
                f"- Vérifier les budgets dépassant 85% de consommation.\n\n"
                f"## 3. Conclusion\n\n"
                f"Taux global d'exécution : **{taux_global}%**. "
                f"{'Niveau satisfaisant.' if taux_global < 85 else 'Vigilance requise sur les dépassements potentiels.'}"
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

        from django.utils import timezone
        taux = budget.calculer_taux_consommation()
        montant_global   = float(budget.montant_global)
        montant_consomme = float(budget.montant_consomme)

        # Analyse temporelle
        today = timezone.now().date()
        jours_total   = max(1, (budget.date_fin - budget.date_debut).days)
        jours_ecoules = max(1, (today - budget.date_debut).days)
        jours_restants = max(0, (budget.date_fin - today).days)
        pct_periode   = round(jours_ecoules / jours_total * 100, 1)

        # Vélocité journalière et projection
        velocite_jour = montant_consomme / jours_ecoules if jours_ecoules > 0 else 0
        montant_projete = montant_consomme + (velocite_jour * jours_restants)
        ecart_projete   = montant_projete - montant_global

        # Taux de consommation attendu vs réel (sur-consommation ou sous-consommation)
        taux_attendu = pct_periode  # on s'attend à consommer proportionnellement à la période
        ecart_rythme = taux - taux_attendu  # positif = on consomme trop vite

        # Calcul probabilité
        if montant_projete >= montant_global * 1.1:
            probabilite = 95
            niveau = 'CRITIQUE'
        elif montant_projete >= montant_global:
            probabilite = 80
            niveau = 'ELEVE'
        elif ecart_rythme > 20:
            probabilite = 60
            niveau = 'MODERE'
        elif ecart_rythme > 10:
            probabilite = 35
            niveau = 'FAIBLE'
        else:
            probabilite = 10
            niveau = 'NEGLIGEABLE'

        lignes_critiques = [l for l in budget.lignes.all() if l.montant_alloue and float(l.montant_consomme) / float(l.montant_alloue) > 0.9]

        facteurs = [
            {
                'facteur': 'Taux de consommation actuel',
                'valeur':  f"{taux}%",
                'impact':  'POSITIF' if taux < taux_attendu else 'NEGATIF',
            },
            {
                'facteur': 'Avancement de la période',
                'valeur':  f"{pct_periode}% écoulé ({jours_ecoules}/{jours_total} jours)",
                'impact':  'NEUTRE',
            },
            {
                'facteur': 'Vélocité journalière',
                'valeur':  f"{velocite_jour:,.0f} FCFA/jour",
                'impact':  'NEGATIF' if velocite_jour * jours_total > montant_global * 1.05 else 'POSITIF',
            },
        ]
        if lignes_critiques:
            facteurs.append({
                'facteur': f"{len(lignes_critiques)} ligne(s) à plus de 90%",
                'valeur':   str(len(lignes_critiques)),
                'impact':   'NEGATIF',
            })

        if ecart_rythme > 15:
            recommandation = (
                f"Rythme de consommation trop rapide (+{ecart_rythme:.1f}% vs période). "
                "Freiner les dépenses non essentielles."
            )
        elif ecart_rythme < -20:
            recommandation = (
                f"Sous-exécution détectée ({abs(ecart_rythme):.1f}% en retard). "
                "Accélérer l'engagement des dépenses planifiées."
            )
        else:
            recommandation = "Rythme d'exécution conforme à la période. Maintenir la vigilance."

        prediction = {
            'id':                      str(uuid.uuid4()),
            'budget_reference':        budget.code,
            'probabilite_depassement': round(probabilite / 100, 2),
            'niveau_risque':           niveau,
            'taux_actuel':             taux,
            'taux_attendu':            taux_attendu,
            'ecart_rythme':            round(ecart_rythme, 1),
            'montant_prevu_final':     round(montant_projete, 2),
            'ecart_prevu':             round(ecart_projete, 2),
            'jours_restants':          jours_restants,
            'pct_periode_ecoulee':     pct_periode,
            'facteurs':                facteurs,
            'recommandation':          recommandation,
            'created_at':              datetime.now().isoformat(),
        }
        _predictions[str(pk)] = prediction

        return Response({'data': prediction, 'budget_id': str(pk)})


class PredictionsListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response({'data': list(_predictions.values())})


# ── F6 — Scoring Budgétaire ───────────────────────────────────────────────────

class ScorerBudgetView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        budget = _budget_ou_404(pk)
        if not budget:
            return Response({'detail': 'Budget introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        taux      = budget.calculer_taux_consommation()
        nb_lignes = budget.lignes.count()

        # Score exécution (optimal 60–85%)
        if 60 <= taux <= 85:
            score_execution = 100
        elif taux > 85:
            score_execution = max(0, 100 - (taux - 85) * 2)
        elif taux > 0:
            score_execution = max(30, taux * 1.2)
        else:
            score_execution = 20

        # Score complétude (lignes + structure)
        score_completude = min(100, nb_lignes * 12)

        # Score conformité (statut + soumission dans les délais)
        if budget.statut == StatutBudget.APPROUVE:
            score_conformite = 95
        elif budget.statut == StatutBudget.SOUMIS:
            score_conformite = 75
        elif budget.statut == StatutBudget.REJETE:
            score_conformite = 40
        elif budget.statut == StatutBudget.CLOTURE:
            score_conformite = 90
        else:
            score_conformite = 55

        # Score documentation (pièces justificatives sur les dépenses)
        nb_depenses = ConsommationLigne.objects.filter(ligne__budget=budget).count()
        nb_avec_pj  = ConsommationLigne.objects.filter(ligne__budget=budget).exclude(piece_justificative='').exclude(piece_justificative__isnull=True).count()
        if nb_depenses == 0:
            score_documentation = 70  # neutre si pas de dépenses
        else:
            ratio_pj = nb_avec_pj / nb_depenses
            score_documentation = round(ratio_pj * 100)

        # Score anomalies (malus si lignes dépassées)
        lignes_depassees    = budget.lignes.filter(parent__isnull=True)
        nb_lignes_depassees = sum(1 for l in lignes_depassees if l.montant_alloue and float(l.montant_consomme) > float(l.montant_alloue))
        malus_anomalies     = min(30, nb_lignes_depassees * 10)

        score_global = round(
            max(0, (
                score_execution     * 0.35 +
                score_completude    * 0.20 +
                score_conformite    * 0.25 +
                score_documentation * 0.20
            ) - malus_anomalies),
            1
        )

        if score_global >= 85:
            note, niveau = 'A', 'EXCELLENT'
        elif score_global >= 70:
            note, niveau = 'B', 'BON'
        elif score_global >= 50:
            note, niveau = 'C', 'MOYEN'
        else:
            note, niveau = 'D', 'CRITIQUE'

        recommandations = []
        if score_documentation < 60:
            recommandations.append(f"Ajouter les pièces justificatives manquantes ({nb_depenses - nb_avec_pj} dépense(s) sans PJ).")
        if nb_lignes < 3:
            recommandations.append("Structurer le budget avec davantage de lignes détaillées.")
        if nb_lignes_depassees > 0:
            recommandations.append(f"Corriger les {nb_lignes_depassees} ligne(s) en dépassement.")
        if taux < 30 and budget.statut == StatutBudget.APPROUVE:
            recommandations.append("Accélérer l'exécution — taux trop faible pour un budget approuvé.")
        if not recommandations:
            recommandations.append("Budget bien géré. Maintenir ce niveau de rigueur.")

        return Response({
            'data': {
                'score_global': score_global,
                'note':         note,
                'niveau':       niveau,
                'details': {
                    'execution':     round(score_execution, 1),
                    'completude':    round(score_completude, 1),
                    'conformite':    round(score_conformite, 1),
                    'documentation': round(score_documentation, 1),
                    'malus_anomalies': malus_anomalies,
                },
                'recommandations': recommandations,
                'stats': {
                    'nb_lignes':         nb_lignes,
                    'nb_depenses':       nb_depenses,
                    'nb_avec_pj':        nb_avec_pj,
                    'nb_lignes_depassees': nb_lignes_depassees,
                    'taux_consommation': taux,
                },
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

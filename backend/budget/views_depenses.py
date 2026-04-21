"""
BudgetFlow — Vues Dépenses
Endpoints: /api/v1/depenses/
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from django.db.models import Q
from django.core.mail import send_mail
from django.conf import settings

from .models import ConsommationLigne, StatutDepense, PieceJustificative, creer_notification
from accounts.views import IsComptableOrAdmin, IsComptable

APP_NAME = 'Gestion budgétaire'


def _envoyer_email(destinataire, sujet, corps):
    if not getattr(destinataire, 'email', None):
        return
    try:
        from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', f'{APP_NAME} <noreply@gestion-budgetaire.bf>')
        send_mail(
            subject=f'{sujet} — {APP_NAME}',
            message=corps,
            from_email=from_email,
            recipient_list=[destinataire.email],
            fail_silently=True,
        )
    except Exception:
        pass


def _serialiser_depense(c, request=None):
    pj_url = None
    if c.piece_justificative:
        try:
            pj_url = request.build_absolute_uri(c.piece_justificative.url) if request else c.piece_justificative.url
        except Exception:
            pj_url = None
    pieces = []
    for p in c.pieces.all():
        try:
            url = request.build_absolute_uri(p.fichier.url) if request else p.fichier.url
        except Exception:
            url = None
        pieces.append({'id': str(p.id), 'nom': p.nom, 'url': url})

    budget       = c.ligne.budget if c.ligne and c.ligne.budget_id else None
    ligne        = c.ligne
    sous_cat     = ligne.sous_categorie if ligne and ligne.sous_categorie_id else None
    cat          = sous_cat.categorie   if sous_cat and sous_cat.categorie_id  else None

    return {
        'id':                      str(c.id),
        'reference':               c.reference or str(c.id)[:8].upper(),
        'fournisseur':             c.fournisseur or '',
        'montant':                 str(c.montant),
        'budget_id':               str(budget.id)   if budget else None,
        'budget_code':             budget.code       if budget else '—',
        'budget_nom':              budget.nom        if budget else '—',
        'budget_reference':        budget.code       if budget else '—',
        'ligne_id':                str(ligne.id)     if ligne else None,
        'ligne_designation':       ligne.libelle     if ligne else '—',
        'ligne_code':              ligne.code        if ligne else '—',
        'ligne_unite':             ligne.unite       if ligne else '—',
        'ligne_quantite':          str(ligne.quantite) if ligne and ligne.quantite else '—',
        'sous_cat_id':             str(sous_cat.id)    if sous_cat else None,
        'sous_cat_code':           sous_cat.code       if sous_cat else '—',
        'sous_cat_libelle':        sous_cat.libelle    if sous_cat else '—',
        'cat_id':                  str(cat.id)         if cat else None,
        'cat_code':                cat.code            if cat else '—',
        'cat_libelle':             cat.libelle         if cat else '—',
        'date_depense':            c.date.isoformat() if c.date else None,
        'statut':                  c.statut,
        'motif_rejet':             c.motif_rejet,
        'note':                    c.note,
        'piece_justificative_url': pj_url,
        'pieces':                  pieces,
        'enregistre_par':          (
            f"{c.enregistre_par.prenom} {c.enregistre_par.nom}"
            if c.enregistre_par else '—'
        ),
        'validateur_nom':          (
            f"{c.validateur.prenom} {c.validateur.nom}"
            if c.validateur else None
        ),
    }


class DepenseListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        qs = ConsommationLigne.objects.select_related(
            'ligne__budget', 'ligne__sous_categorie__categorie',
            'enregistre_par', 'validateur'
        ).order_by('-date')

        statut    = request.query_params.get('statut')
        search    = request.query_params.get('search', '')
        budget_id = request.query_params.get('budget')

        # Le Gestionnaire ne voit que ses propres dépenses (R-GEST-02)
        if request.user.is_gestionnaire:
            qs = qs.filter(ligne__budget__gestionnaire=request.user)

        if statut:
            qs = qs.filter(statut=statut)
        if search:
            qs = qs.filter(
                Q(fournisseur__icontains=search) |
                Q(reference__icontains=search)   |
                Q(note__icontains=search)
            )
        if budget_id:
            qs = qs.filter(ligne__budget_id=budget_id)

        data = [_serialiser_depense(c, request) for c in qs]
        return Response({'data': data})

    def post(self, request):
        return Response(
            {'detail': 'Enregistrement de dépense via les lignes budgétaires (/api/budget/<id>/lignes/<id>/consommer/).'},
            status=status.HTTP_405_METHOD_NOT_ALLOWED,
        )


class DepenseDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        try:
            c = ConsommationLigne.objects.select_related(
                'ligne__budget__gestionnaire',
                'ligne__sous_categorie__categorie',
                'enregistre_par', 'validateur'
            ).get(pk=pk)
        except ConsommationLigne.DoesNotExist:
            return Response({'detail': 'Dépense introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        u = request.user
        if u.is_gestionnaire and c.ligne and c.ligne.budget.gestionnaire_id != u.id:
            return Response({'detail': 'Accès non autorisé.'}, status=status.HTTP_403_FORBIDDEN)

        return Response({'data': _serialiser_depense(c, request)})


class ValiderDepenseView(APIView):
    permission_classes = [IsComptable]

    def post(self, request, pk):
        try:
            depense = ConsommationLigne.objects.get(pk=pk)
        except ConsommationLigne.DoesNotExist:
            return Response({'detail': 'Dépense introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        if depense.statut != StatutDepense.SAISIE:
            return Response(
                {'detail': f'Impossible de valider une dépense au statut {depense.statut}.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        depense.statut    = StatutDepense.VALIDEE
        depense.validateur = request.user
        depense.save(update_fields=['statut', 'validateur'])
        if depense.enregistre_par:
            creer_notification(
                destinataire=depense.enregistre_par,
                type_notif='DEPENSE_VALIDEE',
                message=f"Votre dépense {depense.reference} ({depense.montant} FCFA) a été validée.",
                lien=f"/mes-depenses",
            )
            _envoyer_email(
                depense.enregistre_par,
                f"Dépense validée : {depense.reference}",
                (
                    f"Bonjour {depense.enregistre_par.prenom} {depense.enregistre_par.nom},\n\n"
                    f"Votre dépense {depense.reference} d'un montant de {depense.montant} FCFA "
                    f"a été validée par {request.user.prenom} {request.user.nom}."
                ),
            )
        return Response({'detail': 'Dépense validée.', 'data': _serialiser_depense(depense, request)})


class RejeterDepenseView(APIView):
    permission_classes = [IsComptable]

    def post(self, request, pk):
        try:
            depense = ConsommationLigne.objects.get(pk=pk)
        except ConsommationLigne.DoesNotExist:
            return Response({'detail': 'Dépense introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        if depense.statut != StatutDepense.SAISIE:
            return Response(
                {'detail': f'Impossible de rejeter une dépense au statut {depense.statut}.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        motif = request.data.get('motif', '')
        if len(motif) < 10:
            return Response(
                {'detail': 'Motif trop court (minimum 10 caractères).'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        depense.statut      = StatutDepense.REJETEE
        depense.motif_rejet = motif
        depense.validateur  = request.user
        depense.save(update_fields=['statut', 'motif_rejet', 'validateur'])
        if depense.enregistre_par:
            creer_notification(
                destinataire=depense.enregistre_par,
                type_notif='DEPENSE_REJETEE',
                message=f"Votre dépense {depense.reference} ({depense.montant} FCFA) a été rejetée. Motif : {motif[:100]}",
                lien=f"/mes-depenses",
            )
            _envoyer_email(
                depense.enregistre_par,
                f"Dépense rejetée : {depense.reference}",
                (
                    f"Bonjour {depense.enregistre_par.prenom} {depense.enregistre_par.nom},\n\n"
                    f"Votre dépense {depense.reference} d'un montant de {depense.montant} FCFA "
                    f"a été rejetée par {request.user.prenom} {request.user.nom}.\n\n"
                    f"Motif : {motif}"
                ),
            )
        return Response({'detail': 'Dépense rejetée.', 'data': _serialiser_depense(depense, request)})

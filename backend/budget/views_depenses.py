"""
BudgetFlow — Vues Dépenses
Endpoints: /api/v1/depenses/
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from django.db.models import Q

from .models import ConsommationLigne, StatutDepense, PieceJustificative, creer_notification
from accounts.views import IsComptableOrAdmin


def _serialiser_depense(c, request=None):
    pj_url = None
    if c.piece_justificative:
        try:
            pj_url = request.build_absolute_uri(c.piece_justificative.url) if request else c.piece_justificative.url
        except Exception:
            pj_url = None
    # Pièces multiples
    pieces = []
    for p in c.pieces.all():
        try:
            url = request.build_absolute_uri(p.fichier.url) if request else p.fichier.url
        except Exception:
            url = None
        pieces.append({'id': str(p.id), 'nom': p.nom, 'url': url})
    return {
        'id':                      str(c.id),
        'reference':               c.reference or str(c.id)[:8].upper(),
        'fournisseur':             c.fournisseur or '—',
        'montant':                 str(c.montant),
        'budget_reference':        c.ligne.budget.code if c.ligne and c.ligne.budget_id else '—',
        'budget_nom':              c.ligne.budget.nom  if c.ligne and c.ligne.budget_id else '—',
        'ligne_designation':       c.ligne.libelle     if c.ligne else '—',
        'date_depense':            c.date.isoformat()  if c.date else None,
        'statut':                  c.statut,
        'motif_rejet':             c.motif_rejet,
        'note':                    c.note,
        'piece_justificative_url': pj_url,
        'pieces':                  pieces,
        'enregistre_par':          (
            f"{c.enregistre_par.prenom} {c.enregistre_par.nom}"
            if c.enregistre_par else '—'
        ),
    }


class DepenseListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        qs = ConsommationLigne.objects.select_related(
            'ligne__budget', 'enregistre_par'
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
                'ligne__budget', 'enregistre_par'
            ).get(pk=pk)
        except ConsommationLigne.DoesNotExist:
            return Response({'detail': 'Dépense introuvable.'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'data': _serialiser_depense(c, request)})


class ValiderDepenseView(APIView):
    permission_classes = [IsComptableOrAdmin]

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
        depense.statut = StatutDepense.VALIDEE
        depense.save(update_fields=['statut'])
        if depense.enregistre_par:
            creer_notification(
                destinataire=depense.enregistre_par,
                type_notif='DEPENSE_VALIDEE',
                message=f"Votre dépense {depense.reference} ({depense.montant} FCFA) a été validée.",
                lien=f"/mes-depenses",
            )
        return Response({'detail': 'Dépense validée.', 'data': _serialiser_depense(depense, request)})


class RejeterDepenseView(APIView):
    permission_classes = [IsComptableOrAdmin]

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
        depense.save(update_fields=['statut', 'motif_rejet'])
        if depense.enregistre_par:
            creer_notification(
                destinataire=depense.enregistre_par,
                type_notif='DEPENSE_REJETEE',
                message=f"Votre dépense {depense.reference} ({depense.montant} FCFA) a été rejetée. Motif : {motif[:100]}",
                lien=f"/mes-depenses",
            )
        return Response({'detail': 'Dépense rejetée.', 'data': _serialiser_depense(depense, request)})

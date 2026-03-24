"""
BudgetFlow — Vues Dépenses
Endpoints: /api/v1/depenses/
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from django.db.models import Q

from .models import ConsommationLigne, StatutDepense
from accounts.views import IsComptableOrAdmin


class DepenseListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        qs = ConsommationLigne.objects.select_related(
            'ligne__budget', 'enregistre_par'
        ).order_by('-date')

        statut = request.query_params.get('statut')
        search = request.query_params.get('search', '')

        # Le Gestionnaire ne voit que ses propres dépenses (R-GEST-02)
        if request.user.is_gestionnaire:
            qs = qs.filter(ligne__budget__gestionnaire=request.user)

        if statut:
            qs = qs.filter(statut=statut)
        if search:
            qs = qs.filter(
                Q(fournisseur__icontains=search) | Q(reference__icontains=search)
            )

        budget_id = request.query_params.get('budget')
        if budget_id:
            qs = qs.filter(ligne__budget_id=budget_id)

        data = [_serialiser_depense(c) for c in qs]
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
            c = ConsommationLigne.objects.select_related('ligne__budget', 'enregistre_par').get(pk=pk)
        except ConsommationLigne.DoesNotExist:
            return Response({'detail': 'Dépense introuvable.'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'data': _serialiser_depense(c)})


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
        return Response({'detail': 'Dépense validée.', 'data': _serialiser_depense(depense)})


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
        if len(motif) < 20:
            return Response(
                {'detail': 'Motif trop court (minimum 20 caractères).'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        depense.statut      = StatutDepense.REJETEE
        depense.motif_rejet = motif
        depense.save(update_fields=['statut', 'motif_rejet'])
        return Response({'detail': 'Dépense rejetée.', 'data': _serialiser_depense(depense)})


def _serialiser_depense(c):
    return {
        'id':               str(c.id),
        'reference':        c.reference or str(c.id)[:8].upper(),
        'fournisseur':      c.fournisseur or c.note or '—',
        'montant':          str(c.montant),
        'budget_reference': c.ligne.budget.code if c.ligne and c.ligne.budget_id else '—',
        'ligne_designation': c.ligne.libelle if c.ligne else '—',
        'date_depense':     c.date.isoformat() if c.date else None,
        'statut':           c.statut,
        'motif_rejet':      c.motif_rejet,
        'note':             c.note,
    }

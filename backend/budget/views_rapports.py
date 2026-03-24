"""
BudgetFlow — Vues KPIs & Rapports analytiques
Endpoints: /api/v1/rapports/
"""
from decimal import Decimal
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from django.db.models import Sum, Count
from django.db.models.functions import TruncMonth

from .models import Budget, StatutBudget, AllocationDepartementale


class KpisView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        total     = Budget.objects.count()
        approuves = Budget.objects.filter(statut=StatutBudget.APPROUVE).count()
        soumis    = Budget.objects.filter(statut=StatutBudget.SOUMIS).count()
        rejetes   = Budget.objects.filter(statut=StatutBudget.REJETE).count()
        taux_approbation = round(approuves / total * 100, 1) if total else 0

        allocs = AllocationDepartementale.objects.all()
        nb_critiques = sum(
            1 for a in allocs
            if a.montant_alloue and (a.montant_consomme / a.montant_alloue) >= Decimal('0.9')
        )

        return Response({'data': {
            'budgets': {
                'total':    total,
                'approuves': approuves,
                'soumis':    soumis,
                'rejetes':   rejetes,
            },
            'taux_approbation':      taux_approbation,
            'nb_enveloppes_critiques': nb_critiques,
        }})


class EvolutionMensuelleView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        data = (
            Budget.objects
            .annotate(mois=TruncMonth('date_creation'))
            .values('mois')
            .annotate(nb_budgets=Count('id'), montant_total=Sum('montant_global'))
            .order_by('mois')
        )
        return Response({'data': list(data)})


class ParDepartementView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        data = (
            Budget.objects
            .filter(departement__isnull=False)
            .values('departement__code', 'departement__nom')
            .annotate(montant_total=Sum('montant_global'), nb_budgets=Count('id'))
            .order_by('-montant_total')
        )
        return Response({'data': list(data)})


class TauxUtilisationEnveloppesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        allocs = AllocationDepartementale.objects.select_related('departement').all()
        result = []
        for a in allocs:
            if a.montant_alloue:
                taux = round(float(a.montant_consomme) / float(a.montant_alloue) * 100, 1)
            else:
                taux = 0
            result.append({
                'id':             str(a.id),
                'departement':    str(a.departement),
                'montant_alloue': str(a.montant_consomme),   # consommé affiché à gauche
                'montant_total':  str(a.montant_alloue),     # total alloué affiché à droite
                'taux_utilisation': taux,
                'est_critique':   taux >= 90,
            })
        return Response({'data': result})


class ExecutionBudgetaireView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        data = (
            Budget.objects
            .filter(statut=StatutBudget.APPROUVE)
            .values('code', 'nom', 'montant_global', 'montant_consomme', 'montant_disponible')
            .order_by('-montant_global')[:20]
        )
        return Response({'data': list(data)})

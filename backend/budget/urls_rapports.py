from django.urls import path
from .views_rapports import (
    KpisView,
    EvolutionMensuelleView,
    ParDepartementView,
    TauxUtilisationEnveloppesView,
    ExecutionBudgetaireView,
)

urlpatterns = [
    path('kpis/',                        KpisView.as_view(),                    name='rapports-kpis'),
    path('evolution-mensuelle/',         EvolutionMensuelleView.as_view(),      name='rapports-evolution'),
    path('par-departement/',             ParDepartementView.as_view(),          name='rapports-par-dept'),
    path('taux-utilisation-enveloppes/', TauxUtilisationEnveloppesView.as_view(), name='rapports-enveloppes'),
    path('execution-budgetaire/',        ExecutionBudgetaireView.as_view(),     name='rapports-execution'),
]

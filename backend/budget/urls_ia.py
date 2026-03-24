from django.urls import path
from .views_ia import (
    AnalyserBudgetView, AnalysesBudgetView,
    ConversationListView, ConversationDetailView, EnvoyerMessageView,
    DetecterAnomaliesView, AnomaliesListView, TraiterAnomalieView,
    RapportsNaratifsListView, RapportNaratifDetailView,
    PredireDepassementView, PredictionsListView,
    ScorerBudgetView, ScoreBudgetDetailView,
)

urlpatterns = [
    # F1 — Analyse budgétaire
    path('analyser-budget/<uuid:pk>/', AnalyserBudgetView.as_view(),  name='ia-analyser-budget'),
    path('analyses/<uuid:pk>/',        AnalysesBudgetView.as_view(),  name='ia-analyses-budget'),

    # F2 — Chatbot
    path('conversations/',                         ConversationListView.as_view(),   name='ia-conversations'),
    path('conversations/<uuid:pk>/',               ConversationDetailView.as_view(), name='ia-conversation-detail'),
    path('conversations/<uuid:pk>/messages/',      EnvoyerMessageView.as_view(),     name='ia-envoyer-message'),

    # F3 — Anomalies
    path('detecter-anomalies/<uuid:pk>/', DetecterAnomaliesView.as_view(), name='ia-detecter-anomalies'),
    path('anomalies/',                    AnomaliesListView.as_view(),     name='ia-anomalies'),
    path('anomalies/<uuid:pk>/traiter/',  TraiterAnomalieView.as_view(),   name='ia-traiter-anomalie'),

    # F4 — Rapports narratifs
    path('rapports-narratifs/',          RapportsNaratifsListView.as_view(), name='ia-rapports'),
    path('rapports-narratifs/generer/',  RapportsNaratifsListView.as_view(), name='ia-generer-rapport'),
    path('rapports-narratifs/<uuid:pk>/', RapportNaratifDetailView.as_view(), name='ia-rapport-detail'),

    # F5 — Prédictions
    path('predire-depassement/<uuid:pk>/', PredireDepassementView.as_view(), name='ia-predire'),
    path('predictions/',                   PredictionsListView.as_view(),    name='ia-predictions'),

    # F6 — Scoring
    path('scorer-budget/<uuid:pk>/', ScorerBudgetView.as_view(),      name='ia-scorer'),
    path('score-budget/<uuid:pk>/',  ScoreBudgetDetailView.as_view(), name='ia-score-detail'),
]

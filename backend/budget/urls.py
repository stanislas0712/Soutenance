from django.urls import path
from . import views, views_export

urlpatterns = [
    # Budget annuel (admin)
    path('annuel/',                      views.BudgetAnnuelListCreateView.as_view(),  name='budget-annuel-list'),
    path('annuel/<uuid:pk>/',            views.BudgetAnnuelDetailView.as_view(),      name='budget-annuel-detail'),
    path('annuel/<uuid:budget_annuel_pk>/allocations/',
         views.AllocationListCreateView.as_view(),  name='allocation-list'),
    path('annuel/<uuid:budget_annuel_pk>/allocations/<uuid:pk>/',
         views.AllocationDetailView.as_view(),      name='allocation-detail'),

    # Budgets
    path('',                       views.BudgetListCreateView.as_view(),  name='budget-list'),
    path('<uuid:pk>/',             views.BudgetDetailView.as_view(),      name='budget-detail'),
    path('<uuid:pk>/soumettre/',   views.SoumettreView.as_view(),         name='budget-soumettre'),
    path('<uuid:pk>/approuver/',   views.ApprouverBudgetView.as_view(),   name='budget-approuver'),
    path('<uuid:pk>/rejeter/',     views.RejeterBudgetView.as_view(),     name='budget-rejeter'),
    path('<uuid:pk>/cloturer/',    views.CloturerBudgetView.as_view(),    name='budget-cloturer'),
    path('<uuid:pk>/archiver/',    views.ArchiverBudgetView.as_view(),    name='budget-archiver'),

    # Lignes budgétaires
    path('<uuid:budget_pk>/lignes/',
         views.LigneBudgetaireListCreateView.as_view(),  name='ligne-list'),
    path('<uuid:budget_pk>/lignes/<uuid:pk>/',
         views.LigneBudgetaireDetailView.as_view(),      name='ligne-detail'),
    path('<uuid:budget_pk>/lignes/<uuid:pk>/consommer/',
         views.EnregistrerConsommationMultiView.as_view(), name='ligne-consommer'),
    path('<uuid:pk>/depense-multi/',
         views.EnregistrerDepenseMultiLigneView.as_view(), name='depense-multi-ligne'),

    # Vue comptable
    path('en-validation/',         views.BudgetComptableListView.as_view(),  name='budget-en-validation'),

    # Rapport de clôture + virement
    path('<uuid:pk>/rapport-cloture/',  views.RapportClotureView.as_view(),   name='budget-rapport-cloture'),
    path('<uuid:pk>/virement/',         views.VirementCreditsView.as_view(),  name='budget-virement'),

    # Structure hiérarchique
    path('<uuid:pk>/arbre/',                       views.BudgetArbreView.as_view(),            name='budget-arbre'),
    path('<uuid:pk>/categories/',                  views.BudgetCategorieCreateView.as_view(),  name='budget-categories'),
    path('<uuid:pk>/lignes-selecteur/',            views.LignesSelecteurView.as_view(),        name='budget-lignes-selecteur'),
    path('categories/<uuid:pk>/',                  views.CategorieDetailView.as_view(),        name='categorie-detail'),
    path('categories/<uuid:pk>/sous-categories/',  views.SousCategorieCreateView.as_view(),    name='sous-categorie-create'),
    path('sous-categories/<uuid:pk>/',             views.SousCategorieDetailView.as_view(),    name='sous-categorie-detail'),
    path('sous-categories/<uuid:pk>/lignes/',      views.LigneParSousCategorieView.as_view(), name='ligne-par-sous-cat'),
    path('lignes/<uuid:pk>/',                      views.LigneHierarchieDetailView.as_view(), name='ligne-hierarchie-detail'),

    # Exports Excel & PDF
    path('<uuid:pk>/export/budget-excel/',    views_export.ExportBudgetExcelView.as_view(),   name='export-budget-excel'),
    path('<uuid:pk>/export/budget-pdf/',      views_export.ExportBudgetPdfView.as_view(),     name='export-budget-pdf'),
    path('<uuid:pk>/export/depenses-excel/',  views_export.ExportDepensesExcelView.as_view(), name='export-depenses-excel'),
    path('<uuid:pk>/export/depenses-pdf/',    views_export.ExportDepensesPdfView.as_view(),   name='export-depenses-pdf'),
]

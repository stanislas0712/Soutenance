from django.urls import path
from .views_depenses import DepenseListView, DepenseDetailView, ValiderDepenseView, RejeterDepenseView

urlpatterns = [
    path('',               DepenseListView.as_view(),   name='depense-list'),
    path('<uuid:pk>/',     DepenseDetailView.as_view(), name='depense-detail'),
    path('<uuid:pk>/valider/', ValiderDepenseView.as_view(), name='depense-valider'),
    path('<uuid:pk>/rejeter/', RejeterDepenseView.as_view(), name='depense-rejeter'),
]

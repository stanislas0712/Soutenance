from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    # Auth
    path('login/', views.LoginView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('me/', views.MeView.as_view(), name='me'),
    path('me/password/', views.ModifierMotDePasseView.as_view(), name='modifier_password'),

    # Gestion utilisateurs (admin)
    path('utilisateurs/', views.UtilisateurListCreateView.as_view(), name='utilisateur-list'),
    path('utilisateurs/<uuid:pk>/', views.UtilisateurDetailView.as_view(), name='utilisateur-detail'),
    path('utilisateurs/<uuid:pk>/reset-password/', views.AdminResetPasswordView.as_view(), name='admin-reset-password'),

    # Départements (admin)
    path('departements/', views.DepartementListCreateView.as_view(), name='departement-list'),
    path('departements/<uuid:pk>/', views.DepartementDetailView.as_view(), name='departement-detail'),
]

from django.contrib import admin
from django.urls import path, include
from django.views.generic import RedirectView
from django.contrib.auth import views as auth_views
from apps.budgets.views import inscription

urlpatterns = [
    path('manager/', admin.site.urls),
    path('', RedirectView.as_view(pattern_name='login', permanent=False)),

    # Authentification
    path('accounts/login/', auth_views.LoginView.as_view(redirect_authenticated_user=True), name='login'),
    path('accounts/logout/', auth_views.LogoutView.as_view(), name='logout'),
    path('accounts/inscription/', inscription, name='inscription'),

    # Applications
    path('budgets/', include('apps.budgets.urls')),
]
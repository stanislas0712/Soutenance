from django.urls import path
from . import views

urlpatterns = [
    path('', views.LogAuditListView.as_view(), name='audit-list'),
]

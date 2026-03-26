from django.urls import path
from budget import views

urlpatterns = [
    path('',                        views.NotificationsListView.as_view(),   name='notifications-list'),
    path('<uuid:pk>/lire/',         views.MarquerLueView.as_view(),          name='notification-lire'),
    path('lire-tout/',              views.MarquerToutesLuesView.as_view(),   name='notifications-lire-tout'),
]

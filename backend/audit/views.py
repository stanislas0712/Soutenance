from rest_framework import generics, permissions
from .models import LogAudit
from .serializers import LogAuditSerializer
from accounts.models import Role


class LogAuditListView(generics.ListAPIView):
    serializer_class   = LogAuditSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs   = LogAudit.objects.select_related('utilisateur')

        # Admin et comptable voient tous les logs ; les autres voient les leurs
        if user.role not in (Role.ADMINISTRATEUR, Role.COMPTABLE):
            qs = qs.filter(utilisateur=user)

        params = self.request.query_params
        if params.get('table'):
            qs = qs.filter(table=params['table'])
        if params.get('action'):
            qs = qs.filter(action=params['action'])
        if params.get('date_debut'):
            qs = qs.filter(date_action__date__gte=params['date_debut'])
        if params.get('date_fin'):
            qs = qs.filter(date_action__date__lte=params['date_fin'])

        return qs

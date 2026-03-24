from rest_framework import serializers
from .models import LogAudit


class LogAuditSerializer(serializers.ModelSerializer):
    utilisateur_str = serializers.SerializerMethodField()
    action_display = serializers.CharField(source='get_action_display', read_only=True)

    class Meta:
        model = LogAudit
        fields = [
            'id', 'utilisateur', 'utilisateur_str', 'action', 'action_display',
            'table', 'enregistrement_id',
            'valeur_avant', 'valeur_apres', 'utilisateur_agent', 'date_action',
        ]

    def get_utilisateur_str(self, obj):
        if obj.utilisateur:
            return str(obj.utilisateur)
        return 'Système'

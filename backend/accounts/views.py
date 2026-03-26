import logging
from django.db.models import ProtectedError
from rest_framework import generics, permissions, serializers, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Utilisateur, Departement
from audit.models import LogAudit, ActionAudit

logger = logging.getLogger('accounts')
from .serializers import (
    UtilisateurSerializer,
    CreerUtilisateurSerializer,
    ModifierUtilisateurSerializer,
    ModifierMotDePasseSerializer,
    AdminResetPasswordSerializer,
    DepartementSerializer,
)


# ── JWT personnalisé ─────────────────────────────────────────────────────────

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data['role']             = self.user.role
        data['email']            = self.user.email
        data['matricule']        = self.user.matricule
        data['nom']              = self.user.nom
        data['prenom']           = self.user.prenom
        data['is_administrateur'] = self.user.is_administrateur
        return data


class LoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            try:
                user = Utilisateur.objects.get(email=request.data.get('email'))
                user.se_connecter()
                LogAudit.enregistrer(
                    utilisateur=user,
                    table='utilisateur',
                    enregistrement_id=str(user.id),
                    action=ActionAudit.LOGIN,
                    user_agent=request.META.get('HTTP_USER_AGENT', ''),
                )
                logger.info("CONNEXION | %s | %s %s (%s)", user.email, user.prenom, user.nom, user.role)
            except Utilisateur.DoesNotExist:
                pass
        elif response.status_code == 401:
            logger.warning("ECHEC LOGIN | email: %s", request.data.get('email', '?'))
        return response


# ── Profil utilisateur connecté ──────────────────────────────────────────────

class MeView(generics.RetrieveUpdateAPIView):
    serializer_class   = UtilisateurSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class ModifierMotDePasseView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ModifierMotDePasseSerializer(
            data=request.data,
            context={'request': request},
        )
        if serializer.is_valid():
            serializer.save()
            return Response({'detail': 'Mot de passe modifié avec succès.'})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ── Permissions personnalisées ────────────────────────────────────────────────

class IsAdministrateur(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_administrateur


class IsComptableOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.is_comptable or request.user.is_administrateur
        )


class IsGestionnaireOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.is_gestionnaire or request.user.is_administrateur
        )


class IsGestionnaire(permissions.BasePermission):
    """Réservé au Gestionnaire uniquement — l'Admin ne crée/modifie pas de budget."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_gestionnaire


# ── Gestion des utilisateurs (admin) ─────────────────────────────────────────

class UtilisateurListCreateView(generics.ListCreateAPIView):
    queryset           = Utilisateur.objects.select_related('departement').all()
    permission_classes = [IsAdministrateur]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CreerUtilisateurSerializer
        return UtilisateurSerializer

    def perform_create(self, serializer):
        instance = serializer.save()
        LogAudit.enregistrer(
            utilisateur=self.request.user,
            table='utilisateur',
            enregistrement_id=str(instance.id),
            action=ActionAudit.CREATE,
            valeur_apres=f"{instance.matricule} – {instance.nom} {instance.prenom} ({instance.role})",
            user_agent=self.request.META.get('HTTP_USER_AGENT', ''),
        )


class UtilisateurDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset           = Utilisateur.objects.select_related('departement').all()
    permission_classes = [IsAdministrateur]

    def get_serializer_class(self):
        if self.request.method in ('PUT', 'PATCH'):
            return ModifierUtilisateurSerializer
        return UtilisateurSerializer

    def perform_update(self, serializer):
        instance = serializer.save()
        LogAudit.enregistrer(
            utilisateur=self.request.user,
            table='utilisateur',
            enregistrement_id=str(instance.id),
            action=ActionAudit.UPDATE,
            valeur_apres=str(self.request.data),
            user_agent=self.request.META.get('HTTP_USER_AGENT', ''),
        )

    def perform_destroy(self, instance):
        try:
            LogAudit.enregistrer(
                utilisateur=self.request.user,
                table='utilisateur',
                enregistrement_id=str(instance.id),
                action=ActionAudit.DELETE,
                valeur_avant=f"{instance.matricule} – {instance.nom} {instance.prenom}",
                user_agent=self.request.META.get('HTTP_USER_AGENT', ''),
            )
            instance.delete()
        except ProtectedError:
            nb_budgets = instance.budgets_crees.count()
            raise serializers.ValidationError(
                f"Impossible de supprimer {instance.prenom} {instance.nom} : "
                f"cet utilisateur est lié à {nb_budgets} budget(s). "
                "Réaffectez ou supprimez ses budgets d'abord."
            )


# ── Gestion des départements (admin) ─────────────────────────────────────────

class AdminResetPasswordView(APIView):
    permission_classes = [IsAdministrateur]

    def post(self, request, pk):
        try:
            user = Utilisateur.objects.get(pk=pk)
        except Utilisateur.DoesNotExist:
            return Response({'detail': 'Utilisateur introuvable.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = AdminResetPasswordSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user)
            LogAudit.enregistrer(
                utilisateur=request.user,
                table='utilisateur',
                enregistrement_id=str(user.id),
                action=ActionAudit.UPDATE,
                valeur_apres=f"Mot de passe réinitialisé pour {user.matricule}",
                user_agent=request.META.get('HTTP_USER_AGENT', ''),
            )
            return Response({'detail': 'Mot de passe réinitialisé avec succès.'})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DepartementListCreateView(generics.ListCreateAPIView):
    queryset           = Departement.objects.all()
    serializer_class   = DepartementSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.IsAuthenticated()]
        return [IsAdministrateur()]

    def perform_create(self, serializer):
        instance = serializer.save()
        LogAudit.enregistrer(
            utilisateur=self.request.user,
            table='departement',
            enregistrement_id=str(instance.id),
            action=ActionAudit.CREATE,
            valeur_apres=f"{instance.code} – {instance.nom}",
            user_agent=self.request.META.get('HTTP_USER_AGENT', ''),
        )


class DepartementDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset           = Departement.objects.all()
    serializer_class   = DepartementSerializer
    permission_classes = [IsAdministrateur]

    def perform_update(self, serializer):
        instance = serializer.save()
        LogAudit.enregistrer(
            utilisateur=self.request.user,
            table='departement',
            enregistrement_id=str(instance.id),
            action=ActionAudit.UPDATE,
            valeur_apres=str(self.request.data),
            user_agent=self.request.META.get('HTTP_USER_AGENT', ''),
        )

    def perform_destroy(self, instance):
        LogAudit.enregistrer(
            utilisateur=self.request.user,
            table='departement',
            enregistrement_id=str(instance.id),
            action=ActionAudit.DELETE,
            valeur_avant=f"{instance.code} – {instance.nom}",
            user_agent=self.request.META.get('HTTP_USER_AGENT', ''),
        )
        instance.delete()

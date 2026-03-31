from rest_framework import serializers
from .models import Utilisateur, Departement


class DepartementSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Departement
        fields = ['id', 'code', 'nom', 'description', 'actif']
        read_only_fields = ['id', 'code']


class UtilisateurSerializer(serializers.ModelSerializer):
    departement_detail = DepartementSerializer(source='departement', read_only=True)
    role_display       = serializers.CharField(source='get_role_display', read_only=True)

    class Meta:
        model  = Utilisateur
        fields = [
            'id', 'matricule', 'email', 'nom', 'prenom', 'photo',
            'role', 'role_display', 'departement', 'departement_detail',
            'actif', 'bloque', 'tentatives_connexion',
            'date_creation', 'derniere_connexion',
        ]
        read_only_fields = ['id', 'date_creation', 'derniere_connexion', 'bloque', 'tentatives_connexion']


class CreerUtilisateurSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=4)

    class Meta:
        model  = Utilisateur
        fields = ['matricule', 'email', 'nom', 'prenom', 'password', 'role', 'departement', 'actif']

    def create(self, validated_data):
        password = validated_data.pop('password')
        user     = Utilisateur(**validated_data)
        user.set_password(password)
        user.save()
        return user


class ModifierUtilisateurSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Utilisateur
        fields = ['matricule', 'email', 'nom', 'prenom', 'role', 'departement', 'actif']


class ModifierMotDePasseSerializer(serializers.Serializer):
    ancien_password  = serializers.CharField(write_only=True)
    nouveau_password = serializers.CharField(write_only=True, min_length=4)

    def validate_ancien_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Mot de passe actuel incorrect.")
        return value

    def save(self):
        user = self.context['request'].user
        user.set_password(self.validated_data['nouveau_password'])
        user.save()
        return user


class AdminResetPasswordSerializer(serializers.Serializer):
    nouveau_password = serializers.CharField(write_only=True, min_length=4)

    def save(self, user):
        user.set_password(self.validated_data['nouveau_password'])
        user.save()
        return user

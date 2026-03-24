from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.core.exceptions import ValidationError
from .models import (
    BudgetAnnuel, AllocationDepartementale,
    Budget, LigneBudgetaire,
    StatutBudget, NiveauAlerte,
    CategoriePrincipale, SousCategorie,
)
from .serializers import (
    BudgetAnnuelSerializer,
    AllocationDepartementaleSerializer,
    AllocationCreateSerializer,
    BudgetListSerializer,
    BudgetDetailSerializer,
    BudgetCreateSerializer,
    BudgetUpdateSerializer,
    LigneBudgetaireSerializer,
    LigneBudgetaireCreateSerializer,
    CategoriePrincipaleSerializer,
    SousCategorieSerializer,
    LigneBudgetaireHierarchieSerializer,
)
from accounts.views import IsAdministrateur, IsGestionnaireOrAdmin, IsComptableOrAdmin, IsGestionnaire
from audit.models import LogAudit, ActionAudit


# ── Budget annuel ─────────────────────────────────────────────────────────────

class BudgetAnnuelListCreateView(generics.ListCreateAPIView):
    serializer_class = BudgetAnnuelSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.IsAuthenticated()]
        return [IsAdministrateur()]

    def get_queryset(self):
        return BudgetAnnuel.objects.prefetch_related('allocations__departement').all()

    def perform_create(self, serializer):
        instance = serializer.save()
        LogAudit.enregistrer(
            utilisateur=self.request.user,
            table='budget_annuel',
            enregistrement_id=str(instance.id),
            action=ActionAudit.CREATE,
            valeur_apres=f"Budget annuel {instance.annee} – global: {instance.montant_global}",
            user_agent=self.request.META.get('HTTP_USER_AGENT', ''),
        )


class BudgetAnnuelDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset         = BudgetAnnuel.objects.prefetch_related('allocations__departement').all()
    serializer_class = BudgetAnnuelSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.IsAuthenticated()]
        return [IsAdministrateur()]

    def perform_update(self, serializer):
        instance = serializer.save()
        LogAudit.enregistrer(
            utilisateur=self.request.user,
            table='budget_annuel',
            enregistrement_id=str(instance.id),
            action=ActionAudit.UPDATE,
            valeur_apres=str(self.request.data),
            user_agent=self.request.META.get('HTTP_USER_AGENT', ''),
        )

    def perform_destroy(self, instance):
        LogAudit.enregistrer(
            utilisateur=self.request.user,
            table='budget_annuel',
            enregistrement_id=str(instance.id),
            action=ActionAudit.DELETE,
            valeur_avant=str(instance),
            user_agent=self.request.META.get('HTTP_USER_AGENT', ''),
        )
        instance.delete()


# ── Allocations départementales ───────────────────────────────────────────────

class AllocationListCreateView(generics.ListCreateAPIView):
    """Allocations d'un budget annuel donné."""

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.IsAuthenticated()]
        return [IsAdministrateur()]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return AllocationCreateSerializer
        return AllocationDepartementaleSerializer

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx['budget_annuel'] = self._get_budget_annuel()
        return ctx

    def _get_budget_annuel(self):
        try:
            return BudgetAnnuel.objects.get(pk=self.kwargs['budget_annuel_pk'])
        except BudgetAnnuel.DoesNotExist:
            from rest_framework.exceptions import NotFound
            raise NotFound('Budget annuel introuvable.')

    def get_queryset(self):
        return AllocationDepartementale.objects.select_related('departement').filter(
            budget_annuel_id=self.kwargs['budget_annuel_pk']
        )

    def perform_create(self, serializer):
        budget_annuel = self._get_budget_annuel()
        instance = serializer.save(budget_annuel=budget_annuel)
        LogAudit.enregistrer(
            utilisateur=self.request.user,
            table='allocation_departementale',
            enregistrement_id=str(instance.id),
            action=ActionAudit.CREATE,
            valeur_apres=f"{instance} – alloué: {instance.montant_alloue}",
            user_agent=self.request.META.get('HTTP_USER_AGENT', ''),
        )


class AllocationDetailView(generics.RetrieveUpdateDestroyAPIView):
    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.IsAuthenticated()]
        return [IsAdministrateur()]

    def get_serializer_class(self):
        if self.request.method in ('PUT', 'PATCH'):
            return AllocationCreateSerializer
        return AllocationDepartementaleSerializer

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        try:
            ctx['budget_annuel'] = BudgetAnnuel.objects.get(pk=self.kwargs['budget_annuel_pk'])
        except BudgetAnnuel.DoesNotExist:
            ctx['budget_annuel'] = None
        return ctx

    def get_queryset(self):
        return AllocationDepartementale.objects.select_related('departement').filter(
            budget_annuel_id=self.kwargs['budget_annuel_pk']
        )

    def perform_update(self, serializer):
        instance = serializer.save()
        LogAudit.enregistrer(
            utilisateur=self.request.user,
            table='allocation_departementale',
            enregistrement_id=str(instance.id),
            action=ActionAudit.UPDATE,
            valeur_apres=str(self.request.data),
            user_agent=self.request.META.get('HTTP_USER_AGENT', ''),
        )

    def perform_destroy(self, instance):
        LogAudit.enregistrer(
            utilisateur=self.request.user,
            table='allocation_departementale',
            enregistrement_id=str(instance.id),
            action=ActionAudit.DELETE,
            valeur_avant=str(instance),
            user_agent=self.request.META.get('HTTP_USER_AGENT', ''),
        )
        instance.delete()


# ── Budget ────────────────────────────────────────────────────────────────────

class BudgetListCreateView(generics.ListCreateAPIView):
    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.IsAuthenticated()]
        # Seul le Gestionnaire peut créer un budget (pas l'Admin)
        return [IsGestionnaire()]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return BudgetCreateSerializer
        return BudgetListSerializer

    def get_queryset(self):
        user   = self.request.user
        qs     = Budget.objects.select_related('departement', 'gestionnaire', 'comptable', 'allocation__budget_annuel').all()
        statut = self.request.query_params.get('statut')
        dept   = self.request.query_params.get('departement')
        if statut: qs = qs.filter(statut=statut)
        if dept:   qs = qs.filter(departement=dept)
        if user.is_gestionnaire:
            # Le Gestionnaire ne voit que ses propres budgets
            qs = qs.filter(gestionnaire=user)
        elif user.is_comptable:
            # Le Comptable ne voit jamais les brouillons
            qs = qs.exclude(statut=StatutBudget.BROUILLON)
        # L'Admin voit tout (lecture seule — pas de création/modification)
        return qs

    def perform_create(self, serializer):
        instance = serializer.save()
        LogAudit.enregistrer(
            utilisateur=self.request.user,
            table='budget',
            enregistrement_id=str(instance.id),
            action=ActionAudit.CREATE,
            valeur_apres=f"{instance.code} – {instance.nom}",
            user_agent=self.request.META.get('HTTP_USER_AGENT', ''),
        )


class BudgetDetailView(generics.RetrieveUpdateDestroyAPIView):
    def get_permissions(self):
        if self.request.method in ('PUT', 'PATCH'):
            return [IsGestionnaire()]
        if self.request.method == 'DELETE':
            return [IsGestionnaireOrAdmin()]
        return [permissions.IsAuthenticated()]

    def get_serializer_class(self):
        if self.request.method in ('PUT', 'PATCH'):
            return BudgetUpdateSerializer
        return BudgetDetailSerializer

    def get_queryset(self):
        return Budget.objects.select_related(
            'departement', 'gestionnaire', 'comptable', 'allocation__budget_annuel'
        ).prefetch_related('lignes').all()

    def update(self, request, *args, **kwargs):
        budget = self.get_object()
        if budget.statut not in (StatutBudget.BROUILLON, StatutBudget.REJETE):
            return Response(
                {'detail': 'Seul un budget en brouillon ou rejeté peut être modifié.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return super().update(request, *args, **kwargs)

    def perform_update(self, serializer):
        instance = serializer.save()
        LogAudit.enregistrer(
            utilisateur=self.request.user,
            table='budget',
            enregistrement_id=str(instance.id),
            action=ActionAudit.UPDATE,
            valeur_apres=str(self.request.data),
            user_agent=self.request.META.get('HTTP_USER_AGENT', ''),
        )

    def destroy(self, request, *args, **kwargs):
        budget = self.get_object()
        if budget.statut not in (StatutBudget.BROUILLON, StatutBudget.REJETE):
            return Response(
                {'detail': 'Seul un budget en brouillon ou rejeté peut être supprimé.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        LogAudit.enregistrer(
            utilisateur=request.user,
            table='budget',
            enregistrement_id=str(budget.id),
            action=ActionAudit.DELETE,
            valeur_avant=f"{budget.code} – {budget.nom}",
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
        )
        return super().destroy(request, *args, **kwargs)


class ApprouverBudgetView(APIView):
    permission_classes = [IsComptableOrAdmin]

    def post(self, request, pk):
        try:
            budget = Budget.objects.get(pk=pk)
        except Budget.DoesNotExist:
            return Response({'detail': 'Budget introuvable.'}, status=status.HTTP_404_NOT_FOUND)
        try:
            budget.approuver_budget(request.user)
        except ValidationError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        LogAudit.enregistrer(
            utilisateur=request.user, table='budget',
            enregistrement_id=str(budget.id), action=ActionAudit.APPROVE,
            valeur_apres=f"{budget.code} approuvé",
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
        )
        return Response(BudgetListSerializer(budget).data)


class RejeterBudgetView(APIView):
    permission_classes = [IsComptableOrAdmin]

    def post(self, request, pk):
        try:
            budget = Budget.objects.get(pk=pk)
        except Budget.DoesNotExist:
            return Response({'detail': 'Budget introuvable.'}, status=status.HTTP_404_NOT_FOUND)
        try:
            budget.rejeter_budget(request.user)
        except ValidationError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        LogAudit.enregistrer(
            utilisateur=request.user, table='budget',
            enregistrement_id=str(budget.id), action=ActionAudit.REJECT,
            valeur_apres=f"{budget.code} rejeté",
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
        )
        return Response(BudgetListSerializer(budget).data)


class CloturerBudgetView(APIView):
    permission_classes = [IsAdministrateur]

    def post(self, request, pk):
        try:
            budget = Budget.objects.get(pk=pk)
        except Budget.DoesNotExist:
            return Response({'detail': 'Budget introuvable.'}, status=status.HTTP_404_NOT_FOUND)
        try:
            budget.cloturer_budget()
        except ValidationError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        LogAudit.enregistrer(
            utilisateur=request.user, table='budget',
            enregistrement_id=str(budget.id), action=ActionAudit.UPDATE,
            valeur_avant='APPROUVE', valeur_apres='CLOTURE',
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
        )
        return Response(BudgetListSerializer(budget).data)


class ArchiverBudgetView(APIView):
    permission_classes = [IsAdministrateur]

    def post(self, request, pk):
        try:
            budget = Budget.objects.get(pk=pk)
        except Budget.DoesNotExist:
            return Response({'detail': 'Budget introuvable.'}, status=status.HTTP_404_NOT_FOUND)
        try:
            budget.archiver_budget()
        except ValidationError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        LogAudit.enregistrer(
            utilisateur=request.user, table='budget',
            enregistrement_id=str(budget.id), action=ActionAudit.UPDATE,
            valeur_avant='CLOTURE', valeur_apres='ARCHIVE',
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
        )
        return Response(BudgetListSerializer(budget).data)


class SoumettreView(APIView):
    permission_classes = [IsGestionnaire]

    def post(self, request, pk):
        try:
            budget = Budget.objects.get(pk=pk)
        except Budget.DoesNotExist:
            return Response({'detail': 'Budget introuvable.'}, status=status.HTTP_404_NOT_FOUND)
        if budget.gestionnaire != request.user and not request.user.is_administrateur:
            return Response({'detail': 'Vous ne pouvez soumettre que vos propres budgets.'}, status=status.HTTP_403_FORBIDDEN)
        try:
            budget.soumettre_budget()
        except ValidationError as e:
            msg = e.message if hasattr(e, 'message') else (e.messages[0] if e.messages else str(e))
            return Response({'detail': msg}, status=status.HTTP_400_BAD_REQUEST)
        LogAudit.enregistrer(
            utilisateur=request.user, table='budget',
            enregistrement_id=str(budget.id), action=ActionAudit.SUBMIT,
            valeur_avant='BROUILLON', valeur_apres='SOUMIS',
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
        )
        return Response(BudgetListSerializer(budget).data)


# ── Lignes budgétaires ────────────────────────────────────────────────────────

class LigneBudgetaireListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return LigneBudgetaireCreateSerializer
        return LigneBudgetaireSerializer

    def get_queryset(self):
        return LigneBudgetaire.objects.filter(budget_id=self.kwargs['budget_pk'])

    def perform_create(self, serializer):
        try:
            budget = Budget.objects.get(pk=self.kwargs['budget_pk'])
        except Budget.DoesNotExist:
            from rest_framework.exceptions import NotFound
            raise NotFound('Budget introuvable.')
        if budget.statut not in (StatutBudget.BROUILLON, StatutBudget.REJETE):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('Les lignes ne peuvent être modifiées que sur un budget en brouillon ou rejeté.')
        from django.core.exceptions import ValidationError as DjangoValidationError
        from rest_framework.exceptions import ValidationError as DRFValidationError
        try:
            instance = serializer.save(budget=budget)
        except DjangoValidationError as e:
            raise DRFValidationError({'detail': e.messages[0] if e.messages else str(e)})
        LogAudit.enregistrer(
            utilisateur=self.request.user, table='ligne_budgetaire',
            enregistrement_id=str(instance.id), action=ActionAudit.CREATE,
            valeur_apres=f"{instance.libelle} – {instance.montant_alloue} FCFA (budget {budget.code})",
            user_agent=self.request.META.get('HTTP_USER_AGENT', ''),
        )


class LigneBudgetaireDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method in ('PUT', 'PATCH'):
            return LigneBudgetaireCreateSerializer
        return LigneBudgetaireSerializer

    def get_queryset(self):
        return LigneBudgetaire.objects.filter(budget_id=self.kwargs['budget_pk'])

    def perform_update(self, serializer):
        from django.core.exceptions import ValidationError as DjangoValidationError
        from rest_framework.exceptions import ValidationError as DRFValidationError
        try:
            instance = serializer.save()
        except DjangoValidationError as e:
            raise DRFValidationError({'detail': e.messages[0] if e.messages else str(e)})
        LogAudit.enregistrer(
            utilisateur=self.request.user, table='ligne_budgetaire',
            enregistrement_id=str(instance.id), action=ActionAudit.UPDATE,
            valeur_apres=str(self.request.data),
            user_agent=self.request.META.get('HTTP_USER_AGENT', ''),
        )

    def perform_destroy(self, instance):
        LogAudit.enregistrer(
            utilisateur=self.request.user, table='ligne_budgetaire',
            enregistrement_id=str(instance.id), action=ActionAudit.DELETE,
            valeur_avant=f"{instance.libelle} – {instance.montant_alloue} F",
            user_agent=self.request.META.get('HTTP_USER_AGENT', ''),
        )
        instance.delete()


class EnregistrerConsommationView(APIView):
    permission_classes = [IsGestionnaire]

    def post(self, request, budget_pk, pk):
        try:
            ligne = LigneBudgetaire.objects.select_related('budget__allocation').get(pk=pk, budget_id=budget_pk)
        except LigneBudgetaire.DoesNotExist:
            return Response({'detail': 'Ligne introuvable.'}, status=status.HTTP_404_NOT_FOUND)
        if ligne.budget.statut != StatutBudget.APPROUVE:
            return Response(
                {'detail': 'Les dépenses ne peuvent être enregistrées que sur un budget approuvé.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        montant = request.data.get('montant')
        if montant is None:
            return Response({'detail': 'Le champ montant est requis.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            montant = float(montant)
            if montant <= 0:
                raise ValueError()
        except (ValueError, TypeError):
            return Response({'detail': 'Montant invalide.'}, status=status.HTTP_400_BAD_REQUEST)

        piece_justificative = request.FILES.get('piece_justificative')
        note = request.data.get('note', '')

        try:
            ligne.enregistrer_consommation(
                montant,
                piece_justificative=piece_justificative,
                note=note,
                enregistre_par=request.user,
            )
        except ValidationError as e:
            msg = e.message if hasattr(e, 'message') else (e.messages[0] if e.messages else str(e))
            return Response({'detail': msg}, status=status.HTTP_400_BAD_REQUEST)
        montant_avant = float(ligne.montant_consomme) - montant
        LogAudit.enregistrer(
            utilisateur=request.user, table='ligne_budgetaire',
            enregistrement_id=str(ligne.id), action=ActionAudit.UPDATE,
            valeur_avant=f"consommé: {montant_avant:,.0f} FCFA",
            valeur_apres=f"consommé: {float(ligne.montant_consomme):,.0f} FCFA (+{montant:,.0f} FCFA)",
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
        )
        ligne.refresh_from_db()
        ligne.budget.refresh_from_db()
        return Response({
            'ligne':         LigneBudgetaireSerializer(ligne).data,
            'budget_statut': ligne.budget.statut,
            'niveau_alerte': ligne.budget.niveau_alerte,
            'taux':          ligne.budget.calculer_taux_consommation(),
        })


class BudgetComptableListView(generics.ListAPIView):
    serializer_class   = BudgetListSerializer
    permission_classes = [IsComptableOrAdmin]

    def get_queryset(self):
        # Le Comptable ne voit jamais les brouillons (R-COMPT-01)
        qs = Budget.objects.select_related('departement', 'gestionnaire', 'allocation__budget_annuel').exclude(
            statut=StatutBudget.BROUILLON
        )
        statut = self.request.query_params.get('statut')
        if statut:
            qs = qs.filter(statut=statut)
        return qs


# ── Structure hiérarchique ────────────────────────────────────────────────────

class BudgetArbreView(APIView):
    """GET /budget/{id}/arbre/ — Arbre catégories > sous-catégories > lignes"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        try:
            budget = Budget.objects.get(pk=pk)
        except Budget.DoesNotExist:
            return Response({'detail': 'Budget introuvable.'}, status=status.HTTP_404_NOT_FOUND)
        cats = CategoriePrincipale.objects.filter(budget=budget).prefetch_related(
            'sous_categories__lignes'
        ).order_by('ordre', 'code')
        return Response({'success': True, 'data': CategoriePrincipaleSerializer(cats, many=True).data})


class BudgetCategorieCreateView(APIView):
    """POST /budget/{id}/categories/"""
    permission_classes = [IsGestionnaire]

    def post(self, request, pk):
        try:
            budget = Budget.objects.get(pk=pk)
        except Budget.DoesNotExist:
            return Response({'detail': 'Budget introuvable.'}, status=status.HTTP_404_NOT_FOUND)
        if budget.statut not in (StatutBudget.BROUILLON, StatutBudget.REJETE):
            return Response({'detail': 'Modification impossible sur ce statut.'}, status=status.HTTP_400_BAD_REQUEST)
        libelle = request.data.get('libelle', '').strip()
        if not libelle:
            return Response({'detail': 'Le libellé est requis.'}, status=status.HTTP_400_BAD_REQUEST)
        from django.core.exceptions import ValidationError as _DjVE
        try:
            cat = CategoriePrincipale(budget=budget, libelle=libelle)
            cat.save()
        except _DjVE as e:
            msg = e.messages[0] if hasattr(e, 'messages') and e.messages else str(e)
            return Response({'detail': msg}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'success': True, 'data': CategoriePrincipaleSerializer(cat).data}, status=status.HTTP_201_CREATED)


class CategorieDetailView(APIView):
    """DELETE /categories/{id}/"""
    permission_classes = [IsGestionnaire]

    def delete(self, request, pk):
        try:
            cat = CategoriePrincipale.objects.select_related('budget').get(pk=pk)
        except CategoriePrincipale.DoesNotExist:
            return Response({'detail': 'Categorie introuvable.'}, status=status.HTTP_404_NOT_FOUND)
        if cat.budget.statut not in (StatutBudget.BROUILLON, StatutBudget.REJETE):
            return Response({'detail': 'Modification impossible sur ce statut.'}, status=status.HTTP_400_BAD_REQUEST)
        budget = cat.budget
        cat.delete()
        budget.recalculer_montants()
        return Response(status=status.HTTP_204_NO_CONTENT)


class SousCategorieCreateView(APIView):
    """POST /categories/{id}/sous-categories/"""
    permission_classes = [IsGestionnaire]

    def post(self, request, pk):
        try:
            cat = CategoriePrincipale.objects.select_related('budget').get(pk=pk)
        except CategoriePrincipale.DoesNotExist:
            return Response({'detail': 'Categorie introuvable.'}, status=status.HTTP_404_NOT_FOUND)
        if cat.budget.statut not in (StatutBudget.BROUILLON, StatutBudget.REJETE):
            return Response({'detail': 'Modification impossible sur ce statut.'}, status=status.HTTP_400_BAD_REQUEST)
        libelle = request.data.get('libelle', '').strip()
        if not libelle:
            return Response({'detail': 'Le libelle est requis.'}, status=status.HTTP_400_BAD_REQUEST)
        sc = SousCategorie(categorie=cat, libelle=libelle)
        sc.save()
        return Response({'success': True, 'data': SousCategorieSerializer(sc).data}, status=status.HTTP_201_CREATED)


class SousCategorieDetailView(APIView):
    """DELETE /sous-categories/{id}/"""
    permission_classes = [IsGestionnaire]

    def delete(self, request, pk):
        try:
            sc = SousCategorie.objects.select_related('categorie__budget').get(pk=pk)
        except SousCategorie.DoesNotExist:
            return Response({'detail': 'Sous-categorie introuvable.'}, status=status.HTTP_404_NOT_FOUND)
        if sc.categorie.budget.statut not in (StatutBudget.BROUILLON, StatutBudget.REJETE):
            return Response({'detail': 'Modification impossible sur ce statut.'}, status=status.HTTP_400_BAD_REQUEST)
        budget = sc.categorie.budget
        sc.delete()
        budget.recalculer_montants()
        return Response(status=status.HTTP_204_NO_CONTENT)


class LigneParSousCategorieView(APIView):
    """POST /sous-categories/{id}/lignes/"""
    permission_classes = [IsGestionnaire]

    def post(self, request, pk):
        try:
            sc = SousCategorie.objects.select_related('categorie__budget').get(pk=pk)
        except SousCategorie.DoesNotExist:
            return Response({'detail': 'Sous-categorie introuvable.'}, status=status.HTTP_404_NOT_FOUND)
        budget = sc.categorie.budget
        if budget.statut not in (StatutBudget.BROUILLON, StatutBudget.REJETE):
            return Response({'detail': 'Modification impossible sur ce statut.'}, status=status.HTTP_400_BAD_REQUEST)
        libelle = request.data.get('libelle', '').strip()
        if not libelle:
            return Response({'detail': 'Le libelle est requis.'}, status=status.HTTP_400_BAD_REQUEST)
        from decimal import Decimal as _D
        from django.core.exceptions import ValidationError as _DjVE
        from rest_framework.exceptions import ValidationError as _DRFVE
        try:
            quantite      = _D(str(request.data.get('quantite', 1) or 1))
            montant_prevu = _D(str(request.data.get('montantPrevu', 0) or 0))
            prix_unitaire = (montant_prevu / quantite) if quantite else montant_prevu
            ligne = LigneBudgetaire(
                budget=budget,
                sous_categorie=sc,
                libelle=libelle,
                unite=request.data.get('unite', '') or '',
                quantite=quantite,
                prix_unitaire=prix_unitaire,
            )
            ligne.save()
        except (ValueError, _DjVE) as e:
            msg = e.messages[0] if hasattr(e, 'messages') and e.messages else str(e)
            return Response({'detail': msg}, status=status.HTTP_400_BAD_REQUEST)
        LogAudit.enregistrer(
            utilisateur=request.user, table='ligne_budgetaire',
            enregistrement_id=str(ligne.id), action=ActionAudit.CREATE,
            valeur_apres=f"{ligne.libelle} - {ligne.montant_alloue} FCFA (budget {budget.code})",
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
        )
        return Response({'success': True, 'data': LigneBudgetaireHierarchieSerializer(ligne).data}, status=status.HTTP_201_CREATED)


class LigneHierarchieDetailView(generics.RetrieveUpdateDestroyAPIView):
    """PATCH/DELETE /lignes/{id}/"""
    serializer_class = LigneBudgetaireHierarchieSerializer

    def get_permissions(self):
        if self.request.method in ('PUT', 'PATCH', 'DELETE'):
            return [IsGestionnaire()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        return LigneBudgetaire.objects.select_related('sous_categorie__categorie__budget').all()

    def perform_update(self, serializer):
        from django.core.exceptions import ValidationError as _DjVE
        from rest_framework.exceptions import ValidationError as _DRFVE
        try:
            serializer.save()
        except _DjVE as e:
            raise _DRFVE({'detail': e.messages[0] if e.messages else str(e)})

    def perform_destroy(self, instance):
        LogAudit.enregistrer(
            utilisateur=self.request.user, table='ligne_budgetaire',
            enregistrement_id=str(instance.id), action=ActionAudit.DELETE,
            valeur_avant=f"{instance.libelle} - {instance.montant_alloue} F",
            user_agent=self.request.META.get('HTTP_USER_AGENT', ''),
        )
        instance.delete()


class LignesSelecteurView(APIView):
    """GET /budget/{id}/lignes-selecteur/ — Liste pour saisir une depense"""
    permission_classes = [IsGestionnaire]

    def get(self, request, pk):
        try:
            budget = Budget.objects.get(pk=pk)
        except Budget.DoesNotExist:
            return Response({'detail': 'Budget introuvable.'}, status=status.HTTP_404_NOT_FOUND)
        lignes = LigneBudgetaire.objects.filter(
            budget=budget, sous_categorie__isnull=False
        ).select_related('sous_categorie__categorie').order_by(
            'sous_categorie__categorie__ordre', 'sous_categorie__categorie__code',
            'sous_categorie__ordre', 'sous_categorie__code',
        )
        from common.formatters import formater_montant, calculer_taux_execution
        data = []
        for l in lignes:
            taux = calculer_taux_execution(float(l.montant_consomme), float(l.montant_alloue))
            data.append({
                'ligne_id':                   str(l.id),
                'categorie':                  f"{l.sous_categorie.categorie.code} - {l.sous_categorie.categorie.libelle}",
                'sous_categorie':             f"{l.sous_categorie.code} - {l.sous_categorie.libelle}",
                'libelle':                    l.libelle,
                'montant_prevu':              float(l.montant_alloue),
                'montant_consomme':           float(l.montant_consomme),
                'montant_disponible':         float(l.montant_disponible),
                'montant_disponible_formate': formater_montant(l.montant_disponible),
                'taux_consommation':          taux,
            })
        return Response({'success': True, 'data': data})

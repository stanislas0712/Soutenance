import uuid
import django.core.validators
import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('accounts', '0001_initial'),
    ]

    operations = [
        # ── Budget annuel ─────────────────────────────────────────────────────
        migrations.CreateModel(
            name='BudgetAnnuel',
            fields=[
                ('id',             models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('annee',          models.IntegerField(unique=True, verbose_name='Année')),
                ('montant_global', models.DecimalField(decimal_places=2, max_digits=18, validators=[django.core.validators.MinValueValidator(0)], verbose_name='Budget global')),
                ('description',    models.TextField(blank=True, verbose_name='Description / note')),
                ('date_creation',  models.DateTimeField(auto_now_add=True)),
            ],
            options={'db_table': 'budget_annuel', 'ordering': ['-annee'], 'verbose_name': 'Budget annuel', 'verbose_name_plural': 'Budgets annuels'},
        ),

        # ── Allocation départementale ─────────────────────────────────────────
        migrations.CreateModel(
            name='AllocationDepartementale',
            fields=[
                ('id',                 models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('budget_annuel',      models.ForeignKey(on_delete=django.db.models.deletion.CASCADE,      related_name='allocations', to='budget.budgetannuel',              verbose_name='Budget annuel')),
                ('departement',        models.ForeignKey(on_delete=django.db.models.deletion.PROTECT,      related_name='allocations', to='accounts.departement',              verbose_name='Département')),
                ('montant_alloue',     models.DecimalField(decimal_places=2, max_digits=18, validators=[django.core.validators.MinValueValidator(0)], verbose_name='Montant alloué')),
                ('montant_consomme',   models.DecimalField(decimal_places=2, default=0, max_digits=18,     verbose_name='Montant consommé')),
                ('montant_disponible', models.DecimalField(decimal_places=2, default=0, max_digits=18,     verbose_name='Montant disponible')),
                ('date_creation',      models.DateTimeField(auto_now_add=True)),
            ],
            options={'db_table': 'allocation_departementale', 'ordering': ['budget_annuel', 'departement__nom'], 'verbose_name': 'Allocation départementale', 'verbose_name_plural': 'Allocations départementales', 'unique_together': {('budget_annuel', 'departement')}},
        ),

        # ── Budget ────────────────────────────────────────────────────────────
        migrations.CreateModel(
            name='Budget',
            fields=[
                ('id',             models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('gestionnaire',   models.ForeignKey(on_delete=django.db.models.deletion.PROTECT,  related_name='budgets_crees',  to=settings.AUTH_USER_MODEL, verbose_name='Gestionnaire')),
                ('comptable',      models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='budgets_valides', to=settings.AUTH_USER_MODEL, verbose_name='Comptable')),
                ('allocation',     models.ForeignKey(on_delete=django.db.models.deletion.PROTECT,  related_name='budgets',        to='budget.allocationdepartementale', verbose_name='Allocation départementale')),
                ('departement',    models.ForeignKey(on_delete=django.db.models.deletion.PROTECT,  related_name='budgets',        to='accounts.departement',            verbose_name='Département')),
                ('code',           models.CharField(max_length=50, unique=True, verbose_name='Code')),
                ('nom',            models.CharField(max_length=200, verbose_name='Nom')),
                ('technique_estimation', models.CharField(choices=[('ANALOGIE', 'Analogie'), ('TROIS_POINTS', '3 Points (PERT)'), ('ASCENDANTE', 'Ascendante')], default='ASCENDANTE', max_length=20, verbose_name="Technique d'estimation")),
                ('montant_global',     models.DecimalField(decimal_places=2, default=0, max_digits=18, verbose_name='Montant global')),
                ('montant_consomme',   models.DecimalField(decimal_places=2, default=0, max_digits=18, verbose_name='Montant consommé')),
                ('montant_disponible', models.DecimalField(decimal_places=2, default=0, max_digits=18, verbose_name='Montant disponible')),
                ('statut',         models.CharField(choices=[('SOUMIS', 'Soumis'), ('APPROUVE', 'Approuvé'), ('REJETE', 'Rejeté'), ('CLOTURE', 'Clôturé'), ('ARCHIVE', 'Archivé')], default='SOUMIS', max_length=10, verbose_name='Statut')),
                ('date_debut',     models.DateField(verbose_name='Date début')),
                ('date_fin',       models.DateField(verbose_name='Date fin')),
                ('date_creation',  models.DateTimeField(auto_now_add=True)),
                ('date_soumission', models.DateTimeField(blank=True, null=True)),
                ('date_cloture',   models.DateTimeField(blank=True, null=True)),
            ],
            options={'db_table': 'budget', 'ordering': ['-date_creation'], 'verbose_name': 'Budget', 'verbose_name_plural': 'Budgets', 'indexes': [models.Index(fields=['statut'], name='budget_statut_ea2d92_idx'), models.Index(fields=['departement'], name='budget_departe_91c8d7_idx')]},
        ),

        # ── Ligne budgétaire ──────────────────────────────────────────────────
        migrations.CreateModel(
            name='LigneBudgetaire',
            fields=[
                ('id',             models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('budget',         models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='lignes', to='budget.budget', verbose_name='Budget')),
                ('libelle',        models.CharField(max_length=200, verbose_name='Libellé')),
                ('section',        models.CharField(choices=[('REVENU', 'Revenu'), ('DEPENSE', 'Dépense')], max_length=10, verbose_name='Section')),
                ('quantite',       models.DecimalField(decimal_places=2, default=1, max_digits=14, validators=[django.core.validators.MinValueValidator(0)], verbose_name='Quantité')),
                ('prix_unitaire',  models.DecimalField(decimal_places=2, default=0, max_digits=18, validators=[django.core.validators.MinValueValidator(0)], verbose_name='Prix unitaire')),
                ('cout_optimiste', models.DecimalField(blank=True, decimal_places=2, max_digits=18, null=True, verbose_name='Coût optimiste (Co)')),
                ('cout_probable',  models.DecimalField(blank=True, decimal_places=2, max_digits=18, null=True, verbose_name='Coût le plus probable (Cm)')),
                ('cout_pessimiste',models.DecimalField(blank=True, decimal_places=2, max_digits=18, null=True, verbose_name='Coût pessimiste (Cp)')),
                ('montant_alloue',     models.DecimalField(decimal_places=2, default=0, max_digits=18, verbose_name='Montant alloué')),
                ('montant_consomme',   models.DecimalField(decimal_places=2, default=0, max_digits=18, verbose_name='Montant consommé')),
                ('montant_disponible', models.DecimalField(decimal_places=2, default=0, max_digits=18, verbose_name='Montant disponible')),
                ('date_creation',  models.DateTimeField(auto_now_add=True)),
            ],
            options={'db_table': 'ligne_budgetaire', 'ordering': ['section', 'id'], 'verbose_name': 'Ligne budgétaire', 'verbose_name_plural': 'Lignes budgétaires'},
        ),
    ]

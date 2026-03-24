"""
Migration 0010 — Structure hiérarchique 3 niveaux
Ajoute CategoriePrincipale, SousCategorie et FK sous_categorie sur LigneBudgetaire.
"""
import uuid
import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('budget', '0009_depense_statut_reference'),
    ]

    operations = [
        # 1. Créer table categorie_principale
        migrations.CreateModel(
            name='CategoriePrincipale',
            fields=[
                ('id',      models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, serialize=False)),
                ('code',    models.CharField(max_length=5, verbose_name='Code (A, B, C...)')),
                ('libelle', models.CharField(max_length=200, verbose_name='Libellé')),
                ('ordre',   models.PositiveIntegerField(default=0, verbose_name='Ordre')),
                ('budget',  models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='categories',
                    to='budget.budget',
                    verbose_name='Budget',
                )),
            ],
            options={
                'verbose_name': 'Catégorie principale',
                'verbose_name_plural': 'Catégories principales',
                'db_table': 'categorie_principale',
                'ordering': ['ordre', 'code'],
            },
        ),
        migrations.AddConstraint(
            model_name='categorieprincipale',
            constraint=models.UniqueConstraint(fields=['budget', 'code'], name='unique_budget_cat_code'),
        ),

        # 2. Créer table sous_categorie
        migrations.CreateModel(
            name='SousCategorie',
            fields=[
                ('id',        models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, serialize=False)),
                ('code',      models.CharField(max_length=10, verbose_name='Code (A.1, A.2...)')),
                ('libelle',   models.CharField(max_length=200, verbose_name='Libellé')),
                ('ordre',     models.PositiveIntegerField(default=0, verbose_name='Ordre')),
                ('categorie', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='sous_categories',
                    to='budget.categorieprincipale',
                    verbose_name='Catégorie',
                )),
            ],
            options={
                'verbose_name': 'Sous-catégorie',
                'verbose_name_plural': 'Sous-catégories',
                'db_table': 'sous_categorie',
                'ordering': ['ordre', 'code'],
            },
        ),
        migrations.AddConstraint(
            model_name='souscategorie',
            constraint=models.UniqueConstraint(fields=['categorie', 'code'], name='unique_cat_sousc_code'),
        ),

        # 3. Ajouter sous_categorie_id (nullable) sur ligne_budgetaire
        migrations.AddField(
            model_name='lignebudgetaire',
            name='sous_categorie',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name='lignes',
                to='budget.souscategorie',
                verbose_name='Sous-catégorie',
            ),
        ),
    ]

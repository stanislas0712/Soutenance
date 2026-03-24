import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('budget', '0007_departement_optionnel_budget'),
    ]

    operations = [
        migrations.AddField(
            model_name='lignebudgetaire',
            name='parent',
            field=models.ForeignKey(
                blank=True, null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name='sous_lignes',
                to='budget.lignebudgetaire',
                verbose_name='Ligne parente',
            ),
        ),
        migrations.AddField(
            model_name='lignebudgetaire',
            name='code',
            field=models.CharField(blank=True, max_length=30, verbose_name='Code'),
        ),
        migrations.AddField(
            model_name='lignebudgetaire',
            name='unite',
            field=models.CharField(blank=True, max_length=50, verbose_name='Unité'),
        ),
        migrations.AlterField(
            model_name='lignebudgetaire',
            name='section',
            field=models.CharField(
                choices=[('REVENU', 'Revenu'), ('DEPENSE', 'Dépense')],
                default='DEPENSE',
                max_length=10,
                verbose_name='Section',
            ),
        ),
        migrations.AlterModelOptions(
            name='lignebudgetaire',
            options={
                'ordering': ['code', 'id'],
                'verbose_name': 'Ligne budgétaire',
                'verbose_name_plural': 'Lignes budgétaires',
            },
        ),
    ]

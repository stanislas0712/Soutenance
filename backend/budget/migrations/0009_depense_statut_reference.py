from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('budget', '0008_ligne_code_unite_parent'),
    ]

    operations = [
        migrations.AddField(
            model_name='consommationligne',
            name='reference',
            field=models.CharField(blank=True, max_length=50, null=True, unique=True, verbose_name='Référence'),
        ),
        migrations.AddField(
            model_name='consommationligne',
            name='fournisseur',
            field=models.CharField(blank=True, default='', max_length=200, verbose_name='Fournisseur'),
        ),
        migrations.AddField(
            model_name='consommationligne',
            name='statut',
            field=models.CharField(
                choices=[('SAISIE', 'En attente'), ('VALIDEE', 'Validée'), ('REJETEE', 'Rejetée')],
                default='SAISIE',
                max_length=12,
                verbose_name='Statut',
            ),
        ),
        migrations.AddField(
            model_name='consommationligne',
            name='motif_rejet',
            field=models.CharField(blank=True, default='', max_length=500, verbose_name='Motif de rejet'),
        ),
        migrations.AlterField(
            model_name='consommationligne',
            name='piece_justificative',
            field=models.FileField(
                blank=True,
                null=True,
                upload_to='justificatifs/%Y/%m/',
                verbose_name='Pièce justificative',
            ),
        ),
    ]

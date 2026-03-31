from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='utilisateur',
            name='bloque',
            field=models.BooleanField(default=False, verbose_name='Compte bloqué'),
        ),
        migrations.AddField(
            model_name='utilisateur',
            name='tentatives_connexion',
            field=models.PositiveSmallIntegerField(default=0, verbose_name='Tentatives échouées'),
        ),
    ]

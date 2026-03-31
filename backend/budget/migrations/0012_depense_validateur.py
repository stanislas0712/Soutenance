from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('budget', '0011_add_motif_rejet_notifications_pieces'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name='consommationligne',
            name='validateur',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='depenses_validees',
                to=settings.AUTH_USER_MODEL,
                verbose_name='Validé/Rejeté par',
            ),
        ),
    ]

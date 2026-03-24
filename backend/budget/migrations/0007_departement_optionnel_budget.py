import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('budget', '0006_budget_annuel_direct_allocation_optionnelle'),
        ('accounts', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='budget',
            name='departement',
            field=models.ForeignKey(
                blank=True, null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='budgets',
                to='accounts.departement',
                verbose_name='Département',
            ),
        ),
    ]

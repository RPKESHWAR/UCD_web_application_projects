# Generated by Django 3.0.7 on 2020-07-29 10:35

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('bus_stops', '0002_auto_20200727_1708'),
    ]

    operations = [
        migrations.CreateModel(
            name='timetable',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('line_id', models.CharField(max_length=10)),
                ('direction', models.IntegerField()),
                ('program_number', models.IntegerField()),
                ('planned_arrival', models.IntegerField()),
                ('stop_id', models.ForeignKey(db_column='stop_id', on_delete=django.db.models.deletion.PROTECT, to='bus_stops.BusStops')),
            ],
            options={
                'db_table': 'timetable',
                'managed': True,
            },
        ),
        migrations.AddIndex(
            model_name='timetable',
            index=models.Index(fields=['stop_id', 'line_id', 'direction', 'program_number', 'planned_arrival'], name='timetable_stop_id_dbe3a8_idx'),
        ),
        migrations.AlterUniqueTogether(
            name='timetable',
            unique_together={('line_id', 'direction', 'program_number', 'planned_arrival', 'stop_id')},
        ),
    ]

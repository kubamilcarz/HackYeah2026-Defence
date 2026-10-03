import csv
import os
import time
from pathlib import Path
from django.conf import settings
from django.core.management.base import BaseCommand
from django.db import transaction

from api.models import ShelterPoint


class Command(BaseCommand):
    help = "Imports shelter points from a CSV file into SQLite database."

    def add_arguments(self, parser):
        parser.add_argument(
            "--file",
            type=str,
            default=str(settings.BASE_DIR / "data" / "punkty_schronienia.csv"),
            help="Path to the source CSV file",
        )
        parser.add_argument(
            "--clear",
            action="store_true",
            help="Clear existing ShelterPoint records before importing",
        )
        parser.add_argument(
            "--save-clean-csv",
            action="store_true",
            help="Save an optimized/cleaned version of the CSV (punkty_schronienia_clean.csv)",
        )
        parser.add_argument(
            "--batch-size",
            type=int,
            default=5000,
            help="Batch size for bulk insertion into the database",
        )

    def handle(self, *args, **options):
        csv_path = Path(options["file"])
        if not csv_path.exists():
            self.stderr.write(self.style.ERROR(f"File not found: {csv_path}"))
            return

        start_time = time.time()
        self.stdout.write(self.style.NOTICE(f"Reading CSV from {csv_path}..."))

        if options["clear"]:
            deleted_count, _ = ShelterPoint.objects.all().delete()
            self.stdout.write(self.style.WARNING(f"Cleared {deleted_count} existing records."))

        shelter_instances = []
        clean_rows = []
        save_clean_csv = options["save_clean_csv"]
        skipped_count = 0

        with open(csv_path, mode="r", encoding="utf-8-sig") as f:
            reader = csv.DictReader(f)
            for row in reader:
                identyfikator = row.get("Identyfikator publiczny", "").strip()
                if not identyfikator:
                    skipped_count += 1
                    continue

                try:
                    lat = round(float(row.get("Szerokosc geograficzna", 0)), 6)
                    lon = round(float(row.get("Dlugosc geograficzna", 0)), 6)
                except (ValueError, TypeError):
                    skipped_count += 1
                    continue

                voivodeship = row.get("Wojewodztwo", "").strip()
                county = row.get("Powiat", "").strip()
                commune = row.get("Gmina", "").strip()
                address = row.get("Adres", "").strip()
                accessibility = row.get("Dostepnosc", "").strip()

                shelter_instances.append(
                    ShelterPoint(
                        id=identyfikator,
                        name="Miejsce ochronne",
                        object_type="Obiekt ochrony ludności",
                        voivodeship=voivodeship,
                        county=county,
                        commune=commune,
                        address=address,
                        accessibility=accessibility,
                        latitude=lat,
                        longitude=lon,
                    )
                )

                if save_clean_csv:
                    clean_rows.append({
                        "id": identyfikator,
                        "wojewodztwo": voivodeship,
                        "powiat": county,
                        "gmina": commune,
                        "adres": address,
                        "dostepnosc": accessibility,
                        "latitude": lat,
                        "longitude": lon,
                    })

        self.stdout.write(f"Parsed {len(shelter_instances)} valid shelter points (skipped {skipped_count}).")

        # Bulk insert into database
        batch_size = options["batch_size"]
        self.stdout.write(f"Inserting into database in batches of {batch_size}...")
        
        with transaction.atomic():
            ShelterPoint.objects.bulk_create(
                shelter_instances,
                batch_size=batch_size,
                ignore_conflicts=True,
            )

        total_in_db = ShelterPoint.objects.count()
        elapsed = time.time() - start_time
        self.stdout.write(
            self.style.SUCCESS(
                f"Successfully imported shelters! Total in database: {total_in_db} in {elapsed:.2f} seconds."
            )
        )

        # Save cleaned CSV if requested
        if save_clean_csv and clean_rows:
            clean_path = csv_path.parent / "punkty_schronienia_clean.csv"
            self.stdout.write(f"Writing cleaned CSV to {clean_path}...")
            fieldnames = ["id", "wojewodztwo", "powiat", "gmina", "adres", "dostepnosc", "latitude", "longitude"]
            with open(clean_path, mode="w", encoding="utf-8", newline="") as cf:
                writer = csv.DictWriter(cf, fieldnames=fieldnames)
                writer.writeheader()
                writer.writerows(clean_rows)

            orig_mb = os.path.getsize(csv_path) / (1024 * 1024)
            clean_mb = os.path.getsize(clean_path) / (1024 * 1024)
            self.stdout.write(
                self.style.SUCCESS(
                    f"Cleaned CSV saved! Size reduced from {orig_mb:.2f} MB to {clean_mb:.2f} MB."
                )
            )

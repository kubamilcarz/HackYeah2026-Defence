from django.db import models


class ShelterPoint(models.Model):
    """
    Civil protection shelter point (Miejsce doraźnego schronienia / punkt ochrony ludności).
    """
    id = models.CharField(
        max_length=32,
        primary_key=True,
        help_text="Public identifier (e.g. OZO-6D94271C9708)",
    )
    name = models.CharField(
        max_length=120,
        default="Miejsce ochronne",
        help_text="Object name",
    )
    object_type = models.CharField(
        max_length=120,
        default="Obiekt ochrony ludności",
        help_text="Type of protection facility",
    )
    voivodeship = models.CharField(
        max_length=32,
        db_index=True,
        help_text="Województwo (e.g. dolnośląskie)",
    )
    county = models.CharField(
        max_length=64,
        db_index=True,
        help_text="Powiat (e.g. Wrocław, pow. nyski)",
    )
    commune = models.CharField(
        max_length=64,
        db_index=True,
        help_text="Gmina (e.g. Wrocław, Otmuchów)",
    )
    address = models.CharField(
        max_length=255,
        help_text="Street address / locality",
    )
    accessibility = models.CharField(
        max_length=32,
        db_index=True,
        help_text="Accessibility status (Całodobowa, Na żądanie, Określone godziny)",
    )
    latitude = models.FloatField(
        db_index=True,
        help_text="Latitude in WGS84 coordinate system",
    )
    longitude = models.FloatField(
        db_index=True,
        help_text="Longitude in WGS84 coordinate system",
    )

    class Meta:
        verbose_name = "Punkt schronienia"
        verbose_name_plural = "Punkty schronienia"
        indexes = [
            models.Index(fields=["latitude", "longitude"], name="idx_shelter_coords"),
            models.Index(fields=["voivodeship", "county", "commune"], name="idx_shelter_location"),
        ]

    def __str__(self):
        return f"{self.id} - {self.address} ({self.commune})"

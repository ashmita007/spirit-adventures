from django.core.cache import cache
from django.test import TestCase

from adventures.models import Category, Destination, Trip, TripImage


class TripPhotosApiTests(TestCase):
    def setUp(self):
        cache.clear()
        dest = Destination.objects.create(name="Dandeli", slug="dandeli")
        cat = Category.objects.create(name="Water Sports", slug="water-sports")
        base = dict(destination=dest, category=cat, short_description="x", full_description="x", price=4200)
        self.trip = Trip.objects.create(title="2D 1N Dandeli", slug="2d-1n-dandeli",
                                        cover_image="https://example.com/cover.jpg", **base)
        TripImage.objects.create(trip=self.trip, image_url="https://example.com/a.jpg", ordering=1)
        TripImage.objects.create(trip=self.trip, image_url="https://example.com/cover.jpg", ordering=2)  # same as cover
        TripImage.objects.create(trip=self.trip, image_url="https://example.com/clip.mp4", ordering=3)
        hidden = Trip.objects.create(title="Hidden", slug="hidden", is_published=False,
                                     cover_image="https://example.com/hidden.jpg", **base)
        TripImage.objects.create(trip=hidden, image_url="https://example.com/hidden-2.jpg")

    def test_lists_each_published_photo_once_without_videos(self):
        r = self.client.get("/api/v1/gallery/trips/")
        self.assertEqual(r.status_code, 200, r.content)
        data = r.json()["data"]
        self.assertEqual([d["image_url"] for d in data], ["https://example.com/cover.jpg", "https://example.com/a.jpg"])
        first = data[0]
        self.assertEqual(first["trip_slug"], "2d-1n-dandeli")
        self.assertEqual(first["category"], "Water Sports")
        self.assertEqual(first["location"], "Dandeli")

from django.core.management import call_command
from django.test import TestCase

from adventures.models import Category, Destination, Enquiry, Review, Trip


def _trip(dest, title, slug):
    fields = {f.name for f in Trip._meta.get_fields()}
    data = {'destination': dest, 'title': title, 'slug': slug}
    for name, value in (('price', 1000), ('duration_days', 2), ('duration_nights', 1),
                        ('short_description', 'x'), ('description', 'x'), ('overview', 'x')):
        if name in fields:
            data[name] = value
    return Trip.objects.create(**data)


class CleanDemoDataTests(TestCase):
    def setUp(self):
        self.dandeli = Destination.objects.create(name='Dandeli', slug='dandeli')
        self.karnataka = Destination.objects.create(name='Karnataka', slug='karnataka')
        self.ladakh = Destination.objects.create(name='Ladakh', slug='ladakh')
        self.real = _trip(self.karnataka, '3D 2N GOKARNA & DANDELI', '3d-2n-gokarna-dandeli')
        self.demo = _trip(self.dandeli, 'Dandeli Kali River Rafting', 'dandeli-river-rafting-jungle-expedition')
        _trip(self.ladakh, 'Leh Ladakh Ultimate Motorcycle Odyssey', 'leh-ladakh-motorcycle-odyssey')

    def test_demo_trip_goes_but_its_review_and_enquiry_stay(self):
        review = Review.objects.create(trip=self.demo, traveler_name='Shahid Ali', rating=5, review_text='Great')
        enquiry = Enquiry.objects.create(trip=self.demo, full_name='Asha', phone='9123456789')
        call_command('clean_demo_data')
        self.assertFalse(Trip.objects.filter(slug=self.demo.slug).exists())
        review.refresh_from_db()
        enquiry.refresh_from_db()
        self.assertEqual(review.trip, self.real)
        self.assertIsNone(enquiry.trip)

    def test_empty_demo_destination_removed_but_used_one_kept(self):
        _trip(self.dandeli, '2D 1N DANDELI', '2d-1n-dandeli')
        call_command('clean_demo_data')
        self.assertFalse(Destination.objects.filter(slug='ladakh').exists())
        self.assertTrue(Destination.objects.filter(slug='dandeli').exists())
        self.assertTrue(Trip.objects.filter(slug='2d-1n-dandeli').exists())

    def test_duplicates_merge_and_typo_is_fixed(self):
        good = _trip(self.karnataka, '4D 3N Munnar & Alleppey', '4d-3n-munnar-alleppey')
        typo = _trip(self.karnataka, '4D 3N MUNNAT & ALLEPPEY', '4d-3n-munnat-alleppey')
        Enquiry.objects.create(trip=good, full_name='Ravi', phone='9123456780')
        Review.objects.create(trip=typo, traveler_name='A', rating=5, review_text='x')
        Review.objects.create(trip=typo, traveler_name='B', rating=5, review_text='y')
        call_command('clean_demo_data')
        left = Trip.objects.filter(title__icontains='alleppey')
        self.assertEqual(left.count(), 1)
        trip = left.get()
        self.assertEqual(trip.slug, '4d-3n-munnar-alleppey')
        self.assertIn('MUNNAR', trip.title)
        self.assertEqual(trip.reviews.count(), 2)
        self.assertEqual(trip.enquiries.count(), 1)

    def test_running_twice_changes_nothing_more(self):
        call_command('clean_demo_data')
        before = (Trip.objects.count(), Destination.objects.count())
        call_command('clean_demo_data')
        self.assertEqual(before, (Trip.objects.count(), Destination.objects.count()))

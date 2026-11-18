import datetime
import json

from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.test import TestCase

from adventures.models import Destination, Promotion, SiteTheme, Trip
from adventures.promotions import active_theme


class PromotionApiTests(TestCase):
    def setUp(self):
        cache.clear()
        self.staff = get_user_model().objects.create_user('o@example.com', 'pw-123456', is_staff=True)
        dest = Destination.objects.create(name='Karnataka', slug='karnataka')
        self.trip = Trip.objects.create(destination=dest, title='3D 2N GOKARNA & DANDELI', slug='3d-2n-gokarna-dandeli',
                                        short_description='x', full_description='x', price=4999,
                                        cover_image='https://example.com/c.jpg')

    def post(self, url, body):
        return self.client.post(url, json.dumps(body), content_type='application/json')

    def test_owner_creates_offer_and_it_shows_publicly(self):
        self.client.force_login(self.staff)
        r = self.post('/api/v1/owner/promotions/', {
            'kind': 'OFFER', 'title': 'New Year Dandeli', 'badge': '20% OFF', 'trip_id': self.trip.id,
            'price': '3999', 'original_price': '4999'})
        self.assertEqual(r.status_code, 200, r.content)
        data = r.json()['data']
        self.assertEqual(data['trip_slug'], self.trip.slug)
        self.assertEqual(data['image_url'], 'https://example.com/c.jpg')
        self.client.logout()
        pub = self.client.get('/api/v1/promotions/').json()['data']
        self.assertEqual([i['title'] for i in pub['items']], ['New Year Dandeli'])

    def test_expired_hidden_and_past_events_hidden(self):
        y = datetime.date.today() - datetime.timedelta(days=2)
        Promotion.objects.create(title='Old offer', ends_on=y)
        Promotion.objects.create(title='Past event', kind='EVENT', event_date=y)
        Promotion.objects.create(title='Hidden', is_published=False)
        Promotion.objects.create(title='Live')
        pub = self.client.get('/api/v1/promotions/').json()['data']
        self.assertEqual([i['title'] for i in pub['items']], ['Live'])

    def test_owner_endpoints_need_staff(self):
        r = self.post('/api/v1/owner/promotions/', {'title': 'x'})
        self.assertIn(r.status_code, (401, 403))

    def test_validation(self):
        self.client.force_login(self.staff)
        r = self.post('/api/v1/owner/promotions/', {'title': 'x', 'starts_on': '2026-12-10', 'ends_on': '2026-12-01'})
        self.assertEqual(r.status_code, 400)
        r = self.post('/api/v1/owner/promotions/', {'title': 'x', 'image_url': 'javascript:alert(1)'})
        self.assertEqual(r.status_code, 400)

    def test_update_and_delete(self):
        self.client.force_login(self.staff)
        p = Promotion.objects.create(title='A', trip=self.trip)
        r = self.post(f'/api/v1/owner/promotions/{p.id}/', {'title': 'B', 'clear_trip': True})
        self.assertEqual(r.status_code, 200, r.content)
        p.refresh_from_db()
        self.assertEqual((p.title, p.trip), ('B', None))
        self.assertEqual(self.client.delete(f'/api/v1/owner/promotions/{p.id}/').status_code, 200)

    def test_theme_switch_from_owner(self):
        self.client.force_login(self.staff)
        r = self.post('/api/v1/owner/promotions/theme/', {'theme': 'NEWYEAR', 'banner_text': 'Flat 15% off'})
        self.assertEqual(r.status_code, 200, r.content)
        theme = self.client.get('/api/v1/promotions/').json()['data']['theme']
        self.assertEqual(theme['active'], 'NEWYEAR')
        self.assertEqual(theme['banner_text'], 'Flat 15% off')

    def test_auto_theme_follows_calendar(self):
        s = SiteTheme(theme='AUTO')
        self.assertEqual(active_theme(s, datetime.date(2026, 12, 20)), 'CHRISTMAS')
        self.assertEqual(active_theme(s, datetime.date(2026, 12, 31)), 'NEWYEAR')
        self.assertEqual(active_theme(s, datetime.date(2027, 1, 3)), 'NEWYEAR')
        self.assertEqual(active_theme(s, datetime.date(2027, 2, 1)), 'NONE')

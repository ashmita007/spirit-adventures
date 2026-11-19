import json

from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.test import TestCase

from adventures.models import Destination, SiteContent, Trip


class SiteContentApiTests(TestCase):
    URL = '/api/v1/owner/site-content/'

    def setUp(self):
        cache.clear()
        self.staff = get_user_model().objects.create_user('o@example.com', 'pw-123456', is_staff=True)
        dest = Destination.objects.create(name='Karnataka', slug='karnataka')
        self.trip = Trip.objects.create(destination=dest, title='Gokarna', slug='gokarna', short_description='x',
                                        full_description='x', price=4999, cover_image='https://example.com/c.jpg')

    def post(self, body):
        return self.client.post(self.URL, json.dumps(body), content_type='application/json')

    def test_public_defaults_are_empty(self):
        data = self.client.get('/api/v1/site/content/').json()['data']
        self.assertEqual(data['instagram_url'], '')
        self.assertEqual(data['hero_words'], [])
        self.assertEqual(data['hidden_sections'], [])

    def test_owner_saves_and_public_sees_it_immediately(self):
        self.client.get('/api/v1/site/content/')  # warm the cache
        self.client.force_login(self.staff)
        r = self.post({
            'instagram_url': 'https://www.instagram.com/spirit/', 'youtube_url': 'https://youtube.com/@spirit',
            'hero_words': [' Trek ', '', 'Beach'], 'home_trip_ids': [self.trip.id, 9999, self.trip.id],
            'hero_videos': [{'video_url': 'https://res.cloudinary.com/x/video/upload/a.mp4', 'poster_url': ''}],
            'hidden_sections': ['quote', 'maps'],
        })
        self.assertEqual(r.status_code, 200, r.content)
        self.client.logout()
        data = self.client.get('/api/v1/site/content/').json()['data']
        self.assertEqual(data['instagram_url'], 'https://www.instagram.com/spirit/')
        self.assertEqual(data['hero_words'], ['Trek', 'Beach'])
        self.assertEqual(data['home_trip_ids'], [self.trip.id])
        self.assertEqual(data['hidden_sections'], ['quote', 'maps'])
        self.assertEqual(len(data['hero_videos']), 1)

    def test_rejects_wrong_social_host_and_plain_http(self):
        self.client.force_login(self.staff)
        self.assertEqual(self.post({'instagram_url': 'https://evil.example/instagram.com'}).status_code, 400)
        self.assertEqual(self.post({'youtube_url': 'http://youtube.com/@x'}).status_code, 400)
        self.assertEqual(self.post({'cta_image_url': 'javascript:alert(1)'}).status_code, 400)
        self.assertEqual(self.post({'hidden_sections': ['nope']}).status_code, 400)
        self.assertEqual(SiteContent.current().instagram_url, '')

    def test_owner_endpoints_need_staff(self):
        self.assertIn(self.client.get(self.URL).status_code, (401, 403))
        self.assertIn(self.post({'hero_subtitle': 'x'}).status_code, (401, 403))

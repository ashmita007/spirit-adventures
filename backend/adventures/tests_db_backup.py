import base64
import json
import os
import sqlite3
import tempfile
from unittest import mock

from django.test import SimpleTestCase

import github_db_backup as gb


class FakeGitHub:
    """Keeps blobs, commits and one branch in memory, like the GitHub git data API."""

    def __init__(self):
        self.objects, self.ref, self.n = {}, None, 0

    def _id(self, obj):
        self.n += 1
        sha = f'sha{self.n}'
        self.objects[sha] = obj
        return sha

    def __call__(self, method, path, body=None, accept='', ok=(200, 201)):
        if method == 'POST' and path.endswith('/git/blobs'):
            return 201, {'sha': self._id(base64.b64decode(body['content']))}
        if method == 'POST' and path.endswith('/git/trees'):
            return 201, {'sha': self._id({e['path']: e['sha'] for e in body['tree']})}
        if method == 'POST' and path.endswith('/git/commits'):
            assert body['parents'] == []
            return 201, {'sha': self._id(body['tree'])}
        if method == 'GET' and '/git/ref/' in path:
            return (200, {}) if self.ref else (404, None)
        if method in ('POST', 'PATCH') and '/git/refs' in path:
            self.ref = body['sha']
            return 200, {}
        if method == 'GET' and '/contents/' in path:
            if not self.ref:
                return 404, None
            name = path.split('/contents/')[1].split('?')[0]
            tree = self.objects[self.objects[self.ref]]
            return 200, self.objects[tree[name]]
        raise AssertionError(f'unexpected {method} {path}')


ENV = {'GITHUB_BACKUP_TOKEN': 't', 'GITHUB_BACKUP_REPO': 'me/backups',
       'GITHUB_BACKUP_BRANCH': 'app', 'RENDER_GIT_COMMIT': 'build1'}


def make_db(path, value):
    conn = sqlite3.connect(path)
    conn.execute('CREATE TABLE IF NOT EXISTS t (v TEXT)')
    conn.execute('DELETE FROM t')
    conn.execute('INSERT INTO t VALUES (?)', (value,))
    conn.commit()
    conn.close()


def read_db(path):
    conn = sqlite3.connect(path)
    try:
        return conn.execute('SELECT v FROM t').fetchone()[0]
    finally:
        conn.close()


@mock.patch.dict(os.environ, ENV)
class GitHubDbBackupTests(SimpleTestCase):
    def setUp(self):
        self.dir = tempfile.TemporaryDirectory()
        self.db = os.path.join(self.dir.name, 'db.sqlite3')
        self.gh = FakeGitHub()
        patcher = mock.patch.object(gb, '_request', self.gh)
        patcher.start()
        self.addCleanup(patcher.stop)
        self.addCleanup(self.dir.cleanup)

    def test_restart_gets_back_the_saved_database(self):
        make_db(self.db, 'live group made after deploy')
        self.assertTrue(gb.push(self.db))
        # Render restart: disk goes back to the build copy, without the state file.
        make_db(self.db, 'build copy')
        os.unlink(self.db + '.backup-state.json')
        meta = gb.restore(self.db)
        self.assertEqual(meta['build'], 'build1')
        self.assertEqual(read_db(self.db), 'live group made after deploy')

    def test_current_database_is_left_alone(self):
        make_db(self.db, 'v1')
        gb.push(self.db)
        self.assertIsNone(gb.restore(self.db))
        self.assertEqual(read_db(self.db), 'v1')

    def test_unchanged_database_is_not_saved_twice(self):
        make_db(self.db, 'v1')
        self.assertTrue(gb.push(self.db))
        self.assertFalse(gb.push(self.db))

    def test_branch_keeps_a_single_commit(self):
        make_db(self.db, 'v1')
        gb.push(self.db)
        make_db(self.db, 'v2')
        gb.push(self.db)
        meta = json.loads(self.gh('GET', '/contents/meta.json?ref=app')[1])
        self.assertEqual(meta['sha256'], gb.snapshot(self.db)[1])

    def test_nothing_saved_yet(self):
        make_db(self.db, 'build copy')
        self.assertIsNone(gb.restore(self.db))
        self.assertEqual(read_db(self.db), 'build copy')

    def test_corrupt_download_is_rejected(self):
        make_db(self.db, 'v1')
        gb.push(self.db)
        os.unlink(self.db + '.backup-state.json')
        with mock.patch.object(gb, '_download_db', return_value=__import__('gzip').compress(b'not sqlite')):
            with self.assertRaises(gb.BackupError):
                gb.restore(self.db)
        self.assertEqual(read_db(self.db), 'v1')

    @mock.patch.dict(os.environ, {'GITHUB_BACKUP_TOKEN': ''})
    def test_off_without_settings(self):
        make_db(self.db, 'v1')
        self.assertFalse(gb.push(self.db))
        self.assertIsNone(gb.restore(self.db))

import unittest

from app import app
from config import NAV_LINKS


class TestNavLinks(unittest.TestCase):
    def test_nav_links_are_valid_flask_endpoints(self):
        with app.test_request_context():
            for _, endpoint in NAV_LINKS:
                with self.subTest(endpoint=endpoint):
                    self.assertIn(endpoint, app.view_functions)
                    self.assertIsNotNone(app.view_functions[endpoint])


if __name__ == "__main__":
    unittest.main()

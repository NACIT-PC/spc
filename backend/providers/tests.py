from django.test import TestCase
from rest_framework.test import APIClient

from .models import CategoryModel, ProviderModel


def make_provider(name, category, city="Blantyre", description="Sample", phone="265000000000"):
    return ProviderModel.objects.create(
        name=name, category=category, city=city, description=description,
        price_range="Indicative range: mid", phone=phone, whatsapp=phone,
    )


class ProviderApiTests(TestCase):
    # ponytail: one class covering FR-01..FR-04 + FR-07 + FR-09; add more when logic grows
    def setUp(self):
        self.client = APIClient()
        self.catering = CategoryModel.objects.create(name="Catering")
        self.decor = CategoryModel.objects.create(name="Decor")
        make_provider("Sample Bites", self.catering, city="Lilongwe", description="wedding catering", phone="265000000011")
        self.p1 = make_provider("Example Decor", self.decor, city="Blantyre", description="wedding decor", phone="265000000012")
        make_provider("Other Decor", self.decor, city="Zomba", description="party decor", phone="265000000013")

    def test_health(self):
        self.assertEqual(self.client.get("/api/health/").status_code, 200)

    def test_list_and_nested_category(self):
        res = self.client.get("/api/providers/")
        self.assertEqual(res.status_code, 200)
        rows = res.json()["results"]
        self.assertEqual(len(rows), 3)
        self.assertEqual(rows[0]["name"], "Example Decor")  # ordered by name
        self.assertEqual(rows[0]["category"]["name"], "Decor")

    def test_filter_category_city_search_and_detail(self):
        self.assertEqual(len(self.client.get("/api/providers/", {"category": "Decor"}).json()["results"]), 2)
        self.assertEqual(len(self.client.get("/api/providers/", {"city": "Blantyre"}).json()["results"]), 1)
        self.assertEqual(len(self.client.get("/api/providers/", {"q": "wedding"}).json()["results"]), 2)
        res = self.client.get(f"/api/providers/{self.p1.pk}/")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["name"], "Example Decor")

    def test_categories_list(self):
        res = self.client.get("/api/categories/")
        self.assertEqual(res.status_code, 200)
        self.assertEqual([c["name"] for c in res.json()["results"]], ["Catering", "Decor"])


class AuthWriteTests(TestCase):
    # ponytail: minimal auth/write coverage; add owner-rules tests when ownership lands
    def setUp(self):
        self.client = APIClient()
        self.cat = CategoryModel.objects.create(name="Decor")

    def payload(self, **kw):
        base = {"name": "New Decor", "category_id": str(self.cat.pk), "city": "Blantyre",
                "description": "fresh", "price_range": "mid",
                "phone": "265000000099", "whatsapp": "265000000099"}
        base.update(kw)
        return base

    def test_anon_write_rejected_and_authed_write_allowed(self):
        self.assertEqual(self.client.post("/api/providers/", self.payload()).status_code, 401)
        self.assertEqual(self.client.post(
            "/api/auth/register/", {"username": "demo", "password": "demo-pass-1"}).status_code, 201)
        token = self.client.post(
            "/api/auth/token/", {"username": "demo", "password": "demo-pass-1"}).json()["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        res = self.client.post("/api/providers/", self.payload())
        self.assertEqual(res.status_code, 201)
        # verified flag is not user-settable
        self.assertFalse(res.json()["is_verified"])
        pk = res.json()["id"]
        res = self.client.patch(f"/api/providers/{pk}/", {"is_verified": True, "city": "Lilongwe"})
        self.assertEqual(res.status_code, 200)
        self.assertFalse(res.json()["is_verified"])
        self.assertEqual(res.json()["city"], "Lilongwe")


class StaffVerifyTests(TestCase):
    # ponytail: minimal staff gating coverage; add unverify/audit when moderation lands
    def setUp(self):
        from django.contrib.auth.models import User
        self.client = APIClient()
        cat = CategoryModel.objects.create(name="Decor")
        self.provider = make_provider("Example Decor", cat, phone="265000000021")
        self.staff = User.objects.create_user("staff", password="staff-pass-1", is_staff=True)
        self.user = User.objects.create_user("plain", password="plain-pass-1")

    def token(self, username, password):
        return self.client.post(
            "/api/auth/token/", {"username": username, "password": password}).json()["access"]

    def test_me_reports_staff_flag(self):
        self.assertEqual(self.client.get("/api/auth/me/").status_code, 401)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token('plain', 'plain-pass-1')}")
        self.assertEqual(self.client.get("/api/auth/me/").json(),
                         {"username": "plain", "is_staff": False})
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token('staff', 'staff-pass-1')}")
        self.assertTrue(self.client.get("/api/auth/me/").json()["is_staff"])

    def test_only_staff_can_verify(self):
        url = f"/api/providers/{self.provider.pk}/verify/"
        self.assertIn(self.client.post(url).status_code, (401, 403))
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token('plain', 'plain-pass-1')}")
        self.assertEqual(self.client.post(url).status_code, 403)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token('staff', 'staff-pass-1')}")
        res = self.client.post(url)
        self.assertEqual(res.status_code, 200)
        self.assertTrue(res.json()["is_verified"])

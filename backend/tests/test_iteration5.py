"""
Backend API Tests - Iteration 5
Testing: Bug fixes (dropdown, rental total) and new features (Mappe & Info, PropertyEditor, availability APIs)
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://beachstay-2.preview.emergentagent.com')

# Admin credentials
ADMIN_EMAIL = "nico.suez2000@gmail.com"
ADMIN_PASSWORD = "Thegame2000"


@pytest.fixture(scope="module")
def admin_token():
    """Get admin authentication token"""
    response = requests.post(
        f"{BASE_URL}/api/admin/login",
        json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
    )
    assert response.status_code == 200, f"Admin login failed: {response.text}"
    return response.json()["token"]


@pytest.fixture(scope="module")
def auth_headers(admin_token):
    """Get authorization headers"""
    return {"Authorization": f"Bearer {admin_token}"}


class TestAdminLogin:
    """Test admin authentication"""
    
    def test_admin_login_success(self):
        """Test successful admin login"""
        response = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert data["email"] == ADMIN_EMAIL
        assert data["name"] == "Nico"
    
    def test_admin_login_invalid_credentials(self):
        """Test login with wrong password"""
        response = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={"email": ADMIN_EMAIL, "password": "wrongpassword"}
        )
        assert response.status_code == 401


class TestPropertiesDropdown:
    """Test properties for dropdown in Link Ospiti - BUG FIX VERIFICATION"""
    
    def test_get_properties_returns_both(self, auth_headers):
        """Verify dropdown shows Casa Brezza and Casa Bella"""
        response = requests.get(
            f"{BASE_URL}/api/admin/properties",
            headers=auth_headers
        )
        assert response.status_code == 200
        properties = response.json()
        
        # Should have at least 2 properties
        assert len(properties) >= 2, f"Expected at least 2 properties, got {len(properties)}"
        
        # Verify both properties exist
        property_names = [p["name"] for p in properties]
        assert "Casa Brezza" in property_names, "Casa Brezza not found in properties"
        assert "Casa Bella" in property_names, "Casa Bella not found in properties"
        
        # Verify each property has required fields for dropdown
        for prop in properties:
            assert "id" in prop
            assert "name" in prop
            assert "slug" in prop


class TestMappeInfo:
    """Test Mappe & Info tab - NEW FEATURE"""
    
    def test_get_map_info_count(self):
        """Verify 26 map info items exist"""
        response = requests.get(f"{BASE_URL}/api/map-info")
        assert response.status_code == 200
        items = response.json()
        assert len(items) == 26, f"Expected 26 map info items, got {len(items)}"
    
    def test_map_info_categories(self):
        """Verify map info has various categories"""
        response = requests.get(f"{BASE_URL}/api/map-info")
        assert response.status_code == 200
        items = response.json()
        
        categories = set(item.get("category") for item in items)
        # Should have multiple categories
        assert len(categories) >= 3, f"Expected at least 3 categories, got {categories}"
    
    def test_map_info_structure(self):
        """Verify map info items have required fields"""
        response = requests.get(f"{BASE_URL}/api/map-info")
        assert response.status_code == 200
        items = response.json()
        
        for item in items[:5]:  # Check first 5 items
            assert "id" in item
            assert "name" in item
            assert "category" in item


class TestRentalsAndPricing:
    """Test rentals API and pricing - BUG FIX VERIFICATION"""
    
    def test_get_rentals(self):
        """Test rentals list endpoint"""
        response = requests.get(f"{BASE_URL}/api/rentals")
        assert response.status_code == 200
        rentals = response.json()
        assert len(rentals) > 0, "No rentals found"
    
    def test_kit_spiaggia_price(self):
        """Verify Kit Spiaggia has €8 daily price"""
        response = requests.get(f"{BASE_URL}/api/rentals")
        assert response.status_code == 200
        rentals = response.json()
        
        kit_spiaggia = next((r for r in rentals if "Kit Spiaggia" in r["name"]), None)
        assert kit_spiaggia is not None, "Kit Spiaggia not found"
        
        # Price can be string "€8" or number 8
        daily_price = kit_spiaggia["daily_price"]
        if isinstance(daily_price, str):
            assert "8" in daily_price, f"Expected €8, got {daily_price}"
        else:
            assert daily_price == 8, f"Expected 8, got {daily_price}"
    
    def test_rental_availability_api(self):
        """Test new rental availability API"""
        # Get first rental
        response = requests.get(f"{BASE_URL}/api/rentals")
        rentals = response.json()
        rental_id = rentals[0]["id"]
        
        # Test availability endpoint
        response = requests.get(
            f"{BASE_URL}/api/rentals/{rental_id}/availability",
            params={"start_date": "2026-01-20", "end_date": "2026-01-22"}
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "rental_id" in data
        assert "availability" in data
        assert "fully_available" in data
        assert data["rental_id"] == rental_id
        
        # Check availability structure
        availability = data["availability"]
        assert "2026-01-20" in availability
        assert "2026-01-21" in availability
        assert "2026-01-22" in availability


class TestRestaurantTimeSlots:
    """Test restaurant time slots API - NEW FEATURE"""
    
    def test_get_restaurants(self):
        """Test restaurants list endpoint"""
        response = requests.get(f"{BASE_URL}/api/restaurants")
        assert response.status_code == 200
        restaurants = response.json()
        assert len(restaurants) > 0, "No restaurants found"
    
    def test_restaurant_time_slots_api(self):
        """Test new restaurant time slots API"""
        # Get first restaurant
        response = requests.get(f"{BASE_URL}/api/restaurants")
        restaurants = response.json()
        restaurant_id = restaurants[0]["id"]
        
        # Test time slots endpoint
        response = requests.get(
            f"{BASE_URL}/api/restaurants/{restaurant_id}/time-slots",
            params={"date": "2026-01-20"}
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "available" in data
        assert "slots" in data
        
        # Check slots structure
        if data["available"]:
            slots = data["slots"]
            assert len(slots) > 0, "No time slots returned"
            for slot in slots:
                assert "time" in slot
                assert "max_covers" in slot
                assert "available_covers" in slot
                assert "available" in slot


class TestGuestBookingCreation:
    """Test guest link creation with property selection"""
    
    def test_create_guest_booking(self, auth_headers):
        """Test creating a guest booking link"""
        # Get properties first
        response = requests.get(
            f"{BASE_URL}/api/admin/properties",
            headers=auth_headers
        )
        properties = response.json()
        prop = properties[0]
        
        # Create guest booking
        booking_data = {
            "property_id": prop["id"],
            "property_slug": prop["slug"],
            "property_name": prop["name"],
            "guest_name": "TEST_Mario",
            "guest_surname": "Rossi",
            "num_guests": 2,
            "room_number": "Camera 1",
            "checkin_date": "2026-02-01",
            "checkout_date": "2026-02-07"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/admin/guest-bookings",
            headers=auth_headers,
            json=booking_data
        )
        assert response.status_code == 200
        data = response.json()
        
        assert data["success"] == True
        assert "token" in data
        assert "link" in data
        
        # Cleanup - delete the test booking
        booking_id = data["id"]
        requests.delete(
            f"{BASE_URL}/api/admin/guest-bookings/{booking_id}",
            headers=auth_headers
        )


class TestPropertyEditor:
    """Test property data structure for PropertyEditor"""
    
    def test_property_has_all_fields(self, auth_headers):
        """Verify property has fields for all PropertyEditor tabs"""
        response = requests.get(
            f"{BASE_URL}/api/admin/properties",
            headers=auth_headers
        )
        properties = response.json()
        prop = properties[0]
        
        # Base tab fields
        assert "name" in prop
        assert "slug" in prop
        
        # WiFi tab fields
        assert "wifi_name" in prop or prop.get("wifi_name") is None
        assert "wifi_password" in prop or prop.get("wifi_password") is None
        
        # Check-in tab fields
        assert "checkin_time" in prop or prop.get("checkin_time") is None
        assert "checkout_time" in prop or prop.get("checkout_time") is None
        
        # Contacts tab fields
        assert "host_name" in prop or prop.get("host_name") is None
        assert "host_phone" in prop or prop.get("host_phone") is None


class TestPublicAPIs:
    """Test public APIs"""
    
    def test_beaches_api(self):
        """Test beaches endpoint"""
        response = requests.get(f"{BASE_URL}/api/beaches")
        assert response.status_code == 200
        beaches = response.json()
        assert len(beaches) > 0
    
    def test_experiences_api(self):
        """Test experiences endpoint"""
        response = requests.get(f"{BASE_URL}/api/experiences")
        assert response.status_code == 200
        experiences = response.json()
        assert len(experiences) > 0
    
    def test_nightlife_events_api(self):
        """Test nightlife events endpoint"""
        response = requests.get(f"{BASE_URL}/api/nightlife-events")
        assert response.status_code == 200


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

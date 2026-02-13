"""
Backend API Tests for Torre Lapillo Guest Portal
Tests: Admin login, CRUD operations, booking forms, guest links
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://property-portal-app.preview.emergentagent.com')

# Admin credentials
ADMIN_EMAIL = "nico.suez2000@gmail.com"
ADMIN_PASSWORD = "Thegame2000"


class TestHealthAndPublicEndpoints:
    """Test public API endpoints"""
    
    def test_api_root(self):
        """Test API root endpoint"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        print(f"✓ API Root: {data['message']}")
    
    def test_weather_api(self):
        """Test weather API"""
        response = requests.get(f"{BASE_URL}/api/weather")
        assert response.status_code == 200
        data = response.json()
        assert "temperature" in data
        assert "icon" in data
        print(f"✓ Weather: {data['temperature']}°C, {data.get('description', 'N/A')}")
    
    def test_beaches_list(self):
        """Test beaches list endpoint"""
        response = requests.get(f"{BASE_URL}/api/beaches")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        print(f"✓ Beaches: {len(data)} items")
    
    def test_restaurants_list(self):
        """Test restaurants list endpoint"""
        response = requests.get(f"{BASE_URL}/api/restaurants")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Restaurants: {len(data)} items")
    
    def test_experiences_list(self):
        """Test experiences list endpoint"""
        response = requests.get(f"{BASE_URL}/api/experiences")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Experiences: {len(data)} items")
    
    def test_rentals_list(self):
        """Test rentals list endpoint"""
        response = requests.get(f"{BASE_URL}/api/rentals")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        print(f"✓ Rentals: {len(data)} items")
    
    def test_nightlife_events(self):
        """Test nightlife events endpoint"""
        response = requests.get(f"{BASE_URL}/api/nightlife-events")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Nightlife Events: {len(data)} items")
    
    def test_map_info(self):
        """Test map info endpoint"""
        response = requests.get(f"{BASE_URL}/api/map-info")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Map Info: {len(data)} items")
    
    def test_transports(self):
        """Test transports endpoint"""
        response = requests.get(f"{BASE_URL}/api/transports")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Transports: {len(data)} items")
    
    def test_troubleshooting(self):
        """Test troubleshooting endpoint"""
        response = requests.get(f"{BASE_URL}/api/troubleshooting")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        print(f"✓ Troubleshooting: {len(data)} items")
    
    def test_property_by_slug(self):
        """Test property by slug endpoint"""
        response = requests.get(f"{BASE_URL}/api/properties/casa-brezza")
        assert response.status_code == 200
        data = response.json()
        assert data["slug"] == "casa-brezza"
        assert "wifi_name" in data
        assert "faq" in data
        print(f"✓ Property: {data['name']}")


class TestAdminAuth:
    """Test admin authentication"""
    
    def test_admin_login_success(self):
        """Test admin login with correct credentials"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert data["email"] == ADMIN_EMAIL
        assert data["name"] == "Nico"
        print(f"✓ Admin Login: {data['email']}")
        return data["token"]
    
    def test_admin_login_invalid_credentials(self):
        """Test admin login with wrong credentials"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "email": "wrong@email.com",
            "password": "wrongpassword"
        })
        assert response.status_code == 401
        print("✓ Invalid credentials rejected")
    
    def test_admin_me_endpoint(self):
        """Test admin /me endpoint with valid token"""
        # First login
        login_response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        token = login_response.json()["token"]
        
        # Then get /me
        response = requests.get(f"{BASE_URL}/api/admin/me", headers={
            "Authorization": f"Bearer {token}"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == ADMIN_EMAIL
        print(f"✓ Admin Me: {data['email']}")


class TestBookingForms:
    """Test booking form submissions"""
    
    def test_rental_booking_submission(self):
        """Test rental booking form submission"""
        # Get a rental first
        rentals_response = requests.get(f"{BASE_URL}/api/rentals")
        rentals = rentals_response.json()
        rental = rentals[0]
        
        booking_data = {
            "rental_id": rental["id"],
            "rental_name": rental["name"],
            "guest_name": "TEST_Mario",
            "guest_surname": "Rossi",
            "guest_phone": "+39 333 1234567",
            "start_date": "2025-02-01",
            "end_date": "2025-02-03",
            "duration_type": "giornaliero",
            "delivery": True,
            "pickup": False,
            "total_price": "€30",
            "notes": "Test booking"
        }
        
        response = requests.post(f"{BASE_URL}/api/rental-bookings", json=booking_data)
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "booking_id" in data
        print(f"✓ Rental Booking: {data['booking_id']}")
    
    def test_support_ticket_submission(self):
        """Test support ticket form submission"""
        ticket_data = {
            "property_slug": "casa-brezza",
            "description": "TEST - Il condizionatore non funziona",
            "urgency": "medio",
            "contact_preference": "whatsapp",
            "guest_name": "TEST_Guest",
            "guest_phone": "+39 333 9876543"
        }
        
        response = requests.post(f"{BASE_URL}/api/support-tickets", json=ticket_data)
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "ticket_number" in data
        print(f"✓ Support Ticket: {data['ticket_number']}")
    
    def test_restaurant_booking_submission(self):
        """Test restaurant booking form submission"""
        # Get a restaurant first
        restaurants_response = requests.get(f"{BASE_URL}/api/restaurants")
        restaurants = restaurants_response.json()
        restaurant = restaurants[0]
        
        booking_data = {
            "restaurant_id": restaurant["id"],
            "restaurant_name": restaurant["name"],
            "guest_name": "TEST_Luigi",
            "guest_surname": "Verdi",
            "guest_phone": "+39 333 5555555",
            "date": "2025-02-05",
            "time": "20:00",
            "num_people": 4,
            "notes": "Tavolo esterno se possibile"
        }
        
        response = requests.post(f"{BASE_URL}/api/restaurant-bookings", json=booking_data)
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        print(f"✓ Restaurant Booking: {data['booking_id']}")
    
    def test_experience_booking_submission(self):
        """Test experience booking form submission"""
        # Get an experience first
        experiences_response = requests.get(f"{BASE_URL}/api/experiences")
        experiences = experiences_response.json()
        experience = experiences[0]
        
        booking_data = {
            "experience_id": experience["id"],
            "experience_name": experience["name"],
            "guest_name": "TEST_Anna",
            "guest_surname": "Bianchi",
            "guest_phone": "+39 333 6666666",
            "date": "2025-02-10",
            "time": "09:00",
            "num_people": 2,
            "notes": "Prima esperienza"
        }
        
        response = requests.post(f"{BASE_URL}/api/experience-bookings", json=booking_data)
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        print(f"✓ Experience Booking: {data['booking_id']}")


class TestGuestLinks:
    """Test guest booking links (unique tokens)"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin token"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        return response.json()["token"]
    
    def test_create_guest_link(self, admin_token):
        """Test creating a guest booking link"""
        # Get property first
        prop_response = requests.get(f"{BASE_URL}/api/properties/casa-brezza")
        prop = prop_response.json()
        
        booking_data = {
            "property_id": prop["id"],
            "property_slug": prop["slug"],
            "property_name": prop["name"],
            "guest_name": "TEST_Marco",
            "guest_surname": "Neri",
            "num_guests": 2,
            "room_number": "Camera 1",
            "checkin_date": "2025-02-01",
            "checkout_date": "2025-02-07"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/admin/guest-bookings",
            json=booking_data,
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "token" in data
        assert "link" in data
        print(f"✓ Guest Link Created: {data['link']}")
        return data["token"]
    
    def test_validate_guest_token(self, admin_token):
        """Test validating a guest token"""
        # First create a guest booking
        prop_response = requests.get(f"{BASE_URL}/api/properties/casa-brezza")
        prop = prop_response.json()
        
        booking_data = {
            "property_id": prop["id"],
            "property_slug": prop["slug"],
            "property_name": prop["name"],
            "guest_name": "TEST_Validate",
            "guest_surname": "Token",
            "num_guests": 1,
            "checkin_date": "2025-01-01",
            "checkout_date": "2025-12-31"
        }
        
        create_response = requests.post(
            f"{BASE_URL}/api/admin/guest-bookings",
            json=booking_data,
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        token = create_response.json()["token"]
        
        # Now validate the token
        validate_response = requests.get(f"{BASE_URL}/api/booking/{token}")
        assert validate_response.status_code == 200
        data = validate_response.json()
        assert data["valid"] == True
        assert "booking" in data
        print(f"✓ Token Validated: {data['message']}")
    
    def test_invalid_token(self):
        """Test invalid guest token"""
        response = requests.get(f"{BASE_URL}/api/booking/invalid-token-12345")
        assert response.status_code == 404
        print("✓ Invalid token rejected")


class TestAdminDashboard:
    """Test admin dashboard endpoints"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin token"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        return response.json()["token"]
    
    def test_get_all_requests(self, admin_token):
        """Test getting all requests from admin dashboard"""
        response = requests.get(
            f"{BASE_URL}/api/admin/all-requests",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "rental_bookings" in data
        assert "support_tickets" in data
        assert "restaurant_bookings" in data
        print(f"✓ All Requests: rental={len(data['rental_bookings'])}, tickets={len(data['support_tickets'])}")
    
    def test_get_guest_bookings(self, admin_token):
        """Test getting guest bookings list"""
        response = requests.get(
            f"{BASE_URL}/api/admin/guest-bookings",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Guest Bookings: {len(data)} items")
    
    def test_get_properties(self, admin_token):
        """Test getting properties list"""
        response = requests.get(
            f"{BASE_URL}/api/admin/properties",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Properties: {len(data)} items")


class TestAdminCRUD:
    """Test admin CRUD operations"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin token"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        return response.json()["token"]
    
    def test_create_beach(self, admin_token):
        """Test creating a beach"""
        beach_data = {
            "name": "TEST_Spiaggia Test",
            "description": "Test beach description",
            "distance": "1km",
            "category": "libera",
            "map_url": "https://maps.google.com",
            "image_url": "https://example.com/image.jpg",
            "is_recommended": False,
            "parking_info": "Test parking",
            "best_time": "Morning",
            "tips": "Test tips",
            "has_sunbeds": False
        }
        
        response = requests.post(
            f"{BASE_URL}/api/admin/beaches",
            json=beach_data,
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "id" in data
        print(f"✓ Beach Created: {data['id']}")
        return data["id"]
    
    def test_create_restaurant(self, admin_token):
        """Test creating a restaurant"""
        restaurant_data = {
            "name": "TEST_Ristorante Test",
            "description": "Test restaurant",
            "category": "pesce",
            "phone": "+39 123 456789",
            "map_url": "https://maps.google.com",
            "image_url": "https://example.com/image.jpg",
            "is_recommended": False,
            "price_range": "€€",
            "hours": "12:00-23:00"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/admin/restaurants",
            json=restaurant_data,
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        print(f"✓ Restaurant Created: {data['id']}")
    
    def test_create_experience(self, admin_token):
        """Test creating an experience"""
        experience_data = {
            "name": "TEST_Esperienza Test",
            "description": "Test experience",
            "category": "barca",
            "price_info": "€50/persona",
            "contact_phone": "+39 123 456789",
            "image_url": "https://example.com/image.jpg",
            "is_top": False,
            "duration": "3 ore"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/admin/experiences",
            json=experience_data,
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        print(f"✓ Experience Created: {data['id']}")
    
    def test_create_rental(self, admin_token):
        """Test creating a rental"""
        rental_data = {
            "name": "TEST_Noleggio Test",
            "description": "Test rental",
            "daily_price": 15,
            "weekly_price": 80,
            "rules": "Test rules",
            "image_url": "https://example.com/image.jpg",
            "category": "mare"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/admin/rentals",
            json=rental_data,
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        print(f"✓ Rental Created: {data['id']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

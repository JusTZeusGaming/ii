"""
Test new features for Torre Lapillo Guest Portal - Iteration 4
Features tested:
- Property persistence with ?struttura= parameter
- Weather detailed API endpoint
- Nightlife events API
- Nightlife bookings API
- Admin QR code functionality (frontend only)
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestWeatherAPI:
    """Test weather endpoints including new detailed weather"""
    
    def test_basic_weather(self):
        """Test basic weather endpoint"""
        response = requests.get(f"{BASE_URL}/api/weather")
        assert response.status_code == 200
        data = response.json()
        assert "temperature" in data
        print(f"✓ Basic weather: {data.get('temperature')}°C")
    
    def test_detailed_weather(self):
        """Test new detailed weather endpoint with hourly and daily forecasts"""
        response = requests.get(f"{BASE_URL}/api/weather/detailed")
        assert response.status_code == 200
        data = response.json()
        
        # Check current weather
        assert "current" in data
        current = data["current"]
        assert "temperature" in current
        assert "humidity" in current
        assert "weather_code" in current
        assert "wind_speed" in current
        print(f"✓ Current weather: {current.get('temperature')}°C, humidity: {current.get('humidity')}%")
        
        # Check hourly forecast
        assert "hourly" in data
        hourly = data["hourly"]
        assert isinstance(hourly, list)
        if len(hourly) > 0:
            assert "time" in hourly[0]
            assert "temperature" in hourly[0]
            print(f"✓ Hourly forecast: {len(hourly)} hours available")
        
        # Check daily forecast
        assert "daily" in data
        daily = data["daily"]
        assert isinstance(daily, list)
        if len(daily) > 0:
            assert "date" in daily[0]
            assert "temp_max" in daily[0]
            assert "temp_min" in daily[0]
            print(f"✓ Daily forecast: {len(daily)} days available")


class TestNightlifeAPI:
    """Test nightlife events and bookings endpoints"""
    
    def test_get_nightlife_events(self):
        """Test getting all nightlife events"""
        response = requests.get(f"{BASE_URL}/api/nightlife-events")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Nightlife events: {len(data)} events found")
        
        if len(data) > 0:
            event = data[0]
            assert "id" in event
            assert "name" in event
            assert "venue" in event
            assert "date" in event
            assert "price_entry" in event
            assert "price_with_transport" in event
            print(f"  First event: {event.get('name')} at {event.get('venue')}")
            return event
        return None
    
    def test_get_single_nightlife_event(self):
        """Test getting a single nightlife event by ID"""
        # First get all events
        response = requests.get(f"{BASE_URL}/api/nightlife-events")
        events = response.json()
        
        if len(events) > 0:
            event_id = events[0]["id"]
            response = requests.get(f"{BASE_URL}/api/nightlife-events/{event_id}")
            assert response.status_code == 200
            event = response.json()
            assert event["id"] == event_id
            print(f"✓ Single event fetch: {event.get('name')}")
    
    def test_create_nightlife_booking(self):
        """Test creating a nightlife booking"""
        # First get an event
        response = requests.get(f"{BASE_URL}/api/nightlife-events")
        events = response.json()
        
        if len(events) > 0:
            event = events[0]
            booking_data = {
                "event_id": event["id"],
                "event_name": event["name"],
                "guest_name": "TEST_Mario",
                "guest_phone": "+39 333 1234567",
                "package": "entry_transport",
                "num_people": 2,
                "pickup_point": "Torre Lapillo centro",
                "notes": "Test booking"
            }
            
            response = requests.post(f"{BASE_URL}/api/nightlife-bookings", json=booking_data)
            assert response.status_code == 200
            data = response.json()
            assert data["success"] == True
            assert "booking_id" in data
            print(f"✓ Nightlife booking created: {data.get('booking_id')}")


class TestPropertyAPI:
    """Test property endpoints for persistence feature"""
    
    def test_get_property_by_slug(self):
        """Test getting property by slug"""
        response = requests.get(f"{BASE_URL}/api/properties/casa-brezza")
        assert response.status_code == 200
        data = response.json()
        assert data["slug"] == "casa-brezza"
        assert "name" in data
        print(f"✓ Property fetch: {data.get('name')} (slug: {data.get('slug')})")
    
    def test_get_nonexistent_property(self):
        """Test getting a property that doesn't exist"""
        response = requests.get(f"{BASE_URL}/api/properties/nonexistent-property")
        assert response.status_code == 404
        print("✓ Nonexistent property returns 404")
    
    def test_get_property_casa_bella(self):
        """Test getting casa-bella property if it exists"""
        response = requests.get(f"{BASE_URL}/api/properties/casa-bella")
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Casa Bella exists: {data.get('name')}")
        else:
            print(f"⚠ Casa Bella not found (status: {response.status_code})")


class TestAdminAPI:
    """Test admin endpoints including property management"""
    
    @pytest.fixture
    def auth_token(self):
        """Get admin authentication token"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "email": "nico.suez2000@gmail.com",
            "password": "Thegame2000"
        })
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Admin authentication failed")
    
    def test_admin_login(self):
        """Test admin login with correct credentials"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "email": "nico.suez2000@gmail.com",
            "password": "Thegame2000"
        })
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert data["email"] == "nico.suez2000@gmail.com"
        print(f"✓ Admin login successful: {data.get('name')}")
        return data["token"]
    
    def test_admin_get_properties(self, auth_token):
        """Test getting all properties as admin"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/admin/properties", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Admin properties: {len(data)} properties found")
        for prop in data:
            print(f"  - {prop.get('name')} (slug: {prop.get('slug')})")
    
    def test_admin_get_all_requests(self, auth_token):
        """Test getting all requests including nightlife bookings"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/admin/all-requests", headers=headers)
        assert response.status_code == 200
        data = response.json()
        
        # Check nightlife bookings are included
        assert "nightlife_bookings" in data
        nightlife_count = len(data.get("nightlife_bookings", []))
        print(f"✓ Admin all requests - Nightlife bookings: {nightlife_count}")
        
        # Count all requests
        total = sum(len(v) for v in data.values() if isinstance(v, list))
        print(f"✓ Total requests across all categories: {total}")


class TestGuestBookingAPI:
    """Test guest booking token validation"""
    
    def test_valid_booking_token(self):
        """Test with a known valid token"""
        # First create a guest booking via admin
        login_response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "email": "nico.suez2000@gmail.com",
            "password": "Thegame2000"
        })
        
        if login_response.status_code == 200:
            token = login_response.json().get("token")
            headers = {"Authorization": f"Bearer {token}"}
            
            # Get existing guest bookings
            response = requests.get(f"{BASE_URL}/api/admin/guest-bookings", headers=headers)
            if response.status_code == 200:
                bookings = response.json()
                if len(bookings) > 0:
                    guest_token = bookings[0].get("token")
                    # Validate the token
                    validate_response = requests.get(f"{BASE_URL}/api/booking/{guest_token}")
                    print(f"✓ Guest booking validation: status {validate_response.status_code}")
                    if validate_response.status_code == 200:
                        data = validate_response.json()
                        print(f"  Valid: {data.get('valid')}, Message: {data.get('message')}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

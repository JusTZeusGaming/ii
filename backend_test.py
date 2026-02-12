import requests
import sys
import json
from datetime import datetime

class TorreLapilloAPITester:
    def __init__(self, base_url="https://beachstay-2.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        if headers:
            test_headers.update(headers)
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return success, response.json() if response.text else {}
                except:
                    return success, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}...")
                self.failed_tests.append({
                    'name': name,
                    'expected': expected_status,
                    'actual': response.status_code,
                    'response': response.text[:200]
                })
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append({
                'name': name,
                'error': str(e)
            })
            return False, {}

    def test_root_endpoint(self):
        """Test API root endpoint"""
        return self.run_test("API Root", "GET", "", 200)

    def test_seed_database(self):
        """Test database seeding"""
        return self.run_test("Seed Database", "POST", "seed", 200)

    def test_admin_login(self):
        """Test admin login and get token"""
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "admin/login",
            200,
            data={"username": "admin", "password": "admin123"}
        )
        if success and 'token' in response:
            self.token = response['token']
            print(f"   Token obtained: {self.token[:20]}...")
            return True
        return False

    def test_admin_me(self):
        """Test admin profile endpoint"""
        if not self.token:
            print("❌ No token available for admin/me test")
            return False
        return self.run_test("Admin Profile", "GET", "admin/me", 200)

    def test_get_property(self):
        """Test getting property by slug"""
        return self.run_test("Get Property", "GET", "properties/casa-brezza", 200)

    def test_get_beaches(self):
        """Test getting beaches list"""
        success, response = self.run_test("Get Beaches", "GET", "beaches", 200)
        if success and isinstance(response, list):
            print(f"   Found {len(response)} beaches")
        return success

    def test_get_restaurants(self):
        """Test getting restaurants list"""
        success, response = self.run_test("Get Restaurants", "GET", "restaurants", 200)
        if success and isinstance(response, list):
            print(f"   Found {len(response)} restaurants")
        return success

    def test_get_experiences(self):
        """Test getting experiences list"""
        success, response = self.run_test("Get Experiences", "GET", "experiences", 200)
        if success and isinstance(response, list):
            print(f"   Found {len(response)} experiences")
        return success

    def test_get_rentals(self):
        """Test getting rentals list"""
        success, response = self.run_test("Get Rentals", "GET", "rentals", 200)
        if success and isinstance(response, list):
            print(f"   Found {len(response)} rentals")
        return success

    def test_get_map_info(self):
        """Test getting map info list"""
        success, response = self.run_test("Get Map Info", "GET", "map-info", 200)
        if success and isinstance(response, list):
            print(f"   Found {len(response)} map info items")
        return success

    def test_get_transports(self):
        """Test getting transports list"""
        success, response = self.run_test("Get Transports", "GET", "transports", 200)
        if success and isinstance(response, list):
            print(f"   Found {len(response)} transport options")
        return success

    def test_create_rental_booking(self):
        """Test creating a rental booking"""
        booking_data = {
            "rental_id": "test-rental-id",
            "rental_name": "Test Rental",
            "guest_name": "Test Guest",
            "guest_surname": "Guest",
            "guest_phone": "+39 123 456 7890",
            "start_date": "2024-08-15",
            "end_date": "2024-08-16",
            "notes": "Test booking"
        }
        success, response = self.run_test(
            "Create Rental Booking",
            "POST",
            "rental-bookings",
            200,
            data=booking_data
        )
        if success and response.get('success'):
            print(f"   Booking ID: {response.get('booking_id')}")
        return success

    def test_create_transport_request(self):
        """Test creating a transport request"""
        request_data = {
            "transport_type": "NCC Transfer",
            "guest_name": "Test Guest",
            "guest_surname": "Guest",
            "guest_phone": "+39 123 456 7890",
            "date": "2024-08-15",
            "num_people": 2,
            "route": "Aeroporto Brindisi - Torre Lapillo",
            "notes": "Test transport request"
        }
        success, response = self.run_test(
            "Create Transport Request",
            "POST",
            "transport-requests",
            200,
            data=request_data
        )
        if success and response.get('success'):
            print(f"   Request ID: {response.get('request_id')}")
        return success

    def test_get_weather(self):
        """Test weather API endpoint"""
        success, response = self.run_test("Get Weather", "GET", "weather", 200)
        if success and 'temperature' in response:
            print(f"   Temperature: {response.get('temperature')}°C")
            print(f"   Description: {response.get('description')}")
        return success

    def test_get_supermarket(self):
        """Test supermarket info endpoint"""
        success, response = self.run_test("Get Supermarket", "GET", "supermarket", 200)
        if success and 'name' in response:
            print(f"   Supermarket: {response.get('name')}")
        return success

    def test_get_extra_services(self):
        """Test extra services endpoint"""
        success, response = self.run_test("Get Extra Services", "GET", "extra-services", 200)
        if success and isinstance(response, list):
            print(f"   Found {len(response)} extra services")
        return success

    def test_get_troubleshooting(self):
        """Test troubleshooting endpoint"""
        success, response = self.run_test("Get Troubleshooting", "GET", "troubleshooting", 200)
        if success and isinstance(response, list):
            print(f"   Found {len(response)} troubleshooting items")
        return success

    def test_create_support_ticket(self):
        """Test creating a support ticket"""
        ticket_data = {
            "property_slug": "casa-brezza",
            "description": "Test issue with air conditioning",
            "urgency": "medio",
            "contact_preference": "whatsapp",
            "guest_name": "Test Guest",
            "guest_phone": "+39 123 456 7890"
        }
        success, response = self.run_test(
            "Create Support Ticket",
            "POST",
            "support-tickets",
            200,
            data=ticket_data
        )
        if success and response.get('success'):
            print(f"   Ticket Number: {response.get('ticket_number')}")
        return success

    def test_create_beach_booking(self):
        """Test creating a beach booking"""
        booking_data = {
            "beach_id": "test-beach-id",
            "beach_name": "Test Beach",
            "guest_name": "Test Guest",
            "guest_surname": "Guest",
            "guest_phone": "+39 123 456 7890",
            "date": "2024-08-15",
            "duration": "intera",
            "row_preference": "indifferente",
            "umbrella_type": "standard",
            "notes": "Test beach booking"
        }
        success, response = self.run_test(
            "Create Beach Booking",
            "POST",
            "beach-bookings",
            200,
            data=booking_data
        )
        if success and response.get('success'):
            print(f"   Booking ID: {response.get('booking_id')}")
        return success

    def test_create_restaurant_booking(self):
        """Test creating a restaurant booking"""
        booking_data = {
            "restaurant_id": "test-restaurant-id",
            "restaurant_name": "Test Restaurant",
            "guest_name": "Test Guest",
            "guest_surname": "Guest",
            "guest_phone": "+39 123 456 7890",
            "date": "2024-08-15",
            "time": "20:00",
            "num_people": 2,
            "notes": "Test restaurant booking"
        }
        success, response = self.run_test(
            "Create Restaurant Booking",
            "POST",
            "restaurant-bookings",
            200,
            data=booking_data
        )
        if success and response.get('success'):
            print(f"   Booking ID: {response.get('booking_id')}")
        return success

    def test_create_experience_booking(self):
        """Test creating an experience booking"""
        booking_data = {
            "experience_id": "test-experience-id",
            "experience_name": "Test Experience",
            "guest_name": "Test Guest",
            "guest_surname": "Guest",
            "guest_phone": "+39 123 456 7890",
            "date": "2024-08-15",
            "time": "10:00",
            "num_people": 2,
            "notes": "Test experience booking"
        }
        success, response = self.run_test(
            "Create Experience Booking",
            "POST",
            "experience-bookings",
            200,
            data=booking_data
        )
        if success and response.get('success'):
            print(f"   Booking ID: {response.get('booking_id')}")
        return success

    def test_create_extra_service_request(self):
        """Test creating an extra service request"""
        request_data = {
            "property_slug": "casa-brezza",
            "service_type": "pulizia-extra",
            "guest_name": "Test Guest",
            "guest_surname": "Guest",
            "guest_phone": "+39 123 456 7890",
            "date": "2024-08-15",
            "notes": "Test extra service request"
        }
        success, response = self.run_test(
            "Create Extra Service Request",
            "POST",
            "extra-service-requests",
            200,
            data=request_data
        )
        if success and response.get('success'):
            print(f"   Request ID: {response.get('request_id')}")
        return success

    def test_admin_crud_operations(self):
        """Test admin CRUD operations"""
        if not self.token:
            print("❌ No token available for admin CRUD tests")
            return False

        # Test getting admin data
        tests = [
            ("Admin Get Properties", "GET", "admin/properties", 200),
            ("Admin Get Rental Bookings", "GET", "admin/rental-bookings", 200),
            ("Admin Get Transport Requests", "GET", "admin/transport-requests", 200),
            ("Admin Get Beach Bookings", "GET", "admin/beach-bookings", 200),
            ("Admin Get Restaurant Bookings", "GET", "admin/restaurant-bookings", 200),
            ("Admin Get Experience Bookings", "GET", "admin/experience-bookings", 200),
            ("Admin Get Support Tickets", "GET", "admin/support-tickets", 200),
            ("Admin Get Extra Service Requests", "GET", "admin/extra-service-requests", 200)
        ]

        all_passed = True
        for name, method, endpoint, expected in tests:
            success, _ = self.run_test(name, method, endpoint, expected)
            if not success:
                all_passed = False

        return all_passed

def main():
    print("🚀 Starting Torre Lapillo Guest Portal API Tests")
    print("=" * 60)
    
    # Setup
    tester = TorreLapilloAPITester()
    
    # Test sequence
    tests = [
        ("API Root", tester.test_root_endpoint),
        ("Database Seeding", tester.test_seed_database),
        ("Admin Login", tester.test_admin_login),
        ("Admin Profile", tester.test_admin_me),
        ("Get Property", tester.test_get_property),
        ("Get Weather", tester.test_get_weather),
        ("Get Supermarket", tester.test_get_supermarket),
        ("Get Extra Services", tester.test_get_extra_services),
        ("Get Troubleshooting", tester.test_get_troubleshooting),
        ("Get Beaches", tester.test_get_beaches),
        ("Get Restaurants", tester.test_get_restaurants),
        ("Get Experiences", tester.test_get_experiences),
        ("Get Rentals", tester.test_get_rentals),
        ("Get Map Info", tester.test_get_map_info),
        ("Get Transports", tester.test_get_transports),
        ("Create Support Ticket", tester.test_create_support_ticket),
        ("Create Beach Booking", tester.test_create_beach_booking),
        ("Create Restaurant Booking", tester.test_create_restaurant_booking),
        ("Create Experience Booking", tester.test_create_experience_booking),
        ("Create Rental Booking", tester.test_create_rental_booking),
        ("Create Transport Request", tester.test_create_transport_request),
        ("Create Extra Service Request", tester.test_create_extra_service_request),
        ("Admin CRUD Operations", tester.test_admin_crud_operations)
    ]

    # Run all tests
    for test_name, test_func in tests:
        print(f"\n📋 Running {test_name} test...")
        try:
            test_func()
        except Exception as e:
            print(f"❌ Test {test_name} crashed: {str(e)}")
            tester.failed_tests.append({
                'name': test_name,
                'error': f"Test crashed: {str(e)}"
            })

    # Print results
    print("\n" + "=" * 60)
    print("📊 TEST RESULTS")
    print("=" * 60)
    print(f"Tests run: {tester.tests_run}")
    print(f"Tests passed: {tester.tests_passed}")
    print(f"Tests failed: {tester.tests_run - tester.tests_passed}")
    print(f"Success rate: {(tester.tests_passed / tester.tests_run * 100):.1f}%" if tester.tests_run > 0 else "0%")

    if tester.failed_tests:
        print("\n❌ FAILED TESTS:")
        for i, failure in enumerate(tester.failed_tests, 1):
            print(f"{i}. {failure['name']}")
            if 'error' in failure:
                print(f"   Error: {failure['error']}")
            else:
                print(f"   Expected: {failure['expected']}, Got: {failure['actual']}")
                if 'response' in failure:
                    print(f"   Response: {failure['response']}")

    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())
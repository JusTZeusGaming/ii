from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, UploadFile, File, Form
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import jwt
import bcrypt
import httpx

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Config
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-journey-secret-key-2024')
JWT_ALGORITHM = "HS256"

app = FastAPI()
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

# ============== MODELS ==============

class PropertyBase(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    slug: str
    wifi_name: str
    wifi_password: str
    checkin_time: str
    checkin_instructions: str
    checkout_time: str
    checkout_instructions: str
    house_rules: List[str]
    host_name: str
    host_phone: str
    emergency_contacts: List[dict]
    faq: List[dict]
    image_url: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PropertyCreate(BaseModel):
    name: str
    slug: str
    wifi_name: str
    wifi_password: str
    checkin_time: str
    checkin_instructions: str
    checkout_time: str
    checkout_instructions: str
    house_rules: List[str]
    host_name: str
    host_phone: str
    emergency_contacts: List[dict]
    faq: List[dict]
    image_url: Optional[str] = None

class BeachBase(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    distance: str
    category: str
    map_url: str
    image_url: str
    is_recommended: bool = False
    parking_info: Optional[str] = None
    best_time: Optional[str] = None
    tips: Optional[str] = None
    has_sunbeds: bool = False

class BeachCreate(BaseModel):
    name: str
    description: str
    distance: str
    category: str
    map_url: str
    image_url: str
    is_recommended: bool = False
    parking_info: Optional[str] = None
    best_time: Optional[str] = None
    tips: Optional[str] = None
    has_sunbeds: bool = False

class RestaurantBase(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    category: str
    phone: str
    map_url: str
    image_url: str
    is_recommended: bool = False
    price_range: Optional[str] = None
    hours: Optional[str] = None
    reviews: Optional[List[dict]] = None

class RestaurantCreate(BaseModel):
    name: str
    description: str
    category: str
    phone: str
    map_url: str
    image_url: str
    is_recommended: bool = False
    price_range: Optional[str] = None
    hours: Optional[str] = None
    reviews: Optional[List[dict]] = None

class ExperienceBase(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    category: str
    price_info: str
    contact_phone: str
    image_url: str
    is_top: bool = False
    duration: Optional[str] = None
    included: Optional[List[str]] = None
    extras: Optional[List[str]] = None
    min_participants: Optional[int] = None

class ExperienceCreate(BaseModel):
    name: str
    description: str
    category: str
    price_info: str
    contact_phone: str
    image_url: str
    is_top: bool = False
    duration: Optional[str] = None
    included: Optional[List[str]] = None
    extras: Optional[List[str]] = None
    min_participants: Optional[int] = None

class RentalBase(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    daily_price: str
    weekly_price: Optional[str] = None
    rules: str
    image_url: str
    category: str = "mare"  # mare, spostamenti

class RentalCreate(BaseModel):
    name: str
    description: str
    daily_price: str
    weekly_price: Optional[str] = None
    rules: str
    image_url: str
    category: str = "mare"

class MapInfoBase(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    category: str
    map_url: str
    icon: str
    phone: Optional[str] = None
    hours: Optional[str] = None
    if_closed: Optional[str] = None

class MapInfoCreate(BaseModel):
    name: str
    description: str
    category: str
    map_url: str
    icon: str
    phone: Optional[str] = None
    hours: Optional[str] = None
    if_closed: Optional[str] = None

class TransportBase(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    category: str
    contact_phone: str
    price_info: str
    min_participants: Optional[int] = None
    cancellation_policy: Optional[str] = None

class TransportCreate(BaseModel):
    name: str
    description: str
    category: str
    contact_phone: str
    price_info: str
    min_participants: Optional[int] = None
    cancellation_policy: Optional[str] = None

# Booking models
class RentalBooking(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    rental_id: str
    rental_name: str
    guest_name: str
    guest_surname: str
    guest_phone: str
    start_date: str
    end_date: str
    duration_type: str = "giornaliero"
    delivery: bool = False
    pickup: bool = False
    total_price: Optional[str] = None
    notes: Optional[str] = None
    status: str = "pending"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class RentalBookingCreate(BaseModel):
    rental_id: str
    rental_name: str
    guest_name: str
    guest_surname: str
    guest_phone: str
    start_date: str
    end_date: str
    duration_type: str = "giornaliero"
    delivery: bool = False
    pickup: bool = False
    total_price: Optional[str] = None
    notes: Optional[str] = None

class RestaurantBooking(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    restaurant_id: str
    restaurant_name: str
    guest_name: str
    guest_surname: str
    guest_phone: str
    date: str
    time: str
    num_people: int
    notes: Optional[str] = None
    status: str = "pending"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class RestaurantBookingCreate(BaseModel):
    restaurant_id: str
    restaurant_name: str
    guest_name: str
    guest_surname: str
    guest_phone: str
    date: str
    time: str
    num_people: int
    notes: Optional[str] = None

class BeachBooking(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    beach_id: str
    beach_name: str
    guest_name: str
    guest_surname: str
    guest_phone: str
    date: str
    duration: str  # intera, mezza_mattina, mezza_pomeriggio
    row_preference: str  # prime, ultime, indifferente
    umbrella_type: str  # standard, premium
    extras: Optional[List[str]] = None
    notes: Optional[str] = None
    status: str = "pending"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class BeachBookingCreate(BaseModel):
    beach_id: str
    beach_name: str
    guest_name: str
    guest_surname: str
    guest_phone: str
    date: str
    duration: str
    row_preference: str
    umbrella_type: str
    extras: Optional[List[str]] = None
    notes: Optional[str] = None

class ExperienceBooking(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    experience_id: str
    experience_name: str
    guest_name: str
    guest_surname: str
    guest_phone: str
    date: str
    time: str
    num_people: int
    notes: Optional[str] = None
    status: str = "pending"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ExperienceBookingCreate(BaseModel):
    experience_id: str
    experience_name: str
    guest_name: str
    guest_surname: str
    guest_phone: str
    date: str
    time: str
    num_people: int
    notes: Optional[str] = None

class TransportRequest(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    transport_type: str
    guest_name: str
    guest_surname: str
    guest_phone: str
    date: str
    time: Optional[str] = None
    num_people: int
    route: str
    notes: Optional[str] = None
    status: str = "pending"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TransportRequestCreate(BaseModel):
    transport_type: str
    guest_name: str
    guest_surname: str
    guest_phone: str
    date: str
    time: Optional[str] = None
    num_people: int
    route: str
    notes: Optional[str] = None

class SupportTicket(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    ticket_number: str = Field(default_factory=lambda: f"TKT-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:6].upper()}")
    property_slug: str
    description: str
    urgency: str  # urgente, medio, basso
    contact_preference: str  # whatsapp, chiamata, email
    guest_name: Optional[str] = None
    guest_phone: Optional[str] = None
    photo_url: Optional[str] = None
    status: str = "open"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SupportTicketCreate(BaseModel):
    property_slug: str
    description: str
    urgency: str
    contact_preference: str
    guest_name: Optional[str] = None
    guest_phone: Optional[str] = None
    photo_url: Optional[str] = None

class ExtraServiceRequest(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    property_slug: str
    service_type: str
    guest_name: str
    guest_surname: str
    guest_phone: str
    date: str
    time: Optional[str] = None
    notes: Optional[str] = None
    status: str = "pending"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ExtraServiceRequestCreate(BaseModel):
    property_slug: str
    service_type: str
    guest_name: str
    guest_surname: str
    guest_phone: str
    date: str
    time: Optional[str] = None
    notes: Optional[str] = None

class AdminUser(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    password_hash: str

class AdminLogin(BaseModel):
    username: str
    password: str

# ============== AUTH HELPERS ==============

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())

def create_token(admin_id: str) -> str:
    payload = {
        "sub": admin_id,
        "exp": datetime.now(timezone.utc).timestamp() + 86400
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_admin(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        admin_id = payload.get("sub")
        admin = await db.admins.find_one({"id": admin_id}, {"_id": 0})
        if not admin:
            raise HTTPException(status_code=401, detail="Invalid token")
        return admin
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ============== WEATHER API ==============

@api_router.get("/weather")
async def get_weather():
    """Get real weather for Torre Lapillo using Open-Meteo (free, no API key)"""
    try:
        async with httpx.AsyncClient() as client:
            # Torre Lapillo coordinates
            lat, lon = 40.2844, 17.8573
            response = await client.get(
                f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,weather_code,wind_speed_10m&timezone=Europe/Rome"
            )
            data = response.json()
            current = data.get("current", {})
            
            # Map weather codes to icons and descriptions
            weather_code = current.get("weather_code", 0)
            weather_map = {
                0: {"icon": "sun", "desc": "Sereno"},
                1: {"icon": "sun", "desc": "Prevalentemente sereno"},
                2: {"icon": "cloud-sun", "desc": "Parzialmente nuvoloso"},
                3: {"icon": "cloud", "desc": "Nuvoloso"},
                45: {"icon": "cloud-fog", "desc": "Nebbia"},
                48: {"icon": "cloud-fog", "desc": "Nebbia gelata"},
                51: {"icon": "cloud-drizzle", "desc": "Pioggerella leggera"},
                53: {"icon": "cloud-drizzle", "desc": "Pioggerella"},
                55: {"icon": "cloud-drizzle", "desc": "Pioggerella intensa"},
                61: {"icon": "cloud-rain", "desc": "Pioggia leggera"},
                63: {"icon": "cloud-rain", "desc": "Pioggia"},
                65: {"icon": "cloud-rain", "desc": "Pioggia intensa"},
                80: {"icon": "cloud-rain", "desc": "Rovesci"},
                95: {"icon": "cloud-lightning", "desc": "Temporale"},
            }
            weather_info = weather_map.get(weather_code, {"icon": "sun", "desc": "Sereno"})
            
            return {
                "temperature": round(current.get("temperature_2m", 25)),
                "wind_speed": round(current.get("wind_speed_10m", 0)),
                "icon": weather_info["icon"],
                "description": weather_info["desc"]
            }
    except Exception as e:
        # Fallback
        return {
            "temperature": 28,
            "wind_speed": 12,
            "icon": "sun",
            "description": "Sereno"
        }

# ============== PUBLIC ROUTES ==============

@api_router.get("/")
async def root():
    return {"message": "Your Journey API - Torre Lapillo Guest Portal"}

@api_router.get("/properties/{slug}")
async def get_property(slug: str):
    prop = await db.properties.find_one({"slug": slug}, {"_id": 0})
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    return prop

@api_router.get("/beaches", response_model=List[BeachBase])
async def get_beaches():
    beaches = await db.beaches.find({}, {"_id": 0}).to_list(100)
    return beaches

@api_router.get("/beaches/{beach_id}")
async def get_beach(beach_id: str):
    beach = await db.beaches.find_one({"id": beach_id}, {"_id": 0})
    if not beach:
        raise HTTPException(status_code=404, detail="Beach not found")
    return beach

@api_router.get("/restaurants", response_model=List[RestaurantBase])
async def get_restaurants():
    restaurants = await db.restaurants.find({}, {"_id": 0}).to_list(100)
    return restaurants

@api_router.get("/restaurants/{restaurant_id}")
async def get_restaurant(restaurant_id: str):
    restaurant = await db.restaurants.find_one({"id": restaurant_id}, {"_id": 0})
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    return restaurant

@api_router.get("/experiences", response_model=List[ExperienceBase])
async def get_experiences():
    experiences = await db.experiences.find({}, {"_id": 0}).to_list(100)
    return experiences

@api_router.get("/experiences/{experience_id}")
async def get_experience(experience_id: str):
    experience = await db.experiences.find_one({"id": experience_id}, {"_id": 0})
    if not experience:
        raise HTTPException(status_code=404, detail="Experience not found")
    return experience

@api_router.get("/rentals", response_model=List[RentalBase])
async def get_rentals():
    rentals = await db.rentals.find({}, {"_id": 0}).to_list(100)
    return rentals

@api_router.get("/rentals/{rental_id}")
async def get_rental(rental_id: str):
    rental = await db.rentals.find_one({"id": rental_id}, {"_id": 0})
    if not rental:
        raise HTTPException(status_code=404, detail="Rental not found")
    return rental

@api_router.get("/map-info", response_model=List[MapInfoBase])
async def get_map_info():
    info = await db.map_info.find({}, {"_id": 0}).to_list(100)
    return info

@api_router.get("/transports", response_model=List[TransportBase])
async def get_transports():
    transports = await db.transports.find({}, {"_id": 0}).to_list(100)
    return transports

@api_router.get("/supermarket")
async def get_supermarket():
    """Get supermarket info"""
    return {
        "id": "supermarket-1",
        "name": "L'Angolo dei Sapori di Suersilario",
        "description": "Il supermercato di riferimento per i turisti di Torre Lapillo. Trovi tutto il necessario per la tua vacanza: panini farciti al momento, prodotti tipici pugliesi, confezioni sottovuoto e box regalo, oli extravergine locali, vini del Salento, snack, bevande fresche e molto altro. Personale cordiale e prezzi onesti.",
        "address": "Via Salento, 45 - Torre Lapillo (LE)",
        "phone": "+39 0833 565 890",
        "hours": {
            "weekdays": "07:30 - 13:30 / 16:30 - 21:00",
            "saturday": "07:30 - 13:30 / 16:30 - 22:00",
            "sunday": "08:00 - 13:00 / 17:00 - 21:00"
        },
        "map_url": "https://maps.google.com/?q=40.2847,17.8577",
        "distance": "300m",
        "services": [
            {"name": "Panini Farciti", "description": "Preparati al momento con ingredienti freschi", "icon": "sandwich"},
            {"name": "Spesa Pronta", "description": "Kit vacanza già pronti da portare via", "icon": "shopping-bag"},
            {"name": "Prodotti Tipici", "description": "Taralli, friselle, olio, vino locale", "icon": "package"},
            {"name": "Frutta Fresca", "description": "Frutta e verdura locale di stagione", "icon": "apple"}
        ],
        "images": [
            "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800",
            "https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=800",
            "https://images.unsplash.com/photo-1608198093002-ad4e005571b3?w=800"
        ]
    }

@api_router.get("/extra-services")
async def get_extra_services():
    """Get available extra services for properties"""
    return [
        {
            "id": "pulizia-extra",
            "name": "Pulizia Straordinaria",
            "description": "Pulizia completa dell'alloggio durante il soggiorno",
            "price": "€50",
            "icon": "sparkles"
        },
        {
            "id": "cambio-biancheria",
            "name": "Cambio Biancheria Extra",
            "description": "Cambio completo di lenzuola e asciugamani",
            "price": "€25",
            "icon": "bed"
        },
        {
            "id": "checkin-romantico",
            "name": "Check-in Romantico",
            "description": "Petali di rosa, prosecco freddo e fragole fresche all'arrivo",
            "price": "€45",
            "icon": "heart"
        },
        {
            "id": "spesa-arrivo",
            "name": "Spesa in Casa all'Arrivo",
            "description": "Frigo rifornito con prodotti base al tuo arrivo",
            "price": "€35 + spesa",
            "icon": "shopping-cart"
        },
        {
            "id": "late-checkout",
            "name": "Late Check-out",
            "description": "Estensione check-out fino alle 14:00 (soggetto a disponibilità)",
            "price": "€30",
            "icon": "clock"
        }
    ]

@api_router.get("/troubleshooting")
async def get_troubleshooting():
    """Get common troubleshooting solutions"""
    return [
        {
            "id": "piano-cottura",
            "title": "Il piano cottura non si accende",
            "solution": "Controlla che la bombola del gas sia aperta (ruota la valvola in senso antiorario). Se la bombola è vuota, contattaci per la sostituzione."
        },
        {
            "id": "acqua-calda",
            "title": "Non c'è acqua calda",
            "solution": "Verifica che lo scaldabagno sia acceso (interruttore nel bagno o quadro elettrico). Attendi 20-30 minuti per il riscaldamento."
        },
        {
            "id": "salvavita",
            "title": "È scattato il salvavita",
            "solution": "Vai al quadro elettrico e rialza la leva del salvavita. Se scatta di nuovo, scollega gli elettrodomestici uno alla volta per individuare il problema."
        },
        {
            "id": "wifi-lento",
            "title": "Wi-Fi lento o non funziona",
            "solution": "Riavvia il router staccando la spina per 30 secondi. Assicurati di essere connesso alla rete corretta e non a reti vicine."
        },
        {
            "id": "condizionatore",
            "title": "Il condizionatore non raffredda",
            "solution": "Imposta la temperatura sotto i 24°C. Controlla che i filtri non siano sporchi e che le finestre siano chiuse."
        },
        {
            "id": "lavandino",
            "title": "Il lavandino si scarica lentamente",
            "solution": "Usa lo sturalavandino sotto il lavello. Evita di buttare residui di cibo nello scarico."
        },
        {
            "id": "tv",
            "title": "La TV non si accende o non trova canali",
            "solution": "Controlla che la presa sia inserita e usa il telecomando corretto. Per la Smart TV, connettila al Wi-Fi dalle impostazioni."
        },
        {
            "id": "lavatrice",
            "title": "La lavatrice non parte",
            "solution": "Assicurati che lo sportello sia ben chiuso e che il rubinetto dell'acqua sia aperto. Controlla che non sia in pausa."
        },
        {
            "id": "zanzare",
            "title": "Ci sono zanzare in casa",
            "solution": "Usa le zanzariere alle finestre. Trovi piastrine e spray nel mobile sotto il lavello della cucina."
        },
        {
            "id": "chiavi",
            "title": "Problemi con la serratura/chiavi",
            "solution": "Prova a lubrificare la serratura con lo spray che trovi nel cassetto dell'ingresso. Se il problema persiste, contattaci."
        }
    ]

# ============== BOOKING ROUTES ==============

@api_router.post("/rental-bookings")
async def create_rental_booking(booking: RentalBookingCreate):
    booking_obj = RentalBooking(**booking.model_dump())
    doc = booking_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.rental_bookings.insert_one(doc)
    return {"success": True, "booking_id": booking_obj.id}

@api_router.post("/restaurant-bookings")
async def create_restaurant_booking(booking: RestaurantBookingCreate):
    booking_obj = RestaurantBooking(**booking.model_dump())
    doc = booking_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.restaurant_bookings.insert_one(doc)
    return {"success": True, "booking_id": booking_obj.id}

@api_router.post("/beach-bookings")
async def create_beach_booking(booking: BeachBookingCreate):
    booking_obj = BeachBooking(**booking.model_dump())
    doc = booking_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.beach_bookings.insert_one(doc)
    return {"success": True, "booking_id": booking_obj.id}

@api_router.post("/experience-bookings")
async def create_experience_booking(booking: ExperienceBookingCreate):
    booking_obj = ExperienceBooking(**booking.model_dump())
    doc = booking_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.experience_bookings.insert_one(doc)
    return {"success": True, "booking_id": booking_obj.id}

@api_router.post("/transport-requests")
async def create_transport_request(request: TransportRequestCreate):
    req_obj = TransportRequest(**request.model_dump())
    doc = req_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.transport_requests.insert_one(doc)
    return {"success": True, "request_id": req_obj.id}

@api_router.post("/support-tickets")
async def create_support_ticket(ticket: SupportTicketCreate):
    ticket_obj = SupportTicket(**ticket.model_dump())
    doc = ticket_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.support_tickets.insert_one(doc)
    return {"success": True, "ticket_id": ticket_obj.id, "ticket_number": ticket_obj.ticket_number}

@api_router.post("/extra-service-requests")
async def create_extra_service_request(request: ExtraServiceRequestCreate):
    req_obj = ExtraServiceRequest(**request.model_dump())
    doc = req_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.extra_service_requests.insert_one(doc)
    return {"success": True, "request_id": req_obj.id}

# ============== AUTH ROUTES ==============

@api_router.post("/admin/login")
async def admin_login(login: AdminLogin):
    admin = await db.admins.find_one({"username": login.username}, {"_id": 0})
    if not admin or not verify_password(login.password, admin['password_hash']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_token(admin['id'])
    return {"token": token, "username": admin['username']}

@api_router.get("/admin/me")
async def get_admin_me(admin: dict = Depends(get_current_admin)):
    return {"username": admin['username'], "id": admin['id']}

# ============== ADMIN CRUD ROUTES ==============

@api_router.get("/admin/properties")
async def admin_get_properties(admin: dict = Depends(get_current_admin)):
    props = await db.properties.find({}, {"_id": 0}).to_list(100)
    return props

@api_router.post("/admin/properties")
async def admin_create_property(prop: PropertyCreate, admin: dict = Depends(get_current_admin)):
    prop_obj = PropertyBase(**prop.model_dump())
    doc = prop_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.properties.insert_one(doc)
    return {"success": True, "id": prop_obj.id}

@api_router.put("/admin/properties/{prop_id}")
async def admin_update_property(prop_id: str, prop: PropertyCreate, admin: dict = Depends(get_current_admin)):
    result = await db.properties.update_one({"id": prop_id}, {"$set": prop.model_dump()})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Property not found")
    return {"success": True}

@api_router.delete("/admin/properties/{prop_id}")
async def admin_delete_property(prop_id: str, admin: dict = Depends(get_current_admin)):
    result = await db.properties.delete_one({"id": prop_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Property not found")
    return {"success": True}

# Beaches CRUD
@api_router.post("/admin/beaches")
async def admin_create_beach(beach: BeachCreate, admin: dict = Depends(get_current_admin)):
    beach_obj = BeachBase(**beach.model_dump())
    await db.beaches.insert_one(beach_obj.model_dump())
    return {"success": True, "id": beach_obj.id}

@api_router.put("/admin/beaches/{beach_id}")
async def admin_update_beach(beach_id: str, beach: BeachCreate, admin: dict = Depends(get_current_admin)):
    result = await db.beaches.update_one({"id": beach_id}, {"$set": beach.model_dump()})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Beach not found")
    return {"success": True}

@api_router.delete("/admin/beaches/{beach_id}")
async def admin_delete_beach(beach_id: str, admin: dict = Depends(get_current_admin)):
    result = await db.beaches.delete_one({"id": beach_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Beach not found")
    return {"success": True}

# Restaurants CRUD
@api_router.post("/admin/restaurants")
async def admin_create_restaurant(rest: RestaurantCreate, admin: dict = Depends(get_current_admin)):
    rest_obj = RestaurantBase(**rest.model_dump())
    await db.restaurants.insert_one(rest_obj.model_dump())
    return {"success": True, "id": rest_obj.id}

@api_router.put("/admin/restaurants/{rest_id}")
async def admin_update_restaurant(rest_id: str, rest: RestaurantCreate, admin: dict = Depends(get_current_admin)):
    result = await db.restaurants.update_one({"id": rest_id}, {"$set": rest.model_dump()})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    return {"success": True}

@api_router.delete("/admin/restaurants/{rest_id}")
async def admin_delete_restaurant(rest_id: str, admin: dict = Depends(get_current_admin)):
    result = await db.restaurants.delete_one({"id": rest_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    return {"success": True}

# Experiences CRUD
@api_router.post("/admin/experiences")
async def admin_create_experience(exp: ExperienceCreate, admin: dict = Depends(get_current_admin)):
    exp_obj = ExperienceBase(**exp.model_dump())
    await db.experiences.insert_one(exp_obj.model_dump())
    return {"success": True, "id": exp_obj.id}

@api_router.put("/admin/experiences/{exp_id}")
async def admin_update_experience(exp_id: str, exp: ExperienceCreate, admin: dict = Depends(get_current_admin)):
    result = await db.experiences.update_one({"id": exp_id}, {"$set": exp.model_dump()})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Experience not found")
    return {"success": True}

@api_router.delete("/admin/experiences/{exp_id}")
async def admin_delete_experience(exp_id: str, admin: dict = Depends(get_current_admin)):
    result = await db.experiences.delete_one({"id": exp_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Experience not found")
    return {"success": True}

# Rentals CRUD
@api_router.post("/admin/rentals")
async def admin_create_rental(rental: RentalCreate, admin: dict = Depends(get_current_admin)):
    rental_obj = RentalBase(**rental.model_dump())
    await db.rentals.insert_one(rental_obj.model_dump())
    return {"success": True, "id": rental_obj.id}

@api_router.put("/admin/rentals/{rental_id}")
async def admin_update_rental(rental_id: str, rental: RentalCreate, admin: dict = Depends(get_current_admin)):
    result = await db.rentals.update_one({"id": rental_id}, {"$set": rental.model_dump()})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Rental not found")
    return {"success": True}

@api_router.delete("/admin/rentals/{rental_id}")
async def admin_delete_rental(rental_id: str, admin: dict = Depends(get_current_admin)):
    result = await db.rentals.delete_one({"id": rental_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Rental not found")
    return {"success": True}

# Map Info CRUD
@api_router.post("/admin/map-info")
async def admin_create_map_info(info: MapInfoCreate, admin: dict = Depends(get_current_admin)):
    info_obj = MapInfoBase(**info.model_dump())
    await db.map_info.insert_one(info_obj.model_dump())
    return {"success": True, "id": info_obj.id}

@api_router.put("/admin/map-info/{info_id}")
async def admin_update_map_info(info_id: str, info: MapInfoCreate, admin: dict = Depends(get_current_admin)):
    result = await db.map_info.update_one({"id": info_id}, {"$set": info.model_dump()})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Map info not found")
    return {"success": True}

@api_router.delete("/admin/map-info/{info_id}")
async def admin_delete_map_info(info_id: str, admin: dict = Depends(get_current_admin)):
    result = await db.map_info.delete_one({"id": info_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Map info not found")
    return {"success": True}

# Transports CRUD
@api_router.post("/admin/transports")
async def admin_create_transport(transport: TransportCreate, admin: dict = Depends(get_current_admin)):
    transport_obj = TransportBase(**transport.model_dump())
    await db.transports.insert_one(transport_obj.model_dump())
    return {"success": True, "id": transport_obj.id}

@api_router.put("/admin/transports/{transport_id}")
async def admin_update_transport(transport_id: str, transport: TransportCreate, admin: dict = Depends(get_current_admin)):
    result = await db.transports.update_one({"id": transport_id}, {"$set": transport.model_dump()})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Transport not found")
    return {"success": True}

@api_router.delete("/admin/transports/{transport_id}")
async def admin_delete_transport(transport_id: str, admin: dict = Depends(get_current_admin)):
    result = await db.transports.delete_one({"id": transport_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Transport not found")
    return {"success": True}

# Admin Bookings Views
@api_router.get("/admin/rental-bookings")
async def admin_get_rental_bookings(admin: dict = Depends(get_current_admin)):
    bookings = await db.rental_bookings.find({}, {"_id": 0}).to_list(100)
    return bookings

@api_router.get("/admin/restaurant-bookings")
async def admin_get_restaurant_bookings(admin: dict = Depends(get_current_admin)):
    bookings = await db.restaurant_bookings.find({}, {"_id": 0}).to_list(100)
    return bookings

@api_router.get("/admin/beach-bookings")
async def admin_get_beach_bookings(admin: dict = Depends(get_current_admin)):
    bookings = await db.beach_bookings.find({}, {"_id": 0}).to_list(100)
    return bookings

@api_router.get("/admin/experience-bookings")
async def admin_get_experience_bookings(admin: dict = Depends(get_current_admin)):
    bookings = await db.experience_bookings.find({}, {"_id": 0}).to_list(100)
    return bookings

@api_router.get("/admin/transport-requests")
async def admin_get_transport_requests(admin: dict = Depends(get_current_admin)):
    requests = await db.transport_requests.find({}, {"_id": 0}).to_list(100)
    return requests

@api_router.get("/admin/support-tickets")
async def admin_get_support_tickets(admin: dict = Depends(get_current_admin)):
    tickets = await db.support_tickets.find({}, {"_id": 0}).to_list(100)
    return tickets

@api_router.get("/admin/extra-service-requests")
async def admin_get_extra_service_requests(admin: dict = Depends(get_current_admin)):
    requests = await db.extra_service_requests.find({}, {"_id": 0}).to_list(100)
    return requests

# ============== SEED DATA ==============

@api_router.post("/seed")
async def seed_database():
    existing_admin = await db.admins.find_one({"username": "admin"})
    if existing_admin:
        return {"message": "Database already seeded"}
    
    # Create admin
    admin_doc = {
        "id": str(uuid.uuid4()),
        "username": "admin",
        "password_hash": hash_password("admin123")
    }
    await db.admins.insert_one(admin_doc)
    
    # Extended FAQ list (30 items)
    extended_faq = [
        {"question": "Come funziona il check-in?", "answer": "Il check-in è disponibile dalle 15:00 alle 20:00. Riceverai le istruzioni per il ritiro delle chiavi via WhatsApp il giorno dell'arrivo. La cassetta di sicurezza si trova accanto alla porta d'ingresso."},
        {"question": "A che ora devo fare il check-out?", "answer": "Il check-out è entro le 10:00. Lascia le chiavi sul tavolo della cucina, chiudi tutte le finestre e porta via i rifiuti nei bidoni condominiali."},
        {"question": "Dove posso parcheggiare?", "answer": "Hai a disposizione un posto auto privato nel cortile interno. In alternativa, il parcheggio comunale gratuito è a 200m dalla casa."},
        {"question": "Come funziona la raccolta differenziata?", "answer": "Il calendario della raccolta è affisso sul frigorifero. Separa: plastica (giallo), carta (bianco), umido (marrone), vetro (verde), indifferenziato (grigio). I bidoni sono nel cortile condominiale."},
        {"question": "Quali sono gli orari di silenzio?", "answer": "Il silenzio va rispettato dalle 23:00 alle 8:00 e dalle 14:00 alle 16:30. Evita rumori forti e musica alta per rispetto dei vicini."},
        {"question": "Come funziona l'aria condizionata?", "answer": "Il telecomando è nel cassetto del comodino. Per un comfort ottimale, imposta max 24°C e assicurati che finestre e porte siano chiuse. Non lasciare acceso quando esci."},
        {"question": "Come faccio ad avere acqua calda?", "answer": "Lo scaldabagno è sempre attivo. Se non hai acqua calda, controlla l'interruttore nel bagno o nel quadro elettrico. Attendi 20-30 minuti per il riscaldamento completo."},
        {"question": "Come funziona la bombola del gas?", "answer": "La valvola della bombola è sotto il piano cottura. Girala in senso antiorario per aprire. Se la fiamma è debole o assente, la bombola potrebbe essere vuota: contattaci per la sostituzione."},
        {"question": "Dove trovo la biancheria extra?", "answer": "Lenzuola e asciugamani extra sono nell'armadio della camera da letto, ripiano in alto. Se hai bisogno di un cambio durante il soggiorno, contattaci (servizio a pagamento)."},
        {"question": "È previsto un servizio di pulizia?", "answer": "La pulizia finale è inclusa. Se desideri pulizie durante il soggiorno, offriamo un servizio aggiuntivo a €50 (prenotabile dalla sezione Servizi Aggiuntivi)."},
        {"question": "Posso portare animali?", "answer": "Gli animali domestici sono ammessi previo accordo. Comunicacelo prima dell'arrivo. È richiesto un supplemento di €30 per la pulizia extra."},
        {"question": "La casa è adatta ai bambini?", "answer": "Sì, la casa è family-friendly. Su richiesta possiamo fornire lettino/culla e seggiolone (gratuiti se disponibili). Segnala le tue esigenze al momento della prenotazione."},
        {"question": "Posso invitare ospiti extra?", "answer": "Il numero massimo di ospiti è quello dichiarato in prenotazione. Ospiti aggiuntivi non sono ammessi senza preavviso e potrebbero comportare costi extra."},
        {"question": "È possibile fumare in casa?", "answer": "No, è vietato fumare all'interno dell'alloggio. Puoi fumare nel balcone o negli spazi esterni. Sono previste penali in caso di violazione."},
        {"question": "Ci sono regole condominiali?", "answer": "Sì: rispetta il silenzio negli orari indicati, non lasciare oggetti nelle aree comuni, chiudi il portone d'ingresso, e parcheggia solo nello spazio assegnato."},
        {"question": "Come funziona la serratura/le chiavi?", "answer": "La porta si apre con chiave tradizionale. Gira due mandate per chiudere. Se hai problemi, usa lo spray lubrificante nel cassetto dell'ingresso."},
        {"question": "Qual è la password del Wi-Fi?", "answer": "Nome rete e password sono indicati nella sezione Wi-Fi di questa app e anche sul router in casa. La connessione è fibra ottica ad alta velocità."},
        {"question": "Come collego la Smart TV?", "answer": "La TV è già connessa al Wi-Fi. Puoi accedere a Netflix, Prime Video e YouTube con i tuoi account personali. Ricorda di scollegarti prima della partenza."},
        {"question": "Quali elettrodomestici ci sono?", "answer": "La casa dispone di: frigorifero, piano cottura, forno, microonde, lavatrice, ferro da stiro, asciugacapelli, condizionatore. Manuali e istruzioni nel cassetto della cucina."},
        {"question": "Cosa devo fare in caso di emergenza?", "answer": "Per emergenze gravi chiama il 112. Per problemi non urgenti con la casa, usa la sezione Guasti & Assistenza per aprire un ticket o contattaci su WhatsApp."},
        {"question": "Come posso chiamare un taxi/NCC?", "answer": "Nella sezione 'Senza Auto' trovi tutti i contatti per taxi e NCC della zona. Possiamo anche organizzare transfer aeroportuali."},
        {"question": "C'è un supermercato vicino?", "answer": "Sì! L'Angolo dei Sapori è a 300m (vedi card nella home). Aperto tutti i giorni, offre anche panini farciti e prodotti tipici."},
        {"question": "Dove posso noleggiare attrezzatura da spiaggia?", "answer": "Nella sezione 'Noleggi' puoi prenotare ombrelloni, lettini, SUP, kayak e molto altro con consegna a domicilio."},
        {"question": "Come funziona la lavatrice?", "answer": "La lavatrice è nel bagno/ripostiglio. Detersivo disponibile sotto il lavello. Programmi consigliati: cotone 40° per biancheria, delicati 30° per costumi."},
        {"question": "Posso richiedere il late check-out?", "answer": "Il late check-out (fino alle 14:00) è disponibile su richiesta e soggetto a disponibilità. Costa €30 e va prenotato dalla sezione Servizi Aggiuntivi."},
        {"question": "C'è un kit di primo soccorso?", "answer": "Sì, nel mobile del bagno trovi un kit base con cerotti, disinfettante e antidolorifici. Per emergenze mediche, la Guardia Medica è nella sezione Mappe & Info."},
        {"question": "Come funzionano le zanzariere?", "answer": "Tutte le finestre hanno zanzariere. Chiudile sempre la sera. Se vedi zanzare, usa le piastrine o lo spray che trovi sotto il lavello della cucina."},
        {"question": "Posso fare il barbecue?", "answer": "Se la casa dispone di barbecue, puoi usarlo rispettando le norme antincendio. Non è permesso accendere fuochi sul balcone o in aree non designate."},
        {"question": "Dove butto l'olio esausto?", "answer": "Non versare olio nel lavandino! Raccogli l'olio usato in una bottiglia e portalo all'isola ecologica o al supermercato (hanno contenitori appositi)."},
        {"question": "Come posso lasciare una recensione?", "answer": "Apprezziamo molto il feedback! Puoi lasciare una recensione sulla piattaforma dove hai prenotato (Airbnb, Booking, etc.) dopo il check-out."}
    ]
    
    # Create property with extended FAQ
    property_doc = {
        "id": str(uuid.uuid4()),
        "name": "Casa Brezza",
        "slug": "casa-brezza",
        "wifi_name": "CasaBrezzaWifi",
        "wifi_password": "Benvenuti2024",
        "checkin_time": "15:00 - 20:00",
        "checkin_instructions": "Ritira le chiavi dalla cassetta di sicurezza accanto alla porta. Il codice ti sarà inviato via WhatsApp il giorno dell'arrivo. La cassetta è grigia, sulla destra della porta d'ingresso.",
        "checkout_time": "Entro le 10:00",
        "checkout_instructions": "Lascia le chiavi sul tavolo della cucina. Chiudi tutte le finestre e porta via i rifiuti nei bidoni condominiali. Assicurati di aver scollegato i tuoi account dalla Smart TV.",
        "house_rules": [
            "Non fumare all'interno",
            "No feste o eventi",
            "Rispettare il silenzio dalle 23:00 alle 8:00",
            "Animali ammessi previo accordo",
            "Non superare il numero massimo di ospiti dichiarato",
            "Chiudere sempre il portone condominiale",
            "Non lasciare oggetti nelle aree comuni",
            "Spegnere luci e condizionatore quando esci"
        ],
        "host_name": "Marco",
        "host_phone": "+393293236473",
        "emergency_contacts": [
            {"name": "Emergenze", "phone": "112"},
            {"name": "Guardia Medica Porto Cesareo", "phone": "0833 569 111"}
        ],
        "faq": extended_faq,
        "image_url": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.properties.insert_one(property_doc)
    
    # Seed beaches with extended info
    beaches = [
        {"id": str(uuid.uuid4()), "name": "Spiaggia di Torre Lapillo", "description": "La spiaggia principale del paese, sabbia fine e acque cristalline color turchese. Fondale basso ideale per famiglie con bambini. Ampio arenile con zone libere e stabilimenti attrezzati.", "distance": "300m", "category": "libera", "map_url": "https://maps.google.com/?q=40.2844,17.8573", "image_url": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800", "is_recommended": True, "parking_info": "Parcheggio comunale gratuito a 100m. In alta stagione arriva presto (entro le 9:00).", "best_time": "Mattina presto (8-10) o tardo pomeriggio (17-19) per evitare la folla.", "tips": "Porta ombrellone e acqua. Bar sulla spiaggia per pranzo veloce. Docce pubbliche disponibili.", "has_sunbeds": False},
        {"id": str(uuid.uuid4()), "name": "Lido Tabu", "description": "Stabilimento elegante con tutti i comfort: lettini premium, ombrelloni in paglia, bar sulla spiaggia, ristorante con vista mare. Servizio in spiaggia attento e professionale.", "distance": "400m", "category": "attrezzata", "map_url": "https://maps.google.com/?q=40.2850,17.8580", "image_url": "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800", "is_recommended": True, "parking_info": "Parcheggio privato per clienti €5/giorno. Prenotazione consigliata.", "best_time": "Tutto il giorno con servizio bar. Aperitivo al tramonto imperdibile.", "tips": "Prenota lettini in anticipo in agosto. Menù pranzo ottimo rapporto qualità/prezzo.", "has_sunbeds": True},
        {"id": str(uuid.uuid4()), "name": "Punta Prosciutto", "description": "Una delle spiagge più belle della Puglia e d'Italia. Sabbia bianchissima finissima e mare caraibico con sfumature incredibili. Dune naturali protette alle spalle.", "distance": "5 km", "category": "libera", "map_url": "https://maps.google.com/?q=40.2685,17.8039", "image_url": "https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=800", "is_recommended": True, "parking_info": "Parcheggi a pagamento €5-10/giorno lungo la strada. Arriva presto in estate!", "best_time": "Mattina per trovare posto. Il tramonto qui è spettacolare.", "tips": "Porta tutto il necessario, pochi servizi sulla spiaggia libera. Acqua e cibo essenziali.", "has_sunbeds": False},
        {"id": str(uuid.uuid4()), "name": "Lido Bahia", "description": "Stabilimento trendy e giovanile. Musica lounge durante il giorno, aperitivi al tramonto con DJ set. Lettini comodi e area relax con baldacchini.", "distance": "600m", "category": "giovani", "map_url": "https://maps.google.com/?q=40.2860,17.8590", "image_url": "https://images.unsplash.com/photo-1520454974749-611b7248ffdb?w=800", "is_recommended": False, "parking_info": "Parcheggio libero nelle vicinanze.", "best_time": "Pomeriggio per l'atmosfera. Aperitivo dalle 18:00.", "tips": "Perfetto per giovani coppie. Eventi serali in estate.", "has_sunbeds": True},
        {"id": str(uuid.uuid4()), "name": "Spiaggia di Porto Cesareo", "description": "Ampia spiaggia con fondali bassi e sabbiosi, perfetta per bambini piccoli. Acqua calma e trasparente. Molti stabilimenti e servizi nelle vicinanze.", "distance": "8 km", "category": "family", "map_url": "https://maps.google.com/?q=40.2640,17.8970", "image_url": "https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?w=800", "is_recommended": False, "parking_info": "Parcheggi comunali e privati. In centro più difficile, meglio zone periferiche.", "best_time": "Tutto il giorno, ottima anche per passeggiata serale sul lungomare.", "tips": "Tanti ristoranti e gelaterie sul lungomare. Bel porticciolo da visitare.", "has_sunbeds": True}
    ]
    await db.beaches.insert_many(beaches)
    
    # Seed restaurants with extended info
    restaurants = [
        {"id": str(uuid.uuid4()), "name": "Ristorante Da Cosimino", "description": "Cucina di mare tradizionale salentina dal 1985. Pesce freschissimo del giorno, preparazioni classiche e atmosfera familiare. Specialità: frittura di paranza croccantissima, spaghetti ai ricci di mare, orecchiette ai frutti di mare.", "category": "pesce", "phone": "+390833565123", "map_url": "https://maps.google.com/?q=40.2845,17.8575", "image_url": "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800", "is_recommended": True, "price_range": "€€-€€€", "hours": "12:30-15:00 / 19:30-23:00", "reviews": [{"author": "Marco R.", "text": "Il miglior pesce della zona, freschissimo!", "rating": 5}, {"author": "Laura B.", "text": "Atmosfera autentica, prezzi onesti", "rating": 4}]},
        {"id": str(uuid.uuid4()), "name": "Pizzeria Il Forno", "description": "Pizza napoletana cotta nel forno a legna da maestri pizzaioli. Impasto leggero e digeribile, ingredienti di prima qualità. Ampia scelta di pizze classiche e gourmet. Fritti eccellenti.", "category": "pizzeria", "phone": "+390833565456", "map_url": "https://maps.google.com/?q=40.2848,17.8578", "image_url": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800", "is_recommended": True, "price_range": "€", "hours": "19:00-24:00", "reviews": [{"author": "Giovanni P.", "text": "Pizza eccezionale, impasto perfetto!", "rating": 5}, {"author": "Silvia M.", "text": "Mai una delusione, sempre buonissima", "rating": 5}]},
        {"id": str(uuid.uuid4()), "name": "Braceria La Brace", "description": "Carni alla griglia di altissima qualità, selezionate da allevamenti locali. Tagliata di manzo, fiorentina, grigliate miste spettacolari. Ambiente rustico ed elegante con dehors estivo.", "category": "carne", "phone": "+390833565789", "map_url": "https://maps.google.com/?q=40.2842,17.8572", "image_url": "https://images.unsplash.com/photo-1544025162-d76694265947?w=800", "is_recommended": False, "price_range": "€€€", "hours": "19:30-23:30", "reviews": [{"author": "Andrea F.", "text": "Carne di qualità superiore, cottura perfetta", "rating": 5}]},
        {"id": str(uuid.uuid4()), "name": "Bar del Corso", "description": "Il bar di riferimento per la colazione salentina: pasticciotto caldo, rustici, caffè leccese con latte di mandorla. Aperitivi al tramonto con vista e cocktail serali ben fatti.", "category": "colazione", "phone": "+390833565111", "map_url": "https://maps.google.com/?q=40.2846,17.8576", "image_url": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800", "is_recommended": True, "price_range": "€", "hours": "06:30-01:00", "reviews": [{"author": "Chiara L.", "text": "Pasticciotto divino, caffè ottimo!", "rating": 5}, {"author": "Davide T.", "text": "Aperitivi con vista mare top", "rating": 4}]},
        {"id": str(uuid.uuid4()), "name": "Trattoria Nonna Maria", "description": "Cucina casalinga pugliese come una volta. Piatti della tradizione preparati con amore: orecchiette alle cime di rapa, fave e cicorie, parmigiana di melanzane, polpette al sugo.", "category": "carne", "phone": "+390833565222", "map_url": "https://maps.google.com/?q=40.2843,17.8571", "image_url": "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800", "is_recommended": False, "price_range": "€€", "hours": "12:30-15:00 / 19:30-22:30", "reviews": [{"author": "Rosa M.", "text": "Come mangiare dalla nonna!", "rating": 5}]}
    ]
    await db.restaurants.insert_many(restaurants)
    
    # Seed experiences with extended info
    experiences = [
        {"id": str(uuid.uuid4()), "name": "Gita in Barca alle Isole", "description": "Escursione in barca alle splendide isole di Porto Cesareo: Isola Grande e Isola della Malva. Snorkeling in acque cristalline, bagno in calette nascoste, pranzo a bordo con prodotti tipici.", "category": "barca", "price_info": "Da €45/persona", "contact_phone": "+393293236473", "image_url": "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800", "is_top": True, "duration": "Intera giornata (9:00-17:00)", "included": ["Skipper esperto", "Snorkeling equipment", "Pranzo a bordo", "Bevande fresche", "Assicurazione"], "extras": ["Aperitivo al tramonto +€15", "Pescaturismo +€20"], "min_participants": 4},
        {"id": str(uuid.uuid4()), "name": "Tour di Lecce Barocca", "description": "Visita guidata al centro storico di Lecce, la Firenze del Sud. Ammirerai i capolavori del barocco leccese: Basilica di Santa Croce, Piazza Duomo, Anfiteatro Romano. Guida esperta in italiano.", "category": "escursioni", "price_info": "Da €25/persona", "contact_phone": "+393293236473", "image_url": "https://images.unsplash.com/photo-1534445867742-43195f401b6c?w=800", "is_top": True, "duration": "Mezza giornata (9:00-13:00)", "included": ["Guida certificata", "Ingresso monumenti", "Mappa della città"], "extras": ["Degustazione pasticciotto +€5", "Pranzo tipico +€20"], "min_participants": 2},
        {"id": str(uuid.uuid4()), "name": "Alberobello e Valle d'Itria", "description": "Escursione ai famosi trulli di Alberobello, patrimonio UNESCO. Proseguimento per i borghi bianchi di Locorotondo, Cisternino e Ostuni, la città bianca. Panorami mozzafiato.", "category": "borghi", "price_info": "Da €40/persona", "contact_phone": "+393293236473", "image_url": "https://images.unsplash.com/photo-1568797629192-789acf8e4df3?w=800", "is_top": True, "duration": "Intera giornata (8:00-18:00)", "included": ["Transfer A/R", "Guida turistica", "Tempo libero nei borghi"], "extras": ["Pranzo in masseria +€25", "Degustazione vini +€15"], "min_participants": 4},
        {"id": str(uuid.uuid4()), "name": "Gallipoli by Night", "description": "Serata nella perla dello Ionio. Cena in ristorante tipico nel centro storico, passeggiata sul lungomare illuminato, drink nei locali più cool della movida salentina.", "category": "nightlife", "price_info": "Trasporto €15/persona", "contact_phone": "+393293236473", "image_url": "https://images.unsplash.com/photo-1514214246283-d427a95c5d2f?w=800", "is_top": False, "duration": "Serata (20:00-02:00)", "included": ["Transfer A/R", "Accompagnatore locale"], "extras": ["Cena prenotata su richiesta"], "min_participants": 2},
        {"id": str(uuid.uuid4()), "name": "Diving e Snorkeling", "description": "Immersioni guidate nei fondali cristallini dell'Area Marina Protetta di Porto Cesareo. Adatto a tutti i livelli, dai principianti ai sub esperti. Attrezzatura professionale fornita.", "category": "barca", "price_info": "Da €60/persona", "contact_phone": "+393293236473", "image_url": "https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?w=800", "is_top": False, "duration": "Mezza giornata (9:00-13:00)", "included": ["Istruttore PADI", "Attrezzatura completa", "Assicurazione"], "extras": ["Corso principianti +€30", "Video subacqueo +€20"], "min_participants": 2},
        {"id": str(uuid.uuid4()), "name": "Aperitivo al Tramonto in Barca", "description": "Mini crociera al tramonto con aperitivo gourmet. Prosecco, taglieri di prodotti locali e vista spettacolare sulla costa salentina mentre il sole si tuffa nel mare.", "category": "barca", "price_info": "€35/persona", "contact_phone": "+393293236473", "image_url": "https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?w=800", "is_top": True, "duration": "2-3 ore (18:00-21:00)", "included": ["Aperitivo completo", "Prosecco", "Skipper"], "extras": ["Cena a bordo +€30"], "min_participants": 4}
    ]
    await db.experiences.insert_many(experiences)
    
    # Seed rentals with categories
    rentals = [
        {"id": str(uuid.uuid4()), "name": "Kit Spiaggia Completo", "description": "Ombrellone grande, 2 sdraio in alluminio, borsa frigo 15L. Tutto il necessario per una giornata perfetta in spiaggia libera.", "daily_price": "€8", "weekly_price": "€45", "rules": "Riconsegna entro le 20:00. Responsabilità per danni o smarrimento.", "image_url": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800", "category": "mare"},
        {"id": str(uuid.uuid4()), "name": "SUP - Stand Up Paddle", "description": "Tavola SUP gonfiabile premium, pagaia regolabile, giubbotto salvagente, sacca impermeabile per telefono. Perfetto per esplorare la costa.", "daily_price": "€20", "weekly_price": "€100", "rules": "Solo per nuotatori esperti. Vietato con mare mosso (onda >0.5m). Briefing obbligatorio.", "image_url": "https://images.unsplash.com/photo-1526188717906-ab4a2f949f53?w=800", "category": "mare"},
        {"id": str(uuid.uuid4()), "name": "Kayak Singolo", "description": "Kayak sit-on-top stabile e facile, pagaia, giubbotto salvagente. Ideale per escursioni costiere e calette nascoste.", "daily_price": "€18", "weekly_price": "€90", "rules": "Solo con mare calmo. Rientro obbligatorio entro 2 ore. Giubbotto sempre indossato.", "image_url": "https://images.unsplash.com/photo-1572111866787-bc7632c96e5f?w=800", "category": "mare"},
        {"id": str(uuid.uuid4()), "name": "Kayak Doppio", "description": "Kayak biposto per esplorare insieme. Include 2 pagaie, 2 giubbotti, sacca stagna.", "daily_price": "€25", "weekly_price": "€120", "rules": "Minimo 2 persone. Solo con mare calmo.", "image_url": "https://images.unsplash.com/photo-1572111866787-bc7632c96e5f?w=800", "category": "mare"},
        {"id": str(uuid.uuid4()), "name": "Set Snorkeling", "description": "Maschera in silicone, boccaglio dry-top, pinne regolabili. Taglie S/M/L disponibili.", "daily_price": "€8", "weekly_price": "€35", "rules": "Risciacquare con acqua dolce dopo ogni uso. Controllare taglia prima del noleggio.", "image_url": "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800", "category": "mare"},
        {"id": str(uuid.uuid4()), "name": "Tenda Parasole", "description": "Tenda pop-up con protezione UV50+, facile montaggio, ancora per la sabbia. Ideale per famiglie.", "daily_price": "€10", "weekly_price": "€50", "rules": "Non lasciare incustodita. Smontare in caso di vento forte.", "image_url": "https://images.unsplash.com/photo-1495954484750-af469f2f9be5?w=800", "category": "mare"},
        {"id": str(uuid.uuid4()), "name": "Carrellino da Spiaggia", "description": "Carrello pieghevole con ruote larghe per la sabbia. Capacità 50kg. Perfetto per trasportare attrezzatura.", "daily_price": "€5", "weekly_price": "€25", "rules": "Carico massimo 50kg. Lavare dopo uso su sabbia.", "image_url": "https://images.unsplash.com/photo-1495954484750-af469f2f9be5?w=800", "category": "mare"},
        {"id": str(uuid.uuid4()), "name": "Bicicletta City", "description": "Bici da passeggio con cestino, cambio 6 velocità, luci LED. Include casco e lucchetto. Perfetta per Torre Lapillo e dintorni.", "daily_price": "€10", "weekly_price": "€50", "rules": "Casco obbligatorio. Lucchetto sempre usato. Riconsegna entro le 21:00.", "image_url": "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800", "category": "spostamenti"},
        {"id": str(uuid.uuid4()), "name": "Scooter 125cc", "description": "Scooter automatico perfetto per esplorare la costa. Include 2 caschi, bauletto, assicurazione. Patente B richiesta.", "daily_price": "€35", "weekly_price": "€180", "rules": "Patente B obbligatoria. Età minima 18 anni. Carburante a carico del cliente. Km illimitati.", "image_url": "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800", "category": "spostamenti"},
        {"id": str(uuid.uuid4()), "name": "Auto - Fiat Panda", "description": "Utilitaria compatta ideale per le stradine del Salento. Aria condizionata, radio, km illimitati. Ritiro/riconsegna in struttura.", "daily_price": "€45", "weekly_price": "€250", "rules": "Patente B da almeno 1 anno. Età minima 21 anni. Carburante: pieno/pieno.", "image_url": "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800", "category": "spostamenti"},
        {"id": str(uuid.uuid4()), "name": "Monopattino Elettrico", "description": "E-scooter con autonomia 30km, velocità max 25km/h. Leggero e pratico per spostamenti brevi.", "daily_price": "€15", "weekly_price": "€70", "rules": "Età minima 14 anni. Casco obbligatorio. Non usare su strade trafficate.", "image_url": "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800", "category": "spostamenti"}
    ]
    await db.rentals.insert_many(rentals)
    
    # Seed map info with extended data
    map_info = [
        {"id": str(uuid.uuid4()), "name": "Parcheggio Comunale Torre Lapillo", "description": "Parcheggio gratuito a 200m dalla spiaggia principale. Ampio, non custodito. In estate arriva presto!", "category": "parcheggi", "map_url": "https://maps.google.com/?q=40.2840,17.8570", "icon": "car", "hours": "Sempre aperto", "if_closed": None},
        {"id": str(uuid.uuid4()), "name": "Parcheggio Lido Tabu", "description": "Parcheggio privato riservato ai clienti dello stabilimento. €5/giorno. Custodito.", "category": "parcheggi", "map_url": "https://maps.google.com/?q=40.2852,17.8582", "icon": "car", "hours": "8:00-20:00", "if_closed": "Usa il parcheggio comunale"},
        {"id": str(uuid.uuid4()), "name": "Farmacia Torre Lapillo", "description": "Farmacia di riferimento del paese. Ampia disponibilità di prodotti, anche solari e dopo-sole.", "category": "farmacia", "map_url": "https://maps.google.com/?q=40.2847,17.8577", "icon": "pill", "phone": "+39 0833 565 200", "hours": "9:00-13:00 / 17:00-21:00", "if_closed": "Farmacia di turno a Porto Cesareo"},
        {"id": str(uuid.uuid4()), "name": "Guardia Medica Porto Cesareo", "description": "Servizio medico per urgenze non gravi, attivo nelle ore notturne e festive.", "category": "guardia_medica", "map_url": "https://maps.google.com/?q=40.2640,17.8970", "icon": "stethoscope", "phone": "+39 0833 569 111", "hours": "20:00-8:00 (notti) + festivi tutto il giorno", "if_closed": "Vai al Pronto Soccorso di Lecce"},
        {"id": str(uuid.uuid4()), "name": "Ospedale Vito Fazzi - Lecce", "description": "Pronto soccorso principale della provincia. 35 minuti in auto da Torre Lapillo.", "category": "pronto_soccorso", "map_url": "https://maps.google.com/?q=40.3525,18.1765", "icon": "hospital", "phone": "+39 0832 661 111", "hours": "24/7", "if_closed": None},
        {"id": str(uuid.uuid4()), "name": "Stazione FS Lecce", "description": "Stazione ferroviaria principale del Salento. Treni per Bari, Roma, Milano. Bus per Torre Lapillo.", "category": "stazioni", "map_url": "https://maps.google.com/?q=40.3534,18.1693", "icon": "train", "phone": "+39 892 021", "hours": "5:00-24:00", "if_closed": None},
        {"id": str(uuid.uuid4()), "name": "Fermata Bus Torre Lapillo", "description": "Fermata autobus STP per Lecce e Porto Cesareo. Orari estivi più frequenti.", "category": "stazioni", "map_url": "https://maps.google.com/?q=40.2846,17.8575", "icon": "bus", "hours": "Vedi orari STP Lecce", "if_closed": None},
        {"id": str(uuid.uuid4()), "name": "Porto di Gallipoli", "description": "Porto turistico per traghetti, escursioni in barca, noleggio gommoni.", "category": "porti", "map_url": "https://maps.google.com/?q=40.0558,17.9893", "icon": "anchor", "phone": "+39 0833 261 244", "hours": "6:00-22:00", "if_closed": None},
        {"id": str(uuid.uuid4()), "name": "Torre Lapillo - Torre Costiera", "description": "Torre di avvistamento del XVI secolo. Simbolo del paese, splendida vista sulla costa.", "category": "punti_interesse", "map_url": "https://maps.google.com/?q=40.2848,17.8574", "icon": "landmark", "hours": "Visibile sempre, interni su richiesta", "if_closed": None},
        {"id": str(uuid.uuid4()), "name": "Area Marina Protetta Porto Cesareo", "description": "Riserva naturale con fondali spettacolari. Snorkeling e diving regolamentati.", "category": "punti_interesse", "map_url": "https://maps.google.com/?q=40.2644,17.8947", "icon": "fish", "hours": "Info point 9:00-13:00 / 16:00-20:00", "if_closed": None}
    ]
    await db.map_info.insert_many(map_info)
    
    # Seed transports with updated info
    transports = [
        {"id": str(uuid.uuid4()), "name": "NCC Marco Transfer", "description": "Servizio taxi privato professionale. Auto confortevoli con aria condizionata. Transfer aeroportuali, stazioni, escursioni personalizzate in tutto il Salento.", "category": "ncc", "contact_phone": "+393293236473", "price_info": "Aeroporto Brindisi €60 | Lecce €40 | Gallipoli €35", "min_participants": None, "cancellation_policy": "Cancellazione gratuita fino a 24h prima"},
        {"id": str(uuid.uuid4()), "name": "Tour Lecce + Otranto", "description": "Gita giornaliera organizzata. Mattina a Lecce (centro barocco), pranzo libero, pomeriggio a Otranto (cattedrale, castello, centro storico). Guida inclusa.", "category": "gite", "contact_phone": "+393293236473", "price_info": "€45/persona", "min_participants": 4, "cancellation_policy": "Se non si raggiunge il minimo di 4 partecipanti, la gita viene annullata con rimborso totale"},
        {"id": str(uuid.uuid4()), "name": "Tour Alberobello + Ostuni", "description": "Escursione ai trulli UNESCO e alla città bianca. Transfer, guida, tempo libero per shopping e pranzo.", "category": "gite", "contact_phone": "+393293236473", "price_info": "€50/persona", "min_participants": 4, "cancellation_policy": "Se non si raggiunge il minimo di 4 partecipanti, la gita viene annullata con rimborso totale"},
        {"id": str(uuid.uuid4()), "name": "Noleggio Auto con Conducente", "description": "Servizio NCC per itinerari personalizzati. Tu scegli le tappe, noi guidiamo. Ideale per degustazioni vino e tour borghi.", "category": "ncc", "contact_phone": "+393293236473", "price_info": "Da €150/giorno (8 ore)", "min_participants": None, "cancellation_policy": "Cancellazione gratuita fino a 48h prima"},
        {"id": str(uuid.uuid4()), "name": "Bus STP - Linea Lecce", "description": "Autobus pubblico per Lecce. Partenze da Torre Lapillo, fermate intermedie a Porto Cesareo e Nardò.", "category": "trasporto_pubblico", "contact_phone": "+39 0832 359 142", "price_info": "€3.50 corsa singola | €6 A/R", "min_participants": None, "cancellation_policy": None}
    ]
    await db.transports.insert_many(transports)
    
    return {"message": "Database seeded successfully", "admin_credentials": {"username": "admin", "password": "admin123"}}

# Include router and middleware
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

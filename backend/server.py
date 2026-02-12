from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
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
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt
import httpx
import resend
import asyncio
import secrets

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Config
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-journey-secret-key-2024')
JWT_ALGORITHM = "HS256"

# Email Config
resend.api_key = os.environ.get('RESEND_API_KEY')
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'onboarding@resend.dev')
NOTIFICATION_EMAIL = os.environ.get('NOTIFICATION_EMAIL', 'nico.suez2000@gmail.com')
ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL', 'nico.suez2000@gmail.com')

app = FastAPI()
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ============== EMAIL HELPER ==============

async def send_notification_email(subject: str, html_content: str):
    """Send email notification to admin"""
    if not resend.api_key:
        logger.warning("No Resend API key configured, skipping email")
        return None
    
    try:
        params = {
            "from": SENDER_EMAIL,
            "to": [NOTIFICATION_EMAIL],
            "subject": subject,
            "html": html_content
        }
        result = await asyncio.to_thread(resend.Emails.send, params)
        logger.info(f"Email sent: {subject}")
        return result
    except Exception as e:
        logger.error(f"Failed to send email: {str(e)}")
        return None

def build_booking_email(booking_type: str, data: dict) -> tuple:
    """Build email subject and HTML for booking notifications"""
    subject = f"🔔 Nuova richiesta {booking_type} - Your Journey"
    
    details_html = "".join([f"<tr><td style='padding:8px;border-bottom:1px solid #eee;font-weight:bold;'>{k}</td><td style='padding:8px;border-bottom:1px solid #eee;'>{v}</td></tr>" for k, v in data.items() if v])
    
    html = f"""
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
        <div style="background:#0F172A;color:white;padding:20px;border-radius:12px 12px 0 0;text-align:center;">
            <h1 style="margin:0;font-size:24px;">Your Journey</h1>
            <p style="margin:5px 0 0;opacity:0.8;">Nuova richiesta ricevuta</p>
        </div>
        <div style="background:#fff;border:1px solid #e5e7eb;border-top:none;padding:20px;border-radius:0 0 12px 12px;">
            <h2 style="color:#F59E0B;margin-top:0;">📋 {booking_type}</h2>
            <table style="width:100%;border-collapse:collapse;">
                {details_html}
            </table>
            <p style="margin-top:20px;padding:15px;background:#F8FAFC;border-radius:8px;font-size:14px;color:#64748B;">
                Ricevuto il {datetime.now().strftime('%d/%m/%Y alle %H:%M')}
            </p>
        </div>
    </div>
    """
    return subject, html

# ============== MODELS ==============

class PropertyBase(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    slug: str
    wifi_name: str = ""
    wifi_password: str = ""
    checkin_time: str = ""
    checkin_instructions: str = ""
    checkout_time: str = ""
    checkout_instructions: str = ""
    house_rules: List[str] = []
    host_name: str = ""
    host_phone: str = ""
    emergency_contacts: List[dict] = []
    faq: List[dict] = []
    image_url: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PropertyCreate(BaseModel):
    name: str
    slug: str
    wifi_name: str = ""
    wifi_password: str = ""
    checkin_time: str = ""
    checkin_instructions: str = ""
    checkout_time: str = ""
    checkout_instructions: str = ""
    house_rules: List[str] = []
    host_name: str = ""
    host_phone: str = ""
    emergency_contacts: List[dict] = []
    faq: List[dict] = []
    image_url: Optional[str] = None

class GuestBooking(BaseModel):
    """Guest booking with unique token for access"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    token: str = Field(default_factory=lambda: secrets.token_urlsafe(8))
    property_id: str
    property_slug: str
    property_name: str
    guest_name: str
    guest_surname: str
    num_guests: int = 1
    room_number: Optional[str] = None
    checkin_date: str
    checkout_date: str
    status: str = "active"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class GuestBookingCreate(BaseModel):
    property_id: str
    property_slug: str
    property_name: str
    guest_name: str
    guest_surname: str
    num_guests: int = 1
    room_number: Optional[str] = None
    checkin_date: str
    checkout_date: str

class BeachBase(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str = ""
    distance: str = ""
    category: str = "libera"
    map_url: str = ""
    image_url: str = ""
    is_recommended: bool = False
    parking_info: Optional[str] = None
    best_time: Optional[str] = None
    tips: Optional[str] = None
    has_sunbeds: bool = False

class BeachCreate(BaseModel):
    name: str
    description: str = ""
    distance: str = ""
    category: str = "libera"
    map_url: str = ""
    image_url: str = ""
    is_recommended: bool = False
    parking_info: Optional[str] = None
    best_time: Optional[str] = None
    tips: Optional[str] = None
    has_sunbeds: bool = False

class RestaurantBase(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str = ""
    category: str = "pesce"
    phone: str = ""
    map_url: str = ""
    image_url: str = ""
    is_recommended: bool = False
    price_range: Optional[str] = None
    hours: Optional[str] = None
    reviews: Optional[List[dict]] = None

class RestaurantCreate(BaseModel):
    name: str
    description: str = ""
    category: str = "pesce"
    phone: str = ""
    map_url: str = ""
    image_url: str = ""
    is_recommended: bool = False
    price_range: Optional[str] = None
    hours: Optional[str] = None
    reviews: Optional[List[dict]] = None

class ExperienceBase(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str = ""
    category: str = "barca"
    price_info: str = ""
    contact_phone: str = ""
    image_url: str = ""
    is_top: bool = False
    duration: Optional[str] = None
    included: Optional[List[str]] = None
    extras: Optional[List[str]] = None
    min_participants: Optional[int] = None

class ExperienceCreate(BaseModel):
    name: str
    description: str = ""
    category: str = "barca"
    price_info: str = ""
    contact_phone: str = ""
    image_url: str = ""
    is_top: bool = False
    duration: Optional[str] = None
    included: Optional[List[str]] = None
    extras: Optional[List[str]] = None
    min_participants: Optional[int] = None

class NightlifeEvent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    venue: str
    date: str
    time: str
    dress_code: str = ""
    price_entry: str = ""
    price_with_transport: str = ""
    image_url: str = ""
    status: str = "available"  # available, limited, sold_out
    min_participants: int = 4
    pickup_points: List[str] = []
    notes: str = ""

class RentalBase(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str = ""
    daily_price: float = 0
    weekly_price: Optional[float] = None
    rules: str = ""
    image_url: str = ""
    category: str = "mare"

class RentalCreate(BaseModel):
    name: str
    description: str = ""
    daily_price: float = 0
    weekly_price: Optional[float] = None
    rules: str = ""
    image_url: str = ""
    category: str = "mare"

class MapInfoBase(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str = ""
    category: str = "parcheggi"
    map_url: str = ""
    icon: str = "map-pin"
    phone: Optional[str] = None
    hours: Optional[str] = None
    if_closed: Optional[str] = None
    tips: Optional[str] = None

class MapInfoCreate(BaseModel):
    name: str
    description: str = ""
    category: str = "parcheggi"
    map_url: str = ""
    icon: str = "map-pin"
    phone: Optional[str] = None
    hours: Optional[str] = None
    if_closed: Optional[str] = None
    tips: Optional[str] = None

class TransportBase(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str = ""
    category: str = "ncc"
    contact_phone: str = ""
    price_info: str = ""
    min_participants: Optional[int] = None
    cancellation_policy: Optional[str] = None

class TransportCreate(BaseModel):
    name: str
    description: str = ""
    category: str = "ncc"
    contact_phone: str = ""
    price_info: str = ""
    min_participants: Optional[int] = None
    cancellation_policy: Optional[str] = None

class LocalEvent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str = ""
    date: str = ""
    location: str = ""
    category: str = "sagra"  # sagra, mercato, evento
    image_url: str = ""
    map_url: str = ""

# ============== BOOKING MODELS (with all optional for flexibility) ==============

class RentalBookingCreate(BaseModel):
    rental_id: str
    rental_name: str
    guest_name: str
    guest_surname: Optional[str] = ""
    guest_phone: str
    start_date: str
    end_date: Optional[str] = ""
    duration_type: str = "giornaliero"
    delivery: bool = False
    pickup: bool = False
    total_price: Optional[str] = None
    notes: Optional[str] = ""
    booking_token: Optional[str] = None

class RestaurantBookingCreate(BaseModel):
    restaurant_id: str
    restaurant_name: str
    guest_name: str
    guest_surname: Optional[str] = ""
    guest_phone: str
    date: str
    time: str
    num_people: int = 2
    notes: Optional[str] = ""
    booking_token: Optional[str] = None

class BeachBookingCreate(BaseModel):
    beach_id: str
    beach_name: str
    guest_name: str
    guest_surname: Optional[str] = ""
    guest_phone: str
    date: str
    duration: str = "intera"
    row_preference: str = "indifferente"
    umbrella_type: str = "standard"
    extras: Optional[List[str]] = []
    notes: Optional[str] = ""
    booking_token: Optional[str] = None

class ExperienceBookingCreate(BaseModel):
    experience_id: str
    experience_name: str
    guest_name: str
    guest_surname: Optional[str] = ""
    guest_phone: str
    date: str
    time: Optional[str] = ""
    num_people: int = 2
    notes: Optional[str] = ""
    booking_token: Optional[str] = None

class NightlifeBookingCreate(BaseModel):
    event_id: str
    event_name: str
    guest_name: str
    guest_surname: Optional[str] = ""
    guest_phone: str
    package: str = "entry_only"  # entry_only, entry_transport
    num_people: int = 1
    pickup_point: Optional[str] = ""
    notes: Optional[str] = ""
    booking_token: Optional[str] = None

class TransportRequestCreate(BaseModel):
    transport_type: str
    guest_name: str
    guest_surname: Optional[str] = ""
    guest_phone: str
    date: str
    time: Optional[str] = ""
    num_people: int = 1
    route: str
    notes: Optional[str] = ""
    booking_token: Optional[str] = None

class SupportTicketCreate(BaseModel):
    property_slug: str
    description: str
    urgency: str = "medio"
    contact_preference: str = "whatsapp"
    guest_name: Optional[str] = ""
    guest_phone: Optional[str] = ""
    booking_token: Optional[str] = None

class ExtraServiceRequestCreate(BaseModel):
    property_slug: str
    service_type: str
    guest_name: str
    guest_surname: Optional[str] = ""
    guest_phone: str
    date: str
    time: Optional[str] = ""
    notes: Optional[str] = ""
    booking_token: Optional[str] = None

class AdminLogin(BaseModel):
    email: str
    password: str

# ============== AUTH HELPERS ==============

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())

def create_token(admin_id: str) -> str:
    payload = {
        "sub": admin_id,
        "exp": datetime.now(timezone.utc).timestamp() + 86400 * 7  # 7 days
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
    try:
        async with httpx.AsyncClient() as client:
            lat, lon = 40.2844, 17.8573
            response = await client.get(
                f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,weather_code,wind_speed_10m&timezone=Europe/Rome",
                timeout=5.0
            )
            data = response.json()
            current = data.get("current", {})
            
            weather_code = current.get("weather_code", 0)
            weather_map = {
                0: {"icon": "sun", "desc": "Sereno"},
                1: {"icon": "sun", "desc": "Prevalentemente sereno"},
                2: {"icon": "cloud-sun", "desc": "Parzialmente nuvoloso"},
                3: {"icon": "cloud", "desc": "Nuvoloso"},
                45: {"icon": "cloud-fog", "desc": "Nebbia"},
                51: {"icon": "cloud-drizzle", "desc": "Pioggerella"},
                61: {"icon": "cloud-rain", "desc": "Pioggia"},
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
    except:
        return {"temperature": 28, "wind_speed": 12, "icon": "sun", "description": "Sereno"}

@api_router.get("/weather/detailed")
async def get_detailed_weather():
    """Get detailed weather with hourly and daily forecast"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://api.open-meteo.com/v1/forecast",
                params={
                    "latitude": 40.2833,
                    "longitude": 17.7667,
                    "current": "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,visibility",
                    "hourly": "temperature_2m,weather_code,precipitation_probability",
                    "daily": "weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset",
                    "timezone": "Europe/Rome",
                    "forecast_days": 7
                },
                timeout=10.0
            )
            data = response.json()
            
            current = data.get("current", {})
            hourly = data.get("hourly", {})
            daily = data.get("daily", {})
            
            # Process hourly (next 24 hours)
            hourly_forecast = []
            hourly_times = hourly.get("time", [])
            hourly_temps = hourly.get("temperature_2m", [])
            hourly_codes = hourly.get("weather_code", [])
            hourly_precip = hourly.get("precipitation_probability", [])
            
            for i in range(min(24, len(hourly_times))):
                hour = int(hourly_times[i].split("T")[1].split(":")[0])
                hourly_forecast.append({
                    "time": hourly_times[i],
                    "temperature": round(hourly_temps[i]) if i < len(hourly_temps) else 0,
                    "weather_code": hourly_codes[i] if i < len(hourly_codes) else 0,
                    "precipitation_probability": hourly_precip[i] if i < len(hourly_precip) else 0,
                    "is_night": hour < 6 or hour > 20
                })
            
            # Process daily
            daily_forecast = []
            daily_dates = daily.get("time", [])
            daily_max = daily.get("temperature_2m_max", [])
            daily_min = daily.get("temperature_2m_min", [])
            daily_codes = daily.get("weather_code", [])
            
            for i in range(len(daily_dates)):
                daily_forecast.append({
                    "date": daily_dates[i],
                    "temp_max": round(daily_max[i]) if i < len(daily_max) else 0,
                    "temp_min": round(daily_min[i]) if i < len(daily_min) else 0,
                    "weather_code": daily_codes[i] if i < len(daily_codes) else 0
                })
            
            return {
                "current": {
                    "temperature": round(current.get("temperature_2m", 25)),
                    "humidity": current.get("relative_humidity_2m", 50),
                    "weather_code": current.get("weather_code", 0),
                    "wind_speed": round(current.get("wind_speed_10m", 0)),
                    "visibility": current.get("visibility", 10000)
                },
                "hourly": hourly_forecast,
                "daily": daily_forecast
            }
    except Exception as e:
        return {
            "current": {"temperature": 25, "humidity": 60, "weather_code": 0, "wind_speed": 10, "visibility": 10000},
            "hourly": [],
            "daily": []
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

@api_router.get("/beaches")
async def get_beaches():
    beaches = await db.beaches.find({}, {"_id": 0}).to_list(100)
    return beaches

@api_router.get("/beaches/{beach_id}")
async def get_beach(beach_id: str):
    beach = await db.beaches.find_one({"id": beach_id}, {"_id": 0})
    if not beach:
        raise HTTPException(status_code=404, detail="Beach not found")
    return beach

@api_router.get("/restaurants")
async def get_restaurants():
    restaurants = await db.restaurants.find({}, {"_id": 0}).to_list(100)
    return restaurants

@api_router.get("/restaurants/{restaurant_id}")
async def get_restaurant(restaurant_id: str):
    restaurant = await db.restaurants.find_one({"id": restaurant_id}, {"_id": 0})
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    return restaurant

@api_router.get("/experiences")
async def get_experiences():
    experiences = await db.experiences.find({}, {"_id": 0}).to_list(100)
    return experiences

@api_router.get("/experiences/{experience_id}")
async def get_experience(experience_id: str):
    experience = await db.experiences.find_one({"id": experience_id}, {"_id": 0})
    if not experience:
        raise HTTPException(status_code=404, detail="Experience not found")
    return experience

@api_router.get("/nightlife-events")
async def get_nightlife_events():
    events = await db.nightlife_events.find({}, {"_id": 0}).to_list(50)
    return events

@api_router.get("/nightlife-events/{event_id}")
async def get_nightlife_event(event_id: str):
    event = await db.nightlife_events.find_one({"id": event_id}, {"_id": 0})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event

@api_router.get("/rentals")
async def get_rentals():
    rentals = await db.rentals.find({}, {"_id": 0}).to_list(100)
    return rentals

@api_router.get("/rentals/{rental_id}")
async def get_rental(rental_id: str):
    rental = await db.rentals.find_one({"id": rental_id}, {"_id": 0})
    if not rental:
        raise HTTPException(status_code=404, detail="Rental not found")
    return rental

@api_router.get("/map-info")
async def get_map_info():
    info = await db.map_info.find({}, {"_id": 0}).to_list(100)
    return info

@api_router.get("/transports")
async def get_transports():
    transports = await db.transports.find({}, {"_id": 0}).to_list(100)
    return transports

@api_router.get("/local-events")
async def get_local_events():
    events = await db.local_events.find({}, {"_id": 0}).to_list(50)
    return events

@api_router.get("/supermarket")
async def get_supermarket():
    return {
        "id": "supermarket-1",
        "name": "L'Angolo dei Sapori di Suersilario",
        "description": "Il supermercato di riferimento per i turisti di Torre Lapillo. Trovi tutto il necessario per la tua vacanza: panini farciti al momento, prodotti tipici pugliesi, confezioni sottovuoto e box regalo, oli extravergine locali, vini del Salento, snack, bevande fresche e molto altro.",
        "address": "Via Salento, 45 - Torre Lapillo (LE)",
        "phone": "+39 0833 565 890",
        "hours": {"weekdays": "07:30 - 13:30 / 16:30 - 21:00", "saturday": "07:30 - 13:30 / 16:30 - 22:00", "sunday": "08:00 - 13:00 / 17:00 - 21:00"},
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
    return [
        {"id": "pulizia-extra", "name": "Pulizia Straordinaria", "description": "Pulizia completa dell'alloggio durante il soggiorno", "price": "€50", "icon": "sparkles"},
        {"id": "cambio-biancheria", "name": "Cambio Biancheria Extra", "description": "Cambio completo di lenzuola e asciugamani", "price": "€25", "icon": "bed"},
        {"id": "checkin-romantico", "name": "Check-in Romantico", "description": "Petali di rosa, prosecco freddo e fragole fresche all'arrivo", "price": "€45", "icon": "heart"},
        {"id": "spesa-arrivo", "name": "Spesa in Casa all'Arrivo", "description": "Frigo rifornito con prodotti base al tuo arrivo", "price": "€35 + spesa", "icon": "shopping-cart"},
        {"id": "late-checkout", "name": "Late Check-out", "description": "Estensione check-out fino alle 14:00 (soggetto a disponibilità)", "price": "€30", "icon": "clock"}
    ]

@api_router.get("/troubleshooting")
async def get_troubleshooting():
    return [
        {"id": "piano-cottura", "title": "Il piano cottura non si accende", "solution": "Controlla che la bombola del gas sia aperta (ruota la valvola in senso antiorario). Se la bombola è vuota, contattaci per la sostituzione."},
        {"id": "acqua-calda", "title": "Non c'è acqua calda", "solution": "Verifica che lo scaldabagno sia acceso (interruttore nel bagno o quadro elettrico). Attendi 20-30 minuti per il riscaldamento."},
        {"id": "salvavita", "title": "È scattato il salvavita", "solution": "Vai al quadro elettrico e rialza la leva del salvavita. Se scatta di nuovo, scollega gli elettrodomestici uno alla volta per individuare il problema."},
        {"id": "wifi-lento", "title": "Wi-Fi lento o non funziona", "solution": "Riavvia il router staccando la spina per 30 secondi. Assicurati di essere connesso alla rete corretta."},
        {"id": "condizionatore", "title": "Il condizionatore non raffredda", "solution": "Imposta la temperatura sotto i 24°C. Controlla che i filtri non siano sporchi e che le finestre siano chiuse."},
        {"id": "lavandino", "title": "Il lavandino si scarica lentamente", "solution": "Usa lo sturalavandino sotto il lavello. Evita di buttare residui di cibo nello scarico."},
        {"id": "tv", "title": "La TV non si accende o non trova canali", "solution": "Controlla che la presa sia inserita e usa il telecomando corretto. Per la Smart TV, connettila al Wi-Fi dalle impostazioni."},
        {"id": "lavatrice", "title": "La lavatrice non parte", "solution": "Assicurati che lo sportello sia ben chiuso e che il rubinetto dell'acqua sia aperto."},
        {"id": "zanzare", "title": "Ci sono zanzare in casa", "solution": "Usa le zanzariere alle finestre. Trovi piastrine e spray nel mobile sotto il lavello della cucina."},
        {"id": "chiavi", "title": "Problemi con la serratura/chiavi", "solution": "Prova a lubrificare la serratura con lo spray che trovi nel cassetto dell'ingresso."}
    ]

@api_router.get("/daily-tips")
async def get_daily_tips():
    return [
        {"id": "1", "icon": "car", "text": "Parcheggio: arriva prima delle 9:00 per trovare posto vicino alla spiaggia"},
        {"id": "2", "icon": "umbrella", "text": "Spiaggia meno affollata oggi: Punta Prosciutto (zona nord)"},
        {"id": "3", "icon": "sun", "text": "Meteo: sole fino alle 18, poi possibile brezza serale"},
        {"id": "4", "icon": "utensils", "text": "Consiglio: prenota per cena entro le 17:00, alta stagione!"}
    ]

# ============== GUEST BOOKING TOKEN ROUTES ==============

@api_router.get("/booking/{token}")
async def get_guest_booking(token: str):
    """Validate guest booking token and return booking info if valid"""
    booking = await db.guest_bookings.find_one({"token": token}, {"_id": 0})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    # Check if booking is expired
    checkout = datetime.strptime(booking['checkout_date'], '%Y-%m-%d').date()
    today = datetime.now().date()
    
    if today > checkout:
        return {"valid": False, "message": "Il link di accesso è scaduto (checkout completato)", "booking": booking}
    
    checkin = datetime.strptime(booking['checkin_date'], '%Y-%m-%d').date()
    if today < checkin:
        days_until = (checkin - today).days
        return {"valid": True, "message": f"Benvenuto! Il tuo soggiorno inizia tra {days_until} giorni", "booking": booking}
    
    return {"valid": True, "message": "Benvenuto! Buon soggiorno", "booking": booking}

# ============== BOOKING SUBMISSION ROUTES ==============

@api_router.post("/rental-bookings")
async def create_rental_booking(booking: RentalBookingCreate):
    booking_id = str(uuid.uuid4())
    doc = {
        "id": booking_id,
        **booking.model_dump(),
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.rental_bookings.insert_one(doc)
    
    # Send email notification
    subject, html = build_booking_email("Prenotazione Noleggio", {
        "Servizio": booking.rental_name,
        "Nome": f"{booking.guest_name} {booking.guest_surname or ''}",
        "Telefono": booking.guest_phone,
        "Data inizio": booking.start_date,
        "Data fine": booking.end_date or booking.start_date,
        "Durata": booking.duration_type,
        "Consegna": "Sì (+€5)" if booking.delivery else "No",
        "Ritiro": "Sì (+€5)" if booking.pickup else "No",
        "Totale": booking.total_price or "Da calcolare",
        "Note": booking.notes or "-"
    })
    await send_notification_email(subject, html)
    
    return {"success": True, "booking_id": booking_id, "message": "Prenotazione inviata con successo!"}

@api_router.post("/restaurant-bookings")
async def create_restaurant_booking(booking: RestaurantBookingCreate):
    booking_id = str(uuid.uuid4())
    doc = {
        "id": booking_id,
        **booking.model_dump(),
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.restaurant_bookings.insert_one(doc)
    
    subject, html = build_booking_email("Prenotazione Ristorante", {
        "Ristorante": booking.restaurant_name,
        "Nome": f"{booking.guest_name} {booking.guest_surname or ''}",
        "Telefono": booking.guest_phone,
        "Data": booking.date,
        "Ora": booking.time,
        "Persone": str(booking.num_people),
        "Note": booking.notes or "-"
    })
    await send_notification_email(subject, html)
    
    return {"success": True, "booking_id": booking_id, "message": "Prenotazione inviata con successo!"}

@api_router.post("/beach-bookings")
async def create_beach_booking(booking: BeachBookingCreate):
    booking_id = str(uuid.uuid4())
    doc = {
        "id": booking_id,
        **booking.model_dump(),
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.beach_bookings.insert_one(doc)
    
    subject, html = build_booking_email("Prenotazione Lido", {
        "Lido": booking.beach_name,
        "Nome": f"{booking.guest_name} {booking.guest_surname or ''}",
        "Telefono": booking.guest_phone,
        "Data": booking.date,
        "Durata": booking.duration,
        "Fila": booking.row_preference,
        "Ombrellone": booking.umbrella_type,
        "Note": booking.notes or "-"
    })
    await send_notification_email(subject, html)
    
    return {"success": True, "booking_id": booking_id, "message": "Prenotazione inviata con successo!"}

@api_router.post("/experience-bookings")
async def create_experience_booking(booking: ExperienceBookingCreate):
    booking_id = str(uuid.uuid4())
    doc = {
        "id": booking_id,
        **booking.model_dump(),
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.experience_bookings.insert_one(doc)
    
    subject, html = build_booking_email("Prenotazione Esperienza", {
        "Esperienza": booking.experience_name,
        "Nome": f"{booking.guest_name} {booking.guest_surname or ''}",
        "Telefono": booking.guest_phone,
        "Data": booking.date,
        "Ora": booking.time or "Da definire",
        "Partecipanti": str(booking.num_people),
        "Note": booking.notes or "-"
    })
    await send_notification_email(subject, html)
    
    return {"success": True, "booking_id": booking_id, "message": "Prenotazione inviata con successo!"}

@api_router.post("/nightlife-bookings")
async def create_nightlife_booking(booking: NightlifeBookingCreate):
    booking_id = str(uuid.uuid4())
    doc = {
        "id": booking_id,
        **booking.model_dump(),
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.nightlife_bookings.insert_one(doc)
    
    package_label = "Solo Ingresso" if booking.package == "entry_only" else "Ingresso + Trasporto A/R"
    subject, html = build_booking_email("Prenotazione Evento/Discoteca", {
        "Evento": booking.event_name,
        "Nome": f"{booking.guest_name} {booking.guest_surname or ''}",
        "Telefono": booking.guest_phone,
        "Pacchetto": package_label,
        "Persone": str(booking.num_people),
        "Punto ritiro": booking.pickup_point or "-",
        "Note": booking.notes or "-"
    })
    await send_notification_email(subject, html)
    
    return {"success": True, "booking_id": booking_id, "message": "Prenotazione inviata con successo!"}

@api_router.post("/transport-requests")
async def create_transport_request(request: TransportRequestCreate):
    request_id = str(uuid.uuid4())
    doc = {
        "id": request_id,
        **request.model_dump(),
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.transport_requests.insert_one(doc)
    
    subject, html = build_booking_email("Richiesta Trasporto", {
        "Tipo": request.transport_type,
        "Nome": f"{request.guest_name} {request.guest_surname or ''}",
        "Telefono": request.guest_phone,
        "Data": request.date,
        "Ora": request.time or "Da definire",
        "Persone": str(request.num_people),
        "Tratta": request.route,
        "Note": request.notes or "-"
    })
    await send_notification_email(subject, html)
    
    return {"success": True, "request_id": request_id, "message": "Richiesta inviata con successo!"}

@api_router.post("/support-tickets")
async def create_support_ticket(ticket: SupportTicketCreate):
    ticket_id = str(uuid.uuid4())
    ticket_number = f"TKT-{datetime.now().strftime('%Y%m%d')}-{secrets.token_hex(3).upper()}"
    doc = {
        "id": ticket_id,
        "ticket_number": ticket_number,
        **ticket.model_dump(),
        "status": "open",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.support_tickets.insert_one(doc)
    
    urgency_label = {"urgente": "🔴 URGENTE", "medio": "🟡 Medio", "basso": "🟢 Basso"}.get(ticket.urgency, ticket.urgency)
    subject, html = build_booking_email(f"Ticket Assistenza {urgency_label}", {
        "Numero Ticket": ticket_number,
        "Struttura": ticket.property_slug,
        "Urgenza": urgency_label,
        "Contatto preferito": ticket.contact_preference,
        "Nome": ticket.guest_name or "-",
        "Telefono": ticket.guest_phone or "-",
        "Descrizione": ticket.description
    })
    await send_notification_email(subject, html)
    
    return {"success": True, "ticket_id": ticket_id, "ticket_number": ticket_number, "message": "Ticket inviato con successo!"}

@api_router.post("/extra-service-requests")
async def create_extra_service_request(request: ExtraServiceRequestCreate):
    request_id = str(uuid.uuid4())
    doc = {
        "id": request_id,
        **request.model_dump(),
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.extra_service_requests.insert_one(doc)
    
    subject, html = build_booking_email("Richiesta Servizio Extra", {
        "Servizio": request.service_type,
        "Struttura": request.property_slug,
        "Nome": f"{request.guest_name} {request.guest_surname or ''}",
        "Telefono": request.guest_phone,
        "Data": request.date,
        "Ora": request.time or "Da definire",
        "Note": request.notes or "-"
    })
    await send_notification_email(subject, html)
    
    return {"success": True, "request_id": request_id, "message": "Richiesta inviata con successo!"}

# ============== AUTH ROUTES ==============

@api_router.post("/admin/login")
async def admin_login(login: AdminLogin):
    admin = await db.admins.find_one({"email": login.email}, {"_id": 0})
    if not admin or not verify_password(login.password, admin['password_hash']):
        raise HTTPException(status_code=401, detail="Credenziali non valide")
    token = create_token(admin['id'])
    return {"token": token, "email": admin['email'], "name": admin.get('name', 'Admin')}

@api_router.get("/admin/me")
async def get_admin_me(admin: dict = Depends(get_current_admin)):
    return {"email": admin['email'], "id": admin['id'], "name": admin.get('name', 'Admin')}

# ============== ADMIN CRUD ROUTES ==============

# Properties
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

@api_router.post("/admin/properties/clone/{source_slug}")
async def admin_clone_property(source_slug: str, new_name: str, new_slug: str, admin: dict = Depends(get_current_admin)):
    """Clone an existing property as a template"""
    source = await db.properties.find_one({"slug": source_slug}, {"_id": 0})
    if not source:
        raise HTTPException(status_code=404, detail="Source property not found")
    
    # Create new property based on source
    new_prop = {**source}
    new_prop['id'] = str(uuid.uuid4())
    new_prop['name'] = new_name
    new_prop['slug'] = new_slug
    new_prop['created_at'] = datetime.now(timezone.utc).isoformat()
    
    await db.properties.insert_one(new_prop)
    return {"success": True, "id": new_prop['id'], "slug": new_slug}

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

# Guest Bookings (tokens)
@api_router.get("/admin/guest-bookings")
async def admin_get_guest_bookings(admin: dict = Depends(get_current_admin)):
    bookings = await db.guest_bookings.find({}, {"_id": 0}).to_list(100)
    return bookings

@api_router.post("/admin/guest-bookings")
async def admin_create_guest_booking(booking: GuestBookingCreate, admin: dict = Depends(get_current_admin)):
    booking_obj = GuestBooking(**booking.model_dump())
    doc = booking_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.guest_bookings.insert_one(doc)
    return {"success": True, "id": booking_obj.id, "token": booking_obj.token, "link": f"/p/{booking_obj.token}"}

@api_router.delete("/admin/guest-bookings/{booking_id}")
async def admin_delete_guest_booking(booking_id: str, admin: dict = Depends(get_current_admin)):
    result = await db.guest_bookings.delete_one({"id": booking_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Booking not found")
    return {"success": True}

# Beaches
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

# Restaurants
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

# Experiences
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

# Rentals
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

# Map Info
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

# Transports
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

# Admin View All Requests
@api_router.get("/admin/all-requests")
async def admin_get_all_requests(admin: dict = Depends(get_current_admin)):
    """Get all requests from all collections"""
    rental_bookings = await db.rental_bookings.find({}, {"_id": 0}).to_list(100)
    restaurant_bookings = await db.restaurant_bookings.find({}, {"_id": 0}).to_list(100)
    beach_bookings = await db.beach_bookings.find({}, {"_id": 0}).to_list(100)
    experience_bookings = await db.experience_bookings.find({}, {"_id": 0}).to_list(100)
    nightlife_bookings = await db.nightlife_bookings.find({}, {"_id": 0}).to_list(100)
    transport_requests = await db.transport_requests.find({}, {"_id": 0}).to_list(100)
    support_tickets = await db.support_tickets.find({}, {"_id": 0}).to_list(100)
    extra_service_requests = await db.extra_service_requests.find({}, {"_id": 0}).to_list(100)
    
    return {
        "rental_bookings": rental_bookings,
        "restaurant_bookings": restaurant_bookings,
        "beach_bookings": beach_bookings,
        "experience_bookings": experience_bookings,
        "nightlife_bookings": nightlife_bookings,
        "transport_requests": transport_requests,
        "support_tickets": support_tickets,
        "extra_service_requests": extra_service_requests
    }

@api_router.put("/admin/request-status/{collection}/{request_id}")
async def admin_update_request_status(collection: str, request_id: str, status: str, admin: dict = Depends(get_current_admin)):
    """Update status of any request"""
    collection_map = {
        "rental": "rental_bookings",
        "restaurant": "restaurant_bookings",
        "beach": "beach_bookings",
        "experience": "experience_bookings",
        "nightlife": "nightlife_bookings",
        "transport": "transport_requests",
        "ticket": "support_tickets",
        "extra": "extra_service_requests"
    }
    col_name = collection_map.get(collection)
    if not col_name:
        raise HTTPException(status_code=400, detail="Invalid collection")
    
    result = await db[col_name].update_one({"id": request_id}, {"$set": {"status": status}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Request not found")
    return {"success": True}

# ============== SEED DATA ==============

@api_router.post("/seed")
async def seed_database():
    existing_admin = await db.admins.find_one({"email": ADMIN_EMAIL})
    if existing_admin:
        return {"message": "Database already seeded"}
    
    # Create admin with new credentials
    admin_doc = {
        "id": str(uuid.uuid4()),
        "email": ADMIN_EMAIL,
        "name": "Nico",
        "password_hash": hash_password("Thegame2000")
    }
    await db.admins.insert_one(admin_doc)
    
    # Extended FAQ (30 items)
    extended_faq = [
        {"question": "Come funziona il check-in?", "answer": "Il check-in è disponibile dalle 15:00 alle 20:00. Riceverai le istruzioni per il ritiro delle chiavi via WhatsApp il giorno dell'arrivo."},
        {"question": "A che ora devo fare il check-out?", "answer": "Il check-out è entro le 10:00. Lascia le chiavi sul tavolo della cucina e porta via i rifiuti."},
        {"question": "Dove posso parcheggiare?", "answer": "Hai un posto auto privato nel cortile interno. Parcheggio comunale gratuito a 200m."},
        {"question": "Come funziona la raccolta differenziata?", "answer": "Calendario sul frigorifero. Separa: plastica, carta, umido, vetro, indifferenziato."},
        {"question": "Quali sono gli orari di silenzio?", "answer": "Silenzio dalle 23:00 alle 8:00 e dalle 14:00 alle 16:30."},
        {"question": "Come funziona l'aria condizionata?", "answer": "Telecomando nel cassetto del comodino. Max 24°C, finestre chiuse."},
        {"question": "Come faccio ad avere acqua calda?", "answer": "Scaldabagno sempre attivo. Se manca, controlla interruttore in bagno."},
        {"question": "Come funziona la bombola del gas?", "answer": "Valvola sotto il piano cottura. Gira in senso antiorario per aprire."},
        {"question": "Dove trovo la biancheria extra?", "answer": "Armadio camera da letto, ripiano in alto."},
        {"question": "È previsto un servizio di pulizia?", "answer": "Pulizia finale inclusa. Extra durante soggiorno: €50."},
        {"question": "Posso portare animali?", "answer": "Sì, previo accordo. Supplemento €30 per pulizia extra."},
        {"question": "La casa è adatta ai bambini?", "answer": "Sì, family-friendly. Lettino/culla su richiesta."},
        {"question": "Posso invitare ospiti extra?", "answer": "Solo ospiti dichiarati. Extra non ammessi senza preavviso."},
        {"question": "È possibile fumare in casa?", "answer": "No, vietato all'interno. Puoi fumare sul balcone."},
        {"question": "Ci sono regole condominiali?", "answer": "Rispetta silenzio, chiudi portone, parcheggia nello spazio assegnato."},
        {"question": "Come funziona la serratura?", "answer": "Chiave tradizionale. Due mandate per chiudere."},
        {"question": "Qual è la password del Wi-Fi?", "answer": "Nome rete e password nella sezione Wi-Fi dell'app."},
        {"question": "Come collego la Smart TV?", "answer": "TV già connessa al Wi-Fi. Accedi con tuoi account Netflix/Prime."},
        {"question": "Quali elettrodomestici ci sono?", "answer": "Frigo, piano cottura, forno, microonde, lavatrice, ferro, asciugacapelli."},
        {"question": "Cosa devo fare in caso di emergenza?", "answer": "Emergenze gravi: 112. Problemi casa: sezione Guasti & Assistenza."},
        {"question": "Come posso chiamare un taxi?", "answer": "Sezione 'Senza Auto' con tutti i contatti NCC."},
        {"question": "C'è un supermercato vicino?", "answer": "L'Angolo dei Sapori a 300m. Vedi card nella home."},
        {"question": "Dove noleggio attrezzatura spiaggia?", "answer": "Sezione 'Noleggi' con prenotazione e consegna a domicilio."},
        {"question": "Come funziona la lavatrice?", "answer": "Nel bagno. Detersivo sotto il lavello. Cotone 40°, delicati 30°."},
        {"question": "Posso richiedere il late check-out?", "answer": "Sì, fino alle 14:00. €30, soggetto a disponibilità."},
        {"question": "C'è un kit di primo soccorso?", "answer": "Nel mobile del bagno: cerotti, disinfettante, antidolorifici."},
        {"question": "Come funzionano le zanzariere?", "answer": "Chiudile sempre la sera. Piastrine sotto il lavello cucina."},
        {"question": "Posso fare il barbecue?", "answer": "Se presente, rispetta norme antincendio. No fuochi su balcone."},
        {"question": "Dove butto l'olio esausto?", "answer": "In bottiglia, poi isola ecologica o contenitore supermercato."},
        {"question": "Come lascio una recensione?", "answer": "Sulla piattaforma dove hai prenotato dopo il check-out."}
    ]
    
    # Property
    property_doc = {
        "id": str(uuid.uuid4()),
        "name": "Casa Brezza",
        "slug": "casa-brezza",
        "wifi_name": "CasaBrezzaWifi",
        "wifi_password": "Benvenuti2024",
        "checkin_time": "15:00 - 20:00",
        "checkin_instructions": "Ritira le chiavi dalla cassetta di sicurezza accanto alla porta. Il codice ti sarà inviato via WhatsApp.",
        "checkout_time": "Entro le 10:00",
        "checkout_instructions": "Lascia le chiavi sul tavolo della cucina. Chiudi finestre e porta via i rifiuti.",
        "house_rules": ["Non fumare all'interno", "No feste o eventi", "Silenzio 23:00-8:00", "Animali previo accordo", "Max ospiti dichiarati"],
        "host_name": "Marco",
        "host_phone": "+393293236473",
        "emergency_contacts": [{"name": "Emergenze", "phone": "112"}, {"name": "Guardia Medica", "phone": "0833 569 111"}],
        "faq": extended_faq,
        "image_url": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.properties.insert_one(property_doc)
    
    # Beaches
    beaches = [
        {"id": str(uuid.uuid4()), "name": "Spiaggia di Torre Lapillo", "description": "Spiaggia principale, sabbia fine e acque cristalline. Ideale per famiglie.", "distance": "300m", "category": "libera", "map_url": "https://maps.google.com/?q=40.2844,17.8573", "image_url": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800", "is_recommended": True, "parking_info": "Parcheggio comunale gratuito a 100m. In alta stagione arriva presto.", "best_time": "Mattina presto (8-10) o tardo pomeriggio.", "tips": "Porta ombrellone e acqua. Bar sulla spiaggia.", "has_sunbeds": False},
        {"id": str(uuid.uuid4()), "name": "Lido Tabu", "description": "Stabilimento elegante con tutti i comfort: lettini premium, ombrelloni, bar e ristorante.", "distance": "400m", "category": "attrezzata", "map_url": "https://maps.google.com/?q=40.2850,17.8580", "image_url": "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800", "is_recommended": True, "parking_info": "Parcheggio privato €5/giorno.", "best_time": "Tutto il giorno. Aperitivo al tramonto imperdibile.", "tips": "Prenota in anticipo in agosto.", "has_sunbeds": True},
        {"id": str(uuid.uuid4()), "name": "Punta Prosciutto", "description": "Una delle spiagge più belle della Puglia. Sabbia bianchissima e mare caraibico.", "distance": "5 km", "category": "libera", "map_url": "https://maps.google.com/?q=40.2685,17.8039", "image_url": "https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=800", "is_recommended": True, "parking_info": "Parcheggi a pagamento €5-10/giorno. Arriva presto!", "best_time": "Mattina. Tramonto spettacolare.", "tips": "Porta tutto, pochi servizi. Acqua essenziale.", "has_sunbeds": False},
        {"id": str(uuid.uuid4()), "name": "Lido Bahia", "description": "Stabilimento trendy, musica lounge, aperitivi con DJ set.", "distance": "600m", "category": "giovani", "map_url": "https://maps.google.com/?q=40.2860,17.8590", "image_url": "https://images.unsplash.com/photo-1520454974749-611b7248ffdb?w=800", "is_recommended": False, "parking_info": "Parcheggio libero nelle vicinanze.", "best_time": "Pomeriggio per l'atmosfera.", "tips": "Perfetto per giovani coppie.", "has_sunbeds": True},
        {"id": str(uuid.uuid4()), "name": "Spiaggia Porto Cesareo", "description": "Fondali bassi, perfetta per bambini. Molti servizi.", "distance": "8 km", "category": "family", "map_url": "https://maps.google.com/?q=40.2640,17.8970", "image_url": "https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?w=800", "is_recommended": False, "parking_info": "Parcheggi comunali e privati.", "best_time": "Tutto il giorno.", "tips": "Tanti ristoranti sul lungomare.", "has_sunbeds": True}
    ]
    await db.beaches.insert_many(beaches)
    
    # Restaurants
    restaurants = [
        {"id": str(uuid.uuid4()), "name": "Da Cosimino", "description": "Cucina di mare tradizionale. Frittura di paranza, spaghetti ai ricci.", "category": "pesce", "phone": "+390833565123", "map_url": "https://maps.google.com/?q=40.2845,17.8575", "image_url": "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800", "is_recommended": True, "price_range": "€€-€€€", "hours": "12:30-15:00 / 19:30-23:00", "reviews": [{"author": "Marco R.", "text": "Miglior pesce della zona!", "rating": 5}]},
        {"id": str(uuid.uuid4()), "name": "Pizzeria Il Forno", "description": "Pizza napoletana, forno a legna, impasto leggero.", "category": "pizzeria", "phone": "+390833565456", "map_url": "https://maps.google.com/?q=40.2848,17.8578", "image_url": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800", "is_recommended": True, "price_range": "€", "hours": "19:00-24:00", "reviews": [{"author": "Giovanni P.", "text": "Pizza eccezionale!", "rating": 5}]},
        {"id": str(uuid.uuid4()), "name": "Braceria La Brace", "description": "Carni alla griglia di alta qualità.", "category": "carne", "phone": "+390833565789", "map_url": "https://maps.google.com/?q=40.2842,17.8572", "image_url": "https://images.unsplash.com/photo-1544025162-d76694265947?w=800", "is_recommended": False, "price_range": "€€€", "hours": "19:30-23:30", "reviews": [{"author": "Andrea F.", "text": "Carne top!", "rating": 5}]},
        {"id": str(uuid.uuid4()), "name": "Bar del Corso", "description": "Pasticciotto, caffè leccese, aperitivi al tramonto.", "category": "colazione", "phone": "+390833565111", "map_url": "https://maps.google.com/?q=40.2846,17.8576", "image_url": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800", "is_recommended": True, "price_range": "€", "hours": "06:30-01:00", "reviews": [{"author": "Chiara L.", "text": "Pasticciotto divino!", "rating": 5}]}
    ]
    await db.restaurants.insert_many(restaurants)
    
    # Experiences
    experiences = [
        {"id": str(uuid.uuid4()), "name": "Gita in Barca alle Isole", "description": "Escursione alle isole di Porto Cesareo con snorkeling e pranzo a bordo.", "category": "barca", "price_info": "€45/persona", "contact_phone": "+393293236473", "image_url": "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800", "is_top": True, "duration": "Intera giornata (9:00-17:00)", "included": ["Skipper", "Snorkeling", "Pranzo", "Bevande"], "extras": ["Aperitivo tramonto +€15"], "min_participants": 4},
        {"id": str(uuid.uuid4()), "name": "Tour Lecce Barocca", "description": "Visita guidata al centro storico di Lecce.", "category": "escursioni", "price_info": "€25/persona", "contact_phone": "+393293236473", "image_url": "https://images.unsplash.com/photo-1534445867742-43195f401b6c?w=800", "is_top": True, "duration": "Mezza giornata", "included": ["Guida", "Ingressi"], "extras": ["Degustazione +€5"], "min_participants": 2},
        {"id": str(uuid.uuid4()), "name": "Alberobello e Valle d'Itria", "description": "Escursione ai trulli UNESCO.", "category": "borghi", "price_info": "€40/persona", "contact_phone": "+393293236473", "image_url": "https://images.unsplash.com/photo-1568797629192-789acf8e4df3?w=800", "is_top": True, "duration": "Intera giornata", "included": ["Transfer", "Guida"], "extras": ["Pranzo masseria +€25"], "min_participants": 4},
        {"id": str(uuid.uuid4()), "name": "Aperitivo Tramonto in Barca", "description": "Mini crociera al tramonto con aperitivo gourmet.", "category": "barca", "price_info": "€35/persona", "contact_phone": "+393293236473", "image_url": "https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?w=800", "is_top": True, "duration": "2-3 ore", "included": ["Aperitivo", "Prosecco", "Skipper"], "extras": [], "min_participants": 4}
    ]
    await db.experiences.insert_many(experiences)
    
    # Nightlife Events
    nightlife_events = [
        {"id": str(uuid.uuid4()), "name": "Praja Summer Night", "venue": "Praja - Gallipoli", "date": "2025-08-15", "time": "23:00", "dress_code": "Elegante casual", "price_entry": "€20", "price_with_transport": "€35", "image_url": "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800", "status": "available", "min_participants": 4, "pickup_points": ["Torre Lapillo centro", "Via Salento", "Supermercato"], "notes": "Partenza 22:30, rientro ~04:00"},
        {"id": str(uuid.uuid4()), "name": "Samsara Beach Party", "venue": "Samsara Beach - Gallipoli", "date": "2025-08-16", "time": "22:00", "dress_code": "Beach chic", "price_entry": "€25", "price_with_transport": "€40", "image_url": "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800", "status": "limited", "min_participants": 4, "pickup_points": ["Torre Lapillo centro", "Via Salento"], "notes": "Evento esclusivo, posti limitati"},
        {"id": str(uuid.uuid4()), "name": "Rio Bo Latin Night", "venue": "Rio Bo - Gallipoli", "date": "2025-08-17", "time": "23:30", "dress_code": "Casual", "price_entry": "€15", "price_with_transport": "€30", "image_url": "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800", "status": "available", "min_participants": 4, "pickup_points": ["Torre Lapillo centro"], "notes": "Serata latina, musica dal vivo"},
        {"id": str(uuid.uuid4()), "name": "Parco Gondar Festival", "venue": "Parco Gondar - Gallipoli", "date": "2025-08-20", "time": "21:00", "dress_code": "Casual", "price_entry": "€30", "price_with_transport": "€45", "image_url": "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800", "status": "available", "min_participants": 4, "pickup_points": ["Torre Lapillo centro", "Via Salento", "Supermercato"], "notes": "Festival musicale all'aperto"}
    ]
    await db.nightlife_events.insert_many(nightlife_events)
    
    # Rentals with numeric prices
    rentals = [
        {"id": str(uuid.uuid4()), "name": "Kit Spiaggia Completo", "description": "Ombrellone, 2 sdraio, borsa frigo.", "daily_price": 8, "weekly_price": 45, "rules": "Riconsegna entro le 20:00.", "image_url": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800", "category": "mare"},
        {"id": str(uuid.uuid4()), "name": "SUP", "description": "Tavola SUP gonfiabile, pagaia, giubbotto.", "daily_price": 20, "weekly_price": 100, "rules": "Solo nuotatori esperti. Vietato con mare mosso.", "image_url": "https://images.unsplash.com/photo-1526188717906-ab4a2f949f53?w=800", "category": "mare"},
        {"id": str(uuid.uuid4()), "name": "Kayak Singolo", "description": "Kayak sit-on-top, pagaia, giubbotto.", "daily_price": 18, "weekly_price": 90, "rules": "Solo mare calmo.", "image_url": "https://images.unsplash.com/photo-1572111866787-bc7632c96e5f?w=800", "category": "mare"},
        {"id": str(uuid.uuid4()), "name": "Kayak Doppio", "description": "Kayak biposto, 2 pagaie, 2 giubbotti.", "daily_price": 25, "weekly_price": 120, "rules": "Minimo 2 persone.", "image_url": "https://images.unsplash.com/photo-1572111866787-bc7632c96e5f?w=800", "category": "mare"},
        {"id": str(uuid.uuid4()), "name": "Set Snorkeling", "description": "Maschera, boccaglio, pinne. Taglie S/M/L.", "daily_price": 8, "weekly_price": 35, "rules": "Risciacquare dopo uso.", "image_url": "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800", "category": "mare"},
        {"id": str(uuid.uuid4()), "name": "Tenda Parasole", "description": "Tenda pop-up UV50+.", "daily_price": 10, "weekly_price": 50, "rules": "Smontare con vento forte.", "image_url": "https://images.unsplash.com/photo-1495954484750-af469f2f9be5?w=800", "category": "mare"},
        {"id": str(uuid.uuid4()), "name": "Carrellino Spiaggia", "description": "Carrello pieghevole ruote larghe.", "daily_price": 5, "weekly_price": 25, "rules": "Max 50kg.", "image_url": "https://images.unsplash.com/photo-1495954484750-af469f2f9be5?w=800", "category": "mare"},
        {"id": str(uuid.uuid4()), "name": "Bicicletta City", "description": "Bici con cestino, casco, lucchetto.", "daily_price": 10, "weekly_price": 50, "rules": "Casco obbligatorio.", "image_url": "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800", "category": "spostamenti"},
        {"id": str(uuid.uuid4()), "name": "Scooter 125cc", "description": "Automatico, 2 caschi, bauletto. Patente B.", "daily_price": 35, "weekly_price": 180, "rules": "Patente B, min 18 anni.", "image_url": "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800", "category": "spostamenti"},
        {"id": str(uuid.uuid4()), "name": "Auto Fiat Panda", "description": "Utilitaria, AC, km illimitati.", "daily_price": 45, "weekly_price": 250, "rules": "Patente B 1+ anno, min 21 anni.", "image_url": "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800", "category": "spostamenti"},
        {"id": str(uuid.uuid4()), "name": "Monopattino Elettrico", "description": "Autonomia 30km, max 25km/h.", "daily_price": 15, "weekly_price": 70, "rules": "Min 14 anni, casco obbligatorio.", "image_url": "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800", "category": "spostamenti"}
    ]
    await db.rentals.insert_many(rentals)
    
    # Map Info organized by category
    map_info = [
        # Emergenze
        {"id": str(uuid.uuid4()), "name": "Emergenze", "description": "Numero unico emergenze", "category": "emergenze", "map_url": "", "icon": "phone", "phone": "112", "hours": "24/7", "if_closed": None},
        {"id": str(uuid.uuid4()), "name": "Guardia Medica Porto Cesareo", "description": "Urgenze non gravi, notti e festivi", "category": "emergenze", "map_url": "https://maps.google.com/?q=40.2640,17.8970", "icon": "stethoscope", "phone": "0833 569 111", "hours": "20:00-8:00 + festivi", "if_closed": "Vai al Pronto Soccorso Lecce"},
        {"id": str(uuid.uuid4()), "name": "Ospedale Vito Fazzi Lecce", "description": "Pronto soccorso principale, 35 min in auto", "category": "emergenze", "map_url": "https://maps.google.com/?q=40.3525,18.1765", "icon": "hospital", "phone": "0832 661 111", "hours": "24/7", "if_closed": None},
        {"id": str(uuid.uuid4()), "name": "Farmacia Torre Lapillo", "description": "Farmacia di paese", "category": "emergenze", "map_url": "https://maps.google.com/?q=40.2847,17.8577", "icon": "pill", "phone": "0833 565 200", "hours": "9:00-13:00 / 17:00-21:00", "if_closed": "Farmacia di turno Porto Cesareo"},
        # Servizi
        {"id": str(uuid.uuid4()), "name": "Bancomat Poste", "description": "ATM Postamat", "category": "servizi", "map_url": "https://maps.google.com/?q=40.2846,17.8575", "icon": "credit-card", "phone": None, "hours": "24/7", "if_closed": None},
        {"id": str(uuid.uuid4()), "name": "Ufficio Postale", "description": "Spedizioni, bollettini", "category": "servizi", "map_url": "https://maps.google.com/?q=40.2846,17.8575", "icon": "mail", "phone": "0833 565 xxx", "hours": "8:30-13:30 Lun-Ven", "if_closed": "Porto Cesareo"},
        {"id": str(uuid.uuid4()), "name": "Tabacchi Edicola", "description": "Giornali, tabacchi, ricariche", "category": "servizi", "map_url": "https://maps.google.com/?q=40.2847,17.8576", "icon": "newspaper", "hours": "7:00-13:00 / 17:00-21:00", "if_closed": None},
        # Trasporti
        {"id": str(uuid.uuid4()), "name": "Fermata Bus STP", "description": "Bus per Lecce e Porto Cesareo", "category": "trasporti", "map_url": "https://maps.google.com/?q=40.2846,17.8575", "icon": "bus", "hours": "Vedi orari STP", "if_closed": None, "tips": "Biglietti in tabaccheria"},
        {"id": str(uuid.uuid4()), "name": "Stazione FS Lecce", "description": "Treni per Bari, Roma, Milano", "category": "trasporti", "map_url": "https://maps.google.com/?q=40.3534,18.1693", "icon": "train", "phone": "892 021", "hours": "5:00-24:00", "if_closed": None},
        # Parcheggi
        {"id": str(uuid.uuid4()), "name": "Parcheggio Comunale", "description": "Gratuito, non custodito", "category": "parcheggi", "map_url": "https://maps.google.com/?q=40.2840,17.8570", "icon": "car", "hours": "Sempre", "if_closed": None, "tips": "Arriva presto in estate!"},
        {"id": str(uuid.uuid4()), "name": "Parcheggio Lido Tabu", "description": "Privato clienti, €5/giorno", "category": "parcheggi", "map_url": "https://maps.google.com/?q=40.2852,17.8582", "icon": "car", "hours": "8:00-20:00", "if_closed": "Parcheggio comunale"},
        # Punti interesse
        {"id": str(uuid.uuid4()), "name": "Torre Lapillo", "description": "Torre costiera XVI secolo, simbolo del paese", "category": "punti_interesse", "map_url": "https://maps.google.com/?q=40.2848,17.8574", "icon": "landmark", "hours": "Visibile sempre"},
        {"id": str(uuid.uuid4()), "name": "Area Marina Protetta", "description": "Riserva naturale, snorkeling e diving", "category": "punti_interesse", "map_url": "https://maps.google.com/?q=40.2644,17.8947", "icon": "fish", "hours": "Info point 9-13/16-20"},
        {"id": str(uuid.uuid4()), "name": "Lecce", "description": "Firenze del Sud, barocco leccese", "category": "punti_interesse", "map_url": "https://maps.google.com/?q=40.3516,18.1718", "icon": "building", "tips": "35 min in auto, visita il centro storico"},
        {"id": str(uuid.uuid4()), "name": "Gallipoli", "description": "Perla dello Ionio, centro storico sul mare", "category": "punti_interesse", "map_url": "https://maps.google.com/?q=40.0558,17.9893", "icon": "building", "tips": "40 min, perfetta per cena e passeggiata"},
        {"id": str(uuid.uuid4()), "name": "Alberobello", "description": "Trulli UNESCO", "category": "punti_interesse", "map_url": "https://maps.google.com/?q=40.7847,17.2375", "icon": "home", "tips": "1h30, consigliato tour organizzato"}
    ]
    await db.map_info.insert_many(map_info)
    
    # Transports
    transports = [
        {"id": str(uuid.uuid4()), "name": "NCC Marco Transfer", "description": "Taxi privato, transfer aeroportuali, escursioni.", "category": "ncc", "contact_phone": "+393293236473", "price_info": "Brindisi €60 | Lecce €40 | Gallipoli €35", "cancellation_policy": "Gratuita fino 24h prima"},
        {"id": str(uuid.uuid4()), "name": "Tour Lecce + Otranto", "description": "Gita organizzata con guida.", "category": "gite", "contact_phone": "+393293236473", "price_info": "€45/persona", "min_participants": 4, "cancellation_policy": "Rimborso totale se < 4 partecipanti"},
        {"id": str(uuid.uuid4()), "name": "Tour Alberobello + Ostuni", "description": "Trulli UNESCO e città bianca.", "category": "gite", "contact_phone": "+393293236473", "price_info": "€50/persona", "min_participants": 4, "cancellation_policy": "Rimborso totale se < 4 partecipanti"},
        {"id": str(uuid.uuid4()), "name": "Bus STP Lecce", "description": "Autobus pubblico.", "category": "trasporto_pubblico", "contact_phone": "0832 359 142", "price_info": "€3.50 singola | €6 A/R"}
    ]
    await db.transports.insert_many(transports)
    
    # Local Events
    local_events = [
        {"id": str(uuid.uuid4()), "name": "Sagra del Pesce", "description": "Pesce fritto, grigliate e piatti tradizionali.", "date": "2025-08-14", "location": "Porto Cesareo - Lungomare", "category": "sagra", "image_url": "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800", "map_url": "https://maps.google.com/?q=40.2640,17.8970"},
        {"id": str(uuid.uuid4()), "name": "Mercatino Serale", "description": "Artigianato, prodotti tipici, street food.", "date": "Ogni mercoledì", "location": "Torre Lapillo - Piazza", "category": "mercato", "image_url": "https://images.unsplash.com/photo-1555529669-2269763671c0?w=800", "map_url": "https://maps.google.com/?q=40.2847,17.8577"},
        {"id": str(uuid.uuid4()), "name": "Festa Patronale", "description": "Luminarie, processione, fuochi d'artificio.", "date": "2025-08-15", "location": "Torre Lapillo Centro", "category": "evento", "image_url": "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800", "map_url": "https://maps.google.com/?q=40.2847,17.8577"}
    ]
    await db.local_events.insert_many(local_events)
    
    return {"message": "Database seeded successfully", "admin": {"email": ADMIN_EMAIL, "password": "Thegame2000"}}

# Include router and middleware
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

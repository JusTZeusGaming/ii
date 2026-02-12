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
from datetime import datetime, timezone
import jwt
import bcrypt

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
    category: str  # libera, attrezzata, family, giovani
    map_url: str
    image_url: str
    is_recommended: bool = False

class BeachCreate(BaseModel):
    name: str
    description: str
    distance: str
    category: str
    map_url: str
    image_url: str
    is_recommended: bool = False

class RestaurantBase(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    category: str  # carne, pesce, pizzeria, colazione
    phone: str
    map_url: str
    image_url: str
    is_recommended: bool = False

class RestaurantCreate(BaseModel):
    name: str
    description: str
    category: str
    phone: str
    map_url: str
    image_url: str
    is_recommended: bool = False

class ExperienceBase(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    category: str  # barca, escursioni, nightlife, borghi
    price_info: str
    contact_phone: str
    image_url: str
    is_top: bool = False

class ExperienceCreate(BaseModel):
    name: str
    description: str
    category: str
    price_info: str
    contact_phone: str
    image_url: str
    is_top: bool = False

class RentalBase(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    daily_price: str
    rules: str
    image_url: str

class RentalCreate(BaseModel):
    name: str
    description: str
    daily_price: str
    rules: str
    image_url: str

class MapInfoBase(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    category: str  # parcheggi, farmacia, guardia_medica, pronto_soccorso, stazioni, porti
    map_url: str
    icon: str

class MapInfoCreate(BaseModel):
    name: str
    description: str
    category: str
    map_url: str
    icon: str

class TransportBase(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    category: str  # navette, ncc, gite
    contact_phone: str
    price_info: str

class TransportCreate(BaseModel):
    name: str
    description: str
    category: str
    contact_phone: str
    price_info: str

class RentalBooking(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    rental_id: str
    rental_name: str
    guest_name: str
    guest_phone: str
    date: str
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class RentalBookingCreate(BaseModel):
    rental_id: str
    rental_name: str
    guest_name: str
    guest_phone: str
    date: str
    notes: Optional[str] = None

class TransportRequest(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    guest_name: str
    guest_phone: str
    date: str
    num_people: int
    route: str
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TransportRequestCreate(BaseModel):
    guest_name: str
    guest_phone: str
    date: str
    num_people: int
    route: str
    notes: Optional[str] = None

class AdminUser(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    password_hash: str

class AdminLogin(BaseModel):
    username: str
    password: str

class AdminCreate(BaseModel):
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
        "exp": datetime.now(timezone.utc).timestamp() + 86400  # 24h
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

@api_router.get("/restaurants", response_model=List[RestaurantBase])
async def get_restaurants():
    restaurants = await db.restaurants.find({}, {"_id": 0}).to_list(100)
    return restaurants

@api_router.get("/experiences", response_model=List[ExperienceBase])
async def get_experiences():
    experiences = await db.experiences.find({}, {"_id": 0}).to_list(100)
    return experiences

@api_router.get("/rentals", response_model=List[RentalBase])
async def get_rentals():
    rentals = await db.rentals.find({}, {"_id": 0}).to_list(100)
    return rentals

@api_router.get("/map-info", response_model=List[MapInfoBase])
async def get_map_info():
    info = await db.map_info.find({}, {"_id": 0}).to_list(100)
    return info

@api_router.get("/transports", response_model=List[TransportBase])
async def get_transports():
    transports = await db.transports.find({}, {"_id": 0}).to_list(100)
    return transports

@api_router.post("/rental-bookings")
async def create_rental_booking(booking: RentalBookingCreate):
    booking_obj = RentalBooking(**booking.model_dump())
    doc = booking_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.rental_bookings.insert_one(doc)
    return {"success": True, "booking_id": booking_obj.id}

@api_router.post("/transport-requests")
async def create_transport_request(request: TransportRequestCreate):
    req_obj = TransportRequest(**request.model_dump())
    doc = req_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.transport_requests.insert_one(doc)
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

# Properties
@api_router.get("/admin/properties", response_model=List[PropertyBase])
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

# Bookings (read-only for admin)
@api_router.get("/admin/rental-bookings")
async def admin_get_rental_bookings(admin: dict = Depends(get_current_admin)):
    bookings = await db.rental_bookings.find({}, {"_id": 0}).to_list(100)
    return bookings

@api_router.get("/admin/transport-requests")
async def admin_get_transport_requests(admin: dict = Depends(get_current_admin)):
    requests = await db.transport_requests.find({}, {"_id": 0}).to_list(100)
    return requests

# ============== SEED DATA ==============

@api_router.post("/seed")
async def seed_database():
    # Check if already seeded
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
    
    # Create property
    property_doc = {
        "id": str(uuid.uuid4()),
        "name": "Casa Brezza",
        "slug": "casa-brezza",
        "wifi_name": "CasaBrezzaWifi",
        "wifi_password": "Benvenuti2024",
        "checkin_time": "15:00 - 20:00",
        "checkin_instructions": "Ritira le chiavi dalla cassetta di sicurezza accanto alla porta. Il codice ti sarà inviato via WhatsApp il giorno dell'arrivo.",
        "checkout_time": "Entro le 10:00",
        "checkout_instructions": "Lascia le chiavi sul tavolo della cucina. Chiudi tutte le finestre e porta via i rifiuti nei bidoni condominiali.",
        "house_rules": [
            "Non fumare all'interno",
            "No feste o eventi",
            "Rispettare il silenzio dalle 23:00 alle 8:00",
            "Animali ammessi previo accordo",
            "Non superare il numero massimo di ospiti dichiarato"
        ],
        "host_name": "Marco",
        "host_phone": "+393293236473",
        "emergency_contacts": [
            {"name": "Emergenze", "phone": "112"},
            {"name": "Guardia Medica Porto Cesareo", "phone": "0833 569 111"}
        ],
        "faq": [
            {"question": "Come funziona l'aria condizionata?", "answer": "Il telecomando è nel cassetto del comodino. Impostare max 24°C per un comfort ottimale."},
            {"question": "Dove butto la spazzatura?", "answer": "I bidoni differenziati sono nel cortile condominiale. Calendario raccolta sul frigorifero."},
            {"question": "C'è il parcheggio?", "answer": "Sì, posto auto privato nel cortile interno."}
        ],
        "image_url": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.properties.insert_one(property_doc)
    
    # Seed beaches
    beaches = [
        {"id": str(uuid.uuid4()), "name": "Spiaggia di Torre Lapillo", "description": "La spiaggia principale del paese, sabbia fine e acque cristalline. Ideale per famiglie.", "distance": "300m", "category": "libera", "map_url": "https://maps.google.com/?q=40.2844,17.8573", "image_url": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800", "is_recommended": True},
        {"id": str(uuid.uuid4()), "name": "Lido Tabu", "description": "Stabilimento con tutti i comfort: lettini, ombrelloni, bar e ristorante. Perfetto per una giornata rilassante.", "distance": "400m", "category": "attrezzata", "map_url": "https://maps.google.com/?q=40.2850,17.8580", "image_url": "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800", "is_recommended": True},
        {"id": str(uuid.uuid4()), "name": "Punta Prosciutto", "description": "Una delle spiagge più belle della Puglia. Sabbia bianchissima e mare caraibico.", "distance": "5 km", "category": "libera", "map_url": "https://maps.google.com/?q=40.2685,17.8039", "image_url": "https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=800", "is_recommended": True},
        {"id": str(uuid.uuid4()), "name": "Lido Bahia", "description": "Stabilimento giovane e trendy con musica e aperitivi al tramonto.", "distance": "600m", "category": "giovani", "map_url": "https://maps.google.com/?q=40.2860,17.8590", "image_url": "https://images.unsplash.com/photo-1520454974749-611b7248ffdb?w=800", "is_recommended": False},
        {"id": str(uuid.uuid4()), "name": "Spiaggia di Porto Cesareo", "description": "Ampia spiaggia con fondali bassi, perfetta per i bambini.", "distance": "8 km", "category": "family", "map_url": "https://maps.google.com/?q=40.2640,17.8970", "image_url": "https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?w=800", "is_recommended": False}
    ]
    await db.beaches.insert_many(beaches)
    
    # Seed restaurants
    restaurants = [
        {"id": str(uuid.uuid4()), "name": "Ristorante Da Cosimino", "description": "Cucina di mare tradizionale salentina. Specialità: frittura di paranza e spaghetti ai ricci.", "category": "pesce", "phone": "+390833565123", "map_url": "https://maps.google.com/?q=40.2845,17.8575", "image_url": "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800", "is_recommended": True},
        {"id": str(uuid.uuid4()), "name": "Pizzeria Il Forno", "description": "Pizza napoletana cotta nel forno a legna. Impasto leggero e ingredienti di qualità.", "category": "pizzeria", "phone": "+390833565456", "map_url": "https://maps.google.com/?q=40.2848,17.8578", "image_url": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800", "is_recommended": True},
        {"id": str(uuid.uuid4()), "name": "Braceria La Brace", "description": "Carni alla griglia di altissima qualità. Tagliata, fiorentina e grigliate miste.", "category": "carne", "phone": "+390833565789", "map_url": "https://maps.google.com/?q=40.2842,17.8572", "image_url": "https://images.unsplash.com/photo-1544025162-d76694265947?w=800", "is_recommended": False},
        {"id": str(uuid.uuid4()), "name": "Bar del Corso", "description": "Colazioni con pasticciotto caldo, aperitivi al tramonto e cocktail serali.", "category": "colazione", "phone": "+390833565111", "map_url": "https://maps.google.com/?q=40.2846,17.8576", "image_url": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800", "is_recommended": True},
        {"id": str(uuid.uuid4()), "name": "Trattoria Nonna Maria", "description": "Piatti della tradizione pugliese: orecchiette, fave e cicorie, parmigiana.", "category": "carne", "phone": "+390833565222", "map_url": "https://maps.google.com/?q=40.2843,17.8571", "image_url": "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800", "is_recommended": False}
    ]
    await db.restaurants.insert_many(restaurants)
    
    # Seed experiences
    experiences = [
        {"id": str(uuid.uuid4()), "name": "Gita in Barca alle Isole", "description": "Escursione alle isole di Porto Cesareo con snorkeling e pranzo a bordo.", "category": "barca", "price_info": "Da €45/persona", "contact_phone": "+393293236473", "image_url": "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800", "is_top": True},
        {"id": str(uuid.uuid4()), "name": "Tour di Lecce Barocca", "description": "Visita guidata al centro storico di Lecce, la Firenze del Sud.", "category": "escursioni", "price_info": "Da €25/persona", "contact_phone": "+393293236473", "image_url": "https://images.unsplash.com/photo-1534445867742-43195f401b6c?w=800", "is_top": True},
        {"id": str(uuid.uuid4()), "name": "Alberobello e Valle d'Itria", "description": "Escursione ai trulli patrimonio UNESCO. Visita a Locorotondo e Ostuni.", "category": "borghi", "price_info": "Da €40/persona", "contact_phone": "+393293236473", "image_url": "https://images.unsplash.com/photo-1568797629192-789acf8e4df3?w=800", "is_top": True},
        {"id": str(uuid.uuid4()), "name": "Gallipoli by Night", "description": "Serata nella perla dello Ionio: cena, passeggiata e locali sul mare.", "category": "nightlife", "price_info": "Trasporto €15/persona", "contact_phone": "+393293236473", "image_url": "https://images.unsplash.com/photo-1514214246283-d427a95c5d2f?w=800", "is_top": False},
        {"id": str(uuid.uuid4()), "name": "Diving e Snorkeling", "description": "Immersioni guidate nei fondali cristallini di Porto Cesareo.", "category": "barca", "price_info": "Da €60/persona", "contact_phone": "+393293236473", "image_url": "https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?w=800", "is_top": False}
    ]
    await db.experiences.insert_many(experiences)
    
    # Seed rentals
    rentals = [
        {"id": str(uuid.uuid4()), "name": "Kit Spiaggia Completo", "description": "2 lettini, ombrellone, borsa frigo. Tutto il necessario per la spiaggia libera.", "daily_price": "€15/giorno", "rules": "Riconsegna entro le 20:00. Responsabilità per danni.", "image_url": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800"},
        {"id": str(uuid.uuid4()), "name": "Bicicletta City", "description": "Bici da passeggio con cestino. Perfetta per esplorare Torre Lapillo.", "daily_price": "€10/giorno", "rules": "Casco incluso. Lucchetto fornito. Riconsegna entro le 21:00.", "image_url": "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800"},
        {"id": str(uuid.uuid4()), "name": "SUP - Stand Up Paddle", "description": "Tavola SUP gonfiabile con pagaia e giubbotto salvagente.", "daily_price": "€20/giorno", "rules": "Solo per nuotatori esperti. Vietato con mare mosso.", "image_url": "https://images.unsplash.com/photo-1526188717906-ab4a2f949f53?w=800"},
        {"id": str(uuid.uuid4()), "name": "Kayak Doppio", "description": "Kayak a due posti con pagaie e giubbotti.", "daily_price": "€25/giorno", "rules": "Minimo 2 persone. Solo con mare calmo.", "image_url": "https://images.unsplash.com/photo-1572111866787-bc7632c96e5f?w=800"},
        {"id": str(uuid.uuid4()), "name": "Set Snorkeling", "description": "Maschera, boccaglio e pinne. Taglie disponibili: S, M, L.", "daily_price": "€8/giorno", "rules": "Risciacquare con acqua dolce dopo l'uso.", "image_url": "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800"},
        {"id": str(uuid.uuid4()), "name": "Carrellino da Spiaggia", "description": "Carrello pieghevole per trasportare attrezzatura in spiaggia.", "daily_price": "€5/giorno", "rules": "Carico massimo 30kg.", "image_url": "https://images.unsplash.com/photo-1495954484750-af469f2f9be5?w=800"}
    ]
    await db.rentals.insert_many(rentals)
    
    # Seed map info
    map_info = [
        {"id": str(uuid.uuid4()), "name": "Parcheggio Comunale", "description": "Parcheggio gratuito a 200m dalla spiaggia principale.", "category": "parcheggi", "map_url": "https://maps.google.com/?q=40.2840,17.8570", "icon": "car"},
        {"id": str(uuid.uuid4()), "name": "Parcheggio Lido Tabu", "description": "Parcheggio privato per clienti stabilimento. €5/giorno.", "category": "parcheggi", "map_url": "https://maps.google.com/?q=40.2852,17.8582", "icon": "car"},
        {"id": str(uuid.uuid4()), "name": "Farmacia Torre Lapillo", "description": "Aperta 9:00-13:00 / 17:00-21:00. Turni notturni a rotazione.", "category": "farmacia", "map_url": "https://maps.google.com/?q=40.2847,17.8577", "icon": "pill"},
        {"id": str(uuid.uuid4()), "name": "Guardia Medica Porto Cesareo", "description": "Servizio notturno e festivo. Tel: 0833 569 111", "category": "guardia_medica", "map_url": "https://maps.google.com/?q=40.2640,17.8970", "icon": "stethoscope"},
        {"id": str(uuid.uuid4()), "name": "Ospedale Vito Fazzi - Lecce", "description": "Pronto soccorso più vicino. 35 minuti in auto.", "category": "pronto_soccorso", "map_url": "https://maps.google.com/?q=40.3525,18.1765", "icon": "hospital"},
        {"id": str(uuid.uuid4()), "name": "Stazione FS Lecce", "description": "Stazione ferroviaria principale. Collegamenti per Bari e Roma.", "category": "stazioni", "map_url": "https://maps.google.com/?q=40.3534,18.1693", "icon": "train"},
        {"id": str(uuid.uuid4()), "name": "Porto di Gallipoli", "description": "Traghetti per isole e gite in barca.", "category": "porti", "map_url": "https://maps.google.com/?q=40.0558,17.9893", "icon": "anchor"}
    ]
    await db.map_info.insert_many(map_info)
    
    # Seed transports
    transports = [
        {"id": str(uuid.uuid4()), "name": "Navetta Spiagge", "description": "Servizio navetta gratuito per le principali spiagge. Partenze ogni ora.", "category": "navette", "contact_phone": "+393293236473", "price_info": "Gratuito"},
        {"id": str(uuid.uuid4()), "name": "NCC Marco Transfer", "description": "Servizio taxi privato. Aeroporto Brindisi, stazioni, escursioni.", "category": "ncc", "contact_phone": "+393293236473", "price_info": "Da €50 aeroporto"},
        {"id": str(uuid.uuid4()), "name": "Gita Lecce & Otranto", "description": "Tour organizzato con guida. Partenza ore 9:00, rientro ore 18:00.", "category": "gite", "contact_phone": "+393293236473", "price_info": "€35/persona"},
        {"id": str(uuid.uuid4()), "name": "Gita Alberobello", "description": "Escursione ai trulli. Include visita guidata e tempo libero.", "category": "gite", "contact_phone": "+393293236473", "price_info": "€40/persona"}
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

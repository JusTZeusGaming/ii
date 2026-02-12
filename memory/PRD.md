# Your Journey - Guest Portal Torre Lapillo

## Problem Statement
Web app "Guest Portal" mobile-first per ospiti di case vacanza a Torre Lapillo. Navigabile come un'app con bottom navigation, contenuti modificabili da admin panel.

## User Personas
1. **Ospite/Turista**: Info su alloggio, spiagge, ristoranti, esperienze, noleggi, trasporti
2. **Host/Admin**: Gestisce strutture, contenuti, visualizza prenotazioni e ticket

## Core Requirements (Static)
- Palette: Blu navy (#0F172A) + Giallo sabbia (#F59E0B) + Sfondi chiari
- Mobile-first (iPhone 13/14/15)
- Bottom navigation 4 tab (Guida, Alloggio, Servizi, Aiuto)
- Admin panel con CRUD completo
- WhatsApp: +39 3293236473

## What's Been Implemented

### ✅ PRIORITÀ 0 - FORM PRENOTAZIONI (Completato 12/02/2026)
- Form prenotazione noleggi funzionante
- Form prenotazione lidi funzionante
- Form prenotazione ristoranti funzionante
- Form prenotazione esperienze funzionante
- Form ticket assistenza funzionante con numero ticket automatico
- Calcolo automatico prezzi noleggi (giornaliero/settimanale + extras)

### ✅ PRIORITÀ 0 - ADMIN/CMS COMPLETO (Completato 12/02/2026)
- Admin panel completo con login (nico.suez2000@gmail.com / Thegame2000)
- Tab "Richieste": Visualizzazione TUTTE le prenotazioni e ticket con contatore
- Tab "Link Ospiti": Creazione link univoci con scadenza per ogni soggiorno
- CRUD strutture con copiatura link portale
- CRUD spiagge (con info parcheggio, orari, consigli, lettini)
- CRUD ristoranti (con fascia prezzo, orari)
- CRUD esperienze (con durata)
- CRUD noleggi (prezzi giornalieri/settimanali, categorie)
- Aggiornamento stato richieste (pending/confirmed/cancelled)

### ✅ PRIORITÀ 1 - LINK UNIVOCI PRENOTAZIONI (Completato 12/02/2026)
- Sistema link univoci `/p/TOKEN` implementato
- Validazione automatica date check-in/check-out
- Pagina GuestAccessPage per accesso ospiti
- Link scadono automaticamente dopo checkout

### ✅ PRIORITÀ 1 - NOTIFICHE EMAIL (Configurato 12/02/2026)
- Integrazione Resend configurata (RESEND_API_KEY in .env)
- Email inviate per ogni prenotazione e ticket
- Template HTML professionale per notifiche

### ✅ PRIORITÀ 2 - DASHBOARD (Completato)
- Card alloggio con immagine sfondo
- Badge meteo REALE (Open-Meteo API)
- Card Supermercato grande → pagina /supermercato
- Quick actions per navigazione rapida

### ✅ PRIORITÀ 3 - PAGINE DETTAGLIO (Completato)
- Spiagge: dettaglio con parcheggio, orari, consigli, form prenotazione lettini
- Ristoranti: dettaglio con recensioni, prezzi, form prenotazione
- Esperienze: dettaglio con incluso/extra, min partecipanti, form
- Noleggi: dettaglio con prezzi, regole, calcolo automatico totale

## Admin Credentials
- Email: `nico.suez2000@gmail.com`
- Password: `Thegame2000`
- URL: `/admin`

## URL Struttura
- Portale ospite: `/guida?struttura=casa-brezza`
- Link univoco ospite: `/p/TOKEN`

## Tech Stack
- Frontend: React 19, Tailwind CSS, Framer Motion, Shadcn/UI
- Backend: FastAPI, MongoDB (Motor), Open-Meteo API
- Auth: JWT + bcrypt
- Email: Resend

## API Endpoints Principali
```
# Public
GET  /api/weather
GET  /api/beaches, /api/beaches/{id}
GET  /api/restaurants, /api/restaurants/{id}
GET  /api/experiences, /api/experiences/{id}
GET  /api/rentals, /api/rentals/{id}
GET  /api/nightlife-events
GET  /api/properties/{slug}
GET  /api/booking/{token}

# Bookings (POST)
/api/rental-bookings
/api/beach-bookings
/api/restaurant-bookings
/api/experience-bookings
/api/nightlife-bookings
/api/support-tickets
/api/extra-service-requests

# Admin (Auth required)
POST /api/admin/login
GET  /api/admin/properties
POST /api/admin/properties
POST /api/admin/properties/clone/{slug}
PUT  /api/admin/properties/{id}
DELETE /api/admin/properties/{id}
GET  /api/admin/guest-bookings
POST /api/admin/guest-bookings
GET  /api/admin/all-requests
PUT  /api/admin/request-status/{collection}/{id}
# + CRUD per beaches, restaurants, experiences, rentals
```

## Prioritized Backlog

### P1 (Prossimi)
- [ ] Sezione "Nightlife" frontend completa
- [ ] Riorganizzare pagina "Mappe & Info" in categorie
- [ ] Generatore QR code per link struttura nell'admin
- [ ] Multi-lingua (IT/EN)

### P2 (Future)
- [ ] Tab Preferiti funzionante
- [ ] Notifiche push
- [ ] Pagamenti online per noleggi (Stripe)
- [ ] Calendario disponibilità noleggi real-time
- [ ] Eventi & Sagre
- [ ] Consigli rapidi

## Test Results (12/02/2026)
- Backend: 96% passed (27/28 tests)
- Frontend: 95% passed
- Test files: /app/test_reports/iteration_3.json

## Known Issues (Minor)
- Alcune immagini noleggi non si caricano (URL database da aggiornare)
- Prezzi nel database non normalizzati (mix string/number) - gestito frontend

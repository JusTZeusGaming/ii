# Your Journey - Guest Portal Torre Lapillo

## Problem Statement
Web app "Guest Portal" mobile-first per ospiti di case vacanza a Torre Lapillo. Navigabile come un'app con bottom navigation, contenuti modificabili da admin panel.

## User Personas
1. **Ospite/Turista**: Info su alloggio, spiagge, ristoranti, esperienze, noleggi, trasporti, nightlife
2. **Host/Admin**: Gestisce strutture, contenuti, visualizza prenotazioni e ticket

## Core Requirements (Static)
- Palette: Blu navy (#0F172A) + Giallo sabbia (#F59E0B) + Viola (#7C3AED) per Nightlife + Sfondi chiari
- Mobile-first (iPhone 13/14/15)
- Bottom navigation 4 tab (Guida, Alloggio, Servizi, Aiuto)
- Admin panel con CRUD completo
- WhatsApp: +39 3293236473

---

## What's Been Implemented

### ✅ BUG FIX P0 (Completati 12/02/2026)
1. **Persistenza struttura**: PropertyContext implementato - se entri con `?struttura=casa-bella`, rimani in Casa Bella ovunque
2. **Link generico + QR**: Ogni struttura ha pulsanti "Copia Link", "QR Code", "Apri Portale"
3. **Dropdown strutture**: Funziona correttamente nel form "Link Ospiti"

### ✅ NOTIFICHE P1 (Completate 12/02/2026)
- Email automatiche per TUTTE le richieste (prenotazioni, ticket)
- WhatsApp precompilato: link wa.me generato per conferme admin
- Pulsante conferma nell'admin che apre WhatsApp con messaggio precompilato

### ✅ NIGHTLIFE P2 (Completato 12/02/2026)
- Pagina `/nightlife` con eventi discoteca
- Banner "Nightlife & Discoteche" in pagina Attività
- Due opzioni prezzo: "Solo Ingresso" e "Ingresso + Navetta"
- Form prenotazione con selezione pacchetto e calcolo totale
- Pickup points per navetta

### ✅ METEO DETTAGLIATO P2 (Completato 12/02/2026)
- Badge meteo cliccabile nella Dashboard
- Pagina `/meteo` con:
  - Temperatura attuale, vento, umidità, visibilità
  - Previsioni orarie (prossime 12 ore)
  - Previsioni giornaliere (7 giorni)
  - Consiglio del giorno basato sul meteo

### ✅ ADMIN/CMS (Completato)
- Tab "Richieste": Tutte le prenotazioni con contatore badge
- Tab "Link Ospiti": Creazione link univoci `/p/TOKEN`
- Tab "Strutture" con:
  - CRUD completo strutture
  - Auto-generazione slug
  - Pulsante "Copia Link"
  - Pulsante "Genera QR" con download PNG
  - Pulsante "Apri Portale"
- CRUD per spiagge, ristoranti, esperienze, noleggi

---

## Admin Credentials
- Email: `nico.suez2000@gmail.com`
- Password: `Thegame2000`
- URL: `/admin`

## URL Strutture
- Portale generico: `/guida?struttura=casa-brezza`
- Link univoco ospite: `/p/TOKEN`
- Admin: `/admin/dashboard`

---

## Tech Stack
- Frontend: React 19, Tailwind CSS, Framer Motion, Shadcn/UI, qrcode.react
- Backend: FastAPI, MongoDB (Motor), Open-Meteo API, Resend
- Auth: JWT + bcrypt
- State: PropertyContext per persistenza struttura

## Test Results (12/02/2026)
- Backend: 100% passed (12/12 tests)
- Frontend: 100% passed
- Test files: `/app/test_reports/iteration_4.json`

---

## Prioritized Backlog

### P1 (Prossimi da fare)
- [ ] **Admin struttura completa**: WiFi, Check-in/out, Regole, FAQ, Guasti personalizzabili per struttura
- [ ] **Dashboard richieste migliorata**: Stati (Nuova/In lavorazione/Confermata/Rifiutata/Chiusa)
- [ ] **Servizi extra per struttura**: attivo/disattivo, prezzi diversi

### P2 (Medi)
- [ ] **Noleggi auto-conferma**: Calendario disponibilità + conferma automatica se disponibile
- [ ] **Ristoranti fasce orarie**: Giorni prenotabili, max coperti per fascia, dropdown invece di input
- [ ] **Upsell servizi**: Checkbox extra per esperienze con aggiornamento totale
- [ ] **Date fisse eventi**: Selezione solo date specifiche disponibili

### P3 (Future)
- [ ] Mappe & Info gestibile in admin con categorie
- [ ] Tab Preferiti funzionante
- [ ] Notifiche push
- [ ] Pagamenti online (Stripe)
- [ ] Multi-lingua (IT/EN)

---

## File di Riferimento Chiave
```
/app/
├── backend/
│   ├── server.py            # API FastAPI
│   └── .env                  # MONGO_URL, RESEND_API_KEY
└── frontend/
    ├── src/
    │   ├── context/
    │   │   └── PropertyContext.jsx   # Persistenza struttura
    │   ├── pages/
    │   │   ├── AdminDashboardPage.jsx  # Admin con QR
    │   │   ├── NightlifePage.jsx       # Eventi discoteca
    │   │   ├── WeatherPage.jsx         # Meteo dettagliato
    │   │   └── ...
    │   └── App.js
    └── package.json
```

---

## Known Working Features
- ✅ Login admin
- ✅ CRUD strutture con QR code
- ✅ Form prenotazioni (noleggi, ristoranti, esperienze, lidi, nightlife)
- ✅ Ticket assistenza
- ✅ Link univoci ospiti
- ✅ Persistenza struttura tra navigazione
- ✅ Meteo live + dettagliato
- ✅ Nightlife con pacchetti biglietto/navetta

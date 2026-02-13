# Your Journey - Guest Portal Torre Lapillo

## Problem Statement
Web app "Guest Portal" mobile-first per ospiti di case vacanza a Torre Lapillo.
Pannello admin per gestione strutture, prenotazioni, link ospiti.

## What's Been Implemented

### CORE FEATURES
- Dashboard ospite con meteo live cliccabile
- Persistenza struttura (PropertyContext)
- 4 tab navigazione: Guida, Alloggio, Servizi, Aiuto

### PRENOTAZIONI (Tutti i form funzionanti)
- Form noleggi con calcolo totale automatico
- Form ristoranti, esperienze, lidi/spiagge, nightlife
- Ticket assistenza con numero automatico

### ADMIN PANEL
- **Tab Richieste**: Tutte le prenotazioni con status change (Shadcn Select) + notifica WhatsApp su TUTTI i tipi di prenotazione
- **Tab Link Ospiti**: Dropdown strutture FUNZIONANTE (Shadcn Select, fix bug Safari/Radix)
- **Tab Strutture**: PropertyEditor con 8 tab (Base, WiFi, Check-in/out, Contatti, Regole, FAQ, Guasti, Servizi Extra)
- **Tab Spiagge/Ristoranti/Esperienze/Noleggi**: CRUD completo
- **Tab Mappe & Info**: 26 elementi
- **QR Code generator** per ogni struttura

### NIGHTLIFE & METEO
- Pagina `/nightlife` con eventi e form prenotazione
- Pagina `/meteo` con previsioni orarie e giornaliere

### NOTIFICHE
- Email automatiche admin (Resend)
- WhatsApp precompilato per conferme clienti (su cambio stato)

---

## Admin Credentials
- Email: `nico.suez2000@gmail.com`
- Password: `Thegame2000`
- URL: `/admin`

## Strutture Attive
- Casa Brezza (slug: `casa-brezza`)
- Casa Bella (slug: `casa-bella`)

---

## Bug Fix (13/02/2026)
- **RISOLTO P0**: Dropdown strutture in "Crea Link Ospite" - Sostituito native `<select>` con Shadcn `Select` per compatibilità Radix Dialog Portal
- **RISOLTO P0**: Cambio stato prenotazioni + notifiche WhatsApp su TUTTI i tipi (noleggi, lidi, ristoranti, esperienze, nightlife, servizi extra, ticket)
- **VERIFICATO**: PropertyEditor con servizi extra funzionante (tab Servizi)

## Test Results (13/02/2026)
- Backend: 100% (16/16 tests)
- Frontend: 100%
- Report: `/app/test_reports/iteration_6.json`

---

## Prioritized Backlog

### P1 (Next)
- [ ] Gestione sezioni "Nightlife" e "Senza Auto" nell'admin
- [ ] Pulsante Archivia per richieste vecchie/concluse
- [ ] Gestione completa per ogni struttura (WiFi, check-in, regole, FAQ, servizi extra specifici) - UI esistente, da verificare UX

### P2
- [ ] Noleggi auto-conferma con calendario disponibilità
- [ ] Ristoranti dropdown fasce orarie
- [ ] Upsell esperienze con checkbox extra

### P3 (Future)
- [ ] Date fisse per eventi/escursioni
- [ ] Multi-lingua (IT/EN)
- [ ] Pagamenti online (Stripe)
- [ ] Notifiche push

---

## Tech Stack
- Frontend: React 19, TailwindCSS, Framer Motion, Shadcn/UI, qrcode.react
- Backend: FastAPI, MongoDB, Resend, Open-Meteo API
- Auth: JWT + bcrypt
- State: PropertyContext

## File Structure
```
/app/
├── backend/
│   ├── server.py
│   ├── tests/
│   └── .env
└── frontend/
    ├── src/
    │   ├── context/PropertyContext.jsx
    │   ├── components/PropertyEditor.jsx
    │   ├── pages/AdminDashboardPage.jsx
    │   ├── pages/NightlifePage.jsx
    │   ├── pages/WeatherPage.jsx
    │   └── App.js
    └── package.json
```

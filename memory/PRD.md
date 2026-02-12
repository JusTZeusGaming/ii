# Your Journey - Guest Portal Torre Lapillo

## Problem Statement
Web app "Guest Portal" mobile-first per ospiti di case vacanza a Torre Lapillo.

## What's Been Implemented (100% Working)

### ✅ CORE FEATURES
- **Dashboard ospite** con meteo live cliccabile
- **Persistenza struttura** - PropertyContext mantiene contesto
- **4 tab navigazione**: Guida, Alloggio, Servizi, Aiuto

### ✅ PRENOTAZIONI (Tutti i form funzionanti)
- Form noleggi con **calcolo totale automatico** (fix €0 -> €8)
- Form ristoranti
- Form esperienze
- Form lidi/spiagge
- Form nightlife (biglietto + navetta)
- Ticket assistenza con numero automatico

### ✅ ADMIN PANEL COMPLETO
- **Tab Richieste**: Tutte le prenotazioni con contatore (23)
- **Tab Link Ospiti**: Dropdown strutture funzionante (Casa Brezza, Casa Bella)
- **Tab Strutture**: PropertyEditor con 8 tab:
  - Base (nome, slug, immagine)
  - WiFi (rete, password, note)
  - Check-in/out (orari, istruzioni)
  - Contatti (host, emergenza)
  - Regole casa
  - FAQ personalizzabili
  - Guasti comuni personalizzabili
  - Servizi extra (attivo/disattivo, prezzi)
- **Tab Spiagge/Ristoranti/Esperienze/Noleggi**: CRUD completo
- **Tab Mappe & Info**: 26 elementi (parcheggi, farmacie, guardia medica, ecc.)
- **QR Code generator** per ogni struttura

### ✅ NIGHTLIFE
- Pagina `/nightlife` con eventi discoteca
- Pacchetti: Solo Ingresso / Ingresso + Navetta
- Form prenotazione con calcolo totale

### ✅ METEO
- Badge cliccabile nella dashboard
- Pagina `/meteo` con previsioni orarie (12h) e giornaliere (7gg)

### ✅ NOTIFICHE
- Email automatiche a `nico.suez2000@gmail.com`
- WhatsApp precompilato per conferme

### ✅ API AVANZATE
- `GET /rentals/{id}/availability` - Disponibilità noleggi per data
- `GET /restaurants/{id}/time-slots` - Fasce orarie con coperti disponibili

---

## Admin Credentials
- **Email**: `nico.suez2000@gmail.com`
- **Password**: `Thegame2000`
- **URL**: `/admin`

## Strutture Attive
- Casa Brezza (slug: `casa-brezza`)
- Casa Bella (slug: `casa-bella`)

---

## Test Results (12/02/2026)
- Backend: **100%** (16/16 tests)
- Frontend: **100%**
- Report: `/app/test_reports/iteration_5.json`

---

## Prioritized Backlog

### P2 (In Progress)
- [ ] **Noleggi auto-conferma**: Se disponibile, conferma immediata
- [ ] **Ristoranti dropdown fasce orarie**: Selezione da dropdown, non input
- [ ] **Upsell esperienze**: Checkbox extra con aggiornamento totale
- [ ] **Date fisse eventi**: Solo date selezionabili configurate

### P3 (Future)
- [ ] Tab Preferiti funzionante
- [ ] Pagamenti online (Stripe)
- [ ] Multi-lingua (IT/EN)
- [ ] Notifiche push

---

## Tech Stack
- **Frontend**: React 19, TailwindCSS, Framer Motion, Shadcn/UI, qrcode.react
- **Backend**: FastAPI, MongoDB, Resend, Open-Meteo API
- **Auth**: JWT + bcrypt
- **State**: PropertyContext

---

## File Structure
```
/app/
├── backend/
│   ├── server.py              # API FastAPI complete
│   ├── tests/                 # Test pytest
│   └── .env
└── frontend/
    ├── src/
    │   ├── context/
    │   │   └── PropertyContext.jsx
    │   ├── components/
    │   │   └── PropertyEditor.jsx    # Editor 8 tab
    │   ├── pages/
    │   │   ├── AdminDashboardPage.jsx
    │   │   ├── NightlifePage.jsx
    │   │   ├── WeatherPage.jsx
    │   │   └── ...
    │   └── App.js
    └── package.json
```

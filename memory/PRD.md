# Your Journey - Guest Portal Torre Lapillo

## Problem Statement
Web app "Guest Portal" mobile-first per ospiti di case vacanza a Torre Lapillo. Navigabile come un'app con bottom navigation, contenuti modificabili da admin panel.

## User Personas
1. **Ospite/Turista**: Info su alloggio, spiagge, ristoranti, esperienze, noleggi, trasporti
2. **Host/Admin**: Gestisce strutture, contenuti, visualizza prenotazioni e ticket

## Core Requirements (Static)
- Palette: Blu navy (#0F172A) + Giallo sabbia (#F59E0B) + Sfondi chiari
- Mobile-first (iPhone 13/14/15)
- Bottom navigation 4 tab
- Admin panel con CRUD completo
- WhatsApp: +39 3293236473

## What's Been Implemented (Gen 2026)

### PRIORITÀ 0 - ADMIN/CMS ✅
- Admin panel completo con login (admin/admin123)
- CRUD strutture, spiagge, ristoranti, esperienze, noleggi, trasporti
- Visualizzazione prenotazioni e ticket supporto
- Link personalizzati: `/?struttura=casa-brezza` o `/guida?struttura=casa-brezza`

### PRIORITÀ 1 - DASHBOARD ✅
- Card alloggio con immagine sfondo
- Badge meteo REALE (Open-Meteo API, no API key needed)
- Card Supermercato grande → pagina /supermercato con:
  - Gallery immagini
  - Descrizione, servizi rapidi, orari, telefono, mappa

### PRIORITÀ 2 - ALLOGGIO ✅
- Pagina Guasti & Assistenza con:
  - Accordion soluzioni problemi comuni (10 items)
  - Form ticket (descrizione, urgenza, preferenza contatto)
  - Numero ticket generato automaticamente
- FAQ Casa: 30 domande realistiche
- Servizi Aggiuntivi con form richiesta:
  - Pulizia straordinaria (€50)
  - Cambio biancheria (€25)
  - Check-in romantico (€45)
  - Spesa all'arrivo (€35)
  - Late check-out (€30)

### PRIORITÀ 3 - PAGINE DETTAGLIO ✅
- Spiagge: dettaglio con parcheggio, orari, consigli, form prenotazione lettini
- Ristoranti: dettaglio con recensioni, prezzi, form prenotazione (no Chiama)
- Esperienze: dettaglio con incluso/extra, min partecipanti, form + WhatsApp
- Tutto cliccabile con pagine dedicate

### PRIORITÀ 4 - NOLEGGI ✅
- Divisi in 2 categorie: Attrezzatura Mare / Spostamenti
- 11 prodotti: Kit spiaggia (€8), SUP (€20), Kayak, Snorkeling, Tenda, Carrellino, Bici (€10), Scooter (€35), Auto (€45), Monopattino (€15)
- Form prenotazione con: date, durata, consegna (+€5), ritiro (+€5)
- Prezzi giornalieri e settimanali

### Backend APIs
- `/api/weather` - Meteo reale Torre Lapillo
- `/api/supermarket` - Info supermercato
- `/api/troubleshooting` - Soluzioni problemi comuni
- `/api/extra-services` - Servizi aggiuntivi
- `/api/support-tickets` - Ticket assistenza
- `/api/{beaches|restaurants|experiences|rentals}` - Liste e dettagli
- `/api/{beach|restaurant|experience|rental}-bookings` - Prenotazioni
- Admin CRUD per tutte le collections

## Admin Credentials
- Username: `admin`
- Password: `admin123`
- URL: `/admin`

## URL Struttura
- `/guida?struttura=casa-brezza` carica contenuti specifici struttura

## Tech Stack
- Frontend: React 19, Tailwind CSS, Framer Motion, Shadcn/UI
- Backend: FastAPI, MongoDB (Motor), Open-Meteo API
- Auth: JWT + bcrypt

## Prioritized Backlog

### P1 (Prossimi)
- [ ] Generatore QR code per link struttura nell'admin
- [ ] Multi-lingua (IT/EN)
- [ ] Pagamenti online per noleggi

### P2 (Future)
- [ ] Tab Preferiti funzionante
- [ ] Notifiche push
- [ ] Calendario disponibilità noleggi real-time

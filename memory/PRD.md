# Your Journey - Guest Portal Torre Lapillo

## Problem Statement
Web app "Guest Portal" per ospiti di case vacanza a Torre Lapillo. Mobile-first, navigabile come un'app con bottom navigation e contenuti modificabili dal pannello admin.

## User Personas
1. **Ospite/Turista**: Cerca informazioni su alloggio, spiagge, ristoranti, attività, noleggi, trasporti
2. **Host/Admin**: Gestisce contenuti delle strutture, visualizza prenotazioni

## Core Requirements (Static)
- Palette: Blu navy (#0F172A) + Giallo sabbia (#F59E0B) + Sfondi chiari
- Mobile-first (iPhone 13/14/15)
- Bottom navigation con 4 tab
- 10+ pagine interne navigabili
- Admin panel con autenticazione
- WhatsApp integration: +39 3293236473

## What's Been Implemented (Jan 2026)

### Frontend Pages
1. ✅ Splash Page - Logo "Your Journey" + bottone "Iniziamo"
2. ✅ Dashboard (Guida) - Card alloggio + griglia quick actions
3. ✅ Alloggio - Wi-Fi, Check-in/out, Regole, Contatti, FAQ
4. ✅ Spiagge & Lidi - Filtri + carousel consigliati
5. ✅ Dove mangiare - Categorie + prenotazione WhatsApp
6. ✅ Cosa fare oggi - Esperienze + carousel top
7. ✅ Noleggi - Form prenotazione con data picker
8. ✅ Mappe & Info - Punti utili con link Google Maps
9. ✅ Senza auto - Trasporti + form richiesta
10. ✅ Aiuto - WhatsApp CTA + FAQ + Emergenze
11. ✅ Admin Login
12. ✅ Admin Dashboard - CRUD completo

### Backend APIs
- ✅ Public: beaches, restaurants, experiences, rentals, map-info, transports
- ✅ Property by slug: /api/properties/{slug}
- ✅ Bookings: rental-bookings, transport-requests
- ✅ Admin CRUD: tutte le collections
- ✅ Auth: JWT con bcrypt

### Database
- MongoDB con seed data realistico per Torre Lapillo
- Collections: properties, beaches, restaurants, experiences, rentals, map_info, transports, admins, rental_bookings, transport_requests

## Prioritized Backlog

### P0 (Completato)
- [x] Struttura app completa
- [x] Tutte le 10+ pagine
- [x] Admin panel funzionante
- [x] Seed data realistico

### P1 (Prossimi passi)
- [ ] Preferiti (tab Heart) - Salvare luoghi preferiti
- [ ] Multi-lingua (IT/EN)
- [ ] Notifiche push per prenotazioni

### P2 (Future)
- [ ] Integrazione meteo API reale
- [ ] Mappa interattiva con marker
- [ ] Sistema recensioni
- [ ] Calendario disponibilità noleggi

## Admin Credentials
- Username: admin
- Password: admin123
- URL: /admin

## Tech Stack
- Frontend: React 19, Tailwind CSS, Framer Motion, Shadcn/UI
- Backend: FastAPI, MongoDB (Motor)
- Auth: JWT + bcrypt

import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Toaster } from "@/components/ui/sonner";
import { PropertyProvider } from "@/context/PropertyContext";
import { LanguageProvider } from "@/context/LanguageContext";

// Pages
import SplashPage from "@/pages/SplashPage";
import DashboardPage from "@/pages/DashboardPage";
import AccommodationPage from "@/pages/AccommodationPage";
import BeachesPage from "@/pages/BeachesPage";
import BeachDetailPage from "@/pages/BeachDetailPage";
import DiningPage from "@/pages/DiningPage";
import RestaurantDetailPage from "@/pages/RestaurantDetailPage";
import ActivitiesPage from "@/pages/ActivitiesPage";
import ExperienceDetailPage from "@/pages/ExperienceDetailPage";
import RentalsPage from "@/pages/RentalsPage";
import RentalDetailPage from "@/pages/RentalDetailPage";
import MapsPage from "@/pages/MapsPage";
import TransportPage from "@/pages/TransportPage";
import HelpPage from "@/pages/HelpPage";
import SupermarketPage from "@/pages/SupermarketPage";
import TroubleshootingPage from "@/pages/TroubleshootingPage";
import ExtraServicesPage from "@/pages/ExtraServicesPage";
import AdminLoginPage from "@/pages/AdminLoginPage";
import AdminDashboardPage from "@/pages/AdminDashboardPage";
import GuestAccessPage from "@/pages/GuestAccessPage";
import NightlifePage from "@/pages/NightlifePage";
import WeatherPage from "@/pages/WeatherPage";

// Layout
import AppLayout from "@/components/AppLayout";

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<SplashPage />} />
        <Route path="/guida" element={<AppLayout><DashboardPage /></AppLayout>} />
        <Route path="/alloggio" element={<AppLayout><AccommodationPage /></AppLayout>} />
        <Route path="/spiagge" element={<AppLayout><BeachesPage /></AppLayout>} />
        <Route path="/spiagge/:id" element={<AppLayout><BeachDetailPage /></AppLayout>} />
        <Route path="/ristoranti" element={<AppLayout><DiningPage /></AppLayout>} />
        <Route path="/ristoranti/:id" element={<AppLayout><RestaurantDetailPage /></AppLayout>} />
        <Route path="/attivita" element={<AppLayout><ActivitiesPage /></AppLayout>} />
        <Route path="/attivita/:id" element={<AppLayout><ExperienceDetailPage /></AppLayout>} />
        <Route path="/nightlife" element={<AppLayout><NightlifePage /></AppLayout>} />
        <Route path="/meteo" element={<AppLayout><WeatherPage /></AppLayout>} />
        <Route path="/noleggi" element={<AppLayout><RentalsPage /></AppLayout>} />
        <Route path="/noleggi/:id" element={<AppLayout><RentalDetailPage /></AppLayout>} />
        <Route path="/mappe" element={<AppLayout><MapsPage /></AppLayout>} />
        <Route path="/trasporti" element={<AppLayout><TransportPage /></AppLayout>} />
        <Route path="/aiuto" element={<AppLayout><HelpPage /></AppLayout>} />
        <Route path="/supermercato" element={<AppLayout><SupermarketPage /></AppLayout>} />
        <Route path="/assistenza" element={<AppLayout><TroubleshootingPage /></AppLayout>} />
        <Route path="/servizi-extra" element={<AppLayout><ExtraServicesPage /></AppLayout>} />
        <Route path="/admin" element={<AdminLoginPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="/p/:token" element={<GuestAccessPage />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <div className="app-container">
      <BrowserRouter>
        <LanguageProvider>
          <PropertyProvider>
            <AnimatedRoutes />
          </PropertyProvider>
        </LanguageProvider>
      </BrowserRouter>
      <Toaster position="top-center" richColors />
    </div>
  );
}

export default App;

import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Toaster } from "@/components/ui/sonner";

// Pages
import SplashPage from "@/pages/SplashPage";
import DashboardPage from "@/pages/DashboardPage";
import AccommodationPage from "@/pages/AccommodationPage";
import BeachesPage from "@/pages/BeachesPage";
import DiningPage from "@/pages/DiningPage";
import ActivitiesPage from "@/pages/ActivitiesPage";
import RentalsPage from "@/pages/RentalsPage";
import MapsPage from "@/pages/MapsPage";
import TransportPage from "@/pages/TransportPage";
import HelpPage from "@/pages/HelpPage";
import AdminLoginPage from "@/pages/AdminLoginPage";
import AdminDashboardPage from "@/pages/AdminDashboardPage";

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
        <Route path="/ristoranti" element={<AppLayout><DiningPage /></AppLayout>} />
        <Route path="/attivita" element={<AppLayout><ActivitiesPage /></AppLayout>} />
        <Route path="/noleggi" element={<AppLayout><RentalsPage /></AppLayout>} />
        <Route path="/mappe" element={<AppLayout><MapsPage /></AppLayout>} />
        <Route path="/trasporti" element={<AppLayout><TransportPage /></AppLayout>} />
        <Route path="/aiuto" element={<AppLayout><HelpPage /></AppLayout>} />
        <Route path="/admin" element={<AdminLoginPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <div className="app-container">
      <BrowserRouter>
        <AnimatedRoutes />
      </BrowserRouter>
      <Toaster position="top-center" richColors />
    </div>
  );
}

export default App;

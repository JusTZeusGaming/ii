import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Compass, Calendar, Users, Home, AlertTriangle, CheckCircle2 } from "lucide-react";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function GuestAccessPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [bookingData, setBookingData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const validateToken = async () => {
      try {
        const response = await axios.get(`${API}/booking/${token}`);
        setBookingData(response.data);
        
        // If valid, store in localStorage for the session
        if (response.data.valid) {
          localStorage.setItem("guest_token", token);
          localStorage.setItem("guest_booking", JSON.stringify(response.data.booking));
        }
      } catch (err) {
        setError("Link non valido o scaduto");
      } finally {
        setLoading(false);
      }
    };
    
    if (token) {
      validateToken();
    }
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white/70">Verifica in corso...</p>
        </div>
      </div>
    );
  }

  if (error || !bookingData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center px-5">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="w-full max-w-sm"
        >
          <Card className="p-8 rounded-2xl bg-white text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Link non valido</h2>
            <p className="text-slate-500 mb-6">
              Questo link di accesso non è valido o è già scaduto. Contatta il tuo host per ricevere un nuovo link.
            </p>
            <Button onClick={() => navigate("/")} className="w-full">
              Vai alla homepage
            </Button>
          </Card>
        </motion.div>
      </div>
    );
  }

  const { valid, message, booking } = bookingData;

  // If expired
  if (!valid) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center px-5">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="w-full max-w-sm"
        >
          <Card className="p-8 rounded-2xl bg-white text-center">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-amber-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Soggiorno terminato</h2>
            <p className="text-slate-500 mb-4">{message}</p>
            <div className="bg-slate-50 rounded-xl p-4 mb-6 text-left">
              <p className="text-sm text-slate-500">Struttura</p>
              <p className="font-semibold text-slate-900">{booking.property_name}</p>
              <p className="text-sm text-slate-500 mt-2">Periodo</p>
              <p className="font-semibold text-slate-900">{booking.checkin_date} → {booking.checkout_date}</p>
            </div>
            <p className="text-sm text-slate-400">
              Grazie per aver soggiornato con noi! Speriamo di rivederti presto.
            </p>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Valid booking - show welcome and redirect to portal
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center px-5">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Compass className="w-10 h-10 text-amber-500" />
          </div>
          <h1 className="text-2xl font-bold text-white">Your Journey</h1>
          <p className="text-white/60 text-sm">Torre Lapillo Guest Portal</p>
        </div>

        <Card className="p-6 rounded-2xl bg-white">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">{message}</h2>
          </div>

          {/* Booking Info */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
              <Home className="w-5 h-5 text-amber-500" />
              <div>
                <p className="text-xs text-slate-500">Struttura</p>
                <p className="font-semibold text-slate-900">{booking.property_name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
              <Users className="w-5 h-5 text-amber-500" />
              <div>
                <p className="text-xs text-slate-500">Ospite</p>
                <p className="font-semibold text-slate-900">{booking.guest_name} {booking.guest_surname}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
              <Calendar className="w-5 h-5 text-amber-500" />
              <div>
                <p className="text-xs text-slate-500">Periodo soggiorno</p>
                <p className="font-semibold text-slate-900">{booking.checkin_date} → {booking.checkout_date}</p>
              </div>
            </div>
          </div>

          <Button 
            onClick={() => navigate(`/guida?struttura=${booking.property_slug}`)}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white rounded-xl py-4 font-semibold"
            data-testid="enter-portal-btn"
          >
            Entra nel portale
          </Button>
        </Card>

        <p className="text-center text-white/40 text-xs mt-6">
          Questo link è valido solo per il tuo soggiorno
        </p>
      </motion.div>
    </div>
  );
}

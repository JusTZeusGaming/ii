import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  ChevronLeft, 
  MapPin,
  Car,
  Clock,
  Lightbulb,
  ExternalLink,
  CheckCircle2
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function BeachDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [beach, setBeach] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [bookingSubmitted, setBookingSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    guest_name: "",
    guest_surname: "",
    guest_phone: "",
    date: "",
    duration: "intera",
    row_preference: "indifferente",
    umbrella_type: "standard",
    extras: [],
    notes: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchBeach = async () => {
      try {
        const response = await axios.get(`${API}/beaches/${id}`);
        setBeach(response.data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBeach();
  }, [id]);

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    if (!formData.guest_name || !formData.guest_phone || !formData.date) {
      toast.error("Compila i campi obbligatori");
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post(`${API}/beach-bookings`, {
        beach_id: beach.id,
        beach_name: beach.name,
        ...formData
      });
      setBookingSubmitted(true);
    } catch (error) {
      toast.error("Errore nell'invio della prenotazione");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="px-5 py-6">
        <div className="animate-pulse space-y-4">
          <div className="h-48 bg-slate-200 rounded-2xl"></div>
          <div className="h-24 bg-slate-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (!beach) {
    return (
      <div className="px-5 py-6 text-center">
        <p className="text-slate-500">Spiaggia non trovata</p>
        <Button onClick={() => navigate("/spiagge")} className="mt-4">Torna alle spiagge</Button>
      </div>
    );
  }

  return (
    <div className="pb-6" data-testid="beach-detail-page">
      {/* Hero Image */}
      <div className="relative h-56">
        <img src={beach.image_url} alt={beach.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/spiagge")}
          className="absolute top-4 left-4 bg-white/90 rounded-full"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        {beach.is_recommended && (
          <span className="absolute top-4 right-4 badge-recommended">Consigliata</span>
        )}
        <div className="absolute bottom-4 left-5 right-5 text-white">
          <h1 className="text-2xl font-bold">{beach.name}</h1>
          <p className="text-white/80 capitalize">{beach.category} • {beach.distance}</p>
        </div>
      </div>

      <div className="px-5 pt-5 space-y-4">
        {/* Description */}
        <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <Card className="p-5 rounded-2xl bg-white border border-slate-100">
            <p className="text-slate-600 leading-relaxed">{beach.description}</p>
          </Card>
        </motion.div>

        {/* Info Cards */}
        {beach.parking_info && (
          <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
            <Card className="p-4 rounded-xl bg-slate-50 border-0">
              <div className="flex items-start gap-3">
                <Car className="w-5 h-5 text-slate-500 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">Parcheggio</h4>
                  <p className="text-slate-600 text-sm mt-1">{beach.parking_info}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {beach.best_time && (
          <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }}>
            <Card className="p-4 rounded-xl bg-slate-50 border-0">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-slate-500 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">Orari migliori</h4>
                  <p className="text-slate-600 text-sm mt-1">{beach.best_time}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {beach.tips && (
          <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
            <Card className="p-4 rounded-xl bg-amber-50 border-0">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">Consigli</h4>
                  <p className="text-slate-600 text-sm mt-1">{beach.tips}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* CTA Buttons */}
        <motion.div 
          className="flex gap-3"
          initial={{ y: 10, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }} 
          transition={{ delay: 0.25 }}
        >
          <Button
            onClick={() => window.open(beach.map_url, "_blank")}
            variant="outline"
            className="flex-1 rounded-xl"
          >
            <MapPin className="w-4 h-4 mr-2" /> Apri mappa
          </Button>
          
          {beach.has_sunbeds && (
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="flex-1 bg-amber-500 hover:bg-amber-600 text-white rounded-xl"
            >
              Prenota lettini
            </Button>
          )}
        </motion.div>
      </div>

      {/* Booking Dialog for equipped beaches */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-sm mx-4 rounded-2xl max-h-[90vh] overflow-y-auto">
          {bookingSubmitted ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Richiesta Inviata!</h3>
              <p className="text-slate-500 mb-4">
                La tua prenotazione per {beach.name} è stata inviata. Riceverai conferma a breve.
              </p>
              <Button onClick={() => { setIsDialogOpen(false); setBookingSubmitted(false); }} className="w-full">
                Chiudi
              </Button>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Prenota Lettini - {beach.name}</DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmitBooking} className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Nome *</Label>
                    <Input value={formData.guest_name} onChange={(e) => setFormData({...formData, guest_name: e.target.value})} className="rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label>Cognome</Label>
                    <Input value={formData.guest_surname} onChange={(e) => setFormData({...formData, guest_surname: e.target.value})} className="rounded-xl" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Telefono *</Label>
                  <Input value={formData.guest_phone} onChange={(e) => setFormData({...formData, guest_phone: e.target.value})} placeholder="+39..." className="rounded-xl" />
                </div>

                <div className="space-y-2">
                  <Label>Data *</Label>
                  <Input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="rounded-xl" />
                </div>

                <div className="space-y-2">
                  <Label>Durata</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {[{v: "intera", l: "Intera"}, {v: "mezza_mattina", l: "Mattina"}, {v: "mezza_pomeriggio", l: "Pomeriggio"}].map(opt => (
                      <button key={opt.v} type="button" onClick={() => setFormData({...formData, duration: opt.v})}
                        className={`p-2 rounded-xl border-2 text-sm font-medium transition-all ${formData.duration === opt.v ? "bg-slate-900 border-slate-900 text-white" : "bg-white border-slate-200"}`}>
                        {opt.l}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Fila preferita</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {[{v: "prime", l: "Prime file"}, {v: "ultime", l: "Ultime file"}, {v: "indifferente", l: "Indifferente"}].map(opt => (
                      <button key={opt.v} type="button" onClick={() => setFormData({...formData, row_preference: opt.v})}
                        className={`p-2 rounded-xl border-2 text-xs font-medium transition-all ${formData.row_preference === opt.v ? "bg-slate-900 border-slate-900 text-white" : "bg-white border-slate-200"}`}>
                        {opt.l}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Tipo ombrellone</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {[{v: "standard", l: "Standard"}, {v: "premium", l: "Premium (+€5)"}].map(opt => (
                      <button key={opt.v} type="button" onClick={() => setFormData({...formData, umbrella_type: opt.v})}
                        className={`p-2 rounded-xl border-2 text-sm font-medium transition-all ${formData.umbrella_type === opt.v ? "bg-slate-900 border-slate-900 text-white" : "bg-white border-slate-200"}`}>
                        {opt.l}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Note</Label>
                  <Textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} placeholder="Richieste particolari..." className="rounded-xl resize-none" rows={2} />
                </div>

                <Button type="submit" disabled={isSubmitting} className="w-full bg-amber-500 hover:bg-amber-600 text-white rounded-xl py-3 font-semibold">
                  {isSubmitting ? "Invio..." : "Invia Prenotazione"}
                </Button>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

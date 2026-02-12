import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  ChevronLeft, 
  Calendar,
  Info,
  Truck,
  CheckCircle2
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function RentalDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rental, setRental] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [bookingSubmitted, setBookingSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    guest_name: "",
    guest_surname: "",
    guest_phone: "",
    start_date: "",
    end_date: "",
    duration_type: "giornaliero",
    delivery: false,
    pickup: false,
    notes: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchRental = async () => {
      try {
        const response = await axios.get(`${API}/rentals/${id}`);
        setRental(response.data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRental();
  }, [id]);

  const calculateTotal = () => {
    let base = rental?.daily_price || "€0";
    let extra = 0;
    if (formData.delivery) extra += 5;
    if (formData.pickup) extra += 5;
    
    if (formData.duration_type === "settimanale" && rental?.weekly_price) {
      base = rental.weekly_price;
    }
    
    return extra > 0 ? `${base} + €${extra} (consegna/ritiro)` : base;
  };

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    if (!formData.guest_name || !formData.guest_phone || !formData.start_date) {
      toast.error("Compila i campi obbligatori");
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post(`${API}/rental-bookings`, {
        rental_id: rental.id,
        rental_name: rental.name,
        ...formData,
        total_price: calculateTotal()
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

  if (!rental) {
    return (
      <div className="px-5 py-6 text-center">
        <p className="text-slate-500">Noleggio non trovato</p>
        <Button onClick={() => navigate("/noleggi")} className="mt-4">Torna ai noleggi</Button>
      </div>
    );
  }

  return (
    <div className="pb-6" data-testid="rental-detail-page">
      {/* Hero Image */}
      <div className="relative h-48">
        <img src={rental.image_url} alt={rental.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <Button variant="ghost" size="icon" onClick={() => navigate("/noleggi")} className="absolute top-4 left-4 bg-white/90 rounded-full">
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div className="absolute bottom-4 left-5 right-5 text-white">
          <h1 className="text-2xl font-bold">{rental.name}</h1>
          <p className="text-white/80 capitalize">{rental.category === "mare" ? "Attrezzatura Mare" : "Spostamenti"}</p>
        </div>
      </div>

      <div className="px-5 pt-5 space-y-4">
        {/* Price Cards */}
        <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <div className="flex gap-3">
            <Card className="flex-1 p-4 rounded-xl bg-amber-50 border-0 text-center">
              <p className="text-amber-600 font-bold text-xl">{rental.daily_price}</p>
              <p className="text-slate-500 text-xs">al giorno</p>
            </Card>
            {rental.weekly_price && (
              <Card className="flex-1 p-4 rounded-xl bg-green-50 border-0 text-center">
                <p className="text-green-600 font-bold text-xl">{rental.weekly_price}</p>
                <p className="text-slate-500 text-xs">settimanale</p>
              </Card>
            )}
          </div>
        </motion.div>

        {/* Description */}
        <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
          <Card className="p-5 rounded-2xl bg-white border border-slate-100">
            <p className="text-slate-600 leading-relaxed">{rental.description}</p>
          </Card>
        </motion.div>

        {/* Rules */}
        <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }}>
          <Card className="p-4 rounded-xl bg-slate-50 border-0">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-slate-500 mt-0.5" />
              <div>
                <h4 className="font-semibold text-slate-900 text-sm">Regole noleggio</h4>
                <p className="text-slate-600 text-sm mt-1">{rental.rules}</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Delivery info */}
        <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
          <Card className="p-4 rounded-xl bg-blue-50 border-0">
            <div className="flex items-start gap-3">
              <Truck className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-slate-900 text-sm">Consegna e Ritiro</h4>
                <p className="text-slate-600 text-sm mt-1">+€5 consegna in struttura • +€5 ritiro in struttura</p>
                <p className="text-slate-500 text-xs mt-1">Altrimenti ritiro/riconsegna presso il nostro punto noleggio</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* CTA */}
        <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.25 }}>
          <Button onClick={() => setIsDialogOpen(true)} className="w-full bg-amber-500 hover:bg-amber-600 text-white rounded-xl py-4 font-semibold">
            <Calendar className="w-5 h-5 mr-2" /> Prenota ora
          </Button>
        </motion.div>
      </div>

      {/* Booking Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-sm mx-4 rounded-2xl max-h-[90vh] overflow-y-auto">
          {bookingSubmitted ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Prenotazione Inviata!</h3>
              <p className="text-slate-500 mb-4">Verificheremo la disponibilità e ti confermeremo a breve.</p>
              <Button onClick={() => { setIsDialogOpen(false); setBookingSubmitted(false); }} className="w-full">Chiudi</Button>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Prenota - {rental.name}</DialogTitle>
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
                  <Label>Durata</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {[{v: "giornaliero", l: `Giornaliero (${rental.daily_price})`}, {v: "settimanale", l: `Settimanale (${rental.weekly_price || rental.daily_price})`}].map(opt => (
                      <button key={opt.v} type="button" onClick={() => setFormData({...formData, duration_type: opt.v})}
                        className={`p-3 rounded-xl border-2 text-xs font-medium transition-all ${formData.duration_type === opt.v ? "bg-slate-900 border-slate-900 text-white" : "bg-white border-slate-200"}`}>
                        {opt.l}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Data inizio *</Label>
                    <Input type="date" value={formData.start_date} onChange={(e) => setFormData({...formData, start_date: e.target.value})} className="rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label>Data fine</Label>
                    <Input type="date" value={formData.end_date} onChange={(e) => setFormData({...formData, end_date: e.target.value})} className="rounded-xl" />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Servizi extra</Label>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="delivery" checked={formData.delivery} onCheckedChange={(c) => setFormData({...formData, delivery: c})} />
                    <label htmlFor="delivery" className="text-sm">Consegna in struttura (+€5)</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="pickup" checked={formData.pickup} onCheckedChange={(c) => setFormData({...formData, pickup: c})} />
                    <label htmlFor="pickup" className="text-sm">Ritiro in struttura (+€5)</label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Note</Label>
                  <Textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} placeholder="Orario preferito, richieste..." className="rounded-xl resize-none" rows={2} />
                </div>

                <div className="bg-slate-100 rounded-xl p-3 text-center">
                  <p className="text-sm text-slate-500">Totale stimato</p>
                  <p className="text-lg font-bold text-slate-900">{calculateTotal()}</p>
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

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
  Clock,
  Star,
  CheckCircle2
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function RestaurantDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [bookingSubmitted, setBookingSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    guest_name: "",
    guest_surname: "",
    guest_phone: "",
    date: "",
    time: "",
    num_people: 2,
    notes: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const response = await axios.get(`${API}/restaurants/${id}`);
        setRestaurant(response.data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurant();
  }, [id]);

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    
    if (!formData.guest_name.trim()) {
      toast.error("Inserisci il tuo nome");
      return;
    }
    if (!formData.guest_phone.trim()) {
      toast.error("Inserisci il tuo numero di telefono");
      return;
    }
    if (!formData.date) {
      toast.error("Seleziona la data");
      return;
    }
    if (!formData.time) {
      toast.error("Seleziona l'orario");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        restaurant_id: restaurant.id,
        restaurant_name: restaurant.name,
        guest_name: formData.guest_name.trim(),
        guest_surname: formData.guest_surname.trim() || "",
        guest_phone: formData.guest_phone.trim(),
        date: formData.date,
        time: formData.time,
        num_people: formData.num_people,
        notes: formData.notes || ""
      };
      
      await axios.post(`${API}/restaurant-bookings`, payload);
      setBookingSubmitted(true);
      toast.success("Prenotazione inviata!");
    } catch (error) {
      console.error("Booking error:", error);
      toast.error("Errore nell'invio. Riprova.");
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

  if (!restaurant) {
    return (
      <div className="px-5 py-6 text-center">
        <p className="text-slate-500">Ristorante non trovato</p>
        <Button onClick={() => navigate("/ristoranti")} className="mt-4">Torna ai ristoranti</Button>
      </div>
    );
  }

  return (
    <div className="pb-6" data-testid="restaurant-detail-page">
      {/* Hero Image */}
      <div className="relative h-56">
        <img src={restaurant.image_url} alt={restaurant.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <Button variant="ghost" size="icon" onClick={() => navigate("/ristoranti")} className="absolute top-4 left-4 bg-white/90 rounded-full">
          <ChevronLeft className="w-5 h-5" />
        </Button>
        {restaurant.is_recommended && (
          <span className="absolute top-4 right-4 badge-recommended">Consigliato</span>
        )}
        <div className="absolute bottom-4 left-5 right-5 text-white">
          <h1 className="text-2xl font-bold">{restaurant.name}</h1>
          <p className="text-white/80 capitalize">{restaurant.category} • {restaurant.price_range}</p>
        </div>
      </div>

      <div className="px-5 pt-5 space-y-4">
        {/* Description */}
        <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <Card className="p-5 rounded-2xl bg-white border border-slate-100">
            <p className="text-slate-600 leading-relaxed">{restaurant.description}</p>
          </Card>
        </motion.div>

        {/* Info */}
        <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
          <Card className="p-5 rounded-2xl bg-white border border-slate-100">
            <div className="space-y-3">
              {restaurant.hours && (
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-slate-400" />
                  <span className="text-slate-600">{restaurant.hours}</span>
                </div>
              )}
              {restaurant.price_range && (
                <div className="flex items-center gap-3">
                  <span className="text-slate-400 font-bold">€</span>
                  <span className="text-slate-600">Fascia prezzo: {restaurant.price_range}</span>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Reviews */}
        {restaurant.reviews && restaurant.reviews.length > 0 && (
          <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }}>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Recensioni</h3>
            <div className="space-y-2">
              {restaurant.reviews.map((review, idx) => (
                <Card key={idx} className="p-4 rounded-xl bg-slate-50 border-0">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex">
                      {[...Array(review.rating || 5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-amber-400 fill-current" />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-slate-900">{review.author}</span>
                  </div>
                  <p className="text-slate-600 text-sm">{review.text}</p>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {/* CTA Buttons */}
        <motion.div className="flex gap-3" initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
          <Button onClick={() => window.open(restaurant.map_url, "_blank")} variant="outline" className="flex-1 rounded-xl">
            <MapPin className="w-4 h-4 mr-2" /> Mappa
          </Button>
          <Button onClick={() => setIsDialogOpen(true)} className="flex-1 bg-amber-500 hover:bg-amber-600 text-white rounded-xl">
            Prenota
          </Button>
        </motion.div>
      </div>

      {/* Booking Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-sm mx-4 rounded-2xl">
          {bookingSubmitted ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Richiesta Inviata!</h3>
              <p className="text-slate-500 mb-4">La tua prenotazione per {restaurant.name} è stata inviata. Riceverai conferma a breve.</p>
              <Button onClick={() => { setIsDialogOpen(false); setBookingSubmitted(false); }} className="w-full">Chiudi</Button>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Prenota - {restaurant.name}</DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmitBooking} className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Nome *</Label>
                    <Input 
                      value={formData.guest_name} 
                      onChange={(e) => setFormData({...formData, guest_name: e.target.value})} 
                      placeholder="Mario"
                      className="rounded-xl" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Cognome</Label>
                    <Input 
                      value={formData.guest_surname} 
                      onChange={(e) => setFormData({...formData, guest_surname: e.target.value})} 
                      placeholder="Rossi"
                      className="rounded-xl" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Telefono *</Label>
                  <Input 
                    value={formData.guest_phone} 
                    onChange={(e) => setFormData({...formData, guest_phone: e.target.value})} 
                    placeholder="+39 333 1234567" 
                    className="rounded-xl" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Data *</Label>
                    <Input 
                      type="date" 
                      value={formData.date} 
                      onChange={(e) => setFormData({...formData, date: e.target.value})} 
                      className="rounded-xl" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Ora *</Label>
                    <Input 
                      type="time" 
                      value={formData.time} 
                      onChange={(e) => setFormData({...formData, time: e.target.value})} 
                      className="rounded-xl" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Numero persone</Label>
                  <div className="flex items-center gap-3">
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon" 
                      onClick={() => setFormData({...formData, num_people: Math.max(1, formData.num_people - 1)})}
                    >
                      -
                    </Button>
                    <span className="text-lg font-semibold w-8 text-center">{formData.num_people}</span>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon" 
                      onClick={() => setFormData({...formData, num_people: formData.num_people + 1})}
                    >
                      +
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Note</Label>
                  <Textarea 
                    value={formData.notes} 
                    onChange={(e) => setFormData({...formData, notes: e.target.value})} 
                    placeholder="Allergie, richieste speciali..." 
                    className="rounded-xl resize-none" 
                    rows={2} 
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white rounded-xl py-3 font-semibold"
                >
                  {isSubmitting ? "Invio in corso..." : "Invia Prenotazione"}
                </Button>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

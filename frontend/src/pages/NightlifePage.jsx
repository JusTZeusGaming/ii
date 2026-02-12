import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  ChevronLeft, 
  Moon,
  Music,
  Bus,
  Calendar,
  Clock,
  Users,
  MapPin,
  Ticket,
  CheckCircle2
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function NightlifePage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [bookingSubmitted, setBookingSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    guest_name: "",
    guest_phone: "",
    package: "entry_only",
    num_people: 1,
    pickup_point: "",
    notes: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get(`${API}/nightlife-events`);
        setEvents(response.data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const handleOpenBooking = (event) => {
    setSelectedEvent(event);
    setFormData({
      guest_name: "",
      guest_phone: "",
      package: "entry_only",
      num_people: 1,
      pickup_point: event.pickup_points?.[0] || "",
      notes: ""
    });
    setBookingSubmitted(false);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.guest_name || !formData.guest_phone) {
      toast.error("Inserisci nome e telefono");
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post(`${API}/nightlife-bookings`, {
        event_id: selectedEvent.id,
        event_name: selectedEvent.name,
        ...formData
      });
      setBookingSubmitted(true);
    } catch (error) {
      toast.error("Errore nell'invio");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    if (status === "available") return <Badge className="bg-green-100 text-green-700">Disponibile</Badge>;
    if (status === "limited") return <Badge className="bg-amber-100 text-amber-700">Ultimi posti</Badge>;
    return <Badge className="bg-red-100 text-red-700">Sold Out</Badge>;
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" });
  };

  if (loading) {
    return (
      <div className="px-5 py-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/2"></div>
          <div className="h-48 bg-slate-200 rounded-2xl"></div>
          <div className="h-48 bg-slate-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 py-6" data-testid="nightlife-page">
      {/* Header */}
      <motion.div 
        className="flex items-center gap-3 mb-6"
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/attivita")}
          className="rounded-full"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Moon className="w-5 h-5 text-purple-500" /> Nightlife
          </h1>
          <p className="text-slate-500 text-sm">Discoteche & Eventi serali</p>
        </div>
      </motion.div>

      {/* Info Banner */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <Card className="p-4 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
          <div className="flex items-start gap-3">
            <Bus className="w-6 h-6 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold">Navetta inclusa disponibile!</h3>
              <p className="text-sm text-white/80 mt-1">
                Partenza da Torre Lapillo, ritorno garantito. Niente pensieri per il ritorno!
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Events List */}
      <div className="space-y-4">
        {events.map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 + index * 0.1 }}
          >
            <Card className="overflow-hidden rounded-2xl">
              {/* Event Image */}
              <div className="relative h-40">
                <img 
                  src={event.image_url || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800"} 
                  alt={event.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4">
                  <h3 className="text-white font-bold text-lg">{event.name}</h3>
                  <p className="text-white/80 text-sm">{event.venue}</p>
                </div>
                <div className="absolute top-3 right-3">
                  {getStatusBadge(event.status)}
                </div>
              </div>

              {/* Event Details */}
              <div className="p-4">
                <div className="flex flex-wrap gap-3 text-sm text-slate-600 mb-4">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" /> {formatDate(event.date)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" /> {event.time}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" /> Min {event.min_participants} pers.
                  </span>
                </div>

                {/* Pricing */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <p className="text-xs text-slate-500">Solo Ingresso</p>
                    <p className="text-lg font-bold text-slate-900">{event.price_entry}</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-xl border-2 border-purple-200">
                    <p className="text-xs text-purple-600">Ingresso + Navetta</p>
                    <p className="text-lg font-bold text-purple-700">{event.price_with_transport}</p>
                  </div>
                </div>

                {/* Dress Code & Notes */}
                {event.dress_code && (
                  <p className="text-sm text-slate-500 mb-3">
                    <strong>Dress code:</strong> {event.dress_code}
                  </p>
                )}

                {event.notes && (
                  <p className="text-xs text-slate-400 mb-4">{event.notes}</p>
                )}

                <Button 
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  onClick={() => handleOpenBooking(event)}
                  disabled={event.status === "sold_out"}
                  data-testid="book-nightlife-btn"
                >
                  <Ticket className="w-4 h-4 mr-2" />
                  {event.status === "sold_out" ? "Sold Out" : "Prenota ora"}
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}

        {events.length === 0 && (
          <Card className="p-8 rounded-2xl text-center">
            <Moon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-700">Nessun evento disponibile</h3>
            <p className="text-slate-500 mt-2">Controlla più tardi per nuovi eventi!</p>
          </Card>
        )}
      </div>

      {/* Booking Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Music className="w-5 h-5 text-purple-500" />
              {bookingSubmitted ? "Richiesta Inviata!" : selectedEvent?.name}
            </DialogTitle>
          </DialogHeader>

          {bookingSubmitted ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Prenotazione ricevuta!</h3>
              <p className="text-slate-500 mb-4">
                Ti contatteremo presto per confermare la disponibilità e i dettagli del pagamento.
              </p>
              <Button onClick={() => setIsDialogOpen(false)} className="bg-purple-600 hover:bg-purple-700">
                Chiudi
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Package Selection */}
              <div>
                <Label>Pacchetto *</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <button
                    type="button"
                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                      formData.package === "entry_only" 
                        ? "border-purple-500 bg-purple-50" 
                        : "border-slate-200"
                    }`}
                    onClick={() => setFormData({...formData, package: "entry_only"})}
                  >
                    <p className="font-semibold text-sm">Solo Ingresso</p>
                    <p className="text-lg font-bold text-purple-600">{selectedEvent?.price_entry}</p>
                  </button>
                  <button
                    type="button"
                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                      formData.package === "entry_transport" 
                        ? "border-purple-500 bg-purple-50" 
                        : "border-slate-200"
                    }`}
                    onClick={() => setFormData({...formData, package: "entry_transport"})}
                  >
                    <p className="font-semibold text-sm">Ingresso + Navetta</p>
                    <p className="text-lg font-bold text-purple-600">{selectedEvent?.price_with_transport}</p>
                  </button>
                </div>
              </div>

              {/* Pickup Point (if transport selected) */}
              {formData.package === "entry_transport" && selectedEvent?.pickup_points?.length > 0 && (
                <div>
                  <Label>Punto di ritiro navetta *</Label>
                  <select
                    className="w-full p-3 border rounded-xl mt-1"
                    value={formData.pickup_point}
                    onChange={(e) => setFormData({...formData, pickup_point: e.target.value})}
                  >
                    {selectedEvent.pickup_points.map((point) => (
                      <option key={point} value={point}>{point}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Num People */}
              <div>
                <Label>Numero persone *</Label>
                <Input
                  type="number"
                  min={1}
                  max={20}
                  value={formData.num_people}
                  onChange={(e) => setFormData({...formData, num_people: parseInt(e.target.value) || 1})}
                  className="mt-1"
                />
                {selectedEvent?.min_participants && formData.num_people < selectedEvent.min_participants && (
                  <p className="text-xs text-amber-600 mt-1">
                    Minimo {selectedEvent.min_participants} partecipanti per la navetta
                  </p>
                )}
              </div>

              {/* Name & Phone */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Nome *</Label>
                  <Input
                    placeholder="Mario"
                    value={formData.guest_name}
                    onChange={(e) => setFormData({...formData, guest_name: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Telefono *</Label>
                  <Input
                    placeholder="+39 333..."
                    value={formData.guest_phone}
                    onChange={(e) => setFormData({...formData, guest_phone: e.target.value})}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Total */}
              <div className="p-4 bg-purple-50 rounded-xl">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Totale stimato:</span>
                  <span className="text-2xl font-bold text-purple-700">
                    €{formData.package === "entry_transport" 
                      ? parseInt(selectedEvent?.price_with_transport?.replace(/[^0-9]/g, "") || 0) * formData.num_people
                      : parseInt(selectedEvent?.price_entry?.replace(/[^0-9]/g, "") || 0) * formData.num_people
                    }
                  </span>
                </div>
                <p className="text-xs text-purple-600 mt-1">
                  Il pagamento avverrà in loco o alla conferma
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-purple-600 hover:bg-purple-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Invio..." : "Conferma Prenotazione"}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

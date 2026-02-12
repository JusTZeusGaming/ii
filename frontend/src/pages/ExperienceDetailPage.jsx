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
  Clock,
  Check,
  Plus,
  Users,
  MessageCircle,
  CheckCircle2
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const WHATSAPP_NUMBER = "393293236473";

export default function ExperienceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [experience, setExperience] = useState(null);
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
    const fetchExperience = async () => {
      try {
        const response = await axios.get(`${API}/experiences/${id}`);
        setExperience(response.data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchExperience();
  }, [id]);

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    if (!formData.guest_name || !formData.guest_phone || !formData.date) {
      toast.error("Compila i campi obbligatori");
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post(`${API}/experience-bookings`, {
        experience_id: experience.id,
        experience_name: experience.name,
        ...formData,
        num_people: parseInt(formData.num_people)
      });
      setBookingSubmitted(true);
    } catch (error) {
      toast.error("Errore nell'invio della prenotazione");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openWhatsApp = () => {
    const message = `Ciao, vorrei informazioni su: ${experience?.name}`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank");
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

  if (!experience) {
    return (
      <div className="px-5 py-6 text-center">
        <p className="text-slate-500">Esperienza non trovata</p>
        <Button onClick={() => navigate("/attivita")} className="mt-4">Torna alle attività</Button>
      </div>
    );
  }

  return (
    <div className="pb-6" data-testid="experience-detail-page">
      {/* Hero Image */}
      <div className="relative h-56">
        <img src={experience.image_url} alt={experience.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <Button variant="ghost" size="icon" onClick={() => navigate("/attivita")} className="absolute top-4 left-4 bg-white/90 rounded-full">
          <ChevronLeft className="w-5 h-5" />
        </Button>
        {experience.is_top && (
          <span className="absolute top-4 right-4 badge-recommended">Top</span>
        )}
        <div className="absolute bottom-4 left-5 right-5 text-white">
          <h1 className="text-2xl font-bold">{experience.name}</h1>
          <p className="text-white/80 capitalize">{experience.category}</p>
        </div>
      </div>

      <div className="px-5 pt-5 space-y-4">
        {/* Price & Duration */}
        <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <div className="flex gap-3">
            <Card className="flex-1 p-4 rounded-xl bg-amber-50 border-0 text-center">
              <p className="text-amber-600 font-bold text-lg">{experience.price_info}</p>
              <p className="text-slate-500 text-xs">a persona</p>
            </Card>
            {experience.duration && (
              <Card className="flex-1 p-4 rounded-xl bg-slate-50 border-0 text-center">
                <div className="flex items-center justify-center gap-1 text-slate-900 font-bold">
                  <Clock className="w-4 h-4" />
                  {experience.duration}
                </div>
                <p className="text-slate-500 text-xs">durata</p>
              </Card>
            )}
          </div>
        </motion.div>

        {/* Description */}
        <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
          <Card className="p-5 rounded-2xl bg-white border border-slate-100">
            <p className="text-slate-600 leading-relaxed">{experience.description}</p>
          </Card>
        </motion.div>

        {/* Included */}
        {experience.included && experience.included.length > 0 && (
          <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }}>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Incluso</h3>
            <Card className="p-4 rounded-xl bg-green-50 border-0">
              <ul className="space-y-2">
                {experience.included.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-slate-700 text-sm">
                    <Check className="w-4 h-4 text-green-600" /> {item}
                  </li>
                ))}
              </ul>
            </Card>
          </motion.div>
        )}

        {/* Extras */}
        {experience.extras && experience.extras.length > 0 && (
          <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Extra disponibili</h3>
            <Card className="p-4 rounded-xl bg-slate-50 border-0">
              <ul className="space-y-2">
                {experience.extras.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-slate-700 text-sm">
                    <Plus className="w-4 h-4 text-slate-400" /> {item}
                  </li>
                ))}
              </ul>
            </Card>
          </motion.div>
        )}

        {/* Min participants warning */}
        {experience.min_participants && (
          <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.25 }}>
            <Card className="p-4 rounded-xl bg-amber-50 border border-amber-200">
              <div className="flex items-center gap-2 text-amber-700">
                <Users className="w-5 h-5" />
                <span className="text-sm font-medium">Minimo {experience.min_participants} partecipanti</span>
              </div>
            </Card>
          </motion.div>
        )}

        {/* CTA Buttons */}
        <motion.div className="flex gap-3" initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
          <Button onClick={openWhatsApp} variant="outline" className="flex-1 rounded-xl">
            <MessageCircle className="w-4 h-4 mr-2" /> Chiedi info
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
              <p className="text-slate-500 mb-4">La tua prenotazione è stata inviata. Ti confermeremo disponibilità e dettagli a breve.</p>
              <Button onClick={() => { setIsDialogOpen(false); setBookingSubmitted(false); }} className="w-full">Chiudi</Button>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Prenota - {experience.name}</DialogTitle>
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

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Data *</Label>
                    <Input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label>Ora preferita</Label>
                    <Input type="time" value={formData.time} onChange={(e) => setFormData({...formData, time: e.target.value})} className="rounded-xl" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Numero partecipanti</Label>
                  <div className="flex items-center gap-3">
                    <Button type="button" variant="outline" size="icon" onClick={() => setFormData({...formData, num_people: Math.max(1, formData.num_people - 1)})}>-</Button>
                    <span className="text-lg font-semibold w-8 text-center">{formData.num_people}</span>
                    <Button type="button" variant="outline" size="icon" onClick={() => setFormData({...formData, num_people: formData.num_people + 1})}>+</Button>
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

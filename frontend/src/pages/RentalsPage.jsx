import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { ChevronLeft, Calendar, Check } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function RentalsPage() {
  const navigate = useNavigate();
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRental, setSelectedRental] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    guest_name: "",
    guest_phone: "",
    date: "",
    notes: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchRentals = async () => {
      try {
        const response = await axios.get(`${API}/rentals`);
        setRentals(response.data);
      } catch (error) {
        console.error("Error fetching rentals:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRentals();
  }, []);

  const handleBookClick = (rental) => {
    setSelectedRental(rental);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.guest_name || !formData.guest_phone || !formData.date) {
      toast.error("Compila tutti i campi obbligatori");
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post(`${API}/rental-bookings`, {
        rental_id: selectedRental.id,
        rental_name: selectedRental.name,
        ...formData
      });
      toast.success("Prenotazione inviata con successo!");
      setIsDialogOpen(false);
      setFormData({ guest_name: "", guest_phone: "", date: "", notes: "" });
    } catch (error) {
      toast.error("Errore nell'invio della prenotazione");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="px-5 py-6" data-testid="rentals-page">
      {/* Header */}
      <motion.div 
        className="flex items-center gap-3 mb-6"
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/guida")}
          className="rounded-full"
          data-testid="back-button"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Noleggi</h1>
          <p className="text-slate-500 text-sm">Attrezzature per la tua vacanza</p>
        </div>
      </motion.div>

      {/* Rentals Grid */}
      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-48 bg-slate-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {rentals.map((rental, index) => (
            <motion.div
              key={rental.id}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.05 * index }}
            >
              <Card 
                className="rounded-2xl overflow-hidden bg-white border border-slate-100"
                data-testid={`rental-${rental.id}`}
              >
                <img 
                  src={rental.image_url} 
                  alt={rental.name}
                  className="w-full h-24 object-cover"
                />
                <div className="p-3">
                  <h4 className="font-semibold text-slate-900 text-sm">{rental.name}</h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{rental.description}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-amber-600 font-bold text-sm">{rental.daily_price}</span>
                    <Button
                      size="sm"
                      onClick={() => handleBookClick(rental)}
                      className="bg-slate-900 text-white rounded-lg text-xs px-3 py-1 h-7"
                      data-testid={`rental-book-${rental.id}`}
                    >
                      Prenota
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Booking Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-sm mx-4 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Prenota {selectedRental?.name}
            </DialogTitle>
          </DialogHeader>
          
          {selectedRental && (
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="bg-slate-50 p-4 rounded-xl">
                <p className="text-sm text-slate-600">
                  <strong>Prezzo:</strong> {selectedRental.daily_price}
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  <strong>Regole:</strong> {selectedRental.rules}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="guest_name">Nome *</Label>
                <Input
                  id="guest_name"
                  value={formData.guest_name}
                  onChange={(e) => setFormData({...formData, guest_name: e.target.value})}
                  placeholder="Il tuo nome"
                  className="rounded-xl"
                  data-testid="booking-name-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="guest_phone">Telefono *</Label>
                <Input
                  id="guest_phone"
                  value={formData.guest_phone}
                  onChange={(e) => setFormData({...formData, guest_phone: e.target.value})}
                  placeholder="+39 123 456 7890"
                  className="rounded-xl"
                  data-testid="booking-phone-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Data *</Label>
                <div className="relative">
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="rounded-xl"
                    data-testid="booking-date-input"
                  />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Note (opzionale)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Es. Orario preferito di ritiro..."
                  className="rounded-xl resize-none"
                  rows={3}
                  data-testid="booking-notes-input"
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-slate-900 text-white rounded-xl py-3 font-semibold"
                data-testid="booking-submit-btn"
              >
                {isSubmitting ? "Invio in corso..." : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Conferma prenotazione
                  </>
                )}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

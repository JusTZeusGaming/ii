import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
  Sparkles,
  Bed,
  Heart,
  ShoppingCart,
  Clock,
  CheckCircle2
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const iconMap = {
  sparkles: Sparkles,
  bed: Bed,
  heart: Heart,
  "shopping-cart": ShoppingCart,
  clock: Clock
};

export default function ExtraServicesPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const struttura = searchParams.get("struttura") || "casa-brezza";
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [requestSubmitted, setRequestSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    guest_name: "",
    guest_surname: "",
    guest_phone: "",
    date: "",
    time: "",
    notes: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API}/extra-services`);
        setServices(response.data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSelectService = (service) => {
    setSelectedService(service);
    setIsDialogOpen(true);
    setRequestSubmitted(false);
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (!formData.guest_name || !formData.guest_phone || !formData.date) {
      toast.error("Compila i campi obbligatori");
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post(`${API}/extra-service-requests`, {
        property_slug: struttura,
        service_type: selectedService.id,
        ...formData
      });
      setRequestSubmitted(true);
    } catch (error) {
      toast.error("Errore nell'invio della richiesta");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="px-5 py-6" data-testid="extra-services-page">
      {/* Header */}
      <motion.div 
        className="flex items-center gap-3 mb-6"
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(`/alloggio?struttura=${struttura}`)}
          className="rounded-full"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Servizi Aggiuntivi</h1>
          <p className="text-slate-500 text-sm">Rendi speciale il tuo soggiorno</p>
        </div>
      </motion.div>

      {/* Services Grid */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-slate-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {services.map((service, index) => {
            const Icon = iconMap[service.icon] || Sparkles;
            return (
              <motion.div
                key={service.id}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.05 * index }}
              >
                <Card 
                  className="p-4 rounded-2xl bg-white border border-slate-100 cursor-pointer interactive-card"
                  onClick={() => handleSelectService(service)}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <h4 className="font-semibold text-slate-900">{service.name}</h4>
                        <span className="text-amber-600 font-bold text-sm">{service.price}</span>
                      </div>
                      <p className="text-sm text-slate-500 mt-1">{service.description}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Request Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-sm mx-4 rounded-2xl">
          {requestSubmitted ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Richiesta Inviata!</h3>
              <p className="text-slate-500 mb-4">
                La tua richiesta per "{selectedService?.name}" è stata inviata. Ti confermeremo la disponibilità a breve.
              </p>
              <Button 
                onClick={() => {
                  setIsDialogOpen(false);
                  setFormData({ guest_name: "", guest_surname: "", guest_phone: "", date: "", time: "", notes: "" });
                }}
                className="w-full"
              >
                Chiudi
              </Button>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">
                  Richiedi {selectedService?.name}
                </DialogTitle>
              </DialogHeader>
              
              {selectedService && (
                <div className="bg-amber-50 rounded-xl p-3 mb-4">
                  <p className="text-sm text-slate-600">{selectedService.description}</p>
                  <p className="text-amber-600 font-bold mt-1">{selectedService.price}</p>
                </div>
              )}

              <form onSubmit={handleSubmitRequest} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Nome *</Label>
                    <Input
                      value={formData.guest_name}
                      onChange={(e) => setFormData({...formData, guest_name: e.target.value})}
                      placeholder="Nome"
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Cognome</Label>
                    <Input
                      value={formData.guest_surname}
                      onChange={(e) => setFormData({...formData, guest_surname: e.target.value})}
                      placeholder="Cognome"
                      className="rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Telefono *</Label>
                  <Input
                    value={formData.guest_phone}
                    onChange={(e) => setFormData({...formData, guest_phone: e.target.value})}
                    placeholder="+39 123 456 7890"
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
                    <Label>Orario preferito</Label>
                    <Input
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({...formData, time: e.target.value})}
                      className="rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Note</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    placeholder="Richieste particolari..."
                    className="rounded-xl resize-none"
                    rows={2}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-slate-900 text-white rounded-xl py-3 font-semibold"
                >
                  {isSubmitting ? "Invio..." : "Invia Richiesta"}
                </Button>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

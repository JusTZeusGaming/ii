import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useProperty } from "@/context/PropertyContext";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  ChevronLeft, 
  Wrench,
  AlertTriangle,
  MessageCircle,
  Phone,
  Mail,
  Camera,
  CheckCircle2,
  Lightbulb
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function TroubleshootingPage() {
  const navigate = useNavigate();
  const { propertySlug, currentProperty } = useProperty();
  const [troubleshooting, setTroubleshooting] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [ticketSubmitted, setTicketSubmitted] = useState(false);
  const [ticketNumber, setTicketNumber] = useState("");
  const [formData, setFormData] = useState({
    description: "",
    urgency: "medio",
    contact_preference: "whatsapp",
    guest_name: "",
    guest_phone: "",
    guest_email: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Try to get property-specific troubleshooting, fallback to generic
        const response = await axios.get(`${API}/troubleshooting?property_slug=${propertySlug}`);
        setTroubleshooting(response.data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [propertySlug]);

  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    if (!formData.description) {
      toast.error("Descrivi il problema");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post(`${API}/support-tickets`, {
        property_slug: propertySlug,
        property_name: currentProperty?.name || propertySlug,
        ...formData
      });
      setTicketNumber(response.data.ticket_number);
      setTicketSubmitted(true);
    } catch (error) {
      toast.error("Errore nell'invio del ticket");
    } finally {
      setIsSubmitting(false);
    }
  };

  const urgencyOptions = [
    { value: "urgente", label: "Urgente", desc: "Problema grave, non posso usare l'alloggio", color: "bg-red-100 border-red-300 text-red-700" },
    { value: "medio", label: "Medio", desc: "Fastidioso ma gestibile", color: "bg-amber-100 border-amber-300 text-amber-700" },
    { value: "basso", label: "Basso", desc: "Può aspettare, non urgente", color: "bg-green-100 border-green-300 text-green-700" }
  ];

  const contactOptions = [
    { value: "whatsapp", label: "WhatsApp", icon: MessageCircle },
    { value: "chiamata", label: "Chiamata", icon: Phone },
    { value: "email", label: "Email", icon: Mail }
  ];

  return (
    <div className="px-5 py-6" data-testid="troubleshooting-page">
      {/* Header */}
      <motion.div 
        className="flex items-center gap-3 mb-6"
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(`/alloggio`)}
          className="rounded-full"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Guasti & Assistenza</h1>
          <p className="text-slate-500 text-sm">Trova soluzioni o apri un ticket</p>
        </div>
      </motion.div>

      {/* Quick Solutions */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-6"
      >
        <Card className="p-5 rounded-2xl bg-white border border-slate-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-amber-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Problemi comuni</h3>
          </div>
          <p className="text-slate-500 text-sm mb-4">
            Prima di aprire un ticket, prova queste soluzioni rapide:
          </p>
          
          <Accordion type="single" collapsible className="w-full">
            {troubleshooting.map((item, index) => (
              <AccordionItem key={item.id} value={item.id}>
                <AccordionTrigger className="text-left text-sm font-medium hover:no-underline">
                  <span className="flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-slate-400" />
                    {item.title}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-slate-600 text-sm bg-slate-50 p-3 rounded-lg">
                  {item.solution}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Card>
      </motion.div>

      {/* Open Ticket CTA */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="p-5 rounded-2xl bg-slate-900 text-white">
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle className="w-6 h-6 text-amber-400" />
            <h3 className="text-lg font-semibold">Il problema persiste?</h3>
          </div>
          <p className="text-slate-400 text-sm mb-4">
            Apri un ticket di assistenza e verrai ricontattato dal gestore nel minor tempo possibile.
          </p>
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white rounded-xl py-3 font-semibold"
            data-testid="open-ticket-btn"
          >
            <Wrench className="w-5 h-5 mr-2" />
            Apri Ticket Assistenza
          </Button>
        </Card>
      </motion.div>

      {/* Ticket Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-sm mx-4 rounded-2xl max-h-[90vh] overflow-y-auto">
          {ticketSubmitted ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Ticket Inviato!</h3>
              <p className="text-slate-500 mb-4">
                Il tuo ticket è stato registrato con successo.
              </p>
              <div className="bg-slate-100 rounded-xl p-4 mb-4">
                <p className="text-sm text-slate-500">Numero ticket</p>
                <p className="text-lg font-bold text-slate-900 font-mono">{ticketNumber}</p>
              </div>
              <p className="text-sm text-slate-500 mb-4">
                Verrai ricontattato dal gestore nel minor tempo possibile tramite {formData.contact_preference}.
              </p>
              <Button 
                onClick={() => {
                  setIsDialogOpen(false);
                  setTicketSubmitted(false);
                  setFormData({ description: "", urgency: "medio", contact_preference: "whatsapp", guest_name: "", guest_phone: "" });
                }}
                className="w-full"
              >
                Chiudi
              </Button>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">Apri Ticket Assistenza</DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmitTicket} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Descrizione del problema *</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Descrivi il problema in dettaglio..."
                    className="rounded-xl resize-none"
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Livello di urgenza</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {urgencyOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setFormData({...formData, urgency: opt.value})}
                        className={`p-3 rounded-xl border-2 text-center transition-all ${
                          formData.urgency === opt.value 
                            ? opt.color + " border-current" 
                            : "bg-white border-slate-200"
                        }`}
                      >
                        <span className="text-sm font-semibold">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Preferenza contatto</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {contactOptions.map((opt) => {
                      const Icon = opt.icon;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setFormData({...formData, contact_preference: opt.value})}
                          className={`p-3 rounded-xl border-2 text-center transition-all ${
                            formData.contact_preference === opt.value 
                              ? "bg-slate-900 border-slate-900 text-white" 
                              : "bg-white border-slate-200"
                          }`}
                        >
                          <Icon className="w-5 h-5 mx-auto mb-1" />
                          <span className="text-xs font-medium">{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Nome (opzionale)</Label>
                    <Input
                      value={formData.guest_name}
                      onChange={(e) => setFormData({...formData, guest_name: e.target.value})}
                      placeholder="Il tuo nome"
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Telefono (opzionale)</Label>
                    <Input
                      value={formData.guest_phone}
                      onChange={(e) => setFormData({...formData, guest_phone: e.target.value})}
                      placeholder="+39..."
                      className="rounded-xl"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-slate-900 text-white rounded-xl py-3 font-semibold"
                >
                  {isSubmitting ? "Invio in corso..." : "Invia Ticket"}
                </Button>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

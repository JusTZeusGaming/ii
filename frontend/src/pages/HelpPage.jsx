import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { MessageCircle, Phone, AlertCircle, FileText } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const WHATSAPP_NUMBER = "393293236473";

export default function HelpPage() {
  const { t, language } = useLanguage();

  const faqs = language === "it" ? [
    { question: "Come funziona il check-in?", answer: "Il check-in è disponibile dalle 15:00 alle 20:00. Riceverai le istruzioni per il ritiro delle chiavi via WhatsApp il giorno dell'arrivo." },
    { question: "Posso portare animali?", answer: "Gli animali domestici sono ammessi previo accordo con l'host. Contattaci prima della prenotazione per verificare la disponibilità." },
    { question: "C'è il parcheggio?", answer: "Sì, ogni struttura dispone di un posto auto privato o indica i parcheggi gratuiti più vicini nella sezione Mappe." },
    { question: "Come funziona la raccolta differenziata?", answer: "Il calendario della raccolta è affisso in casa. I bidoni condominiali si trovano nel cortile interno. Separa plastica, carta, umido e indifferenziata." },
    { question: "Posso richiedere un late check-out?", answer: "Il late check-out è soggetto a disponibilità. Contattaci almeno 24 ore prima della partenza per verificare." }
  ] : [
    { question: "How does check-in work?", answer: "Check-in is available from 3:00 PM to 8:00 PM. You will receive key pickup instructions via WhatsApp on arrival day." },
    { question: "Can I bring pets?", answer: "Pets are allowed by prior agreement with the host. Contact us before booking to check availability." },
    { question: "Is there parking?", answer: "Yes, each property has a private parking spot or indicates the nearest free parking in the Maps section." },
    { question: "How does waste sorting work?", answer: "The collection schedule is posted in the house. Communal bins are in the courtyard. Separate plastic, paper, organic and general waste." },
    { question: "Can I request a late check-out?", answer: "Late check-out is subject to availability. Contact us at least 24 hours before departure." }
  ];

  const emergencyContacts = [
    { name: language === "it" ? "Emergenze" : "Emergency", phone: "112" },
    { name: language === "it" ? "Guardia Medica" : "Medical Guard", phone: "0833 569 111" },
    { name: "Carabinieri Torre Lapillo", phone: "0833 565 100" },
    { name: language === "it" ? "Vigili del Fuoco" : "Fire Dept.", phone: "115" }
  ];
  const openWhatsApp = (message = "") => {
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="px-5 py-6" data-testid="help-page">
      {/* Header */}
      <motion.div 
        className="mb-6"
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <h1 className="text-2xl font-bold text-slate-900">{t("help.title")}</h1>
        <p className="text-slate-500 text-sm mt-1">{t("help.subtitle")}</p>
      </motion.div>

      {/* Main WhatsApp CTA */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <Card className="p-6 rounded-2xl bg-slate-900 text-white">
          <h2 className="text-xl font-semibold mb-2">{t("help.needHelp")}</h2>
          <p className="text-slate-400 text-sm mb-4">{t("help.needHelpDesc")}</p>
          <Button
            onClick={() => openWhatsApp("Ciao, ho bisogno di aiuto")}
            className="w-full whatsapp-btn text-white rounded-xl py-4 font-semibold text-base"
            data-testid="main-whatsapp-btn"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            {t("help.writeWhatsApp")}
          </Button>
        </Card>
      </motion.div>

      {/* FAQ Section */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-6"
      >
        <Card className="p-5 rounded-2xl bg-white border border-slate-100" data-testid="faq-section">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">{t("help.faq")}</h3>
          </div>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left text-sm font-medium">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-slate-600 text-sm">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Card>
      </motion.div>

      {/* Emergency Contacts */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mb-6"
      >
        <Card className="p-5 rounded-2xl bg-white border border-slate-100" data-testid="emergency-section">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">{t("help.emergency")}</h3>
          </div>
          <div className="space-y-3">
            {emergencyContacts.map((contact, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-slate-600">{contact.name}</span>
                <a 
                  href={`tel:${contact.phone}`}
                  className="flex items-center gap-2 text-slate-900 font-medium hover:text-amber-600"
                  data-testid={`emergency-${index}`}
                >
                  <Phone className="w-4 h-4" />
                  {contact.phone}
                </a>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Policy */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="p-5 rounded-2xl bg-slate-50 border border-slate-100" data-testid="policy-section">
          <h4 className="font-semibold text-slate-900 mb-2">{t("help.usefulInfo")}</h4>
          <p className="text-sm text-slate-500 leading-relaxed">{t("help.usefulInfoDesc")}</p>
        </Card>
      </motion.div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useProperty } from "@/context/PropertyContext";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  Wifi, LogIn, LogOut, ScrollText, Phone, Wrench, HelpCircle, ChevronLeft, ChevronRight, Sparkles
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function AccommodationPage() {
  const navigate = useNavigate();
  const { currentProperty: property, propertySlug, loading } = useProperty();
  const { t } = useLanguage();

  if (loading) {
    return (
      <div className="px-5 py-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/2"></div>
          <div className="h-32 bg-slate-200 rounded-2xl"></div>
          <div className="h-24 bg-slate-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="px-5 py-6 text-center">
        <p className="text-slate-500">{t("accom.notFound")}</p>
        <Button onClick={() => navigate("/guida")} className="mt-4">
          {t("accom.backToGuide")}
        </Button>
      </div>
    );
  }

  return (
    <div className="px-5 py-6" data-testid="accommodation-page">
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
          <h1 className="text-2xl font-bold text-slate-900">{property.name}</h1>
          <p className="text-slate-500 text-sm">{t("accom.yourAccommodation")}</p>
        </div>
      </motion.div>

      <div className="space-y-4">
        {/* WiFi Card */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-5 rounded-2xl bg-white border border-slate-100" data-testid="wifi-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Wifi className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">{t("accom.wifi")}</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">{t("accom.network")}</span>
                <span className="font-medium text-slate-900">{property.wifi_name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">{t("accom.password")}</span>
                <span className="font-mono text-slate-900 bg-slate-100 px-3 py-1 rounded-lg">
                  {property.wifi_password}
                </span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Check-in Card */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-5 rounded-2xl bg-white border border-slate-100" data-testid="checkin-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <LogIn className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">{t("accom.checkin")}</h3>
            </div>
            <p className="text-amber-600 font-semibold mb-2">{property.checkin_time}</p>
            <p className="text-slate-600 text-sm leading-relaxed">
              {property.checkin_instructions}
            </p>
          </Card>
        </motion.div>

        {/* Check-out Card */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-5 rounded-2xl bg-white border border-slate-100" data-testid="checkout-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <LogOut className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">{t("accom.checkout")}</h3>
            </div>
            <p className="text-amber-600 font-semibold mb-2">{property.checkout_time}</p>
            <p className="text-slate-600 text-sm leading-relaxed">
              {property.checkout_instructions}
            </p>
          </Card>
        </motion.div>

        {/* House Rules Card */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-5 rounded-2xl bg-white border border-slate-100" data-testid="rules-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <ScrollText className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">{t("accom.houseRules")}</h3>
            </div>
            <ul className="space-y-2">
              {property.house_rules?.map((rule, index) => (
                <li key={index} className="flex items-start gap-2 text-slate-600 text-sm">
                  <span className="text-amber-500 mt-0.5">•</span>
                  {rule}
                </li>
              ))}
            </ul>
          </Card>
        </motion.div>

        {/* Contacts Card */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-5 rounded-2xl bg-white border border-slate-100" data-testid="contacts-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Phone className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">{t("accom.contacts")}</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">{t("accom.host")} ({property.host_name})</span>
                <a 
                  href={`tel:${property.host_phone}`}
                  className="text-slate-900 font-medium hover:text-amber-600"
                >
                  {property.host_phone}
                </a>
              </div>
              {property.emergency_contacts?.map((contact, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-slate-500">{contact.name}</span>
                  <a 
                    href={`tel:${contact.phone}`}
                    className="text-slate-900 font-medium hover:text-amber-600"
                  >
                    {contact.phone}
                  </a>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Troubleshooting Card - Clickable */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Card 
            className="p-5 rounded-2xl bg-white border border-slate-100 cursor-pointer interactive-card"
            onClick={() => navigate(`/assistenza`)}
            data-testid="assistance-card"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center">
                  <Wrench className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{t("accom.troubleshooting")}</h3>
                  <p className="text-slate-500 text-sm">{t("accom.troubleshootingDesc")}</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </div>
          </Card>
        </motion.div>

        {/* Extra Services Card - Clickable */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.65 }}
        >
          <Card 
            className="p-5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 cursor-pointer interactive-card"
            onClick={() => navigate(`/servizi-extra`)}
            data-testid="extra-services-card"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{t("accom.extraServices")}</h3>
                  <p className="text-slate-500 text-sm">{t("accom.extraServicesDesc")}</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-amber-600" />
            </div>
          </Card>
        </motion.div>

        {/* FAQ Card */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="p-5 rounded-2xl bg-white border border-slate-100" data-testid="faq-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                <HelpCircle className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{t("accom.faqTitle")}</h3>
                <p className="text-slate-500 text-xs">{property.faq?.length || 0} {t("accom.faqCount")}</p>
              </div>
            </div>
            <Accordion type="single" collapsible className="w-full">
              {property.faq?.slice(0, 10).map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left text-sm font-medium hover:no-underline">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-600 text-sm">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            {property.faq?.length > 10 && (
              <p className="text-center text-sm text-slate-500 mt-4">
                + {t("accom.moreFaq", { count: property.faq.length - 10 })}
              </p>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Compass } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function SplashPage() {
  const navigate = useNavigate();
  const { t, language, toggleLanguage } = useLanguage();

  return (
    <motion.div 
      className="min-h-screen splash-bg flex flex-col items-center justify-center px-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      data-testid="splash-page"
    >
      {/* Language Toggle */}
      <button
        onClick={toggleLanguage}
        className="absolute top-6 right-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-sm font-bold text-white hover:bg-white/20 transition-all"
        data-testid="splash-language-toggle"
      >
        {language === "it" ? "EN" : "IT"}
      </button>

      <motion.div 
        className="text-center mb-12"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <Compass className="w-10 h-10 text-amber-500" />
          <h1 className="text-4xl font-bold text-white tracking-tight">Your Journey</h1>
        </div>
        <p className="text-slate-400 text-lg font-medium">{t("splash.subtitle")}</p>
      </motion.div>

      <motion.div 
        className="w-32 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent rounded-full mb-12"
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      />

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Button
          onClick={() => navigate("/guida")}
          data-testid="start-button"
          className="bg-white text-slate-900 hover:bg-slate-100 rounded-full px-12 py-6 text-lg font-semibold shadow-xl shadow-black/20 transition-all active:scale-95"
        >
          {t("splash.start")}
        </Button>
      </motion.div>

      <motion.p 
        className="absolute bottom-8 text-slate-500 text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        {t("splash.footer")}
      </motion.p>
    </motion.div>
  );
}

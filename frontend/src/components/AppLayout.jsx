import BottomNavigation from "./BottomNavigation";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";

export default function AppLayout({ children }) {
  const { language, toggleLanguage } = useLanguage();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Language Toggle - Fixed top right */}
      <button
        onClick={toggleLanguage}
        className="fixed top-3 right-3 z-50 bg-white border border-slate-200 rounded-full px-3 py-1.5 text-xs font-bold shadow-sm hover:shadow-md transition-all flex items-center gap-1.5"
        data-testid="language-toggle"
      >
        <span className={language === "it" ? "opacity-100" : "opacity-40"}>IT</span>
        <span className="text-slate-300">|</span>
        <span className={language === "en" ? "opacity-100" : "opacity-40"}>EN</span>
      </button>

      <motion.main 
        className="content-area"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.main>
      <BottomNavigation />
    </div>
  );
}

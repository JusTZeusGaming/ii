import BottomNavigation from "./BottomNavigation";
import { motion } from "framer-motion";

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50">
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

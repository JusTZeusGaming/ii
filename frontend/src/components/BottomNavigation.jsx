import { NavLink, useLocation } from "react-router-dom";
import { Home, Building2, Heart, HelpCircle } from "lucide-react";

const navItems = [
  { to: "/guida", icon: Home, label: "Guida" },
  { to: "/alloggio", icon: Building2, label: "Alloggio" },
  { to: "/noleggi", icon: Heart, label: "Servizi" },
  { to: "/aiuto", icon: HelpCircle, label: "Aiuto" },
];

export default function BottomNavigation() {
  const location = useLocation();
  
  return (
    <nav className="bottom-nav" data-testid="bottom-navigation">
      <div className="flex justify-between items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.to || 
            (item.to === "/guida" && ["/spiagge", "/ristoranti", "/attivita", "/mappe", "/trasporti"].includes(location.pathname));
          
          return (
            <NavLink
              key={item.to}
              to={item.to}
              data-testid={`nav-${item.label.toLowerCase()}`}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
                isActive 
                  ? "text-slate-900" 
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <Icon 
                size={24} 
                strokeWidth={isActive ? 2.5 : 2}
                className={isActive ? "text-amber-500" : ""}
              />
              <span className={`text-xs font-medium ${isActive ? "text-slate-900" : ""}`}>
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

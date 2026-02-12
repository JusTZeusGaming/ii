import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Compass, Lock } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error("Inserisci email e password");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${API}/admin/login`, formData);
      localStorage.setItem("admin_token", response.data.token);
      localStorage.setItem("admin_email", response.data.email);
      localStorage.setItem("admin_name", response.data.name || "Admin");
      toast.success("Accesso effettuato!");
      navigate("/admin/dashboard");
    } catch (error) {
      toast.error("Credenziali non valide");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-5" data-testid="admin-login-page">
      <motion.div
        className="w-full max-w-sm"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Compass className="w-8 h-8 text-amber-500" />
            <h1 className="text-2xl font-bold text-slate-900">Your Journey</h1>
          </div>
          <p className="text-slate-500 text-sm">Pannello Amministrazione</p>
        </div>

        {/* Login Card */}
        <Card className="p-6 rounded-2xl bg-white border border-slate-100">
          <div className="flex items-center justify-center mb-6">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
              <Lock className="w-6 h-6 text-slate-600" />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="admin@email.com"
                className="rounded-xl"
                data-testid="admin-email-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                placeholder="••••••••"
                className="rounded-xl"
                data-testid="admin-password-input"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-slate-900 text-white rounded-xl py-3 font-semibold"
              data-testid="admin-login-btn"
            >
              {isLoading ? "Accesso in corso..." : "Accedi"}
            </Button>
          </form>
        </Card>

        {/* Back to portal link */}
        <div className="text-center mt-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="text-slate-500 hover:text-slate-900"
          >
            ← Torna al portale ospiti
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

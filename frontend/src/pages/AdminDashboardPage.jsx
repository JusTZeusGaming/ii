import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Compass, 
  LogOut, 
  Building2, 
  Umbrella, 
  Utensils, 
  Compass as CompassIcon,
  Bike,
  Plus,
  Pencil,
  Trash2,
  Calendar,
  Ticket,
  Link2,
  Copy,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Users,
  Moon,
  QrCode,
  MessageCircle,
  Send,
  ExternalLink
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { QRCodeSVG } from "qrcode.react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const WHATSAPP_NUMBER = "+393293236473";

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("admin_token")}`
});

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("requests");
  const [data, setData] = useState({
    properties: [],
    beaches: [],
    restaurants: [],
    experiences: [],
    rentals: [],
    nightlifeEvents: [],
    guestBookings: [],
    allRequests: null
  });
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      navigate("/admin");
      return;
    }
    fetchAllData();
  }, [navigate]);

  const fetchAllData = async () => {
    try {
      const headers = getAuthHeaders();
      const [properties, beaches, restaurants, experiences, rentals, nightlifeEvents, guestBookings, allRequests] = await Promise.all([
        axios.get(`${API}/admin/properties`, { headers }).catch(() => ({ data: [] })),
        axios.get(`${API}/beaches`),
        axios.get(`${API}/restaurants`),
        axios.get(`${API}/experiences`),
        axios.get(`${API}/rentals`),
        axios.get(`${API}/nightlife-events`),
        axios.get(`${API}/admin/guest-bookings`, { headers }).catch(() => ({ data: [] })),
        axios.get(`${API}/admin/all-requests`, { headers }).catch(() => ({ data: null }))
      ]);
      setData({
        properties: properties.data || [],
        beaches: beaches.data || [],
        restaurants: restaurants.data || [],
        experiences: experiences.data || [],
        rentals: rentals.data || [],
        nightlifeEvents: nightlifeEvents.data || [],
        guestBookings: guestBookings.data || [],
        allRequests: allRequests.data
      });
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem("admin_token");
        navigate("/admin");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_email");
    localStorage.removeItem("admin_name");
    navigate("/admin");
  };

  // QR Code state
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [qrUrl, setQrUrl] = useState("");
  const [qrTitle, setQrTitle] = useState("");

  const showQrCode = (url, title) => {
    setQrUrl(url);
    setQrTitle(title);
    setQrDialogOpen(true);
  };

  const downloadQrCode = () => {
    const svg = document.querySelector("#qr-code-svg");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `qr-${qrTitle.toLowerCase().replace(/\s+/g, "-")}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  // Auto-generate slug from name
  const generateSlug = (name) => {
    return name.toLowerCase()
      .replace(/[àáâãäå]/g, "a")
      .replace(/[èéêë]/g, "e")
      .replace(/[ìíîï]/g, "i")
      .replace(/[òóôõö]/g, "o")
      .replace(/[ùúûü]/g, "u")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

  // Send WhatsApp notification
  const sendWhatsAppNotification = (message) => {
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${WHATSAPP_NUMBER.replace("+", "")}?text=${encodedMessage}`, "_blank");
  };

  // Confirm booking and notify customer
  const confirmAndNotify = async (collection, item, status) => {
    await updateRequestStatus(collection, item.id, status);
    
    const statusLabels = {
      confirmed: "Confermata",
      cancelled: "Annullata",
      resolved: "Risolta"
    };
    
    const customerPhone = item.guest_phone?.replace(/\s/g, "");
    if (customerPhone && status !== "pending") {
      const message = status === "confirmed" 
        ? `✅ La tua richiesta "${item.rental_name || item.restaurant_name || item.experience_name || item.event_name || "assistenza"}" è stata CONFERMATA! Grazie per aver scelto Your Journey.`
        : status === "cancelled"
        ? `❌ Purtroppo la tua richiesta non può essere confermata. Ti contatteremo presto.`
        : `✅ Il tuo ticket è stato risolto!`;
      
      if (window.confirm(`Vuoi inviare conferma WhatsApp al cliente (${customerPhone})?`)) {
        window.open(`https://wa.me/${customerPhone.replace("+", "")}?text=${encodeURIComponent(message)}`, "_blank");
      }
    }
  };

  const openDialog = (type, item = null) => {
    setDialogType(type);
    setEditingItem(item);
    setFormData(item || getEmptyForm(type));
    setIsDialogOpen(true);
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm("Sei sicuro di voler eliminare questo elemento?")) return;
    
    const endpoints = {
      properties: "properties",
      beaches: "beaches",
      restaurants: "restaurants",
      experiences: "experiences",
      rentals: "rentals",
      guestBookings: "guest-bookings"
    };

    try {
      await axios.delete(`${API}/admin/${endpoints[type]}/${id}`, { headers: getAuthHeaders() });
      toast.success("Elemento eliminato");
      fetchAllData();
    } catch (error) {
      toast.error("Errore nell'eliminazione");
    }
  };

  const handleSave = async () => {
    const endpoints = {
      properties: "properties",
      beaches: "beaches",
      restaurants: "restaurants",
      experiences: "experiences",
      rentals: "rentals",
      guestBookings: "guest-bookings"
    };

    const endpoint = endpoints[dialogType];

    try {
      if (editingItem) {
        await axios.put(`${API}/admin/${endpoint}/${editingItem.id}`, formData, { headers: getAuthHeaders() });
        toast.success("Elemento aggiornato");
      } else {
        const response = await axios.post(`${API}/admin/${endpoint}`, formData, { headers: getAuthHeaders() });
        if (dialogType === "guestBookings" && response.data.token) {
          toast.success(`Link creato! Token: ${response.data.token}`);
        } else {
          toast.success("Elemento creato");
        }
      }
      setIsDialogOpen(false);
      fetchAllData();
    } catch (error) {
      toast.error("Errore nel salvataggio");
      console.error(error);
    }
  };

  const updateRequestStatus = async (collection, requestId, status) => {
    try {
      await axios.put(`${API}/admin/request-status/${collection}/${requestId}?status=${status}`, {}, { headers: getAuthHeaders() });
      toast.success("Stato aggiornato");
      fetchAllData();
    } catch (error) {
      toast.error("Errore nell'aggiornamento");
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiato negli appunti!");
  };

  const getEmptyForm = (type) => {
    const forms = {
      properties: { name: "", slug: "", wifi_name: "", wifi_password: "", checkin_time: "", checkin_instructions: "", checkout_time: "", checkout_instructions: "", host_name: "", host_phone: "", image_url: "" },
      beaches: { name: "", description: "", distance: "", category: "libera", map_url: "", image_url: "", is_recommended: false, parking_info: "", best_time: "", tips: "", has_sunbeds: false },
      restaurants: { name: "", description: "", category: "pesce", phone: "", map_url: "", image_url: "", is_recommended: false, price_range: "", hours: "" },
      experiences: { name: "", description: "", category: "barca", price_info: "", contact_phone: "", image_url: "", is_top: false, duration: "" },
      rentals: { name: "", description: "", daily_price: 0, weekly_price: null, rules: "", image_url: "", category: "mare" },
      guestBookings: { property_id: "", property_slug: "", property_name: "", guest_name: "", guest_surname: "", num_guests: 1, room_number: "", checkin_date: "", checkout_date: "" }
    };
    return forms[type] || {};
  };

  const renderForm = () => {
    if (dialogType === "properties") {
      return (
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Nome *</Label><Input value={formData.name || ""} onChange={(e) => {
              const name = e.target.value;
              const autoSlug = !editingItem ? generateSlug(name) : formData.slug;
              setFormData({...formData, name, slug: autoSlug});
            }} placeholder="Casa Brezza" /></div>
            <div><Label>Slug URL *</Label>
              <div className="flex gap-2">
                <Input value={formData.slug || ""} onChange={(e) => setFormData({...formData, slug: e.target.value})} placeholder="casa-brezza" className="flex-1" />
                <Button type="button" variant="outline" size="sm" onClick={() => setFormData({...formData, slug: generateSlug(formData.name || "")})}>Auto</Button>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Nome WiFi</Label><Input value={formData.wifi_name || ""} onChange={(e) => setFormData({...formData, wifi_name: e.target.value})} /></div>
            <div><Label>Password WiFi</Label><Input value={formData.wifi_password || ""} onChange={(e) => setFormData({...formData, wifi_password: e.target.value})} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Orario Check-in</Label><Input value={formData.checkin_time || ""} onChange={(e) => setFormData({...formData, checkin_time: e.target.value})} placeholder="15:00 - 20:00" /></div>
            <div><Label>Orario Check-out</Label><Input value={formData.checkout_time || ""} onChange={(e) => setFormData({...formData, checkout_time: e.target.value})} placeholder="Entro le 10:00" /></div>
          </div>
          <div><Label>Istruzioni Check-in</Label><Textarea value={formData.checkin_instructions || ""} onChange={(e) => setFormData({...formData, checkin_instructions: e.target.value})} rows={2} /></div>
          <div><Label>Istruzioni Check-out</Label><Textarea value={formData.checkout_instructions || ""} onChange={(e) => setFormData({...formData, checkout_instructions: e.target.value})} rows={2} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Nome Host</Label><Input value={formData.host_name || ""} onChange={(e) => setFormData({...formData, host_name: e.target.value})} /></div>
            <div><Label>Telefono Host</Label><Input value={formData.host_phone || ""} onChange={(e) => setFormData({...formData, host_phone: e.target.value})} /></div>
          </div>
          <div><Label>URL Immagine</Label><Input value={formData.image_url || ""} onChange={(e) => setFormData({...formData, image_url: e.target.value})} /></div>
        </div>
      );
    }

    if (dialogType === "beaches") {
      return (
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          <div><Label>Nome *</Label><Input value={formData.name || ""} onChange={(e) => setFormData({...formData, name: e.target.value})} /></div>
          <div><Label>Descrizione</Label><Textarea value={formData.description || ""} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={2} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Distanza</Label><Input value={formData.distance || ""} onChange={(e) => setFormData({...formData, distance: e.target.value})} placeholder="300m" /></div>
            <div><Label>Categoria</Label>
              <select className="w-full p-2 border rounded-lg text-sm" value={formData.category || "libera"} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                <option value="libera">Libera</option>
                <option value="attrezzata">Attrezzata</option>
                <option value="family">Family</option>
                <option value="giovani">Giovani</option>
              </select>
            </div>
          </div>
          <div><Label>Info Parcheggio</Label><Textarea value={formData.parking_info || ""} onChange={(e) => setFormData({...formData, parking_info: e.target.value})} rows={2} /></div>
          <div><Label>Orari Migliori</Label><Input value={formData.best_time || ""} onChange={(e) => setFormData({...formData, best_time: e.target.value})} /></div>
          <div><Label>Consigli</Label><Textarea value={formData.tips || ""} onChange={(e) => setFormData({...formData, tips: e.target.value})} rows={2} /></div>
          <div><Label>URL Mappa</Label><Input value={formData.map_url || ""} onChange={(e) => setFormData({...formData, map_url: e.target.value})} /></div>
          <div><Label>URL Immagine</Label><Input value={formData.image_url || ""} onChange={(e) => setFormData({...formData, image_url: e.target.value})} /></div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={formData.is_recommended || false} onChange={(e) => setFormData({...formData, is_recommended: e.target.checked})} />
              <span className="text-sm">Consigliata</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={formData.has_sunbeds || false} onChange={(e) => setFormData({...formData, has_sunbeds: e.target.checked})} />
              <span className="text-sm">Ha lettini</span>
            </label>
          </div>
        </div>
      );
    }

    if (dialogType === "restaurants") {
      return (
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          <div><Label>Nome *</Label><Input value={formData.name || ""} onChange={(e) => setFormData({...formData, name: e.target.value})} /></div>
          <div><Label>Descrizione</Label><Textarea value={formData.description || ""} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={2} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Telefono</Label><Input value={formData.phone || ""} onChange={(e) => setFormData({...formData, phone: e.target.value})} /></div>
            <div><Label>Categoria</Label>
              <select className="w-full p-2 border rounded-lg text-sm" value={formData.category || "pesce"} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                <option value="pesce">Pesce</option>
                <option value="carne">Carne</option>
                <option value="pizzeria">Pizzeria</option>
                <option value="colazione">Colazione/Bar</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Fascia di Prezzo</Label><Input value={formData.price_range || ""} onChange={(e) => setFormData({...formData, price_range: e.target.value})} placeholder="€€-€€€" /></div>
            <div><Label>Orari</Label><Input value={formData.hours || ""} onChange={(e) => setFormData({...formData, hours: e.target.value})} placeholder="12:00-15:00 / 19:00-23:00" /></div>
          </div>
          <div><Label>URL Mappa</Label><Input value={formData.map_url || ""} onChange={(e) => setFormData({...formData, map_url: e.target.value})} /></div>
          <div><Label>URL Immagine</Label><Input value={formData.image_url || ""} onChange={(e) => setFormData({...formData, image_url: e.target.value})} /></div>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={formData.is_recommended || false} onChange={(e) => setFormData({...formData, is_recommended: e.target.checked})} />
            <span className="text-sm">Consigliato</span>
          </label>
        </div>
      );
    }

    if (dialogType === "experiences") {
      return (
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          <div><Label>Nome *</Label><Input value={formData.name || ""} onChange={(e) => setFormData({...formData, name: e.target.value})} /></div>
          <div><Label>Descrizione</Label><Textarea value={formData.description || ""} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={2} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Prezzo</Label><Input value={formData.price_info || ""} onChange={(e) => setFormData({...formData, price_info: e.target.value})} placeholder="€45/persona" /></div>
            <div><Label>Categoria</Label>
              <select className="w-full p-2 border rounded-lg text-sm" value={formData.category || "barca"} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                <option value="barca">Barca</option>
                <option value="escursioni">Escursioni</option>
                <option value="borghi">Borghi</option>
                <option value="sport">Sport</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Durata</Label><Input value={formData.duration || ""} onChange={(e) => setFormData({...formData, duration: e.target.value})} placeholder="Intera giornata" /></div>
            <div><Label>Telefono</Label><Input value={formData.contact_phone || ""} onChange={(e) => setFormData({...formData, contact_phone: e.target.value})} /></div>
          </div>
          <div><Label>URL Immagine</Label><Input value={formData.image_url || ""} onChange={(e) => setFormData({...formData, image_url: e.target.value})} /></div>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={formData.is_top || false} onChange={(e) => setFormData({...formData, is_top: e.target.checked})} />
            <span className="text-sm">Top esperienza</span>
          </label>
        </div>
      );
    }

    if (dialogType === "rentals") {
      return (
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          <div><Label>Nome *</Label><Input value={formData.name || ""} onChange={(e) => setFormData({...formData, name: e.target.value})} /></div>
          <div><Label>Descrizione</Label><Textarea value={formData.description || ""} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={2} /></div>
          <div className="grid grid-cols-3 gap-3">
            <div><Label>Prezzo/giorno (€)</Label><Input type="number" value={formData.daily_price || 0} onChange={(e) => setFormData({...formData, daily_price: parseFloat(e.target.value) || 0})} /></div>
            <div><Label>Prezzo/sett. (€)</Label><Input type="number" value={formData.weekly_price || ""} onChange={(e) => setFormData({...formData, weekly_price: e.target.value ? parseFloat(e.target.value) : null})} /></div>
            <div><Label>Categoria</Label>
              <select className="w-full p-2 border rounded-lg text-sm" value={formData.category || "mare"} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                <option value="mare">Attrezzatura Mare</option>
                <option value="spostamenti">Spostamenti</option>
              </select>
            </div>
          </div>
          <div><Label>Regole</Label><Textarea value={formData.rules || ""} onChange={(e) => setFormData({...formData, rules: e.target.value})} rows={2} /></div>
          <div><Label>URL Immagine</Label><Input value={formData.image_url || ""} onChange={(e) => setFormData({...formData, image_url: e.target.value})} /></div>
        </div>
      );
    }

    if (dialogType === "guestBookings") {
      return (
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          <div className="bg-blue-50 rounded-xl p-4 mb-4">
            <p className="text-sm text-blue-700">Crea un link univoco per l'ospite. Potrà accedere all'app con questo link durante il soggiorno.</p>
          </div>
          <div><Label>Struttura *</Label>
            <select className="w-full p-2 border rounded-lg text-sm" value={formData.property_slug || ""} onChange={(e) => {
              const prop = data.properties.find(p => p.slug === e.target.value);
              setFormData({...formData, property_slug: e.target.value, property_id: prop?.id || "", property_name: prop?.name || ""});
            }}>
              <option value="">Seleziona...</option>
              {data.properties.map(p => <option key={p.id} value={p.slug}>{p.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Nome ospite *</Label><Input value={formData.guest_name || ""} onChange={(e) => setFormData({...formData, guest_name: e.target.value})} /></div>
            <div><Label>Cognome ospite *</Label><Input value={formData.guest_surname || ""} onChange={(e) => setFormData({...formData, guest_surname: e.target.value})} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>N. Ospiti</Label><Input type="number" min={1} value={formData.num_guests || 1} onChange={(e) => setFormData({...formData, num_guests: parseInt(e.target.value) || 1})} /></div>
            <div><Label>Camera/Unità</Label><Input value={formData.room_number || ""} onChange={(e) => setFormData({...formData, room_number: e.target.value})} placeholder="Es. Camera 1" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Check-in *</Label><Input type="date" value={formData.checkin_date || ""} onChange={(e) => setFormData({...formData, checkin_date: e.target.value})} /></div>
            <div><Label>Check-out *</Label><Input type="date" value={formData.checkout_date || ""} onChange={(e) => setFormData({...formData, checkout_date: e.target.value})} /></div>
          </div>
        </div>
      );
    }

    return null;
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-amber-100 text-amber-700",
      confirmed: "bg-green-100 text-green-700",
      cancelled: "bg-red-100 text-red-700",
      open: "bg-amber-100 text-amber-700",
      resolved: "bg-green-100 text-green-700",
      active: "bg-green-100 text-green-700"
    };
    const labels = {
      pending: "In attesa",
      confirmed: "Confermato",
      cancelled: "Annullato",
      open: "Aperto",
      resolved: "Risolto",
      active: "Attivo"
    };
    return <Badge className={`${styles[status] || "bg-slate-100"} text-xs`}>{labels[status] || status}</Badge>;
  };

  const tabs = [
    { id: "requests", label: "Richieste", icon: Ticket },
    { id: "guestLinks", label: "Link Ospiti", icon: Link2 },
    { id: "properties", label: "Strutture", icon: Building2 },
    { id: "beaches", label: "Spiagge", icon: Umbrella },
    { id: "restaurants", label: "Ristoranti", icon: Utensils },
    { id: "experiences", label: "Esperienze", icon: CompassIcon },
    { id: "rentals", label: "Noleggi", icon: Bike },
  ];

  // Calculate total requests count
  const totalRequests = data.allRequests ? 
    Object.values(data.allRequests).reduce((sum, arr) => sum + (arr?.length || 0), 0) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50" data-testid="admin-dashboard">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Compass className="w-8 h-8 text-amber-500" />
            <div>
              <h1 className="text-xl font-bold text-slate-900">Your Journey</h1>
              <p className="text-xs text-slate-500">Admin Panel</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600 hidden sm:block">
              {localStorage.getItem("admin_name") || localStorage.getItem("admin_email")}
            </span>
            <Button variant="ghost" size="sm" onClick={handleLogout} data-testid="logout-btn">
              <LogOut className="w-4 h-4 mr-2" /> Esci
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 flex-wrap h-auto gap-1 bg-white p-1 rounded-xl">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2 text-xs sm:text-sm data-[state=active]:bg-slate-900 data-[state=active]:text-white rounded-lg px-3 py-2">
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  {tab.id === "requests" && totalRequests > 0 && (
                    <Badge className="bg-red-500 text-white text-xs ml-1">{totalRequests}</Badge>
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Requests Tab - All bookings and tickets */}
          <TabsContent value="requests">
            <div className="space-y-6">
              {/* Support Tickets */}
              {data.allRequests?.support_tickets?.length > 0 && (
                <Card className="p-4 rounded-2xl border-l-4 border-l-red-500">
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" /> Ticket Assistenza ({data.allRequests.support_tickets.length})
                  </h2>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>N. Ticket</TableHead>
                          <TableHead>Struttura</TableHead>
                          <TableHead>Descrizione</TableHead>
                          <TableHead>Urgenza</TableHead>
                          <TableHead>Contatto</TableHead>
                          <TableHead>Stato</TableHead>
                          <TableHead>Azioni</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.allRequests.support_tickets.map((ticket) => (
                          <TableRow key={ticket.id}>
                            <TableCell className="font-mono text-xs">{ticket.ticket_number}</TableCell>
                            <TableCell>{ticket.property_slug}</TableCell>
                            <TableCell className="max-w-xs truncate">{ticket.description}</TableCell>
                            <TableCell>
                              <Badge className={`text-xs ${ticket.urgency === "urgente" ? "bg-red-100 text-red-700" : ticket.urgency === "medio" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}>
                                {ticket.urgency}
                              </Badge>
                            </TableCell>
                            <TableCell>{ticket.contact_preference}</TableCell>
                            <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                            <TableCell>
                              <select className="text-xs border rounded p-1" value={ticket.status} onChange={(e) => updateRequestStatus("ticket", ticket.id, e.target.value)}>
                                <option value="open">Aperto</option>
                                <option value="resolved">Risolto</option>
                              </select>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </Card>
              )}

              {/* Rental Bookings */}
              {data.allRequests?.rental_bookings?.length > 0 && (
                <Card className="p-4 rounded-2xl">
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Bike className="w-5 h-5 text-amber-500" /> Prenotazioni Noleggi ({data.allRequests.rental_bookings.length})
                  </h2>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Servizio</TableHead>
                          <TableHead>Nome</TableHead>
                          <TableHead>Telefono</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Totale</TableHead>
                          <TableHead>Stato</TableHead>
                          <TableHead>Azioni</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.allRequests.rental_bookings.map((booking) => (
                          <TableRow key={booking.id}>
                            <TableCell className="font-medium">{booking.rental_name}</TableCell>
                            <TableCell>{booking.guest_name} {booking.guest_surname}</TableCell>
                            <TableCell>{booking.guest_phone}</TableCell>
                            <TableCell className="text-xs">{booking.start_date} → {booking.end_date || booking.start_date}</TableCell>
                            <TableCell className="font-semibold text-amber-600">{booking.total_price}</TableCell>
                            <TableCell>{getStatusBadge(booking.status)}</TableCell>
                            <TableCell>
                              <select className="text-xs border rounded p-1" value={booking.status} onChange={(e) => updateRequestStatus("rental", booking.id, e.target.value)}>
                                <option value="pending">In attesa</option>
                                <option value="confirmed">Confermato</option>
                                <option value="cancelled">Annullato</option>
                              </select>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </Card>
              )}

              {/* Beach Bookings */}
              {data.allRequests?.beach_bookings?.length > 0 && (
                <Card className="p-4 rounded-2xl">
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Umbrella className="w-5 h-5 text-blue-500" /> Prenotazioni Lidi ({data.allRequests.beach_bookings.length})
                  </h2>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Lido</TableHead>
                          <TableHead>Nome</TableHead>
                          <TableHead>Telefono</TableHead>
                          <TableHead>Data</TableHead>
                          <TableHead>Durata</TableHead>
                          <TableHead>Stato</TableHead>
                          <TableHead>Azioni</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.allRequests.beach_bookings.map((booking) => (
                          <TableRow key={booking.id}>
                            <TableCell className="font-medium">{booking.beach_name}</TableCell>
                            <TableCell>{booking.guest_name}</TableCell>
                            <TableCell>{booking.guest_phone}</TableCell>
                            <TableCell>{booking.date}</TableCell>
                            <TableCell>{booking.duration}</TableCell>
                            <TableCell>{getStatusBadge(booking.status)}</TableCell>
                            <TableCell>
                              <select className="text-xs border rounded p-1" value={booking.status} onChange={(e) => updateRequestStatus("beach", booking.id, e.target.value)}>
                                <option value="pending">In attesa</option>
                                <option value="confirmed">Confermato</option>
                                <option value="cancelled">Annullato</option>
                              </select>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </Card>
              )}

              {/* Restaurant Bookings */}
              {data.allRequests?.restaurant_bookings?.length > 0 && (
                <Card className="p-4 rounded-2xl">
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Utensils className="w-5 h-5 text-orange-500" /> Prenotazioni Ristoranti ({data.allRequests.restaurant_bookings.length})
                  </h2>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Ristorante</TableHead>
                          <TableHead>Nome</TableHead>
                          <TableHead>Telefono</TableHead>
                          <TableHead>Data</TableHead>
                          <TableHead>Ora</TableHead>
                          <TableHead>Persone</TableHead>
                          <TableHead>Stato</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.allRequests.restaurant_bookings.map((booking) => (
                          <TableRow key={booking.id}>
                            <TableCell className="font-medium">{booking.restaurant_name}</TableCell>
                            <TableCell>{booking.guest_name}</TableCell>
                            <TableCell>{booking.guest_phone}</TableCell>
                            <TableCell>{booking.date}</TableCell>
                            <TableCell>{booking.time}</TableCell>
                            <TableCell>{booking.num_people}</TableCell>
                            <TableCell>{getStatusBadge(booking.status)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </Card>
              )}

              {/* Experience Bookings */}
              {data.allRequests?.experience_bookings?.length > 0 && (
                <Card className="p-4 rounded-2xl">
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <CompassIcon className="w-5 h-5 text-green-500" /> Prenotazioni Esperienze ({data.allRequests.experience_bookings.length})
                  </h2>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Esperienza</TableHead>
                          <TableHead>Nome</TableHead>
                          <TableHead>Telefono</TableHead>
                          <TableHead>Data</TableHead>
                          <TableHead>Partecipanti</TableHead>
                          <TableHead>Stato</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.allRequests.experience_bookings.map((booking) => (
                          <TableRow key={booking.id}>
                            <TableCell className="font-medium">{booking.experience_name}</TableCell>
                            <TableCell>{booking.guest_name}</TableCell>
                            <TableCell>{booking.guest_phone}</TableCell>
                            <TableCell>{booking.date}</TableCell>
                            <TableCell>{booking.num_people}</TableCell>
                            <TableCell>{getStatusBadge(booking.status)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </Card>
              )}

              {/* Nightlife Bookings */}
              {data.allRequests?.nightlife_bookings?.length > 0 && (
                <Card className="p-4 rounded-2xl">
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Moon className="w-5 h-5 text-purple-500" /> Prenotazioni Eventi/Discoteca ({data.allRequests.nightlife_bookings.length})
                  </h2>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Evento</TableHead>
                          <TableHead>Nome</TableHead>
                          <TableHead>Telefono</TableHead>
                          <TableHead>Pacchetto</TableHead>
                          <TableHead>Persone</TableHead>
                          <TableHead>Stato</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.allRequests.nightlife_bookings.map((booking) => (
                          <TableRow key={booking.id}>
                            <TableCell className="font-medium">{booking.event_name}</TableCell>
                            <TableCell>{booking.guest_name}</TableCell>
                            <TableCell>{booking.guest_phone}</TableCell>
                            <TableCell>{booking.package === "entry_transport" ? "Ingresso + Trasporto" : "Solo Ingresso"}</TableCell>
                            <TableCell>{booking.num_people}</TableCell>
                            <TableCell>{getStatusBadge(booking.status)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </Card>
              )}

              {/* Extra Service Requests */}
              {data.allRequests?.extra_service_requests?.length > 0 && (
                <Card className="p-4 rounded-2xl">
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-teal-500" /> Richieste Servizi Extra ({data.allRequests.extra_service_requests.length})
                  </h2>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Servizio</TableHead>
                          <TableHead>Struttura</TableHead>
                          <TableHead>Nome</TableHead>
                          <TableHead>Telefono</TableHead>
                          <TableHead>Data</TableHead>
                          <TableHead>Stato</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.allRequests.extra_service_requests.map((req) => (
                          <TableRow key={req.id}>
                            <TableCell className="font-medium">{req.service_type}</TableCell>
                            <TableCell>{req.property_slug}</TableCell>
                            <TableCell>{req.guest_name}</TableCell>
                            <TableCell>{req.guest_phone}</TableCell>
                            <TableCell>{req.date}</TableCell>
                            <TableCell>{getStatusBadge(req.status)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </Card>
              )}

              {totalRequests === 0 && (
                <Card className="p-8 rounded-2xl text-center">
                  <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900">Nessuna richiesta in sospeso</h3>
                  <p className="text-slate-500 mt-2">Le nuove prenotazioni e ticket appariranno qui.</p>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Guest Links Tab */}
          <TabsContent value="guestLinks">
            <Card className="p-4 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold">Link Personalizzati Ospiti</h2>
                  <p className="text-sm text-slate-500">Crea link univoci per ogni soggiorno</p>
                </div>
                <Button onClick={() => openDialog("guestBookings")} size="sm" className="bg-amber-500 hover:bg-amber-600" data-testid="add-guest-link-btn">
                  <Plus className="w-4 h-4 mr-2" /> Nuovo Link
                </Button>
              </div>
              
              {data.guestBookings.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ospite</TableHead>
                        <TableHead>Struttura</TableHead>
                        <TableHead>Check-in</TableHead>
                        <TableHead>Check-out</TableHead>
                        <TableHead>Link</TableHead>
                        <TableHead>Stato</TableHead>
                        <TableHead>Azioni</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.guestBookings.map((booking) => {
                        const fullUrl = `${window.location.origin}/p/${booking.token}`;
                        const isExpired = new Date(booking.checkout_date) < new Date();
                        return (
                          <TableRow key={booking.id}>
                            <TableCell className="font-medium">{booking.guest_name} {booking.guest_surname}</TableCell>
                            <TableCell>{booking.property_name}</TableCell>
                            <TableCell>{booking.checkin_date}</TableCell>
                            <TableCell>{booking.checkout_date}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <code className="text-xs bg-slate-100 px-2 py-1 rounded">/p/{booking.token}</code>
                                <Button variant="ghost" size="sm" onClick={() => copyToClipboard(fullUrl)}>
                                  <Copy className="w-3 h-3" />
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell>
                              {isExpired ? (
                                <Badge className="bg-slate-100 text-slate-500 text-xs">Scaduto</Badge>
                              ) : (
                                <Badge className="bg-green-100 text-green-700 text-xs">Attivo</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm" onClick={() => handleDelete("guestBookings", booking.id)}>
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Link2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">Nessun link creato. Clicca "Nuovo Link" per iniziare.</p>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Properties Tab */}
          <TabsContent value="properties">
            <Card className="p-4 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Gestione Strutture</h2>
                <Button onClick={() => openDialog("properties")} size="sm" data-testid="add-property-btn">
                  <Plus className="w-4 h-4 mr-2" /> Aggiungi
                </Button>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead>Host</TableHead>
                      <TableHead>Link portale</TableHead>
                      <TableHead className="text-right">Azioni</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.properties.map((prop) => (
                      <TableRow key={prop.id}>
                        <TableCell className="font-medium">{prop.name}</TableCell>
                        <TableCell><code className="text-xs bg-slate-100 px-2 py-1 rounded">{prop.slug}</code></TableCell>
                        <TableCell>{prop.host_name}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => copyToClipboard(`${window.location.origin}/guida?struttura=${prop.slug}`)}>
                            <Copy className="w-3 h-3 mr-1" /> Copia
                          </Button>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => openDialog("properties", prop)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete("properties", prop.id)}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {data.properties.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-slate-500 py-8">
                          Nessuna struttura. Clicca "Aggiungi" per crearne una.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>

          {/* Beaches Tab */}
          <TabsContent value="beaches">
            <Card className="p-4 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Gestione Spiagge ({data.beaches.length})</h2>
                <Button onClick={() => openDialog("beaches")} size="sm" data-testid="add-beach-btn">
                  <Plus className="w-4 h-4 mr-2" /> Aggiungi
                </Button>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Distanza</TableHead>
                      <TableHead>Lettini</TableHead>
                      <TableHead>Consigliata</TableHead>
                      <TableHead className="text-right">Azioni</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.beaches.map((beach) => (
                      <TableRow key={beach.id}>
                        <TableCell className="font-medium">{beach.name}</TableCell>
                        <TableCell className="capitalize">{beach.category}</TableCell>
                        <TableCell>{beach.distance}</TableCell>
                        <TableCell>{beach.has_sunbeds ? "Sì" : "No"}</TableCell>
                        <TableCell>{beach.is_recommended ? <Badge className="bg-amber-100 text-amber-700 text-xs">Sì</Badge> : "No"}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => openDialog("beaches", beach)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete("beaches", beach.id)}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>

          {/* Restaurants Tab */}
          <TabsContent value="restaurants">
            <Card className="p-4 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Gestione Ristoranti ({data.restaurants.length})</h2>
                <Button onClick={() => openDialog("restaurants")} size="sm" data-testid="add-restaurant-btn">
                  <Plus className="w-4 h-4 mr-2" /> Aggiungi
                </Button>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Telefono</TableHead>
                      <TableHead>Prezzo</TableHead>
                      <TableHead>Consigliato</TableHead>
                      <TableHead className="text-right">Azioni</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.restaurants.map((rest) => (
                      <TableRow key={rest.id}>
                        <TableCell className="font-medium">{rest.name}</TableCell>
                        <TableCell className="capitalize">{rest.category}</TableCell>
                        <TableCell>{rest.phone}</TableCell>
                        <TableCell>{rest.price_range}</TableCell>
                        <TableCell>{rest.is_recommended ? <Badge className="bg-amber-100 text-amber-700 text-xs">Sì</Badge> : "No"}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => openDialog("restaurants", rest)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete("restaurants", rest.id)}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>

          {/* Experiences Tab */}
          <TabsContent value="experiences">
            <Card className="p-4 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Gestione Esperienze ({data.experiences.length})</h2>
                <Button onClick={() => openDialog("experiences")} size="sm" data-testid="add-experience-btn">
                  <Plus className="w-4 h-4 mr-2" /> Aggiungi
                </Button>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Prezzo</TableHead>
                      <TableHead>Durata</TableHead>
                      <TableHead>Top</TableHead>
                      <TableHead className="text-right">Azioni</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.experiences.map((exp) => (
                      <TableRow key={exp.id}>
                        <TableCell className="font-medium">{exp.name}</TableCell>
                        <TableCell className="capitalize">{exp.category}</TableCell>
                        <TableCell>{exp.price_info}</TableCell>
                        <TableCell>{exp.duration}</TableCell>
                        <TableCell>{exp.is_top ? <Badge className="bg-amber-100 text-amber-700 text-xs">Sì</Badge> : "No"}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => openDialog("experiences", exp)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete("experiences", exp.id)}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>

          {/* Rentals Tab */}
          <TabsContent value="rentals">
            <Card className="p-4 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Gestione Noleggi ({data.rentals.length})</h2>
                <Button onClick={() => openDialog("rentals")} size="sm" data-testid="add-rental-btn">
                  <Plus className="w-4 h-4 mr-2" /> Aggiungi
                </Button>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Prezzo/g</TableHead>
                      <TableHead>Prezzo/sett</TableHead>
                      <TableHead className="text-right">Azioni</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.rentals.map((rental) => (
                      <TableRow key={rental.id}>
                        <TableCell className="font-medium">{rental.name}</TableCell>
                        <TableCell className="capitalize">{rental.category === "mare" ? "Mare" : "Spostamenti"}</TableCell>
                        <TableCell>€{rental.daily_price}</TableCell>
                        <TableCell>{rental.weekly_price ? `€${rental.weekly_price}` : "-"}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => openDialog("rentals", rental)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete("rentals", rental.id)}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Edit/Add Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Modifica" : "Aggiungi"} {
                dialogType === "properties" ? "Struttura" : 
                dialogType === "beaches" ? "Spiaggia" : 
                dialogType === "restaurants" ? "Ristorante" : 
                dialogType === "experiences" ? "Esperienza" : 
                dialogType === "rentals" ? "Noleggio" :
                dialogType === "guestBookings" ? "Link Ospite" : ""
              }
            </DialogTitle>
          </DialogHeader>
          {renderForm()}
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Annulla</Button>
            <Button onClick={handleSave} className="bg-amber-500 hover:bg-amber-600" data-testid="save-item-btn">Salva</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

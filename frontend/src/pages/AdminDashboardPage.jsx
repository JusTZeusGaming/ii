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
import { 
  Compass, 
  LogOut, 
  Building2, 
  Umbrella, 
  Utensils, 
  Compass as CompassIcon,
  Bike,
  Map,
  Bus,
  Plus,
  Pencil,
  Trash2,
  Calendar,
  Users
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("admin_token")}`
});

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("properties");
  const [data, setData] = useState({
    properties: [],
    beaches: [],
    restaurants: [],
    experiences: [],
    rentals: [],
    mapInfo: [],
    transports: [],
    rentalBookings: [],
    transportRequests: []
  });
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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
      const [properties, beaches, restaurants, experiences, rentals, mapInfo, transports, rentalBookings, transportRequests] = await Promise.all([
        axios.get(`${API}/admin/properties`, { headers }),
        axios.get(`${API}/beaches`),
        axios.get(`${API}/restaurants`),
        axios.get(`${API}/experiences`),
        axios.get(`${API}/rentals`),
        axios.get(`${API}/map-info`),
        axios.get(`${API}/transports`),
        axios.get(`${API}/admin/rental-bookings`, { headers }),
        axios.get(`${API}/admin/transport-requests`, { headers })
      ]);
      setData({
        properties: properties.data,
        beaches: beaches.data,
        restaurants: restaurants.data,
        experiences: experiences.data,
        rentals: rentals.data,
        mapInfo: mapInfo.data,
        transports: transports.data,
        rentalBookings: rentalBookings.data,
        transportRequests: transportRequests.data
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
    localStorage.removeItem("admin_username");
    navigate("/admin");
  };

  const handleAdd = (type) => {
    setEditingItem(null);
    setFormData(getEmptyForm(type));
    setIsDialogOpen(true);
  };

  const handleEdit = (type, item) => {
    setEditingItem({ type, item });
    setFormData(item);
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
      mapInfo: "map-info",
      transports: "transports"
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
      mapInfo: "map-info",
      transports: "transports"
    };

    const type = editingItem?.type || activeTab;
    const endpoint = endpoints[type];

    try {
      if (editingItem) {
        await axios.put(`${API}/admin/${endpoint}/${editingItem.item.id}`, formData, { headers: getAuthHeaders() });
        toast.success("Elemento aggiornato");
      } else {
        await axios.post(`${API}/admin/${endpoint}`, formData, { headers: getAuthHeaders() });
        toast.success("Elemento creato");
      }
      setIsDialogOpen(false);
      fetchAllData();
    } catch (error) {
      toast.error("Errore nel salvataggio");
    }
  };

  const getEmptyForm = (type) => {
    const forms = {
      properties: { name: "", slug: "", wifi_name: "", wifi_password: "", checkin_time: "", checkin_instructions: "", checkout_time: "", checkout_instructions: "", house_rules: [], host_name: "", host_phone: "", emergency_contacts: [], faq: [], image_url: "" },
      beaches: { name: "", description: "", distance: "", category: "libera", map_url: "", image_url: "", is_recommended: false },
      restaurants: { name: "", description: "", category: "pesce", phone: "", map_url: "", image_url: "", is_recommended: false },
      experiences: { name: "", description: "", category: "barca", price_info: "", contact_phone: "", image_url: "", is_top: false },
      rentals: { name: "", description: "", daily_price: "", rules: "", image_url: "" },
      mapInfo: { name: "", description: "", category: "parcheggi", map_url: "", icon: "car" },
      transports: { name: "", description: "", category: "navette", contact_phone: "", price_info: "" }
    };
    return forms[type] || {};
  };

  const renderForm = () => {
    const type = editingItem?.type || activeTab;
    
    if (type === "properties") {
      return (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Nome</Label><Input value={formData.name || ""} onChange={(e) => setFormData({...formData, name: e.target.value})} /></div>
            <div><Label>Slug URL</Label><Input value={formData.slug || ""} onChange={(e) => setFormData({...formData, slug: e.target.value})} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Nome WiFi</Label><Input value={formData.wifi_name || ""} onChange={(e) => setFormData({...formData, wifi_name: e.target.value})} /></div>
            <div><Label>Password WiFi</Label><Input value={formData.wifi_password || ""} onChange={(e) => setFormData({...formData, wifi_password: e.target.value})} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Orario Check-in</Label><Input value={formData.checkin_time || ""} onChange={(e) => setFormData({...formData, checkin_time: e.target.value})} /></div>
            <div><Label>Orario Check-out</Label><Input value={formData.checkout_time || ""} onChange={(e) => setFormData({...formData, checkout_time: e.target.value})} /></div>
          </div>
          <div><Label>Istruzioni Check-in</Label><Textarea value={formData.checkin_instructions || ""} onChange={(e) => setFormData({...formData, checkin_instructions: e.target.value})} /></div>
          <div><Label>Istruzioni Check-out</Label><Textarea value={formData.checkout_instructions || ""} onChange={(e) => setFormData({...formData, checkout_instructions: e.target.value})} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Nome Host</Label><Input value={formData.host_name || ""} onChange={(e) => setFormData({...formData, host_name: e.target.value})} /></div>
            <div><Label>Telefono Host</Label><Input value={formData.host_phone || ""} onChange={(e) => setFormData({...formData, host_phone: e.target.value})} /></div>
          </div>
          <div><Label>URL Immagine</Label><Input value={formData.image_url || ""} onChange={(e) => setFormData({...formData, image_url: e.target.value})} /></div>
        </div>
      );
    }

    if (type === "beaches") {
      return (
        <div className="space-y-4">
          <div><Label>Nome</Label><Input value={formData.name || ""} onChange={(e) => setFormData({...formData, name: e.target.value})} /></div>
          <div><Label>Descrizione</Label><Textarea value={formData.description || ""} onChange={(e) => setFormData({...formData, description: e.target.value})} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Distanza</Label><Input value={formData.distance || ""} onChange={(e) => setFormData({...formData, distance: e.target.value})} placeholder="Es. 300m" /></div>
            <div><Label>Categoria</Label>
              <select className="w-full p-2 border rounded-lg" value={formData.category || ""} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                <option value="libera">Libera</option>
                <option value="attrezzata">Attrezzata</option>
                <option value="family">Family</option>
                <option value="giovani">Giovani</option>
              </select>
            </div>
          </div>
          <div><Label>URL Mappa</Label><Input value={formData.map_url || ""} onChange={(e) => setFormData({...formData, map_url: e.target.value})} /></div>
          <div><Label>URL Immagine</Label><Input value={formData.image_url || ""} onChange={(e) => setFormData({...formData, image_url: e.target.value})} /></div>
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={formData.is_recommended || false} onChange={(e) => setFormData({...formData, is_recommended: e.target.checked})} />
            <Label>Consigliata</Label>
          </div>
        </div>
      );
    }

    if (type === "restaurants") {
      return (
        <div className="space-y-4">
          <div><Label>Nome</Label><Input value={formData.name || ""} onChange={(e) => setFormData({...formData, name: e.target.value})} /></div>
          <div><Label>Descrizione</Label><Textarea value={formData.description || ""} onChange={(e) => setFormData({...formData, description: e.target.value})} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Telefono</Label><Input value={formData.phone || ""} onChange={(e) => setFormData({...formData, phone: e.target.value})} /></div>
            <div><Label>Categoria</Label>
              <select className="w-full p-2 border rounded-lg" value={formData.category || ""} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                <option value="pesce">Pesce</option>
                <option value="carne">Carne</option>
                <option value="pizzeria">Pizzeria</option>
                <option value="colazione">Colazione</option>
              </select>
            </div>
          </div>
          <div><Label>URL Mappa</Label><Input value={formData.map_url || ""} onChange={(e) => setFormData({...formData, map_url: e.target.value})} /></div>
          <div><Label>URL Immagine</Label><Input value={formData.image_url || ""} onChange={(e) => setFormData({...formData, image_url: e.target.value})} /></div>
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={formData.is_recommended || false} onChange={(e) => setFormData({...formData, is_recommended: e.target.checked})} />
            <Label>Consigliato</Label>
          </div>
        </div>
      );
    }

    if (type === "experiences") {
      return (
        <div className="space-y-4">
          <div><Label>Nome</Label><Input value={formData.name || ""} onChange={(e) => setFormData({...formData, name: e.target.value})} /></div>
          <div><Label>Descrizione</Label><Textarea value={formData.description || ""} onChange={(e) => setFormData({...formData, description: e.target.value})} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Prezzo</Label><Input value={formData.price_info || ""} onChange={(e) => setFormData({...formData, price_info: e.target.value})} placeholder="Da €45/persona" /></div>
            <div><Label>Categoria</Label>
              <select className="w-full p-2 border rounded-lg" value={formData.category || ""} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                <option value="barca">Barca</option>
                <option value="escursioni">Escursioni</option>
                <option value="nightlife">Nightlife</option>
                <option value="borghi">Borghi</option>
              </select>
            </div>
          </div>
          <div><Label>Telefono contatto</Label><Input value={formData.contact_phone || ""} onChange={(e) => setFormData({...formData, contact_phone: e.target.value})} /></div>
          <div><Label>URL Immagine</Label><Input value={formData.image_url || ""} onChange={(e) => setFormData({...formData, image_url: e.target.value})} /></div>
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={formData.is_top || false} onChange={(e) => setFormData({...formData, is_top: e.target.checked})} />
            <Label>Top esperienza</Label>
          </div>
        </div>
      );
    }

    if (type === "rentals") {
      return (
        <div className="space-y-4">
          <div><Label>Nome</Label><Input value={formData.name || ""} onChange={(e) => setFormData({...formData, name: e.target.value})} /></div>
          <div><Label>Descrizione</Label><Textarea value={formData.description || ""} onChange={(e) => setFormData({...formData, description: e.target.value})} /></div>
          <div><Label>Prezzo giornaliero</Label><Input value={formData.daily_price || ""} onChange={(e) => setFormData({...formData, daily_price: e.target.value})} placeholder="€15/giorno" /></div>
          <div><Label>Regole</Label><Textarea value={formData.rules || ""} onChange={(e) => setFormData({...formData, rules: e.target.value})} /></div>
          <div><Label>URL Immagine</Label><Input value={formData.image_url || ""} onChange={(e) => setFormData({...formData, image_url: e.target.value})} /></div>
        </div>
      );
    }

    return null;
  };

  const tabs = [
    { id: "properties", label: "Strutture", icon: Building2 },
    { id: "beaches", label: "Spiagge", icon: Umbrella },
    { id: "restaurants", label: "Ristoranti", icon: Utensils },
    { id: "experiences", label: "Esperienze", icon: CompassIcon },
    { id: "rentals", label: "Noleggi", icon: Bike },
    { id: "bookings", label: "Prenotazioni", icon: Calendar },
  ];

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
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Compass className="w-8 h-8 text-amber-500" />
            <div>
              <h1 className="text-xl font-bold text-slate-900">Your Journey</h1>
              <p className="text-xs text-slate-500">Admin Panel</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">
              {localStorage.getItem("admin_username")}
            </span>
            <Button variant="ghost" size="sm" onClick={handleLogout} data-testid="logout-btn">
              <LogOut className="w-4 h-4 mr-2" /> Esci
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 flex-wrap h-auto gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Properties Tab */}
          <TabsContent value="properties">
            <Card className="p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Gestione Strutture</h2>
                <Button onClick={() => handleAdd("properties")} size="sm" data-testid="add-property-btn">
                  <Plus className="w-4 h-4 mr-2" /> Aggiungi
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Host</TableHead>
                    <TableHead className="text-right">Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.properties.map((prop) => (
                    <TableRow key={prop.id}>
                      <TableCell className="font-medium">{prop.name}</TableCell>
                      <TableCell>{prop.slug}</TableCell>
                      <TableCell>{prop.host_name}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit("properties", prop)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete("properties", prop.id)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Beaches Tab */}
          <TabsContent value="beaches">
            <Card className="p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Gestione Spiagge</h2>
                <Button onClick={() => handleAdd("beaches")} size="sm" data-testid="add-beach-btn">
                  <Plus className="w-4 h-4 mr-2" /> Aggiungi
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Distanza</TableHead>
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
                      <TableCell>{beach.is_recommended ? "Sì" : "No"}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit("beaches", beach)}>
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
            </Card>
          </TabsContent>

          {/* Restaurants Tab */}
          <TabsContent value="restaurants">
            <Card className="p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Gestione Ristoranti</h2>
                <Button onClick={() => handleAdd("restaurants")} size="sm" data-testid="add-restaurant-btn">
                  <Plus className="w-4 h-4 mr-2" /> Aggiungi
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Telefono</TableHead>
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
                      <TableCell>{rest.is_recommended ? "Sì" : "No"}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit("restaurants", rest)}>
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
            </Card>
          </TabsContent>

          {/* Experiences Tab */}
          <TabsContent value="experiences">
            <Card className="p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Gestione Esperienze</h2>
                <Button onClick={() => handleAdd("experiences")} size="sm" data-testid="add-experience-btn">
                  <Plus className="w-4 h-4 mr-2" /> Aggiungi
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Prezzo</TableHead>
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
                      <TableCell>{exp.is_top ? "Sì" : "No"}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit("experiences", exp)}>
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
            </Card>
          </TabsContent>

          {/* Rentals Tab */}
          <TabsContent value="rentals">
            <Card className="p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Gestione Noleggi</h2>
                <Button onClick={() => handleAdd("rentals")} size="sm" data-testid="add-rental-btn">
                  <Plus className="w-4 h-4 mr-2" /> Aggiungi
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Prezzo</TableHead>
                    <TableHead className="text-right">Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.rentals.map((rental) => (
                    <TableRow key={rental.id}>
                      <TableCell className="font-medium">{rental.name}</TableCell>
                      <TableCell>{rental.daily_price}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit("rentals", rental)}>
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
            </Card>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings">
            <div className="space-y-6">
              <Card className="p-6 rounded-2xl">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Bike className="w-5 h-5" /> Prenotazioni Noleggi
                </h2>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Servizio</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Telefono</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Note</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.rentalBookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell className="font-medium">{booking.rental_name}</TableCell>
                        <TableCell>{booking.guest_name}</TableCell>
                        <TableCell>{booking.guest_phone}</TableCell>
                        <TableCell>{booking.date}</TableCell>
                        <TableCell>{booking.notes || "-"}</TableCell>
                      </TableRow>
                    ))}
                    {data.rentalBookings.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-slate-500">
                          Nessuna prenotazione
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Card>

              <Card className="p-6 rounded-2xl">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Bus className="w-5 h-5" /> Richieste Trasporto
                </h2>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Telefono</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Persone</TableHead>
                      <TableHead>Tratta</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.transportRequests.map((req) => (
                      <TableRow key={req.id}>
                        <TableCell className="font-medium">{req.guest_name}</TableCell>
                        <TableCell>{req.guest_phone}</TableCell>
                        <TableCell>{req.date}</TableCell>
                        <TableCell>{req.num_people}</TableCell>
                        <TableCell>{req.route}</TableCell>
                      </TableRow>
                    ))}
                    {data.transportRequests.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-slate-500">
                          Nessuna richiesta
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Edit/Add Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Modifica" : "Aggiungi"} {activeTab === "properties" ? "Struttura" : activeTab === "beaches" ? "Spiaggia" : activeTab === "restaurants" ? "Ristorante" : activeTab === "experiences" ? "Esperienza" : "Noleggio"}
            </DialogTitle>
          </DialogHeader>
          {renderForm()}
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Annulla</Button>
            <Button onClick={handleSave} data-testid="save-item-btn">Salva</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

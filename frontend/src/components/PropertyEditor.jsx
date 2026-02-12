import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Wifi,
  LogIn,
  LogOut,
  ScrollText,
  Phone,
  HelpCircle,
  Wrench,
  Sparkles,
  Plus,
  Trash2,
  Save,
  X,
  GripVertical
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("admin_token")}`
});

export default function PropertyEditor({ property, onSave, onClose }) {
  const [formData, setFormData] = useState({
    // Basic
    name: property?.name || "",
    slug: property?.slug || "",
    image_url: property?.image_url || "",
    // WiFi
    wifi_name: property?.wifi_name || "",
    wifi_password: property?.wifi_password || "",
    wifi_notes: property?.wifi_notes || "",
    // Check-in/out
    checkin_time: property?.checkin_time || "",
    checkin_instructions: property?.checkin_instructions || "",
    checkout_time: property?.checkout_time || "",
    checkout_instructions: property?.checkout_instructions || "",
    // Host
    host_name: property?.host_name || "",
    host_phone: property?.host_phone || "",
    host_email: property?.host_email || "",
    // Rules
    house_rules: property?.house_rules || [],
    // Contacts
    emergency_contacts: property?.emergency_contacts || [],
    // FAQ
    faq: property?.faq || [],
    // Common issues
    common_issues: property?.common_issues || [],
    // Extra services
    extra_services: property?.extra_services || []
  });

  const [activeTab, setActiveTab] = useState("basic");
  const [isSaving, setIsSaving] = useState(false);

  // Generic add/remove for arrays
  const addItem = (field, template) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], { ...template, id: Date.now().toString() }]
    }));
  };

  const removeItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const updateItem = (field, index, key, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? { ...item, [key]: value } : item)
    }));
  };

  const handleSave = async () => {
    if (!formData.name || !formData.slug) {
      toast.error("Nome e Slug sono obbligatori");
      return;
    }

    setIsSaving(true);
    try {
      if (property?.id) {
        await axios.put(`${API}/admin/properties/${property.id}`, formData, { headers: getAuthHeaders() });
      } else {
        await axios.post(`${API}/admin/properties`, formData, { headers: getAuthHeaders() });
      }
      toast.success("Struttura salvata!");
      onSave();
    } catch (error) {
      toast.error("Errore nel salvataggio");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-white">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold">
            {property?.id ? `Modifica: ${property.name}` : "Nuova Struttura"}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="p-4">
            <TabsList className="flex-wrap mb-4">
              <TabsTrigger value="basic" className="flex items-center gap-1"><ScrollText className="w-4 h-4" /> Base</TabsTrigger>
              <TabsTrigger value="wifi" className="flex items-center gap-1"><Wifi className="w-4 h-4" /> WiFi</TabsTrigger>
              <TabsTrigger value="checkin" className="flex items-center gap-1"><LogIn className="w-4 h-4" /> Check-in/out</TabsTrigger>
              <TabsTrigger value="contacts" className="flex items-center gap-1"><Phone className="w-4 h-4" /> Contatti</TabsTrigger>
              <TabsTrigger value="rules" className="flex items-center gap-1"><ScrollText className="w-4 h-4" /> Regole</TabsTrigger>
              <TabsTrigger value="faq" className="flex items-center gap-1"><HelpCircle className="w-4 h-4" /> FAQ</TabsTrigger>
              <TabsTrigger value="issues" className="flex items-center gap-1"><Wrench className="w-4 h-4" /> Guasti</TabsTrigger>
              <TabsTrigger value="services" className="flex items-center gap-1"><Sparkles className="w-4 h-4" /> Servizi</TabsTrigger>
            </TabsList>

            {/* Basic Info */}
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nome struttura *</Label>
                  <Input 
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Casa Brezza Marina"
                  />
                </div>
                <div>
                  <Label>Slug URL *</Label>
                  <Input 
                    value={formData.slug} 
                    onChange={(e) => setFormData({...formData, slug: e.target.value})}
                    placeholder="casa-brezza-marina"
                  />
                  <p className="text-xs text-slate-500 mt-1">URL: /guida?struttura={formData.slug || "..."}</p>
                </div>
              </div>
              <div>
                <Label>URL Immagine copertina</Label>
                <Input 
                  value={formData.image_url} 
                  onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                  placeholder="https://..."
                />
                {formData.image_url && (
                  <img src={formData.image_url} alt="Preview" className="mt-2 h-32 w-full object-cover rounded-lg" />
                )}
              </div>
            </TabsContent>

            {/* WiFi */}
            <TabsContent value="wifi" className="space-y-4">
              <div className="bg-blue-50 rounded-xl p-4 mb-4">
                <p className="text-sm text-blue-700">Queste informazioni verranno mostrate agli ospiti nella sezione "Il tuo alloggio".</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nome rete WiFi</Label>
                  <Input 
                    value={formData.wifi_name} 
                    onChange={(e) => setFormData({...formData, wifi_name: e.target.value})}
                    placeholder="Casa_Brezza_WiFi"
                  />
                </div>
                <div>
                  <Label>Password WiFi</Label>
                  <Input 
                    value={formData.wifi_password} 
                    onChange={(e) => setFormData({...formData, wifi_password: e.target.value})}
                    placeholder="password123"
                  />
                </div>
              </div>
              <div>
                <Label>Note aggiuntive WiFi</Label>
                <Textarea 
                  value={formData.wifi_notes} 
                  onChange={(e) => setFormData({...formData, wifi_notes: e.target.value})}
                  placeholder="Es: Il router si trova nel corridoio. Se non funziona, riavviarlo staccando la spina per 10 secondi."
                  rows={3}
                />
              </div>
            </TabsContent>

            {/* Check-in/out */}
            <TabsContent value="checkin" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Orario Check-in</Label>
                  <Input 
                    value={formData.checkin_time} 
                    onChange={(e) => setFormData({...formData, checkin_time: e.target.value})}
                    placeholder="15:00 - 20:00"
                  />
                </div>
                <div>
                  <Label>Orario Check-out</Label>
                  <Input 
                    value={formData.checkout_time} 
                    onChange={(e) => setFormData({...formData, checkout_time: e.target.value})}
                    placeholder="Entro le 10:00"
                  />
                </div>
              </div>
              <div>
                <Label>Istruzioni Check-in</Label>
                <Textarea 
                  value={formData.checkin_instructions} 
                  onChange={(e) => setFormData({...formData, checkin_instructions: e.target.value})}
                  placeholder="Descrivere come raggiungere l'alloggio, dove parcheggiare, come ritirare le chiavi, ecc."
                  rows={4}
                />
              </div>
              <div>
                <Label>Istruzioni Check-out</Label>
                <Textarea 
                  value={formData.checkout_instructions} 
                  onChange={(e) => setFormData({...formData, checkout_instructions: e.target.value})}
                  placeholder="Descrivere come lasciare l'alloggio, dove lasciare le chiavi, cosa fare con la spazzatura, ecc."
                  rows={4}
                />
              </div>
            </TabsContent>

            {/* Contacts */}
            <TabsContent value="contacts" className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Nome host</Label>
                  <Input 
                    value={formData.host_name} 
                    onChange={(e) => setFormData({...formData, host_name: e.target.value})}
                    placeholder="Nico"
                  />
                </div>
                <div>
                  <Label>Telefono host</Label>
                  <Input 
                    value={formData.host_phone} 
                    onChange={(e) => setFormData({...formData, host_phone: e.target.value})}
                    placeholder="+39 329 323 6473"
                  />
                </div>
                <div>
                  <Label>Email host</Label>
                  <Input 
                    value={formData.host_email} 
                    onChange={(e) => setFormData({...formData, host_email: e.target.value})}
                    placeholder="email@esempio.com"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Contatti di emergenza</Label>
                  <Button size="sm" variant="outline" onClick={() => addItem("emergency_contacts", { name: "", phone: "", role: "" })}>
                    <Plus className="w-4 h-4 mr-1" /> Aggiungi
                  </Button>
                </div>
                {formData.emergency_contacts.map((contact, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <Input 
                      value={contact.name} 
                      onChange={(e) => updateItem("emergency_contacts", index, "name", e.target.value)}
                      placeholder="Nome"
                      className="flex-1"
                    />
                    <Input 
                      value={contact.phone} 
                      onChange={(e) => updateItem("emergency_contacts", index, "phone", e.target.value)}
                      placeholder="Telefono"
                      className="flex-1"
                    />
                    <Input 
                      value={contact.role} 
                      onChange={(e) => updateItem("emergency_contacts", index, "role", e.target.value)}
                      placeholder="Ruolo (es. Idraulico)"
                      className="flex-1"
                    />
                    <Button variant="ghost" size="icon" onClick={() => removeItem("emergency_contacts", index)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Rules */}
            <TabsContent value="rules" className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <Label>Regole della casa</Label>
                <Button size="sm" variant="outline" onClick={() => setFormData({...formData, house_rules: [...formData.house_rules, ""]})}>
                  <Plus className="w-4 h-4 mr-1" /> Aggiungi regola
                </Button>
              </div>
              {formData.house_rules.map((rule, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <Input 
                    value={rule} 
                    onChange={(e) => {
                      const newRules = [...formData.house_rules];
                      newRules[index] = e.target.value;
                      setFormData({...formData, house_rules: newRules});
                    }}
                    placeholder="Es: Non fumare in casa"
                    className="flex-1"
                  />
                  <Button variant="ghost" size="icon" onClick={() => {
                    setFormData({...formData, house_rules: formData.house_rules.filter((_, i) => i !== index)});
                  }}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ))}
              {formData.house_rules.length === 0 && (
                <p className="text-slate-500 text-sm">Nessuna regola aggiunta. Clicca "Aggiungi regola" per iniziare.</p>
              )}
            </TabsContent>

            {/* FAQ */}
            <TabsContent value="faq" className="space-y-4">
              <div className="bg-amber-50 rounded-xl p-4 mb-4">
                <p className="text-sm text-amber-700">Le FAQ verranno mostrate nella sezione "Il tuo alloggio". Puoi abilitare/disabilitare ogni FAQ.</p>
              </div>
              <div className="flex items-center justify-between mb-2">
                <Label>Domande frequenti</Label>
                <Button size="sm" variant="outline" onClick={() => addItem("faq", { question: "", answer: "", enabled: true })}>
                  <Plus className="w-4 h-4 mr-1" /> Aggiungi FAQ
                </Button>
              </div>
              {formData.faq.map((item, index) => (
                <Card key={index} className="p-4 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 space-y-2">
                      <Input 
                        value={item.question} 
                        onChange={(e) => updateItem("faq", index, "question", e.target.value)}
                        placeholder="Domanda (es. A che ora posso arrivare?)"
                      />
                      <Textarea 
                        value={item.answer} 
                        onChange={(e) => updateItem("faq", index, "answer", e.target.value)}
                        placeholder="Risposta..."
                        rows={2}
                      />
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <Switch 
                        checked={item.enabled !== false} 
                        onCheckedChange={(checked) => updateItem("faq", index, "enabled", checked)}
                      />
                      <Button variant="ghost" size="icon" onClick={() => removeItem("faq", index)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </TabsContent>

            {/* Common Issues */}
            <TabsContent value="issues" className="space-y-4">
              <div className="bg-rose-50 rounded-xl p-4 mb-4">
                <p className="text-sm text-rose-700">I problemi comuni verranno mostrati nella pagina "Guasti & Assistenza". Gli ospiti potranno consultarli prima di aprire un ticket.</p>
              </div>
              <div className="flex items-center justify-between mb-2">
                <Label>Problemi comuni e soluzioni</Label>
                <Button size="sm" variant="outline" onClick={() => addItem("common_issues", { title: "", solution: "", category: "altro" })}>
                  <Plus className="w-4 h-4 mr-1" /> Aggiungi problema
                </Button>
              </div>
              {formData.common_issues.map((item, index) => (
                <Card key={index} className="p-4 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 space-y-2">
                      <div className="flex gap-2">
                        <Input 
                          value={item.title} 
                          onChange={(e) => updateItem("common_issues", index, "title", e.target.value)}
                          placeholder="Titolo problema (es. La TV non si accende)"
                          className="flex-1"
                        />
                        <select 
                          className="border rounded-lg px-3 text-sm"
                          value={item.category || "altro"}
                          onChange={(e) => updateItem("common_issues", index, "category", e.target.value)}
                        >
                          <option value="clima">Clima/AC</option>
                          <option value="acqua">Acqua</option>
                          <option value="elettricita">Elettricità</option>
                          <option value="tecnologia">Tecnologia</option>
                          <option value="altro">Altro</option>
                        </select>
                      </div>
                      <Textarea 
                        value={item.solution} 
                        onChange={(e) => updateItem("common_issues", index, "solution", e.target.value)}
                        placeholder="Soluzione passo-passo..."
                        rows={3}
                      />
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeItem("common_issues", index)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </Card>
              ))}
            </TabsContent>

            {/* Extra Services */}
            <TabsContent value="services" className="space-y-4">
              <div className="bg-green-50 rounded-xl p-4 mb-4">
                <p className="text-sm text-green-700">I servizi extra verranno mostrati nella pagina "Servizi Aggiuntivi". Puoi abilitare/disabilitare e impostare prezzi diversi per ogni struttura.</p>
              </div>
              <div className="flex items-center justify-between mb-2">
                <Label>Servizi extra disponibili</Label>
                <Button size="sm" variant="outline" onClick={() => addItem("extra_services", { name: "", description: "", price: "", enabled: true })}>
                  <Plus className="w-4 h-4 mr-1" /> Aggiungi servizio
                </Button>
              </div>
              {formData.extra_services.map((item, index) => (
                <Card key={index} className="p-4 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 space-y-2">
                      <div className="grid grid-cols-3 gap-2">
                        <Input 
                          value={item.name} 
                          onChange={(e) => updateItem("extra_services", index, "name", e.target.value)}
                          placeholder="Nome servizio"
                        />
                        <Input 
                          value={item.price} 
                          onChange={(e) => updateItem("extra_services", index, "price", e.target.value)}
                          placeholder="Prezzo (es. €15)"
                        />
                        <div className="flex items-center gap-2">
                          <Switch 
                            checked={item.enabled !== false} 
                            onCheckedChange={(checked) => updateItem("extra_services", index, "enabled", checked)}
                          />
                          <span className="text-sm text-slate-500">{item.enabled !== false ? "Attivo" : "Disattivo"}</span>
                        </div>
                      </div>
                      <Input 
                        value={item.description} 
                        onChange={(e) => updateItem("extra_services", index, "description", e.target.value)}
                        placeholder="Descrizione breve"
                      />
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeItem("extra_services", index)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4 border-t bg-slate-50">
          <Button variant="outline" onClick={onClose}>Annulla</Button>
          <Button onClick={handleSave} disabled={isSaving} className="bg-amber-500 hover:bg-amber-600">
            <Save className="w-4 h-4 mr-2" /> {isSaving ? "Salvataggio..." : "Salva struttura"}
          </Button>
        </div>
      </Card>
    </div>
  );
}

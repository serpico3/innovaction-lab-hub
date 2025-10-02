import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Download, AlertCircle } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

interface Materiale {
  id: string;
  nome: string;
  descrizione: string | null;
  quantita_disponibile: number;
  soglia_minima: number;
  qr_code: string;
}

const Materiali = () => {
  const [materiali, setMateriali] = useState<Materiale[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newMaterial, setNewMaterial] = useState({
    nome: "",
    descrizione: "",
    quantita_disponibile: 0,
    soglia_minima: 5,
  });

  useEffect(() => {
    loadMateriali();
  }, []);

  const loadMateriali = async () => {
    try {
      const { data, error } = await supabase
        .from("materiale")
        .select("*")
        .order("nome");

      if (error) throw error;
      setMateriali(data || []);
    } catch (error: any) {
      toast.error("Errore nel caricamento dei materiali");
    } finally {
      setLoading(false);
    }
  };

  const handleAddMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const qrCode = `MAT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const { error } = await supabase.from("materiale").insert([
        {
          ...newMaterial,
          qr_code: qrCode,
        },
      ]);

      if (error) throw error;
      
      toast.success("Materiale aggiunto con successo!");
      setDialogOpen(false);
      setNewMaterial({ nome: "", descrizione: "", quantita_disponibile: 0, soglia_minima: 5 });
      loadMateriali();
    } catch (error: any) {
      toast.error(error.message || "Errore nell'aggiunta del materiale");
    }
  };

  const downloadQRCode = (materiale: Materiale) => {
    const svg = document.getElementById(`qr-${materiale.id}`);
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");

      const downloadLink = document.createElement("a");
      downloadLink.download = `qr-${materiale.nome}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestione Materiali</h1>
            <p className="text-muted-foreground">Catalogo completo con QR code</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nuovo Materiale
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Aggiungi Nuovo Materiale</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddMaterial} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome</Label>
                  <Input
                    id="nome"
                    value={newMaterial.nome}
                    onChange={(e) => setNewMaterial({ ...newMaterial, nome: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="descrizione">Descrizione</Label>
                  <Input
                    id="descrizione"
                    value={newMaterial.descrizione}
                    onChange={(e) => setNewMaterial({ ...newMaterial, descrizione: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantita">Quantità</Label>
                    <Input
                      id="quantita"
                      type="number"
                      min="0"
                      value={newMaterial.quantita_disponibile}
                      onChange={(e) =>
                        setNewMaterial({ ...newMaterial, quantita_disponibile: parseInt(e.target.value) })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="soglia">Soglia Minima</Label>
                    <Input
                      id="soglia"
                      type="number"
                      min="0"
                      value={newMaterial.soglia_minima}
                      onChange={(e) =>
                        setNewMaterial({ ...newMaterial, soglia_minima: parseInt(e.target.value) })
                      }
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full">Aggiungi</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {materiali.map((materiale) => (
            <Card key={materiale.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{materiale.nome}</CardTitle>
                    {materiale.descrizione && (
                      <CardDescription className="mt-1">{materiale.descrizione}</CardDescription>
                    )}
                  </div>
                  {materiale.quantita_disponibile <= materiale.soglia_minima && (
                    <AlertCircle className="h-5 w-5 text-warning flex-shrink-0 ml-2" />
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Disponibile</span>
                  <Badge
                    variant={
                      materiale.quantita_disponibile <= materiale.soglia_minima
                        ? "destructive"
                        : "default"
                    }
                  >
                    {materiale.quantita_disponibile} pz
                  </Badge>
                </div>
                
                <div className="flex flex-col items-center gap-2 p-4 bg-muted rounded-lg">
                  <QRCodeSVG
                    id={`qr-${materiale.id}`}
                    value={materiale.qr_code}
                    size={120}
                    level="H"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadQRCode(materiale)}
                    className="w-full"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Scarica QR
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default Materiali;

import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Html5Qrcode } from "html5-qrcode";
import { Camera, CameraOff, Package } from "lucide-react";

interface ScannedMaterial {
  id: string;
  nome: string;
  quantita_disponibile: number;
}

const Scanner = () => {
  const [scanning, setScanning] = useState(false);
  const [scanner, setScanner] = useState<Html5Qrcode | null>(null);
  const [scannedMaterial, setScannedMaterial] = useState<ScannedMaterial | null>(null);

  useEffect(() => {
    return () => {
      if (scanner) {
        scanner.stop().catch(console.error);
      }
    };
  }, [scanner]);

  const startScanner = async () => {
    try {
      const html5QrCode = new Html5Qrcode("qr-reader");
      setScanner(html5QrCode);

      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        onScanSuccess,
        () => {}
      );

      setScanning(true);
    } catch (error: any) {
      toast.error("Errore nell'avvio della fotocamera");
      console.error(error);
    }
  };

  const stopScanner = async () => {
    if (scanner) {
      try {
        await scanner.stop();
        setScanning(false);
        setScanner(null);
      } catch (error) {
        console.error(error);
      }
    }
  };

  const onScanSuccess = async (decodedText: string) => {
    try {
      const { data: material, error } = await supabase
        .from("materiale")
        .select("*")
        .eq("qr_code", decodedText)
        .single();

      if (error || !material) {
        toast.error("Materiale non trovato");
        return;
      }

      setScannedMaterial(material);
      stopScanner();
    } catch (error) {
      toast.error("Errore nella scansione");
    }
  };

  const handlePrelievo = async () => {
    if (!scannedMaterial) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Utente non autenticato");
        return;
      }

      const { data: formatore } = await supabase
        .from("formatore")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!formatore) {
        toast.error("Profilo formatore non trovato");
        return;
      }

      const { error: movimentoError } = await supabase.from("movimento").insert([
        {
          materiale_id: scannedMaterial.id,
          formatore_id: formatore.id,
          tipo_movimento: "prelievo",
          quantita: 1,
        },
      ]);

      if (movimentoError) throw movimentoError;

      const { error: updateError } = await supabase
        .from("materiale")
        .update({ quantita_disponibile: scannedMaterial.quantita_disponibile - 1 })
        .eq("id", scannedMaterial.id);

      if (updateError) throw updateError;

      toast.success("Prelievo registrato con successo!");
      setScannedMaterial(null);
    } catch (error: any) {
      toast.error(error.message || "Errore nel prelievo");
    }
  };

  const handleRestituzione = async () => {
    if (!scannedMaterial) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Utente non autenticato");
        return;
      }

      const { data: formatore } = await supabase
        .from("formatore")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!formatore) {
        toast.error("Profilo formatore non trovato");
        return;
      }

      const { error: movimentoError } = await supabase.from("movimento").insert([
        {
          materiale_id: scannedMaterial.id,
          formatore_id: formatore.id,
          tipo_movimento: "restituzione",
          quantita: 1,
        },
      ]);

      if (movimentoError) throw movimentoError;

      const { error: updateError } = await supabase
        .from("materiale")
        .update({ quantita_disponibile: scannedMaterial.quantita_disponibile + 1 })
        .eq("id", scannedMaterial.id);

      if (updateError) throw updateError;

      toast.success("Restituzione registrata con successo!");
      setScannedMaterial(null);
    } catch (error: any) {
      toast.error(error.message || "Errore nella restituzione");
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Scanner QR Code</h1>
          <p className="text-muted-foreground">Scansiona i QR code per gestire i movimenti</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Fotocamera</CardTitle>
              <CardDescription>Inquadra il QR code del materiale</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                id="qr-reader"
                className="w-full aspect-square bg-muted rounded-lg overflow-hidden"
              />
              <Button
                onClick={scanning ? stopScanner : startScanner}
                className="w-full"
                variant={scanning ? "destructive" : "default"}
              >
                {scanning ? (
                  <>
                    <CameraOff className="mr-2 h-4 w-4" />
                    Ferma Scanner
                  </>
                ) : (
                  <>
                    <Camera className="mr-2 h-4 w-4" />
                    Avvia Scanner
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Materiale Scansionato</CardTitle>
              <CardDescription>Effettua un'operazione</CardDescription>
            </CardHeader>
            <CardContent>
              {scannedMaterial ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                    <Package className="h-8 w-8 text-primary" />
                    <div className="flex-1">
                      <h3 className="font-semibold">{scannedMaterial.nome}</h3>
                      <p className="text-sm text-muted-foreground">
                        Disponibili: {scannedMaterial.quantita_disponibile} pz
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Button onClick={handlePrelievo} className="w-full">
                      Prelievo
                    </Button>
                    <Button onClick={handleRestituzione} variant="outline" className="w-full">
                      Restituzione
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Package className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Nessun materiale scansionato
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Avvia lo scanner per iniziare
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Scanner;

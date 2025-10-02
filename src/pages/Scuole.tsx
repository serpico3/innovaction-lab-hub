import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { School, MapPin, Phone, Mail } from "lucide-react";

interface Scuola {
  id: string;
  nome: string;
  indirizzo: string;
  contatto: string | null;
  email: string | null;
}

const Scuole = () => {
  const [scuole, setScuole] = useState<Scuola[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadScuole();
  }, []);

  const loadScuole = async () => {
    try {
      const { data, error } = await supabase
        .from("scuola")
        .select("*")
        .order("nome");

      if (error) throw error;
      setScuole(data || []);
    } catch (error: any) {
      toast.error("Errore nel caricamento delle scuole");
    } finally {
      setLoading(false);
    }
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
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Scuole Partner</h1>
          <p className="text-muted-foreground">Istituti scolastici collaboratori del FabLab</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {scuole.map((scuola) => (
            <Card key={scuola.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <School className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg">{scuola.nome}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{scuola.indirizzo}</span>
                </div>
                {scuola.contatto && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-muted-foreground">{scuola.contatto}</span>
                  </div>
                )}
                {scuola.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <a
                      href={`mailto:${scuola.email}`}
                      className="text-primary hover:underline truncate"
                    >
                      {scuola.email}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default Scuole;

import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Users, TrendingUp, Award } from "lucide-react";

interface Formatore {
  id: string;
  disponibilita: string | null;
  ore_totali: number;
  lezioni_concluse: number;
  profiles: {
    nome: string;
    cognome: string | null;
    email: string;
  };
}

const Formatori = () => {
  const [formatori, setFormatori] = useState<Formatore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFormatori();
  }, []);

  const loadFormatori = async () => {
    try {
      const { data, error } = await supabase
        .from("formatore")
        .select(`
          *,
          profiles:user_id (nome, cognome, email)
        `)
        .order("lezioni_concluse", { ascending: false });

      if (error) throw error;
      setFormatori(data || []);
    } catch (error: any) {
      toast.error("Errore nel caricamento dei formatori");
    } finally {
      setLoading(false);
    }
  };

  const getDisponibilitaBadge = (disponibilita: string | null) => {
    if (!disponibilita) return <Badge variant="outline">Non specificata</Badge>;
    return <Badge className="bg-success text-success-foreground">{disponibilita}</Badge>;
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
          <h1 className="text-3xl font-bold tracking-tight">Gestione Formatori</h1>
          <p className="text-muted-foreground">Team di formatori attivi nel FabLab</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {formatori.map((formatore) => {
            const nomeCompleto = `${formatore.profiles.nome} ${formatore.profiles.cognome || ""}`.trim();
            
            return (
              <Card key={formatore.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{nomeCompleto}</CardTitle>
                        <CardDescription className="text-sm">
                          {formatore.profiles.email}
                        </CardDescription>
                      </div>
                    </div>
                    {formatore.lezioni_concluse >= 10 && (
                      <Award className="h-5 w-5 text-accent" />
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Disponibilità</span>
                      {getDisponibilitaBadge(formatore.disponibilita)}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Lezioni</p>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-success" />
                          <span className="text-2xl font-bold">{formatore.lezioni_concluse}</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Ore Totali</p>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold">{formatore.ore_totali}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </MainLayout>
  );
};

export default Formatori;

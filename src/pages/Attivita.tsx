import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";

interface Attivita {
  id: string;
  titolo: string;
  descrizione: string | null;
  data: string;
  orario: string;
  stato: string;
  scuola: { nome: string } | null;
  formatore: {
    profiles: { nome: string; cognome: string | null };
  } | null;
}

const Attivita = () => {
  const [attivita, setAttivita] = useState<Attivita[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    loadAttivita();
  }, []);

  const loadAttivita = async () => {
    try {
      const { data, error } = await supabase
        .from("attivita")
        .select(`
          *,
          scuola:scuola_id (nome),
          formatore:formatore_id (
            profiles:user_id (nome, cognome)
          )
        `)
        .order("data", { ascending: true })
        .order("orario", { ascending: true });

      if (error) throw error;
      setAttivita(data || []);
    } catch (error: any) {
      toast.error("Errore nel caricamento delle attività");
    } finally {
      setLoading(false);
    }
  };

  const filteredAttivita = selectedDate
    ? attivita.filter(
        (att) => att.data === format(selectedDate, "yyyy-MM-dd")
      )
    : attivita;

  const getStatoBadge = (stato: string) => {
    switch (stato) {
      case "programmata":
        return <Badge>Programmata</Badge>;
      case "in_corso":
        return <Badge className="bg-accent text-accent-foreground">In Corso</Badge>;
      case "conclusa":
        return <Badge className="bg-success text-success-foreground">Conclusa</Badge>;
      case "annullata":
        return <Badge variant="destructive">Annullata</Badge>;
      default:
        return <Badge variant="outline">{stato}</Badge>;
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
          <h1 className="text-3xl font-bold tracking-tight">Calendario Attività</h1>
          <p className="text-muted-foreground">Gestione lezioni e attività programmate</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Calendario</CardTitle>
              <CardDescription>Seleziona una data</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                locale={it}
                className="rounded-md border"
              />
            </CardContent>
          </Card>

          <div className="lg:col-span-2 space-y-4">
            {selectedDate && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5" />
                    {format(selectedDate, "EEEE d MMMM yyyy", { locale: it })}
                  </CardTitle>
                  <CardDescription>
                    {filteredAttivita.length} attività programmate
                  </CardDescription>
                </CardHeader>
              </Card>
            )}

            {filteredAttivita.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <CalendarIcon className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Nessuna attività programmata per questa data
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredAttivita.map((att) => (
                <Card key={att.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{att.titolo}</CardTitle>
                        {att.descrizione && (
                          <CardDescription className="mt-1">{att.descrizione}</CardDescription>
                        )}
                      </div>
                      {getStatoBadge(att.stato)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Orario:</span>
                        <p className="font-medium">{att.orario}</p>
                      </div>
                      {att.scuola && (
                        <div>
                          <span className="text-muted-foreground">Scuola:</span>
                          <p className="font-medium">{att.scuola.nome}</p>
                        </div>
                      )}
                      {att.formatore && (
                        <div className="col-span-2">
                          <span className="text-muted-foreground">Formatore:</span>
                          <p className="font-medium">
                            {att.formatore.profiles.nome}{" "}
                            {att.formatore.profiles.cognome || ""}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Attivita;

import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Package, Users, Calendar, AlertCircle, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Stats {
  totalMateriali: number;
  materialiSottoSoglia: number;
  totalFormatori: number;
  attivitaProgrammate: number;
  formatoriAttivi: { nome: string; lezioni: number }[];
}

const Dashboard = () => {
  const [stats, setStats] = useState<Stats>({
    totalMateriali: 0,
    materialiSottoSoglia: 0,
    totalFormatori: 0,
    attivitaProgrammate: 0,
    formatoriAttivi: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [materialiRes, formatoriRes, attivitaRes] = await Promise.all([
        supabase.from("materiale").select("*"),
        supabase
          .from("formatore")
          .select(`
            *,
            profiles:user_id (nome, cognome)
          `),
        supabase.from("attivita").select("*").eq("stato", "programmata"),
      ]);

      const materialiSottoSoglia =
        materialiRes.data?.filter((m) => m.quantita_disponibile <= m.soglia_minima) || [];

      const formatoriConLezioni =
        formatoriRes.data?.map((f: any) => ({
          nome: `${f.profiles?.nome || ""} ${f.profiles?.cognome || ""}`.trim(),
          lezioni: f.lezioni_concluse || 0,
        })) || [];

      setStats({
        totalMateriali: materialiRes.data?.length || 0,
        materialiSottoSoglia: materialiSottoSoglia.length,
        totalFormatori: formatoriRes.data?.length || 0,
        attivitaProgrammate: attivitaRes.data?.length || 0,
        formatoriAttivi: formatoriConLezioni.sort((a, b) => b.lezioni - a.lezioni).slice(0, 5),
      });
    } catch (error) {
      console.error("Errore caricamento statistiche:", error);
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
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Panoramica del FabLab InnovAction</p>
        </div>

        {stats.materialiSottoSoglia > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Attenzione: {stats.materialiSottoSoglia} materiali sotto la soglia minima!
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Materiali Totali</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMateriali}</div>
              {stats.materialiSottoSoglia > 0 && (
                <p className="text-xs text-destructive">
                  {stats.materialiSottoSoglia} sotto soglia
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Formatori</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalFormatori}</div>
              <p className="text-xs text-muted-foreground">Attivi nel sistema</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Attività Programmate</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.attivitaProgrammate}</div>
              <p className="text-xs text-muted-foreground">In calendario</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Crescita</CardTitle>
              <TrendingUp className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">+12%</div>
              <p className="text-xs text-muted-foreground">Rispetto al mese scorso</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Formatori Più Attivi</CardTitle>
            <CardDescription>Numero di lezioni concluse per formatore</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.formatoriAttivi}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nome" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="lezioni" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Dashboard;

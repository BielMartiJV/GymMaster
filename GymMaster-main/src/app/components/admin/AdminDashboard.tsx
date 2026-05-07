import { useEffect, useState } from "react";
import { Activity, CalendarClock, UserCog, Users } from "lucide-react";
import { fetchApi, getAuthHeaders } from "./api";

type DashboardResponse = {
  metrics: {
    socisActius: number;
    entrenadorsActius: number;
    classesActives: number;
    reservesActives: number;
  };
  upcomingClasses: Array<{
    id_classe: number;
    nom: string;
    data_classe: string;
    hora_inici: string;
    places_ocupades: number;
    aforament_max: number;
    entrenador_nom: string;
    entrenador_cognoms: string;
  }>;
  recentSocis: Array<{
    id_soci: number;
    nom: string;
    cognoms: string;
    email: string;
    data_alta: string;
  }>;
};

const metricCards = [
  { key: "socisActius", label: "Socis actius", icon: Users, color: "bg-sky-50 text-sky-700" },
  { key: "entrenadorsActius", label: "Entrenadors", icon: UserCog, color: "bg-emerald-50 text-emerald-700" },
  { key: "classesActives", label: "Classes", icon: CalendarClock, color: "bg-violet-50 text-violet-700" },
  { key: "reservesActives", label: "Reserves", icon: Activity, color: "bg-amber-50 text-amber-700" },
] as const;

export function AdminDashboard() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const response = await fetchApi("/admin/dashboard", {
          headers: getAuthHeaders(),
        });
        const body = await response.json();
        if (!response.ok) {
          throw new Error(body.error || "No s'ha pogut carregar el dashboard");
        }
        setData(body);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (isLoading) {
    return <div className="py-20 text-center text-slate-500 font-semibold">Carregant dashboard...</div>;
  }

  if (!data) {
    return <div className="py-20 text-center text-red-600 font-semibold">No s'han pogut carregar les dades.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {metricCards.map((item) => {
          const Icon = item.icon;
          const value = data.metrics[item.key] ?? 0;
          return (
            <div key={item.key} className="bg-white rounded-xl border border-slate-200 p-5">
              <div className={`inline-flex p-2 rounded-lg ${item.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-sm text-slate-500 mt-3">{item.label}</p>
              <p className="text-3xl font-bold text-slate-900">{value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="font-bold text-slate-900">Properes classes</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="p-3 text-left">Classe</th>
                  <th className="p-3 text-left">Entrenador</th>
                  <th className="p-3 text-left">Data</th>
                  <th className="p-3 text-left">Places</th>
                </tr>
              </thead>
              <tbody>
                {data.upcomingClasses.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-slate-500">Sense classes programades</td>
                  </tr>
                ) : (
                  data.upcomingClasses.map((item) => (
                    <tr key={item.id_classe} className="border-t border-slate-100">
                      <td className="p-3 font-medium text-slate-900">{item.nom}</td>
                      <td className="p-3 text-slate-600">{item.entrenador_nom} {item.entrenador_cognoms}</td>
                      <td className="p-3 text-slate-600">{item.data_classe?.slice(0, 10)} {item.hora_inici?.slice(0, 5)}</td>
                      <td className="p-3 text-slate-600">{item.places_ocupades}/{item.aforament_max}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="font-bold text-slate-900">Ultims socis d'alta</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="p-3 text-left">Nom</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Alta</th>
                </tr>
              </thead>
              <tbody>
                {data.recentSocis.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-6 text-center text-slate-500">Sense registres recents</td>
                  </tr>
                ) : (
                  data.recentSocis.map((item) => (
                    <tr key={item.id_soci} className="border-t border-slate-100">
                      <td className="p-3 font-medium text-slate-900">{item.nom} {item.cognoms}</td>
                      <td className="p-3 text-slate-600">{item.email}</td>
                      <td className="p-3 text-slate-600">{item.data_alta?.slice(0, 10)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

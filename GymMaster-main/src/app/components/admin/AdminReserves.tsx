import { FormEvent, useEffect, useMemo, useState } from "react";
import { Check, Edit2, Plus, Trash2, X } from "lucide-react";
import { fetchApi, getAuthHeaders } from "./api";

type SociOption = {
  id_soci: number;
  nom: string;
  cognoms: string;
};

type ClasseOption = {
  id_classe: number;
  nom: string;
  data_classe: string | null;
  hora_inici: string;
};

type Reserva = {
  id_reserva: number;
  id_soci: number;
  id_classe: number;
  data_classe: string;
  assistit: number;
  soci_nom: string;
  soci_cognoms: string;
  classe_nom: string;
  hora_inici: string;
};

export function AdminReserves() {
  const [reserves, setReserves] = useState<Reserva[]>([]);
  const [socis, setSocis] = useState<SociOption[]>([]);
  const [classes, setClasses] = useState<ClasseOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Reserva | null>(null);

  const [idSoci, setIdSoci] = useState("");
  const [idClasse, setIdClasse] = useState("");
  const [dataClasse, setDataClasse] = useState("");
  const [assistit, setAssistit] = useState(false);

  const classMap = useMemo(
    () => new Map(classes.map((item) => [String(item.id_classe), item])),
    [classes]
  );

  const resetForm = () => {
    setIdSoci("");
    setIdClasse("");
    setDataClasse("");
    setAssistit(false);
    setEditing(null);
  };

  const loadData = async () => {
    try {
      const [reservesResponse, socisResponse, classesResponse] = await Promise.all([
        fetchApi("/reserves", { headers: getAuthHeaders() }),
        fetchApi("/socis", { headers: getAuthHeaders() }),
        fetchApi("/classes", { headers: getAuthHeaders() }),
      ]);

      const reservesData = await reservesResponse.json();
      const socisData = await socisResponse.json();
      const classesData = await classesResponse.json();

      if (!reservesResponse.ok || !socisResponse.ok || !classesResponse.ok) {
        throw new Error("No s'han pogut carregar les dades de reserves");
      }

      setReserves(reservesData.reserves || []);
      setSocis(socisData.socis || []);
      setClasses(classesData.classes || []);
    } catch (error) {
      console.error(error);
      alert("No s'han pogut carregar les dades de reserves");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openModal = (reserva?: Reserva) => {
    if (reserva) {
      setEditing(reserva);
      setIdSoci(String(reserva.id_soci));
      setIdClasse(String(reserva.id_classe));
      setDataClasse(reserva.data_classe?.slice(0, 10) || "");
      setAssistit(reserva.assistit === 1);
    } else {
      resetForm();
    }

    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const saveReserva = async (event: FormEvent) => {
    event.preventDefault();

    try {
      const response = await fetchApi(
        editing ? `/reserves/${editing.id_reserva}` : "/reserves",
        {
          method: editing ? "PUT" : "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify(
            editing
              ? { assistit }
              : {
                  id_soci: Number(idSoci),
                  id_classe: Number(idClasse),
                  data_classe: dataClasse,
                  assistit,
                }
          ),
        }
      );
      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "No s'ha pogut desar la reserva");
        return;
      }

      await loadData();
      closeModal();
    } catch (error) {
      console.error(error);
      alert("Error de connexio");
    }
  };

  const removeReserva = async (id: number) => {
    if (!window.confirm("Vols cancel·lar aquesta reserva?")) {
      return;
    }

    try {
      const response = await fetchApi(`/reserves/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "No s'ha pogut cancel·lar la reserva");
        return;
      }

      await loadData();
    } catch (error) {
      console.error(error);
      alert("Error de connexio");
    }
  };

  if (isLoading) {
    return <div className="py-20 text-center text-slate-500 font-semibold">Carregant reserves...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Gestio de reserves</h2>
          <p className="text-slate-600">Control d'assistencia i altes de noves reserves.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="inline-flex items-center gap-2 bg-sky-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-sky-700"
        >
          <Plus className="w-4 h-4" />
          Nova reserva
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-900 text-slate-100">
              <tr>
                <th className="p-3 text-left">Soci</th>
                <th className="p-3 text-left">Classe</th>
                <th className="p-3 text-left">Data/Hora</th>
                <th className="p-3 text-center">Assistit</th>
                <th className="p-3 text-center">Accions</th>
              </tr>
            </thead>
            <tbody>
              {reserves.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-500">No hi ha reserves actives</td>
                </tr>
              ) : (
                reserves.map((item) => (
                  <tr key={item.id_reserva} className="border-t border-slate-100">
                    <td className="p-3 font-semibold text-slate-900">{item.soci_nom} {item.soci_cognoms}</td>
                    <td className="p-3 text-slate-600">{item.classe_nom}</td>
                    <td className="p-3 text-slate-600">{item.data_classe?.slice(0, 10)} {item.hora_inici?.slice(0, 5)}</td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${item.assistit ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                        {item.assistit ? "Si" : "No"}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex justify-center gap-2">
                        <button className="p-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100" onClick={() => openModal(item)}>
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button className="p-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100" onClick={() => removeReserva(item.id_reserva)}>
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 p-4 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white">
              <h3 className="text-xl font-bold text-slate-900">{editing ? "Editar reserva" : "Crear reserva"}</h3>
              <button onClick={closeModal} className="text-slate-500 hover:text-slate-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={saveReserva} className="p-5 space-y-4">
              {!editing && (
                <>
                  <div>
                    <label className="block text-sm font-semibold mb-1">Soci *</label>
                    <select className="w-full border rounded-lg px-3 py-2" value={idSoci} onChange={(e) => setIdSoci(e.target.value)} required>
                      <option value="">Selecciona soci</option>
                      {socis.map((soci) => (
                        <option key={soci.id_soci} value={soci.id_soci}>{soci.nom} {soci.cognoms}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-1">Classe *</label>
                    <select className="w-full border rounded-lg px-3 py-2" value={idClasse} onChange={(e) => {
                      setIdClasse(e.target.value);
                      const selected = classMap.get(e.target.value);
                      if (selected?.data_classe) {
                        setDataClasse(selected.data_classe.slice(0, 10));
                      }
                    }} required>
                      <option value="">Selecciona classe</option>
                      {classes.map((classe) => (
                        <option key={classe.id_classe} value={classe.id_classe}>{classe.nom}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-1">Data classe *</label>
                    <input type="date" className="w-full border rounded-lg px-3 py-2" value={dataClasse} onChange={(e) => setDataClasse(e.target.value)} required />
                  </div>
                </>
              )}

              <div className="flex items-center gap-2">
                <input id="assistit" type="checkbox" checked={assistit} onChange={(e) => setAssistit(e.target.checked)} />
                <label htmlFor="assistit" className="text-sm font-semibold">Soci assistit</label>
              </div>

              <div className="border-t border-slate-200 pt-4 flex justify-end gap-2">
                <button type="button" onClick={closeModal} className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-semibold">
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-sky-600 text-white font-semibold inline-flex items-center gap-2 hover:bg-sky-700">
                  <Check className="w-4 h-4" />
                  {editing ? "Actualitzar" : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
